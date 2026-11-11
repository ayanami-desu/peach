/* entity-shapes 域控制器：首屏内联的形态表与 `/api/entity/shapes` 的异步名单，
   供资料页骨架决定要不要等、以及哪些骨架块要铺。启动由 Application 的生命周期统一安装。 */
import { $, api, foldName } from '../core';
import { applicationEffects } from './effects';
export const entityShapesState = { entityShapes: null, entityShapesComplete: false, hasEntityShape: undefined, hasEntityPart: undefined, COSTAR_SKELETON_PEOPLE: undefined, costarSkeletonFoot: undefined, factsSkeleton: undefined, HERO_WIDE_PX: undefined };

export function installEntityShapeBootstrap(){
  const script=document.getElementById('peach-entity-shape');
  if(!script)return;
  try{
    const shape=JSON.parse(script.textContent||'null');
    if(!shape?.id||typeof shape.kind!=='string'||!Array.isArray(shape.names)||!Array.isArray(shape.parts))return;
    entityShapesState.entityShapes=new Map([String(shape.id),...shape.names]
      .map(name=>[`${shape.kind}/${foldName(name)}`,shape.parts]));
  }catch{/* 无效的首屏形状由异步名单处理。 */}
}

export async function loadEntityShapes(){
  const effects=applicationEffects;
  const data=await api('/api/entity/shapes',{signal:effects.signal}).catch(()=>null);
  if(!effects.isActive)return entityShapesState.entityShapes;
  if(data&&!data.error){
    entityShapesState.entityShapesComplete=true;
    entityShapesState.entityShapes=new Map((data.entities||[])
      .flatMap(entity=>[String(entity.id),...entity.names].map(name=>[`${entity.kind}/${foldName(name)}`,entity.parts])));
  }
  return entityShapesState.entityShapes;
}

/* 开关挪到下一帧写：它一翻，资料卡换栏、页面变高，而整页那条覆盖滚动条正观察着 `<body>`。在尺寸观察
   回调里当场写，`<body>` 这一层浅的变化本轮送不出去，浏览器就报一次 ResizeObserver 循环错误，
   每开一次资料页都进错误上报。 */
let heroWideFrame=0;
export function syncHeroWide([entry]){
  const wide=entry.contentRect.width>=entityShapesState.HERO_WIDE_PX;
  cancelAnimationFrame(heroWideFrame);
  heroWideFrame=requestAnimationFrame(()=>{heroWideFrame=0;$('#index')?.toggleAttribute('data-hero-wide',wide)});
}

export function installEntityShapes() {
entityShapesState.entityShapes = null;
entityShapesState.entityShapesComplete = false;
entityShapesState.hasEntityShape = (kind,name)=>entityShapesState.entityShapesComplete||!!entityShapesState.entityShapes?.has(`${kind}/${foldName(name)}`);
entityShapesState.hasEntityPart = (kind,name,part)=>!!name&&!!entityShapesState.entityShapes?.get(`${kind}/${foldName(name)}`)?.includes(part);
entityShapesState.COSTAR_SKELETON_PEOPLE = 12;
entityShapesState.costarSkeletonFoot = ()=>`<div class="entityfoot" data-entity-foot><div class="relatedpeople" data-related-people>${
  '<button type="button" disabled tabindex="-1"><span class="skeleton" data-hero-ring></span><span class="skeleton" data-hero-costar-name>&#8203;</span></button>'
    .repeat(entityShapesState.COSTAR_SKELETON_PEOPLE)}</div></div>`;
entityShapesState.factsSkeleton = ()=>`<dl class="entityfacts" data-entity-facts>${
  '<dt><span class="skeleton"></span></dt><dd><span class="skeleton"></span></dd>'.repeat(5)}</dl>`;
entityShapesState.HERO_WIDE_PX = 900;
applicationEffects.resize(syncHeroWide).observe($('#index'));
}
