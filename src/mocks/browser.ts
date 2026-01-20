import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This file configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

