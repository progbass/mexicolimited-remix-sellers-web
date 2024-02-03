import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useRouteError,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import stylesheet from "../tailwind/tailwind.css";

import AuthService from "~/services/Auth.service";
import { FetcherConfigurationProvider } from '~/providers/FetcherConfigurationContext';
import { Fetcher } from '~/utils/fetcher';

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

// LOADER FUNCTION
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // If the user is already authenticated redirect to /dashboard directly
  const user = await AuthService.isAuthenticated(request) || null;

  return json({
    user: user,
    ENV_VARS: {
      API_URL: process.env.API_URL,
      MARKETPLACE_URL: process.env.MARKETPLACE_URL,
    }
  });
};

// MAIN APP COMPONENT
export default function App() {
  const { ENV_VARS, user } = useLoaderData<typeof loader>();

  //
  const fetcher = new Fetcher(user ? user.token : null);
    
  //
  return (
    <html lang="es" className="h-full bg-gray-100">
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV_VARS)}`,
          }}
        />
      </head>
      <body className="h-full">
        <FetcherConfigurationProvider fetcher={fetcher}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </FetcherConfigurationProvider>
      </body>
    </html>
  );
}

// ERROR BOUNDARY COMPONENT
export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="es" className="h-full bg-gray-100">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {/* <Outlet /> */}
        Se produjo un error desconocido.
        <pre>code [{error?.status}] {error?.message}</pre>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}