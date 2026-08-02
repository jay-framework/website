import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";

import './site-footer.css';

export interface SiteFooterViewState {}

export interface SiteFooterElementRefs {}

export type SiteFooterSlowViewState = {};

export type SiteFooterFastViewState = {};

export type SiteFooterInteractiveViewState = {};

export type SiteFooterElement = JayElement<SiteFooterViewState, SiteFooterElementRefs>
export type SiteFooterElementRender = RenderElement<SiteFooterViewState, SiteFooterElementRefs, SiteFooterElement>
export type SiteFooterElementPreRender = [SiteFooterElementRefs, SiteFooterElementRender]
export type SiteFooterContract = JayContract<
    SiteFooterViewState,
    SiteFooterElementRefs,
    SiteFooterSlowViewState,
    SiteFooterFastViewState,
    SiteFooterInteractiveViewState
>;


export declare function render(options?: RenderElementOptions): SiteFooterElementPreRender