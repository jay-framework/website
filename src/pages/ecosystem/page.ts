import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { EcosystemContract } from './page.jay-contract';

export const page = makeJayStackComponent<EcosystemContract>().withProps().withSlowlyRender(async () => {
    return phaseOutput({}, {});
});
