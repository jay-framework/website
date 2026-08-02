import {JayContract} from "@jay-framework/runtime";


export interface SiteHeaderViewState {}

export type SiteHeaderSlowViewState = {};

export type SiteHeaderFastViewState = {};

export type SiteHeaderInteractiveViewState = {};

export interface SiteHeaderRefs {}

export interface SiteHeaderRepeatedRefs {}

export type SiteHeaderContract = JayContract<SiteHeaderViewState, SiteHeaderRefs, SiteHeaderSlowViewState, SiteHeaderFastViewState, SiteHeaderInteractiveViewState>