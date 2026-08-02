import {JayElement, RenderElement, RenderElementOptions, JayContract} from "@jay-framework/runtime";
import {MarkdownPagesViewState, MarkdownPagesRefs, TagOfMarkdownPagesViewState} from "../../../../../node_modules/@jay-framework/markdown/dist/contracts/markdown-pages.jay-contract";
import {SiteHeaderViewState, SiteHeaderRefs, SiteHeaderInteractiveViewState} from "../../../../components/site-header/site-header.jay-contract";
import {SiteHeader} from "../../../../components/site-header/site-header";
import {SiteFooterViewState, SiteFooterRefs, SiteFooterInteractiveViewState} from "../../../../components/site-footer/site-footer.jay-contract";
import {SiteFooter} from "../../../../components/site-footer/site-footer";
import {DocsSidebarViewState, DocsSidebarRefs, ActivePage, DocsSidebarInteractiveViewState} from "../../../../components/docs-sidebar/docs-sidebar.jay-contract";
import {DocsSidebar} from "../../../../components/docs-sidebar/docs-sidebar";

import './page.css';

export interface PageViewState {
  post?: MarkdownPagesViewState,
  activePage: string
}


export interface PageElementRefs {
  ar0: SiteHeaderRefs,
  post: MarkdownPagesRefs
}

export type DocsContractsPageSlowViewState = Pick<PageViewState, 'activePage'>;

export type DocsContractsPageFastViewState = {};

export type DocsContractsPageInteractiveViewState = {};

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