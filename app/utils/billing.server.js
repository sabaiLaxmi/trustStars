import db from "../db.server";

export async function verifyAndSyncPlan(admin, session) {
  try {
    const response = await admin.graphql(`
      query {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
          }
        }
      }
    `);
    
    const { data } = await response.json();
    const activeSubscriptions = data?.currentAppInstallation?.activeSubscriptions || [];
    
    const targetSub = activeSubscriptions.find(sub => 
      (sub.name === "Starter" || sub.name === "Pro") && sub.status === "ACTIVE"
    );

    const actualPlan = targetSub ? (targetSub.name === "Starter" ? "STARTER" : "PRO") : "FREE";
    const actualSubId = targetSub ? targetSub.id : null;

    const shopData = await db.shop.findUnique({ where: { id: session.shop } });
    const dbPlan = shopData?.plan || "FREE";
    const dbSubId = shopData?.subscriptionId || null;

    // Sync if mismatched
    if (actualPlan !== dbPlan || actualSubId !== dbSubId) {
      await db.shop.upsert({
        where: { id: session.shop },
        create: { id: session.shop, plan: actualPlan, subscriptionId: actualSubId },
        update: { plan: actualPlan, subscriptionId: actualSubId }
      });
    }

    return actualPlan;
  } catch (error) {
    console.error("Error verifying subscription:", error);
    // If it fails, fallback to what's in the DB to not block the merchant
    const shopData = await db.shop.findUnique({ where: { id: session.shop } });
    return shopData?.plan || "FREE";
  }
}
