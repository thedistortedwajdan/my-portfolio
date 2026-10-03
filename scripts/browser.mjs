// Shared helpers for the scripts that start a preview server and drive Chromium.
import { preview } from 'vite';
import { chromium } from '@playwright/test';

export async function startPreview() {
  const server = await preview({ preview: { port: 4173, strictPort: true, open: false } });
  const url = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '') ?? 'http://localhost:4173';
  return { server, url };
}

export function chromiumPath() {
  return process.env.PW_CHROMIUM_PATH || process.env.CHROME_PATH || chromium.executablePath();
}

export function launchOptions() {
  const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
  return { executablePath };
}

export { chromium };
