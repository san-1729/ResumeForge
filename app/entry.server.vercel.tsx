/**
 * This is a specialized server entry point for Vercel deployment
 * It's designed to be completely safe from client-side dependencies and CommonJS compatible
 */
// Use CommonJS-compatible imports for Vercel Node.js environment
const { PassThrough } = require('node:stream');
const { createReadableStreamFromReadable } = require('@remix-run/node');
const { RemixServer } = require('@remix-run/react');
const { isbot } = require('isbot');
const React = require('react');
// Explicitly use CommonJS require for React DOM server
const ReactDOMServer = require('react-dom/server');
const { renderToPipeableStream } = ReactDOMServer;
const { renderHeadToString } = require('remix-island');
// Import types separately to avoid mixing import styles
import type { AppLoadContext, EntryContext } from '@remix-run/node';
// Root component needs to be imported this way because it uses JSX
const { Head } = require('./root');

// Safe theme access that won't crash on the server
const getTheme = () => {
  try {
    // Only try to access the store if it's safe
    const { themeStore } = require('./lib/stores/theme');
    return themeStore?.value || 'light';
  } catch (e) {
    // Fallback to light theme if there's any error
    return 'light';
  }
};

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  return isbot(request.headers.get('user-agent') || '')
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onAllReady() {
          const head = renderHeadToString({ request, remixContext, Head });
          const body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(
              createReadableStreamFromReadable(body),
              {
                headers: responseHeaders,
                status: responseStatusCode,
              }
            )
          );

          body.write(`<!DOCTYPE html><html lang="en" data-theme="${getTheme()}"><head>${head}</head><body><div id="root" class="w-full h-full">`);
          pipe(body);
          body.write(`</div></body></html>`);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          const head = renderHeadToString({ request, remixContext, Head });
          const body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(
              createReadableStreamFromReadable(body),
              {
                headers: responseHeaders,
                status: responseStatusCode,
              }
            )
          );

          body.write(`<!DOCTYPE html><html lang="en" data-theme="${getTheme()}"><head>${head}</head><body><div id="root" class="w-full h-full">`);
          pipe(body);
          body.write(`</div></body></html>`);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
