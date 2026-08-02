import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { PageContract } from './page.jay-contract';

export const page = makeJayStackComponent<PageContract>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `devops_${props.slug.replace(/-/g, '_')}` }, {});
  });
