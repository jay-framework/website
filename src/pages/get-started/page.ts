import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { GetStartedContract } from './page.jay-contract';

export const page = makeJayStackComponent<GetStartedContract>().withProps().withSlowlyRender(async () => {
    return phaseOutput(
        {
            title: 'Get Started | Jay Framework',
            description:
                'Get started with Jay — the AI-native full-stack framework. One command to scaffold a project, then build with AI agents.',
        },
        {},
    );
});
