import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";
import {TemplatesDataListViewState, TemplatesDataListRefs, ItemOfTemplatesDataListViewState} from "../../../agent-kit/materialized-contracts/data-files/data-list-templates.jay-contract";
import {PluginsDataListViewState, PluginsDataListRefs, ItemOfPluginsDataListViewState} from "../../../agent-kit/materialized-contracts/data-files/data-list-plugins.jay-contract";
import {SiteHeaderViewState, SiteHeaderRefs, SiteHeaderInteractiveViewState} from "../../components/site-header/site-header.jay-contract";
import {SiteHeader} from "../../components/site-header/site-header";
import {SiteFooterViewState, SiteFooterRefs, SiteFooterInteractiveViewState} from "../../components/site-footer/site-footer.jay-contract";
import {SiteFooter} from "../../components/site-footer/site-footer";

import './page.css';

export interface PageViewState {
  templates?: TemplatesDataListViewState,
  plugins?: PluginsDataListViewState
}


export interface PageElementRefs {
  ar0: SiteHeaderRefs,
  templates: TemplatesDataListRefs,
  plugins: PluginsDataListRefs
}

export type EcosystemSlowViewState = {};

export type EcosystemFastViewState = {};

export type EcosystemInteractiveViewState = {};

export type PageElement = JayElement<PageViewState, PageElementRefs>
export type PageElementRender = RenderElement<PageViewState, PageElementRefs, PageElement>
export type PageElementPreRender = [PageElementRefs, PageElementRender]
export type PageContract = JayContract<
    PageViewState,
    PageElementRefs,
    PageSlowViewState,
    PageFastViewState,
    PageInteractiveViewState
>;


export declare function render(options?: RenderElementOptions): PageElementPreRender