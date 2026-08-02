import {JayContract} from "@jay-framework/runtime";


export interface DocsDeveloperPageViewState {
  activePage: string,
  activeRole: string
}

export type DocsDeveloperPageSlowViewState = Pick<DocsDeveloperPageViewState, 'activePage' | 'activeRole'>;

export type DocsDeveloperPageFastViewState = {};

export type DocsDeveloperPageInteractiveViewState = {};

export interface DocsDeveloperPageRefs {}

export interface DocsDeveloperPageRepeatedRefs {}

export type DocsDeveloperPageContract = JayContract<DocsDeveloperPageViewState, DocsDeveloperPageRefs, DocsDeveloperPageSlowViewState, DocsDeveloperPageFastViewState, DocsDeveloperPageInteractiveViewState>