// GENERATED FILE — do not edit manually. Run: node scripts/sync-agent-kit-docs.cjs
import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsSidebarContract } from './docs-sidebar.jay-contract';
import { ActivePage, ActiveRole } from './docs-sidebar.jay-contract';

export const DocsSidebar = makeJayStackComponent<DocsSidebarContract>()
  .withProps<{ activePage?: string; activeRole?: string; activePageTitle?: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({
      activePage: (props.activePage ?? '') as unknown as ActivePage,
      activeRole: (props.activeRole ?? '') as unknown as ActiveRole,
      activePageTitle: props.activePageTitle,
    }, {});
  });
