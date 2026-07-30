import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { SiteFooterContract } from './site-footer.jay-contract.generated';

export const SiteFooter = makeJayStackComponent<SiteFooterContract>()
  .withFastRender(async () => {
    return phaseOutput({}, {});
  });
