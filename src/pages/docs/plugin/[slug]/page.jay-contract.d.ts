import {JayContract} from "@jay-framework/runtime";


export interface DocsPluginPageViewState {
  activePage: string,
  activeRole: string
}

export type DocsPluginPageSlowViewState = Pick<DocsPluginPageViewState, 'activePage' | 'activeRole'>;

export type DocsPluginPageFastViewState = {};

export type DocsPluginPageInteractiveViewState = {};

export interface DocsPluginPageRefs {}

export interface DocsPluginPageRepeatedRefs {}

export type DocsPluginPageContract = JayContract<DocsPluginPageViewState, DocsPluginPageRefs, DocsPluginPageSlowViewState, DocsPluginPageFastViewState, DocsPluginPageInteractiveViewState>