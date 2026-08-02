import {JayContract} from "@jay-framework/runtime";


export interface DesignLogViewState {}

export type DesignLogSlowViewState = {};

export type DesignLogFastViewState = {};

export type DesignLogInteractiveViewState = {};

export interface DesignLogRefs {}

export interface DesignLogRepeatedRefs {}

export type DesignLogContract = JayContract<DesignLogViewState, DesignLogRefs, DesignLogSlowViewState, DesignLogFastViewState, DesignLogInteractiveViewState>