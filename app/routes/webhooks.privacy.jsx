import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't available if the webhook is not authenticated by Shopify.
    return new Response();
  }

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // Shopify requests customer data for a specific customer.
      // E.g., The customer asked the merchant for all their data.
      // If your app stores customer info, you must extract and provide it or confirm you don't have it.
      // For TrustStars, we only store generic form submissions without mapping to a Shopify Customer ID.
      console.log(`Privacy: Customers Data Request for ${shop}`, payload);
      break;

    case "CUSTOMERS_REDACT":
      // Shopify requests you to delete data for a specific customer.
      console.log(`Privacy: Customers Redact Request for ${shop}`, payload);
      break;

    case "SHOP_REDACT":
      // Shopify requests you to delete all data for a specific shop.
      // This happens 48 hours after a merchant uninstalls your app.
      console.log(`Privacy: Shop Redact Request for ${shop}`, payload);
      // Clean up shop data if needed
      await db.form.deleteMany({ where: { shop } });
      await db.submission.deleteMany({ where: { shop } });
      await db.session.deleteMany({ where: { shop } });
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  // Shopify requires a 200 OK response to acknowledge receipt.
  return new Response("Webhook processed", { status: 200 });
};
