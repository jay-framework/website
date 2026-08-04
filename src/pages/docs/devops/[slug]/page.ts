import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsDevopsPageContract } from './page.jay-contract';

export const page = makeJayStackComponent<DocsDevopsPageContract>()
  .withProps<{ slug: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `devops_${props.slug.replace(/-/g, '_')}`, activeRole: 'devops' }, {});
  });
