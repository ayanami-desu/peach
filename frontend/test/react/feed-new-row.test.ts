/* 新作行轮询回来时只合并变化的那张卡：没变的节点必须是同一份，封面才不会被重建。 */
import { expect, it } from 'vitest';

import { mergeFeedHtml } from '../../src/react/feed-new/feed-new-row';

const card = (id: number, read = false): string =>
  `<article class="card feednewcard${read ? ' isread' : ''}" data-feed-id="${id}">
    <div class="pic"><img src="/cover?code=C${id}"></div>
  </article>`;

const row = (items: string, note = 'note'): string =>
  `<div class="feednetwork">${note}</div><div class="feednewrow srow">${items}</div>`;

it('没变的卡保留节点，顺序按新 HTML 走', () => {
  const box = document.createElement('div');
  mergeFeedHtml(box, row(card(1) + card(2)));
  const first = box.querySelector('[data-feed-id="1"]')!;
  const firstImage = first.querySelector('img')!;
  const note = box.querySelector('.feednetwork')!;
  mergeFeedHtml(box, row(card(2) + card(1)));
  expect(box.querySelector('[data-feed-id="1"]')).toBe(first);
  expect(box.querySelector('[data-feed-id="1"] img')).toBe(firstImage);
  expect(box.querySelector('.feednetwork')).toBe(note);
  expect([...box.querySelectorAll('[data-feed-id]')].map(node => (node as HTMLElement).dataset.feedId))
    .toEqual(['2', '1']);
});

it('只有变化的那张卡换掉，其余节点不动', () => {
  const box = document.createElement('div');
  mergeFeedHtml(box, row(card(1) + card(2)));
  const read = box.querySelector('[data-feed-id="1"]')!;
  const kept = box.querySelector('[data-feed-id="2"]')!;
  const keptImage = kept.querySelector('img')!;
  mergeFeedHtml(box, row(card(1, true) + card(2)));
  expect(box.querySelector('[data-feed-id="1"]')).not.toBe(read);
  expect(box.querySelector('[data-feed-id="2"]')).toBe(kept);
  expect(box.querySelector('[data-feed-id="2"] img')).toBe(keptImage);
});

it('运行时改过的节点仍按服务端原文判断没变', () => {
  const box = document.createElement('div');
  mergeFeedHtml(box, row(card(1)));
  const first = box.querySelector('[data-feed-id="1"]')!;
  first.classList.add('imgwait');
  (first.querySelector('img') as HTMLImageElement).style.setProperty('--panel-left', '12%');
  mergeFeedHtml(box, row(card(1)));
  expect(box.querySelector('[data-feed-id="1"]')).toBe(first);
});

it('骨架行换成真卡时清掉占位', () => {
  const box = document.createElement('div');
  mergeFeedHtml(box, row('<article class="card feednewcard feednewskeleton"></article>'));
  mergeFeedHtml(box, row(card(3)));
  expect(box.querySelector('.feednewskeleton')).toBeNull();
  expect(box.querySelector('[data-feed-id="3"]')).not.toBeNull();
});
