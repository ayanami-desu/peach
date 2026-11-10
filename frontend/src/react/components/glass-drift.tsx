/* 玻璃面上的两团反光。画法在 `web/board.css` 的 `[data-glass-drift]`：两倍大的画布停在原来的
 * 起始位置，只作为静态高光；宿主自己那两层背景光斑随之收起。只在带 `[data-glass-pane]` 等玻璃
 * 材质的宿主里显示；放在宿主子元素的最后，不改动前面那些子元素的 `:first-child` 之类的匹配。 */
export function GlassDrift() {
  return <span data-glass-drift="" aria-hidden="true"><span data-drift="b"><span /></span><span data-drift="a"><span /></span></span>;
}
