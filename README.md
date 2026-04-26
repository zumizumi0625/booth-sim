# booth-sim

3Dブースシミュレータ Web アプリ。出展時のブースを事前に組み立てて、複数アングルの画像／PDFで仲間と共有する。

## Stack
- React 19 + Vite
- React Three Fiber + drei (Three.js)
- zustand（state）
- jszip + jspdf（後の sprint で使用）

## Status
**Day 1 MVP**: ブース構造（床＋3面壁、各壁ON/OFF）、家具5種仮配置、Orbit カメラ、床グリッド。

## Roadmap
- Day 2: 配置 UX（プレビュー / 25cm スナップ / 軸ハンドル / 自動保存）
- Day 3: 画像配置 / 6視点 Capture（ZIP+合成+PDF）/ 寸法ラベル / 名前付きスナップショット
- v2: Walkthrough / モバイル編集 / 家具拡充 / Measure / カスタム視点 / トーン切替 / 英語化

## Dev

```bash
npm install
npm run dev      # http://localhost:5173/booth-sim/
npm run build
npm run preview
```

## Deploy

`main` ブランチに push すると GitHub Actions で GitHub Pages に自動デプロイされる。

## License
MIT
