import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { SiteHeaderContract } from './site-header.jay-contract';

export const SiteHeader = makeJayStackComponent<SiteHeaderContract>()
  .withProps()
  .withFastRender(async () => {
    return phaseOutput({}, {});
  });
