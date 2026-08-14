import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Reset the shop plan to FREE and clear subscriptionId
  await db.shop.updateMany({
    where: { id: shop },
    data: {
      plan: "FREE",
      subscriptionId: null
    }
  });

  return new Response();
};
