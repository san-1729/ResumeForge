/**
 * This is a specialized server entry point for Vercel deployment
 * Using pure CommonJS syntax for maximum Node.js compatibility
 */

// Use CommonJS-compatible require statements for all imports
const { PassThrough } = require('stream');
const { createReadableStreamFromReadable } = require('@remix-run/node');
const { RemixServer } = require('@remix-run/react');
const { isbot } = require('isbot');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { renderToPipeableStream } = ReactDOMServer;
const { renderHeadToString } = require('remix-island');
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

// Export using module.exports for CommonJS compatibility
module.exports = async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  loadContext
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
};

function handleBotRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      React.createElement(RemixServer, {
        context: remixContext,
        url: request.url
      }),
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
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      React.createElement(RemixServer, {
        context: remixContext,
        url: request.url
      }),
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
                status: didError ? 500 : responseStatusCode,
              }
            )
          );

          body.write(`<!DOCTYPE html><html lang="en" data-theme="${getTheme()}"><head>${head}</head><body><div id="root" class="w-full h-full">`);
          pipe(body);
          body.write(`</div></body></html>`);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
