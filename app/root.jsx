import { Links, Meta, Outlet, Scripts, ScrollRestoration, useMatches } from "react-router";

export default function App() {
  const matches = useMatches();
  const isProxy = matches.some((match) => match.handle?.isProxy);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        {!isProxy && <Links />}
      </head>
      <body>
        <Outlet />
        {!isProxy && <ScrollRestoration />}
        {!isProxy && <Scripts />}
      </body>
    </html>
  );
}
