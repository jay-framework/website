import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";
import {MarkdownPagesViewState, MarkdownPagesRefs, TagOfMarkdownPagesViewState} from "../../../../node_modules/@jay-framework/markdown/dist/contracts/markdown-pages.jay-contract";

import './page.css';

export interface PageViewState {
  post?: MarkdownPagesViewState
}


export interface PageElementRefs {
  post: MarkdownPagesRefs
}

export type DesignLogPostSlowViewState = {};

export type DesignLogPostFastViewState = {};

export type DesignLogPostInteractiveViewState = {};

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