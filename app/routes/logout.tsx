import { redirect } from "@remix-run/node";

// Since we're handling logout on the client side in UserProfileDropdown.client.tsx,
// this route just redirects back to the home page
export async function action() {
  return redirect('/');
}

// If someone navigates to /logout directly, redirect them to the home page
export async function loader() {
  return redirect('/');
}
