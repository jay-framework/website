import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsPluginPageContract } from './page.jay-contract';

export const page = makeJayStackComponent<DocsPluginPageContract>()
  .withProps<{ slug: string }>()
  .withSlowlyRender(async (props) => {
    return phaseOutput({ activePage: `plugin_${props.slug.replace(/-/g, '_')}`, activeRole: 'plugin' }, {});
  });
