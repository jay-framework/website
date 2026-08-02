import {JayContract} from "@jay-framework/runtime";


export interface DocsHomeViewState {}

export type DocsHomeSlowViewState = {};

export type DocsHomeFastViewState = {};

export type DocsHomeInteractiveViewState = {};

export interface DocsHomeRefs {}

export interface DocsHomeRepeatedRefs {}

export type DocsHomeContract = JayContract<DocsHomeViewState, DocsHomeRefs, DocsHomeSlowViewState, DocsHomeFastViewState, DocsHomeInteractiveViewState>