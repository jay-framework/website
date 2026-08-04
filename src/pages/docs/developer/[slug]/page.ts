import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsDeveloperPageContract } from './page.jay-contract';

export const page = makeJayStackComponent<DocsDeveloperPageContract>()
  .withProps<{ slug: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `developer_${props.slug.replace(/-/g, '_')}`, activeRole: 'developer' }, {});
  });
