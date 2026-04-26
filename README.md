# booth-sim

3Dブースシミュレータ Web アプリ。出展時のブースを事前に組み立てて、複数アングルの画像／PDFで仲間と共有する。

## Stack
- React 19 + Vite
- React Three Fiber + drei (Three.js)
- zustand（state）
- jszip + jspdf（後の sprint で使用）

## Status
**v1 (Day 1〜3 完了)**:
- ブース: サイズプリセット 3種 + カスタム / 4面壁ON/OFF
- 家具5種パレット: クリックで床にプレビュー追従 → クリックで配置（25cm スナップ）
- 画像アップロード: drag&drop or ファイル選択、印刷サイズプリセット (A0..A3 / B1..B2)
- 画像配置: 壁・床・家具上面のいずれにもクリックで貼付
- 編集: 選択 → 床クリックで移動、矢印キーで微調整、R で 90° 回転、Delete で削除、Esc で解除
- カメラ: 左ドラッグ pan / 右ドラッグ orbit / scroll zoom + 6固定ビュー（正面/背面/左/右/上/45°iso）
- Capture: 6視点を 1080p で順次レンダ → ZIP（PNG×6 + composite.png + layout.pdf）DL
- レイアウト: 名前付き複数管理（切替/複製/削除/リネーム）、JSON Export/Import、自動保存

## Roadmap (v2 Issues)
[#1〜#9](https://github.com/zumizumi0625/booth-sim/issues) を参照。

- Walkthrough / FPS モード
- モバイル編集対応
- 家具ライブラリ拡充
- Measure ツール
- カスタム視点登録
- ビジュアルトーン切替
- 英語化 (i18n)
- Ctrl+drag orbit の正式実装
- TransformControls 軸ハンドル

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
