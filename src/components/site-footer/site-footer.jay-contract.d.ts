import {JayContract} from "@jay-framework/runtime";


export interface SiteFooterViewState {}

export type SiteFooterSlowViewState = {};

export type SiteFooterFastViewState = {};

export type SiteFooterInteractiveViewState = {};

export interface SiteFooterRefs {}

export interface SiteFooterRepeatedRefs {}

export interface SiteFooterProps {
  jc?: string;
}

export type SiteFooterContract = JayContract<SiteFooterViewState, SiteFooterRefs, SiteFooterSlowViewState, SiteFooterFastViewState, SiteFooterInteractiveViewState, SiteFooterProps>