import {JayContract} from "@jay-framework/runtime";


export interface AiditorIntroViewState {}

export type AiditorIntroSlowViewState = {};

export type AiditorIntroFastViewState = {};

export type AiditorIntroInteractiveViewState = {};

export interface AiditorIntroRefs {}

export interface AiditorIntroRepeatedRefs {}

export type AiditorIntroContract = JayContract<AiditorIntroViewState, AiditorIntroRefs, AiditorIntroSlowViewState, AiditorIntroFastViewState, AiditorIntroInteractiveViewState>