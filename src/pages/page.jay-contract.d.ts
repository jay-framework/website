import {JayContract} from "@jay-framework/runtime";


export interface PageViewState {
  title: string,
  description: string
}

export type PageSlowViewState = Pick<PageViewState, 'title' | 'description'>;

export type PageFastViewState = {};

export type PageInteractiveViewState = {};

export interface PageRefs {}

export interface PageRepeatedRefs {}

export type PageContract = JayContract<PageViewState, PageRefs, PageSlowViewState, PageFastViewState, PageInteractiveViewState>