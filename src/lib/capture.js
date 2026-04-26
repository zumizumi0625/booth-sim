import * as THREE from 'three'
import JSZip from 'jszip'
import jsPDF from 'jspdf'
import { VIEWS } from '../components/Scene'

const W = 1920
const H = 1080

async function renderView(captureCtx, size, viewKey) {
  const { gl, scene, camera, controlsRef } = captureCtx
  const v = VIEWS[viewKey](size)

  const originalSize = new THREE.Vector2()
  gl.getSize(originalSize)
  const originalAspect = camera.aspect

  // Save current camera state
  const prev = {
    pos: camera.position.clone(),
    target: controlsRef.current?.target.clone(),
    aspect: camera.aspect,
  }

  // Set up offscreen render target
  gl.setSize(W, H, false)
  camera.aspect = W / H
  camera.position.set(...v.position)
  camera.lookAt(...v.target)
  camera.updateProjectionMatrix()

  // Wait one frame for resize
  await new Promise((r) => requestAnimationFrame(r))

  gl.render(scene, camera)
  const canvas = gl.domElement
  const dataUrl = canvas.toDataURL('image/png')

  // Restore
  gl.setSize(originalSize.x, originalSize.y, false)
  camera.aspect = originalAspect
  camera.position.copy(prev.pos)
  if (prev.target && controlsRef.current) {
    controlsRef.current.target.copy(prev.target)
    controlsRef.current.update()
  }
  camera.updateProjectionMatrix()
  gl.render(scene, camera)

  return dataUrl
}

function dataUrlToBlob(dataUrl) {
  const [head, body] = dataUrl.split(',')
  const mime = head.match(/:(.*?);/)[1]
  const bin = atob(body)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

async function makeComposite(viewMap) {
  // 2 rows × 3 cols composite
  const cw = W / 2
  const ch = H / 2
  const canvas = document.createElement('canvas')
  canvas.width = cw * 3
  canvas.height = ch * 2
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const order = ['front', 'right', 'back', 'left', 'top', 'iso']
  const labelMap = { front: '正面', right: '右', back: '背面', left: '左', top: '上面', iso: '45°' }
  for (let idx = 0; idx < order.length; idx++) {
    const key = order[idx]
    const url = viewMap[key]
    const img = await new Promise((resolve) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.src = url
    })
    const col = idx % 3
    const row = Math.floor(idx / 3)
    ctx.drawImage(img, col * cw, row * ch, cw, ch)
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(col * cw + 12, row * ch + 12, 96, 32)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(labelMap[key], col * cw + 24, row * ch + 34)
  }
  return canvas.toDataURL('image/png')
}

async function makePdf(viewMap, layoutName) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const order = ['front', 'right', 'back', 'left', 'top', 'iso']
  const labelMap = { front: '正面', right: '右', back: '背面', left: '左', top: '上面', iso: '45°' }
  for (let i = 0; i < order.length; i++) {
    const key = order[i]
    if (i > 0) pdf.addPage()
    pdf.setFontSize(18)
    pdf.text(`booth-sim — ${layoutName} / ${labelMap[key]}`, 40, 36)
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 40
    const targetW = pageW - margin * 2
    const targetH = pageH - margin * 2 - 24
    pdf.addImage(viewMap[key], 'PNG', margin, 60, targetW, targetH, undefined, 'FAST')
  }
  return pdf.output('blob')
}

export async function captureAll(captureCtx, size, layoutName) {
  if (!captureCtx?.gl) throw new Error('Canvas context not ready')
  const order = ['front', 'right', 'back', 'left', 'top', 'iso']
  const viewMap = {}
  for (const k of order) {
    viewMap[k] = await renderView(captureCtx, size, k)
  }
  const composite = await makeComposite(viewMap)
  const pdfBlob = await makePdf(viewMap, layoutName)

  const zip = new JSZip()
  for (const k of order) zip.file(`${k}.png`, dataUrlToBlob(viewMap[k]))
  zip.file('composite.png', dataUrlToBlob(composite))
  zip.file('layout.pdf', pdfBlob)

  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = `booth-sim-${layoutName.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
