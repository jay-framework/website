// GENERATED FILE — do not edit manually. Run: node scripts/sync-agent-kit-docs.cjs
import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsSidebarContract } from './docs-sidebar.jay-contract';

export const DocsSidebar = makeJayStackComponent<DocsSidebarContract>()
  .withProps<{ currentPath?: string; activePageTitle?: string }>()
  .withSlowlyRender(async (props: { currentPath?: string; activePageTitle?: string }) => {
    return phaseOutput({
      currentPath: props.currentPath ?? '',
      activePageTitle: props.activePageTitle ?? '',
    }, {});
  });
