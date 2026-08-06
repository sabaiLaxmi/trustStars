import { useState, useCallback } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useRouteError } from "react-router";
import { Page, Layout, Card, FormLayout, TextField, Button, BlockStack, Text, Banner } from "@shopify/polaris";
import { templates } from "../data/templates";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const templateId = parseInt(params.id, 10);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Response("Not Found", { status: 404 });
  }

  return { template };
};

export default function TemplateDetail() {
  const { template } = useLoaderData();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNameChange = useCallback((value) => setName(value), []);
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handleMessageChange = useCallback((value) => setMessage(value), []);

  const handleSubmit = useCallback(() => {
    setShowSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
  }, []);

  const handleDismissBanner = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return (
    <Page
      title={template.name}
      backAction={{ content: 'Back to Gallery', onAction: () => navigate('/app') }}
    >
      <Layout>
        <Layout.Section>
          <div style={{ position: 'relative' }}>
            <Card>
              <div
                style={{
                  filter: template.isPro ? 'blur(2px)' : 'none',
                  opacity: template.isPro ? 0.6 : 1,
                  pointerEvents: template.isPro ? 'none' : 'auto'
                }}
              >
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Sample Form UI</Text>
                  
                  {showSuccess && (
                    <Banner
                      title="Message sent successfully!"
                      tone="success"
                      onDismiss={handleDismissBanner}
                    />
                  )}

                  <FormLayout>
                    <TextField 
                      label="Full Name" 
                      placeholder="Jane Doe" 
                      autoComplete="off" 
                      value={name}
                      onChange={handleNameChange}
                    />
                    <TextField 
                      label="Email Address" 
                      placeholder="jane@example.com" 
                      type="email" 
                      autoComplete="off" 
                      value={email}
                      onChange={handleEmailChange}
                    />
                    <TextField 
                      label="Message" 
                      placeholder="How can we help?" 
                      multiline={4} 
                      autoComplete="off" 
                      value={message}
                      onChange={handleMessageChange}
                    />
                    <Button onClick={handleSubmit}>Submit</Button>
                  </FormLayout>
                </BlockStack>
              </div>
            </Card>

            {template.isPro && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <Card>
                  <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <BlockStack gap="400" align="center" inlineAlign="center">
                      <Text as="h3" variant="headingMd">
                        Upgrade to Pro to use this template
                      </Text>
                      <Button variant="primary" onClick={() => console.log('Navigate to pricing')}>
                        View Pricing
                      </Button>
                    </BlockStack>
                  </div>
                </Card>
              </div>
            )}
          </div>
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
