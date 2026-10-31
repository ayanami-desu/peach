/* 新作那一行的卡片区，首页与资料页共用：画进壳留好的 `section.feednew` 宿主里，卡片是壳拼的
 * 那一份模板（`feedNewCardHtml`）。忽略的那条当场消失，已看过的留在原位只是变淡，想要那颗键
 * 按下去换成填实的星；三样都直接改这一行的节点，不重画整行——重画会把横滚的位置和自动滚动
 * 一起打回起点。一条都没有就整块不出。 */
import { useContext, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ShellActionsContext } from '../router/router';
import { SourceAvatar } from '../components/source-avatar';

import type { FeedNew } from './feed-new';

/* 轮询回来的 HTML 整段换掉会重建每一张 `<img>`，横滚位置和正在解码的封面一起打回
   起点。这里按 `data-feed-id` 对卡片做 keyed 合并：没变的卡原样留着，变了的只换那
   一张，顺序按新 HTML 排。Note 这类卡外节点没有图片，变了才整段换。 */
const feedSource = new WeakMap<Element, string>();

/* 写入失败时本地仍会先把按钮和卡片改成操作后的样子；保留旧节点时用服务端原文把业务状态拉回来，
   取景、微光这些运行期修改仍留在旧节点上。 */
function syncFeedState(old: Element, next: Element): void {
  old.classList.toggle('isread', next.classList.contains('isread'));
  const buttons = old.querySelectorAll<HTMLElement>('[data-feed-action]');
  const fresh = next.querySelectorAll<HTMLElement>('[data-feed-action]');
  buttons.forEach((button, index) => {
    const source = fresh[index];
    if (!source) return;
    if (source.dataset.feedAction === undefined) delete button.dataset.feedAction;
    else button.dataset.feedAction = source.dataset.feedAction;
    for (const name of ['aria-pressed', 'title']) {
      const value = source.getAttribute(name);
      if (value === null) button.removeAttribute(name);
      else button.setAttribute(name, value);
    }
  });
}

export function mergeFeedHtml(box: HTMLElement, html: string): void {
  const template = document.createElement('template');
  template.innerHTML = html;
  const nextNodes = [...template.content.children];
  const currentRow = box.querySelector<HTMLElement>(':scope > .feednewrow');
  const nextRow = nextNodes.find(node => node.classList.contains('feednewrow')) as HTMLElement | undefined;
  if (!currentRow || !nextRow) {
    const fresh = [...nextNodes];
    box.replaceChildren(...fresh);
    for (const node of fresh) {
      feedSource.set(node, node.outerHTML);
      node.querySelectorAll<HTMLElement>('[data-feed-id]').forEach(card => feedSource.set(card, card.outerHTML));
    }
    return;
  }
  const currentBefore = [...box.children].filter(node => node !== currentRow);
  const nextBefore = nextNodes.filter(node => node !== nextRow);
  if (currentBefore.map(node => node.outerHTML).join('') !== nextBefore.map(node => node.outerHTML).join('')) {
    currentBefore.forEach(node => node.remove());
    nextBefore.forEach(node => box.insertBefore(node, currentRow));
  }
  const existing = new Map<string, Element>();
  for (const child of [...currentRow.children]) {
    const key = (child as HTMLElement).dataset.feedId;
    if (key) existing.set(key, child);
    else child.remove();
  }
  const ordered: Element[] = [];
  for (const next of [...nextRow.children]) {
    const key = (next as HTMLElement).dataset.feedId;
    const old = key ? existing.get(key) : undefined;
    if (!old) {
      ordered.push(next);
      feedSource.set(next, next.outerHTML);
      continue;
    }
    existing.delete(key!);
    /* 旧节点已经被取景/微光改过类和内联样式，不能拿它的 outerHTML 当服务端原文比。 */
    if (feedSource.get(old) !== next.outerHTML) {
      old.replaceWith(next);
      feedSource.set(next, next.outerHTML);
      ordered.push(next);
    } else {
      syncFeedState(old, next);
      ordered.push(old);
    }
  }
  existing.forEach(node => node.remove());
  let cursor = currentRow.firstElementChild;
  for (const node of ordered) {
    if (node === cursor) cursor = cursor.nextElementSibling;
    else currentRow.insertBefore(node, cursor);
  }
  if (currentRow.className !== nextRow.className) currentRow.className = nextRow.className;
}

export function FeedNewRow({ feedNew, host, wire, act, settled }: {
  feedNew: FeedNew | null;
  host: HTMLElement;
  /** 拖动、滚轮，按设置接自动滚动。 */
  wire(row: Element | null): void;
  /** 卡上那三颗键的写操作。 */
  act(feedId: number, action: string): Promise<void>;
  /** 有没有卡：画出来、或最后一张被收起时报一次。 */
  settled?(hasItems: boolean): void;
}) {
  const actions = useContext(ShellActionsContext);
  const box = useRef<HTMLDivElement>(null);
  const [sourceFaces, setSourceFaces] = useState<HTMLElement[]>([]);
  const html = feedNew?.items.length ? feedNew.html : '';
  useLayoutEffect(() => {
    host.removeAttribute('aria-busy');
    host.hidden = !html;
    if (feedNew) settled?.(!!html);
  }, [host, html, feedNew, settled]);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !html) return;
    mergeFeedHtml(el, html);
  }, [html]);
  useEffect(() => {
    if (html) wire(box.current?.querySelector('.feednewrow') ?? null);
    setSourceFaces([...box.current?.querySelectorAll<HTMLElement>('[data-feed-source-avatar]') ?? []]);
  }, [wire, html]);
  const click = async (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a.feednewopen');
    if (link && actions && !event.button && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      event.preventDefault(); actions.navigate(link.getAttribute('href')!); return;
    }
    const button = (event.target as Element).closest<HTMLElement>('[data-feed-action]');
    const card = button?.closest<HTMLElement>('[data-feed-id]');
    if (!button || !card) return;
    const action = button.dataset.feedAction || '';
    await act(Number(card.dataset.feedId), action);
    if (action === 'want' || action === 'unwant') {
      // 想要是开关：同一颗键换成另一头，卡片不收起也不变淡。
      const wanted = action === 'want';
      button.dataset.feedAction = wanted ? 'unwant' : 'want';
      button.setAttribute('aria-pressed', String(wanted));
      button.title = wanted ? '取消想要' : '想要';
      return;
    }
    if (action === 'ignore') card.remove();
    else card.classList.add('isread');
    if (!box.current?.querySelector('[data-feed-id]')) {
      host.hidden = true;
      settled?.(false);
    }
  };
  return html ? <><div ref={box} className="contents" onClick={(event) => { void click(event) }} />{sourceFaces.map((face, index) => createPortal(
      <SourceAvatar code={face.dataset.code!} person={{ name: face.dataset.name!, source_actor_id: face.dataset.actor! }} />,
      face, `${index}:${face.dataset.actor || face.dataset.code || ''}`))}</> : null;
}
