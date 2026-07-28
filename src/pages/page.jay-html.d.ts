import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";
import {ClipboardCopyViewState, ClipboardCopyRefs, ClipboardCopyInteractiveViewState} from "../../node_modules/@jay-framework/ui-kit/dist/clipboard-copy.jay-contract";
import {clipboardCopy} from "@jay-framework/ui-kit";

import './page.css';

export interface PageViewState {
  title: string,
  description: string
}


export interface PageElementRefs {
  ar0: ClipboardCopyRefs,
  ar1: ClipboardCopyRefs
}

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