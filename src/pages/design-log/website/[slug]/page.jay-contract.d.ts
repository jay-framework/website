import {JayContract} from "@jay-framework/runtime";


export interface DesignLogPostViewState {}

export type DesignLogPostSlowViewState = {};

export type DesignLogPostFastViewState = {};

export type DesignLogPostInteractiveViewState = {};

export interface DesignLogPostRefs {}

export interface DesignLogPostRepeatedRefs {}

export type DesignLogPostContract = JayContract<DesignLogPostViewState, DesignLogPostRefs, DesignLogPostSlowViewState, DesignLogPostFastViewState, DesignLogPostInteractiveViewState>