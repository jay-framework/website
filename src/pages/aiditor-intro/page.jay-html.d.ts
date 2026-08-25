import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";
import {ClipboardCopyViewState, ClipboardCopyRefs, ClipboardCopyInteractiveViewState} from "../../../node_modules/@jay-framework/ui-kit/dist/clipboard-copy.jay-contract";
import {clipboardCopy} from "@jay-framework/ui-kit";
import {SiteHeaderViewState, SiteHeaderRefs, SiteHeaderInteractiveViewState} from "../../components/site-header/site-header.jay-contract";
import {SiteHeader} from "../../components/site-header/site-header";
import {SiteFooterViewState, SiteFooterRefs, SiteFooterInteractiveViewState} from "../../components/site-footer/site-footer.jay-contract";
import {SiteFooter} from "../../components/site-footer/site-footer";

import './page.css';

export interface PageViewState {}


export interface PageElementRefs {
  ar0: SiteHeaderRefs,
  ar1: ClipboardCopyRefs
}

export type AiditorIntroSlowViewState = {};

export type AiditorIntroFastViewState = {};

export type AiditorIntroInteractiveViewState = {};

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