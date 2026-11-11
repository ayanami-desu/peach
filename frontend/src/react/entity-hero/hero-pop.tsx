/* 资料卡上那几枚进顶层的浮层：别名与标签的「+N」。
 *
 * 都是原生 `popover="manual"`：进顶层才不被资料卡的 `overflow:hidden` 裁掉，也不被卡底
 * 同台艺人那条压住。位置按视口算：默认贴锚点下方 8px，下面放不下翻到上方，左右夹在视口内
 * 8px；开着的时候页面滚动或窗口改宽就重算，收起后那条监听自己摘掉。 */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/** 把 `pop` 摆到 `anchor` 下方，放不下翻上方，左右夹在视口内 8px。两边都放不下时摆到空间大的
 *  那一边，高度压到那一边真正剩下的空间、浮层里自己滚：浮层从不横跨锚点，盖住「+N」那一下
 *  指针就落在浮层上，按钮再也点不到。 */
export function placePop(anchor: Element, pop: HTMLElement): void {
  pop.style.removeProperty('max-height');
  const at = anchor.getBoundingClientRect(), box = pop.getBoundingClientRect();
  pop.style.left = `${Math.max(8, Math.min(innerWidth - box.width - 8, at.left))}px`;
  const below = at.bottom + 8;
  const roomBelow = innerHeight - 8 - below, roomAbove = at.top - 16;
  const downward = box.height <= roomBelow || (box.height > roomAbove && roomBelow >= roomAbove);
  const room = Math.max(0, downward ? roomBelow : roomAbove);
  if (box.height > room) pop.style.maxHeight = `${room}px`;
  pop.style.top = `${downward ? below : at.top - 8 - Math.min(box.height, room)}px`;
}

const isOpen = (pop: HTMLElement | null) => !!pop?.isConnected && pop.matches(':popover-open');

/** 开着时跟着滚动与改窗宽重算位置；`open` 为假或卸载时摘掉监听。 */
function usePlacement(open: boolean, anchor: RefObject<Element | null>, pop: RefObject<HTMLElement | null>, onLost: () => void) {
  const lost = useRef(onLost);
  lost.current = onLost;
  useEffect(() => {
    if (!open) return undefined;
    const track = () => {
      if (anchor.current && isOpen(pop.current)) placePop(anchor.current, pop.current!);
      else lost.current();
    };
    addEventListener('scroll', track, { capture: true, passive: true });
    addEventListener('resize', track, { passive: true });
    return () => {
      removeEventListener('scroll', track, true);
      removeEventListener('resize', track);
    };
  }, [open, anchor, pop]);
}

/** 「+N」和它的浮层。
 *
 *  指针悬停或键盘聚焦就出，指针挪到浮层上读名字时不收；点一下钉住（触屏只有这一条路），
 *  再点、点别处或 Escape 收起。 */
export function MorePop({ id, rest, label, heading, hook, children }: {
  id: string;
  rest: number;
  /** 按钮给读屏的名字：「另外 N 个别名」。 */
  label: string;
  /** 浮层标题：「7 个别名」。 */
  heading: string;
  /** 按钮自己的样式钩子：`alias`／`fact`。 */
  hook: 'alias' | 'fact';
  children: ReactNode;
}) {
  const more = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const closing = useRef(0);

  const hide = () => {
    clearTimeout(closing.current);
    pinned.current = false;
    if (isOpen(pop.current)) pop.current!.hidePopover();
    setOpen(false);
  };
  const show = () => {
    clearTimeout(closing.current);
    if (!pop.current || !more.current || isOpen(pop.current)) return;
    pop.current.showPopover();
    placePop(more.current, pop.current);
    setOpen(true);
  };
  const later = () => {
    clearTimeout(closing.current);
    closing.current = window.setTimeout(() => {
      if (!pinned.current && !more.current?.matches(':hover,:focus-visible') && !pop.current?.matches(':hover')) hide();
    }, 150);
  };
  usePlacement(open, more, pop, hide);
  // 点在按钮和浮层以外的地方就收。
  useEffect(() => {
    if (!open) return undefined;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!more.current?.contains(target) && !pop.current?.contains(target)) hide();
    };
    addEventListener('pointerdown', outside, true);
    return () => removeEventListener('pointerdown', outside, true);
  }, [open]);
  useEffect(() => () => clearTimeout(closing.current), []);

  return (
    <>
      <button ref={more} type="button" data-hero-more={hook} aria-expanded={open} aria-controls={id}
        aria-label={label}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') show() }}
        onPointerLeave={later}
        onFocus={() => { if (more.current?.matches(':focus-visible')) show() }}
        onBlur={later}
        onClick={() => { if (pinned.current) hide(); else { show(); pinned.current = true } }}
        onKeyDown={(event) => { if (event.key === 'Escape' && isOpen(pop.current)) { event.preventDefault(); hide() } }}>
        +{rest}
      </button>
      <div ref={pop} id={id} popover="manual" role="group" aria-label={heading} data-hero-pop=""
        onPointerEnter={() => clearTimeout(closing.current)} onPointerLeave={later}>
        <p data-hero-pop-head="">{heading}</p>
        {children}
      </div>
    </>
  );
}

