---
kind: reference
---

# 首次设置场景素材

设备外框沿用 Peach 宣传视频工程中保存的 Apple Product Bezels PNG，原图保持不变。它们是 Apple 提供的产品外观素材，不适用 Peach 源码的许可；使用范围遵循素材附带的条款。

| 文件 | 原始素材名称 | 原图尺寸 | 屏幕矩形（x、y、宽、高） |
| --- | --- | --- | --- |
| `macbook.png` | MacBook Pro M5 14-inch Space Black | 3860 × 2540 | 418、288、3024、1964 |
| `iphone.png` | iPhone 18 Pro - Black - Portrait | 1350 × 2760 | 72、69、1206、2622 |

屏幕矩形沿用宣传视频工程的 `screens.json`。页面通过 CSS 放入抽象媒体库示意，文件本身不含馆藏、账户或用户截图。欢迎页的单色标识由 `frontend/src/react/pages/setup/peach-silhouette.tsx` 绘制 SVG 外轮廓；确认页和设置完成态使用 `resources/peach-logo.png` 原版标识。

页面不直接加载原图。`resources/setup/1/` 存放按显示宽度缩放的 WebP 派生件（macbook 320/640 宽、iphone 160/320 宽），保留透明通道，由 Pillow LANCZOS 从原图生成；原图只作为后续重新导出的来源。派生件经 `/setup-assets/1/` 以长期缓存交付（见 `routes_pages.setup_asset`）；更换素材时同步更新派生件，并提升版本目录名，避免旧图继续命中缓存。
