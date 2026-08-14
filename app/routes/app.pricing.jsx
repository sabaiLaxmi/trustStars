import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useRouteError, useSubmit, useNavigation, useActionData, useLoaderData } from "react-router";
import { Page, Layout, Card, BlockStack, Text, Button, List, Box, Badge, InlineStack, InlineGrid, Banner } from "@shopify/polaris";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing, admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  let error = null;

  // Handle return from billing approval
  if (chargeId) {
    console.log("====== BILLING REDIRECT RECEIVED ======");
    console.log("Charge ID:", chargeId);
    
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
      console.log("GraphQL Data:", JSON.stringify(data, null, 2));
      
      const activeSubscriptions = data?.currentAppInstallation?.activeSubscriptions || [];
      
      const targetSub = activeSubscriptions.find(sub => 
        (sub.name === "Starter" || sub.name === "Pro") && sub.status === "ACTIVE"
      );

      if (targetSub) {
        // Confirm and persist plan
        await db.shop.update({
          where: { id: session.shop },
          data: {
            plan: targetSub.name === "Starter" ? "STARTER" : "PRO",
            subscriptionId: targetSub.id
          }
        });
      } else {
        error = "Upgrade was not completed.";
      }
    } catch (err) {
      console.error("====== BILLING VERIFICATION ERROR ======");
      console.error("Message:", err.message);
      console.error("Full Error Object:", JSON.stringify(err, null, 2));
      console.error("Stack Trace:", err.stack);
      console.error("========================================");
      error = "Failed to verify subscription status. Please try again.";
    }
  }

  const shop = await db.shop.findUnique({ where: { id: session.shop } });
  const currentPlan = shop?.plan || "FREE";

  return { currentPlan, error };
};

export const action = async ({ request }) => {
  const { session, billing, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan"); // "Starter" or "Pro"
  
  if (plan !== "Starter" && plan !== "Pro") {
    return { error: "Invalid plan selected" };
  }

  try {
    const shop = await db.shop.findUnique({ where: { id: session.shop } });
    
    // Step 4: Handle plan changes by cancelling existing subscription first
    if (shop?.subscriptionId) {
      const response = await admin.graphql(`
        mutation appSubscriptionCancel($id: ID!) {
          appSubscriptionCancel(id: $id) {
            appSubscription {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: { id: shop.subscriptionId }
      });
      const data = await response.json();
      if (data?.data?.appSubscriptionCancel?.userErrors?.length > 0) {
        console.error("Error cancelling existing subscription:", data.data.appSubscriptionCancel.userErrors);
      }
    }

    // Step 1: Trigger subscription request
    await billing.request({
      plan: plan,
      isTest: true,
      returnUrl: `${process.env.SHOPIFY_APP_URL}/app/pricing`
    });
  } catch (error) {
    console.error("Billing request error:", error);
    // If it's a redirect error from billing.request, throw it so Remix can redirect
    if (error instanceof Response) {
      throw error;
    }
    return { error: "Failed to initiate billing request. Please try again." };
  }
};

export default function Pricing() {
  const { currentPlan, error: loaderError } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isUpgrading = navigation.state === "submitting" || navigation.state === "loading";
  
  const handleUpgrade = (plan) => {
    submit({ plan }, { method: "post" });
  };

  const error = loaderError || actionData?.error;

  return (
    <Page title="Pricing Plans" subtitle="Choose the right plan for your business.">
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="warning">
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 3 }} gap="400" alignItems="start">
            {/* Free Plan */}
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingLg">Free</Text>
                    <Text as="p" variant="headingXl" fontWeight="bold">$0 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                    <Text as="p" tone="subdued">For individuals just getting started</Text>
                    
                    <Box paddingBlockStart="400" paddingBlockEnd="400" minHeight="300px">
                      <List type="bullet">
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">Text/label editing</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">50 form submissions per month</Text>
                          </InlineStack>
                        </List.Item>
                      </List>
                    </Box>
                    
                    <Button disabled fullWidth>{currentPlan === "FREE" ? "Current Plan" : "Downgrade to Free (Coming Soon)"}</Button>
                  </BlockStack>
                </Card>
            </div>
            {/* Starter Plan */}
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingLg">Starter</Text>
                    <Text as="p" variant="headingXl" fontWeight="bold">$20 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                    <Text as="p" tone="subdued">Perfect for growing stores</Text>
                    
                    <Box paddingBlockStart="400" paddingBlockEnd="400" minHeight="300px">
                      <List type="bullet">
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">Text/label editing</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">Font customization</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">Image upload (up to 2/form)</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">Theme access</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">Basic color customization</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="success">Available now</Badge>
                            <Text as="span">150 form submissions per month</Text>
                          </InlineStack>
                        </List.Item>
                      </List>
                    </Box>
                    
                    {currentPlan === "STARTER" ? (
                      <Button disabled fullWidth>Current Plan</Button>
                    ) : currentPlan === "PRO" ? (
                      <Button onClick={() => handleUpgrade("Starter")} disabled={isUpgrading} fullWidth>Downgrade to Starter</Button>
                    ) : (
                      <Button variant="primary" onClick={() => handleUpgrade("Starter")} loading={isUpgrading} disabled={isUpgrading} fullWidth>Upgrade to Starter</Button>
                    )}
                  </BlockStack>
                </Card>
            </div>
            
            {/* Pro Plan */}
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Highlight Border for Pro */}
              <div style={{
                position: 'absolute',
                top: '-2px', left: '-2px', right: '-2px', bottom: '-2px',
                background: 'linear-gradient(135deg, #008060, #006E52)',
                borderRadius: '14px',
                zIndex: -1
              }} />
              
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingLg">Pro</Text>
                    <Badge tone="success">Most Popular</Badge>
                  </InlineStack>
                  <Text as="p" variant="headingXl" fontWeight="bold">$25 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                  <Text as="p" tone="subdued">For scaling businesses</Text>
                  
                  <Box paddingBlockStart="400" paddingBlockEnd="400" minHeight="300px">
                    <List type="bullet">
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="success">Available now</Badge>
                          <Text as="span">Text/label editing</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="success">Available now</Badge>
                          <Text as="span">Field add/remove</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="success">Available now</Badge>
                          <Text as="span">Full theme customization</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="success">Available now</Badge>
                          <Text as="span">Branding removal</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="info">Coming soon</Badge>
                          <Text as="span">Unlimited form submissions</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="info">Coming soon</Badge>
                          <Text as="span">Unlimited image uploads</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="info">Coming soon</Badge>
                          <Text as="span">Priority support</Text>
                        </InlineStack>
                      </List.Item>
                    </List>
                  </Box>
                  
                  {currentPlan === "PRO" ? (
                    <Button disabled fullWidth>Current Plan</Button>
                  ) : (
                    <Button variant="primary" onClick={() => handleUpgrade("Pro")} loading={isUpgrading} disabled={isUpgrading} fullWidth>Upgrade to Pro</Button>
                  )}
                </BlockStack>
              </Card>
            </div>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}
