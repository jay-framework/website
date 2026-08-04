import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsDesignerPageContract } from './page.jay-contract';

export const page = makeJayStackComponent<DocsDesignerPageContract>()
  .withProps<{ slug: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `designer_${props.slug.replace(/-/g, '_')}`, activeRole: 'designer' }, {});
  });
