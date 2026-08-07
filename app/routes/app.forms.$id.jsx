import { useState, useCallback, useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useSubmit, useActionData, useNavigation, useRouteError } from "react-router";
import { Page, Layout, Card, FormLayout, TextField, Button, BlockStack, Text, Checkbox, Banner, Box, Divider, InlineStack, Badge, Icon, ProgressBar } from "@shopify/polaris";
import { LockIcon } from "@shopify/polaris-icons";
import db from "../db.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formId = params.id;

  const form = await db.form.findFirst({
    where: { id: formId, shop: session.shop },
    include: { fields: { orderBy: { order: 'asc' } } }
  });

  if (!form) {
    throw new Response("Form Not Found", { status: 404 });
  }

  return { form };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formId = params.id;
  
  const form = await db.form.findFirst({
    where: { id: formId, shop: session.shop }
  });

  if (!form) {
    throw new Response("Form Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const title = formData.get("title");
  const description = formData.get("description");
  const submitText = formData.get("submitText");
  const fieldsJson = formData.get("fields");

  let parsedFields = [];
  try {
    parsedFields = JSON.parse(fieldsJson);
  } catch(e) {}

  const status = intent === "publish" ? "PUBLISHED" : "DRAFT";

  await db.$transaction([
    db.formField.deleteMany({ where: { formId } }),
    db.form.update({
      where: { id: formId },
      data: {
        title,
        description,
        submitText,
        status,
        fields: {
          create: parsedFields.map((field, index) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder || "",
            required: field.required === true || field.required === 'true',
            order: index
          }))
        }
      }
    })
  ]);

  return { success: true, status };
};

export default function FormEditor() {
  const { form } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();

  const CURRENT_PLAN = "FREE"; // Hardcoded for testing the locked state
  const hasStarter = CURRENT_PLAN === "STARTER" || CURRENT_PLAN === "PRO";
  const hasPro = CURRENT_PLAN === "PRO";
  const submissionLimit = CURRENT_PLAN === "FREE" ? 50 : CURRENT_PLAN === "STARTER" ? 150 : "Unlimited";

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [submitText, setSubmitText] = useState(form.submitText || "Submit");
  const [fields, setFields] = useState(form.fields || []);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setTitle(form?.title || "Untitled Form");
    setDescription(form?.description || "");
    setSubmitText(form?.submitText || "Submit");
    setFields(form?.fields || []);
  }, [form]);

  useEffect(() => {
    if (actionData?.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [actionData]);

  const handleTitleChange = useCallback((value) => setTitle(value), []);
  const handleDescriptionChange = useCallback((value) => setDescription(value), []);
  const handleSubmitTextChange = useCallback((value) => setSubmitText(value), []);


  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleSave = (intent) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("submitText", submitText);
    formData.append("fields", JSON.stringify(fields));
    
    submit(formData, { method: "post" });
  };

  const isSaving = navigation.state === "submitting";

  return (
    <Page
      breadcrumbs={[{ content: 'Forms', onAction: () => navigate('/app') }]}
      title={title || "Untitled Form"}
      titleMetadata={<Badge tone="info">{CURRENT_PLAN} Plan</Badge>}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {showToast && (
              <Banner tone="success" onDismiss={() => setShowToast(false)}>
                Form saved successfully.
              </Banner>
            )}
            
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Fields</Text>
                <BlockStack gap="600">
                  {fields.map((field, index) => (
                    <BlockStack gap="200" key={field.id || index}>
                      <TextField
                        labelHidden
                        value={field.label}
                        onChange={(val) => updateField(index, 'label', val)}
                        autoComplete="off"
                        placeholder="Field Label"
                      />
                      
                      {field.type === 'TEXTAREA' ? (
                        <TextField
                          labelHidden
                          value=""
                          placeholder={field.placeholder || "Placeholder..."}
                          multiline={4}
                          autoComplete="off"
                          disabled
                        />
                      ) : (
                        <TextField
                          labelHidden
                          value=""
                          placeholder={field.placeholder || "Placeholder..."}
                          autoComplete="off"
                          disabled
                        />
                      )}
                    </BlockStack>
                  ))}
                </BlockStack>
                
                <Box paddingBlockStart="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasPro ? "base" : "subdued"}>Add / Remove Fields</Text>
                      {!hasPro && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasPro && <Badge tone="magic">Pro</Badge>}
                  </InlineStack>
                  <Box paddingBlockStart="200">
                    <div style={{ opacity: hasPro ? 1 : 0.5, pointerEvents: hasPro ? 'auto' : 'none' }}>
                      <Button disabled={!hasPro}>Add Field</Button>
                    </div>
                  </Box>
                </Box>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Settings & Customization</Text>
                
                {/* Font Customization */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasStarter ? "base" : "subdued"}>Font Customization</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <Badge tone="info">Starter</Badge>}
                  </InlineStack>
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <Button disabled={!hasStarter}>Customize Fonts</Button>
                  </div>
                </BlockStack>

                <Divider />

                {/* Color Customization */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasStarter ? "base" : "subdued"}>Basic Color Customization</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <Badge tone="info">Starter</Badge>}
                  </InlineStack>
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <Button disabled={!hasStarter}>Customize Colors</Button>
                  </div>
                </BlockStack>

                <Divider />

                {/* Theme Access */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasStarter ? "base" : "subdued"}>Theme Access</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <Badge tone="info">Starter</Badge>}
                  </InlineStack>
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <Button disabled={!hasStarter}>Browse Themes</Button>
                  </div>
                </BlockStack>

                <Divider />

                {/* Image Upload */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasStarter ? "base" : "subdued"}>Image Upload (Max 2)</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <Badge tone="info">Starter</Badge>}
                  </InlineStack>
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <Button disabled={!hasStarter}>Upload Image</Button>
                  </div>
                </BlockStack>

                <Divider />

                {/* Branding Removal */}
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasPro ? "base" : "subdued"}>Remove Branding</Text>
                      {!hasPro && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasPro && <Badge tone="magic">Pro</Badge>}
                  </InlineStack>
                  <div style={{ opacity: hasPro ? 1 : 0.5, pointerEvents: hasPro ? 'auto' : 'none' }}>
                    <Checkbox label="Remove TrustStars branding" checked={false} disabled={!hasPro} />
                  </div>
                </BlockStack>

              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Actions</Text>
                <Button size="large" variant="primary" onClick={() => handleSave('publish')} loading={isSaving} fullWidth>
                  Save Changes
                </Button>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Usage</Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text>Form Submissions</Text>
                    <Text fontWeight="bold">0 / {submissionLimit}</Text>
                  </InlineStack>
                  {CURRENT_PLAN !== "PRO" && (
                    <ProgressBar progress={0} tone="primary" />
                  )}
                  <Text tone="subdued" variant="bodySm">
                    Resets at the end of your billing cycle.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
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
