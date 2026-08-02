import {JayContract} from "@jay-framework/runtime";


export interface DocsDesignerPageViewState {
  activePage: string
}

export type DocsDesignerPageSlowViewState = Pick<DocsDesignerPageViewState, 'activePage'>;

export type DocsDesignerPageFastViewState = {};

export type DocsDesignerPageInteractiveViewState = {};

export interface DocsDesignerPageRefs {}

export interface DocsDesignerPageRepeatedRefs {}

export type DocsDesignerPageContract = JayContract<DocsDesignerPageViewState, DocsDesignerPageRefs, DocsDesignerPageSlowViewState, DocsDesignerPageFastViewState, DocsDesignerPageInteractiveViewState>