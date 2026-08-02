import {JayContract} from "@jay-framework/runtime";


export enum ActivePage {
  designer_instructions,
  designer_accordion,
  designer_cli_commands,
  designer_click_popover,
  designer_clipboard_copy,
  designer_contracts_and_plugins,
  designer_design_system,
  designer_routing,
  designer_jay_html_syntax,
  designer_jay_html_components,
  designer_jay_html_styling,
  designer_jay_html_template_syntax,
  designer_letter_split,
  designer_markdown_usage,
  designer_popover_menu,
  designer_project_structure,
  designer_script_tags,
  designer_scroll_carousel,
  designer_spring_button_hover,
  designer_sticky_header_scroll,
  designer_tabs,
  designer_toggle_switch,
  designer_tooltip,
  designer_wix_media,
  designer_word_split,
  developer_instructions,
  developer_cli_commands,
  developer_component_refs,
  developer_component_state,
  developer_configuration,
  developer_dev_server_service,
  developer_routing,
  developer_component_data,
  developer_page_components,
  developer_page_contracts,
  developer_project_structure,
  developer_render_results,
  developer_seo_guide,
  plugin_instructions,
  plugin_aiditor_add_menu,
  plugin_add_menu_guide,
  plugin_commands_guide,
  plugin_component_context,
  plugin_component_refs,
  plugin_component_state,
  plugin_component_structure,
  plugin_dev_server_service,
  plugin_component_data,
  plugin_contracts_guide,
  plugin_plugin_routes,
  plugin_setup_guide,
  plugin_plugin_structure,
  plugin_validation,
  plugin_render_results,
  plugin_seo_guide,
  plugin_actions_guide,
  plugin_services_guide,
  plugin_webhooks_guide,
  devops_instructions,
  devops_wix_baas_deployment,
  devops_fetch_handler,
  devops_invalidation,
  devops_production_build,
  devops_serving_modes,
  contracts_guide,
  contracts_syntax,
  contracts_component_contracts,
  contracts_linked_contracts,
  contracts_page_contracts
}

export enum ActiveRole {
  designer,
  developer,
  plugin,
  devops,
  contracts
}

export interface DocsSidebarViewState {
  activePage: ActivePage,
  activeRole: ActiveRole
}

export type DocsSidebarSlowViewState = Pick<DocsSidebarViewState, 'activePage' | 'activeRole'>;

export type DocsSidebarFastViewState = {};

export type DocsSidebarInteractiveViewState = {};

export interface DocsSidebarRefs {}

export interface DocsSidebarRepeatedRefs {}

export interface DocsSidebarProps {
  activePage?: string;
  activeRole?: string;
}

export type DocsSidebarContract = JayContract<DocsSidebarViewState, DocsSidebarRefs, DocsSidebarSlowViewState, DocsSidebarFastViewState, DocsSidebarInteractiveViewState, DocsSidebarProps>