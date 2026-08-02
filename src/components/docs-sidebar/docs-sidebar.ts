// GENERATED FILE — do not edit manually. Run: node scripts/sync-agent-kit-docs.cjs
import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsSidebarContract } from './docs-sidebar.jay-contract.generated';

export const DocsSidebar = makeJayStackComponent<DocsSidebarContract>()
  .withProps<{ activePage?: string; activeRole?: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: props.activePage ?? '', activeRole: props.activeRole ?? '' }, {});
  });
