import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useRouteError, useSubmit, redirect } from "react-router";
import { Page, Layout, Card, Button, BlockStack, Text, Badge, Grid, List, Box, InlineStack, Divider, Modal } from "@shopify/polaris";
import { templates } from "../data/templates";
import db from "../db.server";
import * as LucideIcons from 'lucide-react';
import { useCallback, useState } from "react";

// Simulated current plan for locking logic
const CURRENT_PLAN = "FREE";
const PLAN_LEVELS = { FREE: 1, BASIC: 2, PRO: 3 };

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const templateId = parseInt(params.id, 10);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Response("Not Found", { status: 404 });
  }

  return { template };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const templateId = parseInt(params.id, 10);
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Response("Not Found", { status: 404 });
  }

  const defaultFields = [
    { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
    { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
    { type: 'TEXTAREA', label: 'Message', placeholder: 'How can we help?', required: false, order: 2 }
  ];

  const form = await db.form.create({
    data: {
      shop: session.shop,
      title: template.name,
      description: template.description,
      submitText: "Submit",
      fields: {
        create: defaultFields
      }
    }
  });

  return redirect(`/app/forms/${form.id}`);
};

export default function TemplateDetail() {
  const { template } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const IconComponent = LucideIcons[template.iconName] || LucideIcons.FileText;

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const isUpgradeRequired = PLAN_LEVELS[template.plan] > PLAN_LEVELS[CURRENT_PLAN];

  const handleUseTemplate = useCallback(() => {
    if (isUpgradeRequired) {
      setIsUpgradeModalOpen(true);
      return;
    }
    submit({}, { method: "post" });
  }, [isUpgradeRequired, submit]);

  const handleCloseModal = useCallback(() => setIsUpgradeModalOpen(false), []);
  const handleUpgrade = useCallback(() => {
    navigate('/app/pricing');
  }, [navigate]);

  const requiredPlanName = template.plan === "PRO" ? "Pro" : "Starter";

  // Mock data for the detailed view
  const mockFeatures = ["Fully responsive design", "Spam protection (reCAPTCHA)", "Automatic email notifications", "Customizable success message"];
  const mockUseCases = ["Capture customer inquiries", "Provide dedicated support", "Collect lead information"];
  const mockFAQs = [
    { q: "Can I customize the fields?", a: "Yes, you can add, remove, and reorder fields after creating the form." },
    { q: "Where do submissions go?", a: "All submissions are securely stored in your TrustStars dashboard." }
  ];

  return (
    <Page
      title={template.name}
      backAction={{ content: 'Back to Gallery', onAction: () => navigate('/app/templates') }}
      primaryAction={{ 
        content: isUpgradeRequired ? 'Upgrade to Use' : 'Use Template', 
        onAction: handleUseTemplate,
        variant: 'primary'
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* Large Preview */}
            <Card padding="0">
              <div style={{ 
                height: '350px', 
                backgroundColor: '#F6F8FB',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottom: '1px solid #E5E7EB',
                position: 'relative'
              }}>
                <div style={{
                  width: '60%',
                  maxWidth: '500px',
                  height: '250px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <IconComponent size={24} color="#008060" />
                    <div style={{ width: '50%', height: '12px', backgroundColor: '#E5E7EB', borderRadius: '6px' }} />
                  </div>
                  {Array.from({ length: Math.min(4, template.fieldsCount || 4) }).map((_, i) => (
                    <div key={i} style={{ width: '100%', height: '36px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', marginBottom: '16px' }} />
                  ))}
                  <div style={{ width: '100%', height: '40px', backgroundColor: '#008060', borderRadius: '6px', opacity: 0.9, marginTop: 'auto' }} />
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <Text variant="bodyLg" tone="subdued">{template.description}</Text>
              </div>
            </Card>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
                <Card title="Features">
                  <Box paddingBlockStart="200" paddingBlockEnd="200">
                    <Text variant="headingMd" as="h3">Key Features</Text>
                    <Box paddingBlockStart="200">
                      <List type="bullet">
                        {mockFeatures.map((feature, i) => <List.Item key={i}>{feature}</List.Item>)}
                      </List>
                    </Box>
                  </Box>
                  
                  <Box paddingBlockStart="400" paddingBlockEnd="200">
                    <Text variant="headingMd" as="h3">Use Cases</Text>
                    <Box paddingBlockStart="200">
                      <List type="bullet">
                        {mockUseCases.map((useCase, i) => <List.Item key={i}>{useCase}</List.Item>)}
                      </List>
                    </Box>
                  </Box>
                </Card>
              </Grid.Cell>
              
              <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h3">Template Info</Text>
                    
                    <InlineStack align="space-between" blockAlign="center">
                      <Text tone="subdued">Category</Text>
                      <Badge tone="attention">{template.category}</Badge>
                    </InlineStack>
                    <Divider />
                    
                    <InlineStack align="space-between" blockAlign="center">
                      <Text tone="subdued">Supported Plans</Text>
                      {template.plan === "PRO" ? (
                        <Badge tone="magic">Pro</Badge>
                      ) : template.plan === "BASIC" ? (
                        <Badge tone="info">Starter & Pro</Badge>
                      ) : (
                        <Badge tone="success">All Plans</Badge>
                      )}
                    </InlineStack>
                    <Divider />
                    
                    <InlineStack align="space-between" blockAlign="center">
                      <Text tone="subdued">Included Fields</Text>
                      <Text fontWeight="semibold">{template.fieldsCount} Fields</Text>
                    </InlineStack>
                    <Divider />

                    <InlineStack align="space-between" blockAlign="center">
                      <Text tone="subdued">Setup Time</Text>
                      <Text fontWeight="semibold">{template.setupTime}</Text>
                    </InlineStack>
                    <Divider />
                    
                    <InlineStack align="space-between" blockAlign="center">
                      <Text tone="subdued">Best For</Text>
                      <Text fontWeight="semibold">E-commerce Stores</Text>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            </Grid>

            <Card>
              <Box padding="400">
                <Text variant="headingLg" as="h3">Frequently Asked Questions</Text>
                <Box paddingBlockStart="400">
                  <BlockStack gap="400">
                    {mockFAQs.map((faq, i) => (
                      <div key={i}>
                        <Text variant="headingMd" as="h4">{faq.q}</Text>
                        <Box paddingBlockStart="100">
                          <Text tone="subdued" variant="bodyMd">{faq.a}</Text>
                        </Box>
                      </div>
                    ))}
                  </BlockStack>
                </Box>
              </Box>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Upgrade Modal */}
      <Modal
        open={isUpgradeModalOpen}
        onClose={handleCloseModal}
        title={`Upgrade to ${requiredPlanName} Plan`}
        primaryAction={{
          content: 'Upgrade Plan',
          onAction: handleUpgrade,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p">
              The <strong>{template.name}</strong> template is a premium feature available on the {requiredPlanName} plan and above. 
              Upgrade your plan to unlock this template and access powerful new tools for your store.
            </Text>
            
            <Box paddingBlockStart="400">
              <Text variant="headingSm" as="h3">What you get when you upgrade:</Text>
              <Box paddingBlockStart="200">
                <List type="bullet">
                  <List.Item>Full access to all {requiredPlanName} templates and features</List.Item>
                  <List.Item>Increased monthly form submission limits</List.Item>
                  <List.Item>Priority support from our team</List.Item>
                </List>
              </Box>
            </Box>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}
