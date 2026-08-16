import { Outlet, useLoaderData, useRouteError, useLocation, Link, isRouteErrorResponse } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { AnimatePresence, motion } from "framer-motion";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const meta = ({ data }) => [{ name: "shopify-api-key", content: data?.apiKey || "" }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();
  const location = useLocation();

  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <AppProvider embedded apiKey={apiKey}>
        <ui-nav-menu>
          <Link to="/app" rel="home">Dashboard</Link>
          <Link to="/app/templates">Templates</Link>
          <Link to="/app/wishlist">Wishlist</Link>
          <Link to="/app/pricing">Pricing</Link>
        </ui-nav-menu>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </AppProvider>
    </PolarisAppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 200) {
    return <div dangerouslySetInnerHTML={{ __html: error.data }} />;
  }
  return boundary.error(error);
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
