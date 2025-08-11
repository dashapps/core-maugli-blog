import { buildSW } from 'virtual:pwa-register';

export const GET = async () =>
  new Response(await buildSW(), {
    headers: { 'Content-Type': 'application/javascript' }
  });
