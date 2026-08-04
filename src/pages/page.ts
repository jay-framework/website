import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { PageContract } from './page.jay-contract';

export const page = makeJayStackComponent<PageContract>().withProps().withSlowlyRender(async () => {
    return phaseOutput(
        {
            title: 'Jay Framework | AI Agents Wired for the Web',
            description:
                'Jay bridges the gap between probabilistic AI outputs and deterministic engineering standards. The self-correcting visual ecosystem for AI-native web development.',
        },
        {},
    );
});
