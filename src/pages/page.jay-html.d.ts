import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";

import './page.css';

export interface PageViewState {
  title: string,
  description: string
}

export interface PageElementRefs {}

export type PageSlowViewState = Pick<PageViewState, 'title' | 'description'>;

export type PageFastViewState = {};

export type PageInteractiveViewState = {};

export type PageElement = JayElement<PageViewState, PageElementRefs>
export type PageElementRender = RenderElement<PageViewState, PageElementRefs, PageElement>
export type PageElementPreRender = [PageElementRefs, PageElementRender]
export type PageContract = JayContract<
    PageViewState,
    PageElementRefs,
    PageSlowViewState,
    PageFastViewState,
    PageInteractiveViewState
>;


export declare function render(options?: RenderElementOptions): PageElementPreRender