/* lifecycle 域控制器：本域状态与动作，启动由 Application 的生命周期统一安装。 */
import { initBoardControls } from './../board-controls';
import { attachOverlayScrollbar, observeScrollRegions, wireBusyActions } from '../ui-kit';
import { $ } from '../core';
import { applicationEffects } from './effects';
import { wireImageFallbacks } from './../card-art/image-fallback';
import { catalogState } from './catalog.js';
import { layoutState } from './layout.js';
export function installLifecycle1() {
initBoardControls();
wireBusyActions(document);
attachOverlayScrollbar(document.documentElement,{variant:'page'});
attachOverlayScrollbar($('#drawerScroll'));
applicationEffects.own(observeScrollRegions());
wireImageFallbacks(document.body);
catalogState.barsRequestSeq = 0;
catalogState.barsPendingSeq = 0;
catalogState.barsRendered = '';
catalogState.catalogFilterProps = null;
catalogState.catalogFilterMounting = null;
catalogState.catalogTagRows = [];
catalogState.catalogTopsPages = null;
layoutState.sidebarProps = {content:null,filters:{},latest:null};
layoutState.sidebarSurface = '';
layoutState.sidebarCatalog = null;
layoutState.sidebarContentSeq = 0;
}
