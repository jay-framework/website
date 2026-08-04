import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsContractsPageContract } from './page.jay-contract';

export const page = makeJayStackComponent<DocsContractsPageContract>()
  .withProps<{ slug: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `contracts_${props.slug.replace(/-/g, '_')}`, activeRole: 'contracts' }, {});
  });
