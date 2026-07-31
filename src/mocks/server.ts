import { setupServer } from 'msw/node';

import { handlers } from './handlers';

// MSW request-interception server, started from instrumentation.ts when
// MOCK_BACKEND=1. Intercepts the BFF's server-side upstream fetches.
export const server = setupServer(...handlers);
