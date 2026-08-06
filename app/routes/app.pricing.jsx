import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useRouteError } from "react-router";
import { Page, Layout, Grid, Card, BlockStack, Text, Button, List, Box, Badge, InlineStack } from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Pricing() {
  return (
    <Page title="Pricing Plans" subtitle="Choose the right plan for your business.">
      <Layout>
        <Layout.Section>
          <Grid>
            {/* Free Plan */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">Free</Text>
                  <Text as="p" variant="headingXl" fontWeight="bold">$0 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                  <Text as="p" tone="subdued">Perfect for getting started</Text>
                  
                  <Box paddingBlockStart="400" paddingBlockEnd="400">
                    <List type="bullet">
                      <List.Item><strong>1 Active Form</strong></List.Item>
                      <List.Item><strong>50 Submissions</strong> / month</List.Item>
                      <List.Item>Basic Templates</List.Item>
                      <List.Item>Community Support</List.Item>
                    </List>
                  </Box>
                  
                  <Button disabled fullWidth>Current Plan</Button>
                </BlockStack>
              </Card>
            </Grid.Cell>
            
            {/* Starter Plan */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingLg">Starter</Text>
                  </InlineStack>
                  <Text as="p" variant="headingXl" fontWeight="bold">$9 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                  <Text as="p" tone="subdued">For growing businesses</Text>
                  
                  <Box paddingBlockStart="400" paddingBlockEnd="400">
                    <List type="bullet">
                      <List.Item><strong>5 Active Forms</strong></List.Item>
                      <List.Item><strong>500 Submissions</strong> / month</List.Item>
                      <List.Item>Premium Templates</List.Item>
                      <List.Item>Email Support</List.Item>
                    </List>
                  </Box>
                  
                  <Button onClick={() => console.log('Initiate charge')} fullWidth>Upgrade to Starter</Button>
                </BlockStack>
              </Card>
            </Grid.Cell>

            {/* Pro Plan */}
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <div style={{ position: 'relative', height: '100%' }}>
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
                    <Text as="p" variant="headingXl" fontWeight="bold">$29 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                    <Text as="p" tone="subdued">For high-volume merchants</Text>
                    
                    <Box paddingBlockStart="400" paddingBlockEnd="400">
                      <List type="bullet">
                        <List.Item><strong>Unlimited Forms</strong></List.Item>
                        <List.Item><strong>Unlimited Submissions</strong></List.Item>
                        <List.Item>Premium Templates & Analytics</List.Item>
                        <List.Item>Priority 24/7 Support</List.Item>
                        <List.Item>Remove Branding</List.Item>
                      </List>
                    </Box>
                    
                    <Button variant="primary" onClick={() => console.log('Initiate charge')} fullWidth>Upgrade to Pro</Button>
                  </BlockStack>
                </Card>
              </div>
            </Grid.Cell>
          </Grid>
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
