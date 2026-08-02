import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { PageContract } from './page.jay-contract';

export const page = makeJayStackComponent<PageContract>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `contracts_${props.slug.replace(/-/g, '_')}`, activeRole: 'contracts' }, {});
  });
