import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";
import {SiteHeaderViewState, SiteHeaderRefs, SiteHeaderInteractiveViewState} from "../../components/site-header/site-header.jay-contract";
import {SiteHeader} from "../../components/site-header/site-header";

import './page.css';

export interface PageViewState {}


export interface PageElementRefs {
  siteHeader: SiteHeaderRefs
}

export type DesignLogSlowViewState = {};

export type DesignLogFastViewState = {};

export type DesignLogInteractiveViewState = {};

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