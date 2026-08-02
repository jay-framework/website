import {JayContract} from "@jay-framework/runtime";


export interface DocsContractsPageViewState {
  activePage: string
}

export type DocsContractsPageSlowViewState = Pick<DocsContractsPageViewState, 'activePage'>;

export type DocsContractsPageFastViewState = {};

export type DocsContractsPageInteractiveViewState = {};

export interface DocsContractsPageRefs {}

export interface DocsContractsPageRepeatedRefs {}

export type DocsContractsPageContract = JayContract<DocsContractsPageViewState, DocsContractsPageRefs, DocsContractsPageSlowViewState, DocsContractsPageFastViewState, DocsContractsPageInteractiveViewState>