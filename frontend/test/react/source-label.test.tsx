import { act } from 'react';
import { expect, it } from 'vitest';
import { SiteLabel } from '../../src/react/components/source-label';
import { mount } from './render';

it('采集来源的站标只认 javdb 与 dmm，经本站读取；取不到时换成通用图标并保留来源名称', async () => {
  const host = await mount(<SiteLabel site="javdb" label="javdb" />);
  const image = host.querySelector('img')!;
  expect(image.getAttribute('src')).toBe('/site-mark?source=javdb');
  await act(async () => { image.dispatchEvent(new Event('error')) });
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).toContain('javdb');
  expect(host.querySelector('svg')).not.toBeNull();
});

it('别的站点不取站标，直接用通用图标', async () => {
  const host = await mount(<SiteLabel site="missav.com" label="MISSAV 地址" />);
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).toContain('MISSAV 地址');
  expect(host.querySelector('svg')).not.toBeNull();
});
