import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { SiteHeaderContract } from './site-header.jay-contract.generated';

export const SiteHeader = makeJayStackComponent<SiteHeaderContract>()
  .withFastRender(async () => {
    return phaseOutput({}, {});
  });
