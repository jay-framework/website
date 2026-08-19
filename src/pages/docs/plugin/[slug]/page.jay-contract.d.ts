import {JayContract} from "@jay-framework/runtime";


export interface DocsPluginPageViewState {}

export type DocsPluginPageSlowViewState = {};

export type DocsPluginPageFastViewState = {};

export type DocsPluginPageInteractiveViewState = {};

export interface DocsPluginPageRefs {}

export interface DocsPluginPageRepeatedRefs {}

export type DocsPluginPageContract = JayContract<DocsPluginPageViewState, DocsPluginPageRefs, DocsPluginPageSlowViewState, DocsPluginPageFastViewState, DocsPluginPageInteractiveViewState>