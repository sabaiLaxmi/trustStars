import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useRouteError } from "react-router";
import { Page, Layout, Grid, Card, BlockStack, Text, Button, List, Box, Badge, InlineStack, InlineGrid } from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Pricing() {
  return (
    <Page title="Pricing Plans" subtitle="Choose the right plan for your business.">
      <Layout>
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
                    
                    <Button disabled fullWidth>Current Plan</Button>
                  </BlockStack>
                </Card>
            </div>
            {/* Starter Plan */}
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingLg">Starter</Text>
                    <Text as="p" variant="headingXl" fontWeight="bold">$4.99 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
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
                            <Badge tone="info">Coming soon</Badge>
                            <Text as="span">Font customization</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="info">Coming soon</Badge>
                            <Text as="span">Image upload (up to 2/form)</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="info">Coming soon</Badge>
                            <Text as="span">Theme access</Text>
                          </InlineStack>
                        </List.Item>
                        <List.Item>
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Badge tone="info">Coming soon</Badge>
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
                    
                    <Button variant="secondary" onClick={() => shopify.toast.show('Billing integration coming soon')} fullWidth>Upgrade to Starter</Button>
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
                  <Text as="p" variant="headingXl" fontWeight="bold">$9.99 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
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
                          <Badge tone="info">Coming soon</Badge>
                          <Text as="span">Field add/remove</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="info">Coming soon</Badge>
                          <Text as="span">Full theme customization</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="info">Coming soon</Badge>
                          <Text as="span">Branding removal</Text>
                        </InlineStack>
                      </List.Item>
                      <List.Item>
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Badge tone="success">Available now</Badge>
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
                  
                  <Button variant="primary" onClick={() => shopify.toast.show('Billing integration coming soon')} fullWidth>Upgrade to Pro</Button>
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
