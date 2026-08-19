import {JayContract} from "@jay-framework/runtime";


export interface DocsSidebarViewState {
  currentPath: string,
  activePageTitle: string
}

export type DocsSidebarSlowViewState = Pick<DocsSidebarViewState, 'currentPath' | 'activePageTitle'>;

export type DocsSidebarFastViewState = {};

export type DocsSidebarInteractiveViewState = {};

export interface DocsSidebarRefs {}

export interface DocsSidebarRepeatedRefs {}

export interface DocsSidebarProps {
  currentPath?: string;
  activePageTitle?: string;
}

export type DocsSidebarContract = JayContract<DocsSidebarViewState, DocsSidebarRefs, DocsSidebarSlowViewState, DocsSidebarFastViewState, DocsSidebarInteractiveViewState, DocsSidebarProps>