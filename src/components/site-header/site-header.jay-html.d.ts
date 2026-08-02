import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";

import './site-header.css';

export interface SiteHeaderViewState {}

export interface SiteHeaderElementRefs {}

export type SiteHeaderSlowViewState = {};

export type SiteHeaderFastViewState = {};

export type SiteHeaderInteractiveViewState = {};

export type SiteHeaderElement = JayElement<SiteHeaderViewState, SiteHeaderElementRefs>
export type SiteHeaderElementRender = RenderElement<SiteHeaderViewState, SiteHeaderElementRefs, SiteHeaderElement>
export type SiteHeaderElementPreRender = [SiteHeaderElementRefs, SiteHeaderElementRender]
export type SiteHeaderContract = JayContract<
    SiteHeaderViewState,
    SiteHeaderElementRefs,
    SiteHeaderSlowViewState,
    SiteHeaderFastViewState,
    SiteHeaderInteractiveViewState
>;


export declare function render(options?: RenderElementOptions): SiteHeaderElementPreRender