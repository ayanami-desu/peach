import { describe, expect, it } from 'vitest';
import { overlayMatch } from '../../src/history/overlay';

describe('库外作品身份', () => {
  it('番号路由保持独立身份并拒绝路径片段', () => {
    expect(overlayMatch('/works/EXM-001')?.target).toEqual({ kind: 'jav', code: 'EXM-001' });
    expect(overlayMatch('/works/../../file')).toBeNull();
    expect(overlayMatch('/assets/3')?.target).toEqual({ kind: 'item', id: 3 });
  });
});
