import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useRouteError } from "react-router";
import { Page, Layout, Grid, Card, BlockStack, Text, Button, List, Box } from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Pricing() {
  return (
    <Page title="Pricing">
      <Layout>
        <Layout.Section>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">Free Plan</Text>
                  <Text as="p" variant="headingXl" fontWeight="bold">$0</Text>
                  <Text as="p" tone="subdued">Perfect for getting started</Text>
                  
                  <Box paddingBlockStart="400" paddingBlockEnd="400">
                    <List type="bullet">
                      <List.Item>Access to basic templates</List.Item>
                      <List.Item>Up to 100 form submissions / mo</List.Item>
                      <List.Item>Standard email support</List.Item>
                    </List>
                  </Box>
                  
                  <Button disabled fullWidth>Current Plan</Button>
                </BlockStack>
              </Card>
            </Grid.Cell>
            
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">Pro Plan</Text>
                  <Text as="p" variant="headingXl" fontWeight="bold">$9.99 <Text as="span" variant="bodyLg" tone="subdued">/ month</Text></Text>
                  <Text as="p" tone="subdued">For growing businesses</Text>
                  
                  <Box paddingBlockStart="400" paddingBlockEnd="400">
                    <List type="bullet">
                      <List.Item>Access to basic templates</List.Item>
                      <List.Item>Unlock all premium templates</List.Item>
                      <List.Item>Unlimited form submissions</List.Item>
                      <List.Item>Priority 24/7 support</List.Item>
                      <List.Item>Remove branding</List.Item>
                    </List>
                  </Box>
                  
                  <Button variant="primary" onClick={() => console.log('Initiate charge')} fullWidth>Upgrade to Pro</Button>
                </BlockStack>
              </Card>
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
