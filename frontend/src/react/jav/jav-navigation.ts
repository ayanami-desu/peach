/** 馆藏 JAV 筛选在目录页的地址：与目录共用同一份搜索与筛选。 */
export function javLibraryPath(search: string) {
  const params = new URLSearchParams(search);
  params.delete('tab'); params.set('jav', '1');
  return '/?' + params;
}
