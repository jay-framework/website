import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { SiteFooterContract } from './site-footer.jay-contract';

export const SiteFooter = makeJayStackComponent<SiteFooterContract>()
  .withProps()
  .withFastRender(async () => {
    return phaseOutput({}, {});
  });
