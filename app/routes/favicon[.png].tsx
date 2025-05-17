import type { LoaderFunctionArgs } from "@remix-run/node";

// This route handles requests for /favicon.png
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Redirect to the SVG favicon that exists in the public directory
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/favicon.svg",
    },
  });
};

// No need for a default export since this is just a resource route
