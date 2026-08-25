import {JayContract} from "@jay-framework/runtime";


export interface EcosystemViewState {}

export type EcosystemSlowViewState = {};

export type EcosystemFastViewState = {};

export type EcosystemInteractiveViewState = {};

export interface EcosystemRefs {}

export interface EcosystemRepeatedRefs {}

export type EcosystemContract = JayContract<EcosystemViewState, EcosystemRefs, EcosystemSlowViewState, EcosystemFastViewState, EcosystemInteractiveViewState>