import {JayContract} from "@jay-framework/runtime";


export interface DocsDevopsPageViewState {
  activePage: string
}

export type DocsDevopsPageSlowViewState = Pick<DocsDevopsPageViewState, 'activePage'>;

export type DocsDevopsPageFastViewState = {};

export type DocsDevopsPageInteractiveViewState = {};

export interface DocsDevopsPageRefs {}

export interface DocsDevopsPageRepeatedRefs {}

export type DocsDevopsPageContract = JayContract<DocsDevopsPageViewState, DocsDevopsPageRefs, DocsDevopsPageSlowViewState, DocsDevopsPageFastViewState, DocsDevopsPageInteractiveViewState>