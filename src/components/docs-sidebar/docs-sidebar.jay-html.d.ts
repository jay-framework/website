import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";

import './docs-sidebar.css';

export interface DocsSidebarViewState {
  currentPath: string,
  activePageTitle: string
}

export interface DocsSidebarElementRefs {}

export type DocsSidebarSlowViewState = Pick<DocsSidebarViewState, 'currentPath' | 'activePageTitle'>;

export type DocsSidebarFastViewState = {};

export type DocsSidebarInteractiveViewState = {};

export type DocsSidebarElement = JayElement<DocsSidebarViewState, DocsSidebarElementRefs>
export type DocsSidebarElementRender = RenderElement<DocsSidebarViewState, DocsSidebarElementRefs, DocsSidebarElement>
export type DocsSidebarElementPreRender = [DocsSidebarElementRefs, DocsSidebarElementRender]
export type DocsSidebarContract = JayContract<
    DocsSidebarViewState,
    DocsSidebarElementRefs,
    DocsSidebarSlowViewState,
    DocsSidebarFastViewState,
    DocsSidebarInteractiveViewState
>;


export declare function render(options?: RenderElementOptions): DocsSidebarElementPreRender