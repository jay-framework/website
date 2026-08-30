import {JayContract} from "@jay-framework/runtime";


export interface GetStartedViewState {
  title: string,
  description: string
}

export type GetStartedSlowViewState = Pick<GetStartedViewState, 'title' | 'description'>;

export type GetStartedFastViewState = {};

export type GetStartedInteractiveViewState = {};

export interface GetStartedRefs {}

export interface GetStartedRepeatedRefs {}

export type GetStartedContract = JayContract<GetStartedViewState, GetStartedRefs, GetStartedSlowViewState, GetStartedFastViewState, GetStartedInteractiveViewState>