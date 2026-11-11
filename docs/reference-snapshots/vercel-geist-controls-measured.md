# Geist 控件实测记录

- 取证日期：2026-08-26
- URL：<https://vercel.com/geist/input>
- 取证方式：浏览器加载页面后读 `getComputedStyle`，不是读源码或截图量取
- **不在 `docs/reference-sources.json` 里登记**：那张表的契约是「每个来源都有可哈希的
  上游快照」，而这里记的是渲染结果，随上游发布变化且没有可锁定的文件哈希。把它塞进去
  会让 `sha256` 这个字段在别处的含义失真。要复核就按上面的方式重测一次。

## 实测值

Peach 配置页的产品取值（2026-09-05 定的间距）：文字按钮左右内边距为 14px，
纯图标按钮保留正方形；下拉箭头距右边框 14px，文字右侧预留 42px。以下上游测量值保留为证据，
实现采用这里的产品取值。删除用危险色，在线与离线用成功色与危险色，并保留文字状态。
系统说明只在当前运行系统适用时显示；配置页验收使用完整主站外壳与完整运行信息。

配置页补充取证（2026-09-05）：Vercel Toolbar 的手工截图；浅色页面与底栏为浅灰、
正文为白色，外边框与底栏分隔线同色。Peach 对应使用 `--page`／`--surface`、`--ground`、
`--line` 和 6px 控件圆角；深色沿用项目色板。截图没有提供展开菜单的上游画面，展开行为沿用
已取证的 `selectFieldHtml`／`wireSelectField`，不能只重画原生 select 的箭头。
链接默认无下划线，悬停允许下划线；外链附右上角箭头图标。验收必须包含明暗主题和展开菜单。

| 项 | 值 |
| --- | --- |
| 输入框高 | 32 px |
| 按钮高 | 32 px |
| 字号（两者） | 14 px |
| 按钮圆角 | 4 px |
| 按钮边框 | `1px solid rgb(46, 46, 46)` |
| 按钮背景 | 透明（`rgba(0,0,0,0)`） |
| `--geist-radius` | 6 px |
| `--ds-gray-alpha-400` | `#ffffff24` |

## Peach 复用了什么

2026-09-06 复核：官方 `https://vercel.com/geist/button` 明确导航使用 ButtonLink；首次设置完成页复用主站 `.geist-button.primary`，保持链接语义。`https://vercel.com/geist/label` 未给出「可选」专用颜色；Peach 自行采用已有 `--muted`、`--fs-sm` 与 400 字重。密码输入与其他文本字段共用首启样式。官方正文可读取；IAB 与 Chrome 控制均返回 `js execution timed out`，上游浏览器视觉实测未取得。

Peach 的控件按这份实测：控件统一 32 px 高、14 px 字；
圆角取根变量的 **6 px** 而不是按钮的 4 px；默认按钮描边透明，只有主操作填色。

配合 `design.md` 的「Reject generated-design reflexes」清单，被用作判据的四条是：
卡片套卡片或用边框补救层级、成排通栏条而彼此不共享量纲、细小灰字加随意字号、
把普通元信息做成胶囊徽章。面板因此去掉嵌套卡片盒子，分组改用标题加发丝分隔线，
字号收敛为 14 / 13 / 12 三档，即全站刻度的 `--fs-md` / `--fs-sm` / `--fs-xs`；
写死字号与刻度外的圆角由 `tests/test_web_ui.py` 的全站词汇表检查拒绝。

## 后来推广到全站（2026-08-26）

面板当初收敛出的那三档本来就该是全站的下三档，各写各的迟早会漂开。样式表原先
散着 **21 种字号（9…48px）**，相邻两档常常只差半个像素——既排不出层级，也没法复核
「这里为什么是 12.5」。现在只有一套刻度：

| token | 值 | 用途 |
| --- | --- | --- |
| `--fs-xs` | 12px | 元信息、计数、标记。**这是下限** |
| `--fs-sm` | 13px | 次要文字 |
| `--fs-md` | 14px | 正文 |
| `--fs-lg` | 16px | 小标题、搜索框 |
| `--fs-xl` | 20px | 段标题、品牌 |
| `--fs-2xl` | 24px | 页标题 |
| `--fs-3xl` | 32px | 统计数字、实体名 |
| `--fs-4xl` | 48px | 占位字形 |

下限定在 12px 是因为 `design.md` 把「细小灰字加随意字号」列为要拒绝的生成式设计反射。
原来的 9px / 10px 灰字（侧栏分组标题、来源筛选按钮、计数徽章、沉浸模式的按钮说明）
全部提到 12px。提上来之后有两处露馅：`.toklabel` 的 `line-height:1` 会切掉中文字形
下缘 2px（9px 时切得少所以没人注意），`.tokcount` 的 16px 圆点装不下 12px 数字——
分别改成 1.25 行高和 18px。

**唯一保留字面像素的是移动端输入框那条 `16px!important`**：那是 iOS 的自动放大阈值，
不是刻度里的一档。让它跟着 `--fs-lg` 走的话，将来调整 lg 会悄悄破坏那个保护，
而症状（在 iPhone 上聚焦输入框页面猛地放大）跟字号改动看不出任何关系。

## 圆角也有词汇

同一份 `design.md` 点名的另一条反射是「把普通元信息做成胶囊徽章」。原先「整圆」有
`999px` / `99px` / `9999px` 三种写法并存，都是同一个意思却看不出是不是同一个决定。

- `--pill-radius:999px`：真正的胶囊——标签、筛选令牌、滚动条与进度条这类连续的条。
  `--tag-radius` 现在指向它。
- `--control-radius:6px`：按钮与分段器，取本页实测的 Geist 根变量。
  `.dupactions button`、`.indexmore`、`.photoback`、`.reviewtabs button`、`.javbar button` 归到这里——
  `.dupactions` 的注释本来就写着「必须看着像按钮」，整圆正好在跟它对着干。
- `--badge-radius:4px`：状态与元信息标记（`.fbadge`、`.fvkind`、`.dupmarks i`、`.dupflag`、
  `.deleteMark`）。它们做成整圆会跟真标签抢同一种视觉身份，用户以为可以点。

`tests/test_web_ui.py` 断言全站不再有字面整圆值，也断言上面几个选择器分别落在哪个
token 上；样式表里除 iOS 那条之外出现任何字面字号都会红。

## Peach 主动保留的差异

继续使用自己的 `--tungsten` 主色和既有暗色表面变量，不引入 Geist 的调色板或字体。
这是有意的差异，不是没做完。

## Introduction 控件复测（2026-08-28）

- URL：<https://vercel.com/geist/introduction>
- 浏览器 `getComputedStyle`：搜索操作高 32px、圆角 4px、1px 边框；图标操作为
  32×32px、圆角 6px；主操作高 36px、圆角 6px。
- 圆形只用于 emoji 反馈等具有独立语义的动作，不是普通操作按钮的默认形状。

因此 Peach 的普通操作与关闭按钮统一使用 `--control-radius:6px`；筛选 Tag 继续使用
`--pill-radius`，图片左右切换继续保留圆形，因为它们是媒体空间导航而不是普通操作。
本次同步检查确认 `design.md` 的锁定 SHA-256 未变化。

## Select 的标签位置与危险按钮填色（2026-09-03）

- URL：<https://vercel.com/geist/select>、<https://vercel.com/geist/button>
- 取证方式：浏览器读渲染后的 DOM 与 `getComputedStyle`，同上不进 `reference-sources.json`。

Select 有两种标明用途的方式，工具行里能用的只有前者：

| 方式 | 实测结构 |
| --- | --- |
| prefix 图标 | `<span class="absolute inline-flex pointer-events-none left-3">` 包 16×16 图标，输入区 `pl-10`、`pr-9`；颜色 `--ds-gray-900`，`group-hover` 转 `--geist-foreground` |
| 文字 Label | `<div class="block text-[13px] text-gray-900 mb-2">`，**块级、排在控件上方** |

行内并排一个文字标签的写法 Geist 没有。官方 Best Practices 另外写明 Label 是简短的
Title Case 名词，直接作为 `<Select>` 的 prop 传，不是外挂的兄弟节点。

Button 的 error 变体实测是**实心红填充**：背景 `oklch(0.5801 0.227 25.12)`、文字纯白，
不是描红边加红字。Peach 的危险按钮静止态仍是安静的描边按钮，只把悬停态统一成
`--drop` 实底加白字——暗色底上只换描边和文字色的话，两个状态几乎一样亮。
