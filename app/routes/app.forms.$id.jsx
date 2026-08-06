import { useState, useCallback, useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useSubmit, useActionData, useNavigation, useRouteError } from "react-router";
import { Page, Layout, Card, FormLayout, TextField, Button, BlockStack, Text, Select, Checkbox, InlineStack, Banner, Box, Divider } from "@shopify/polaris";
import { ArrowUpIcon, ArrowDownIcon, DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
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

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [submitText, setSubmitText] = useState(form.submitText || "Submit");
  const [fields, setFields] = useState(form.fields || []);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [actionData]);

  const handleTitleChange = useCallback((value) => setTitle(value), []);
  const handleDescriptionChange = useCallback((value) => setDescription(value), []);
  const handleSubmitTextChange = useCallback((value) => setSubmitText(value), []);

  const addField = () => {
    setFields([
      ...fields,
      { id: Date.now().toString(), type: 'TEXT', label: 'New Field', placeholder: '', required: false }
    ]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    if (direction === 'up' && index > 0) {
      const temp = newFields[index];
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;
    } else if (direction === 'down' && index < newFields.length - 1) {
      const temp = newFields[index];
      newFields[index] = newFields[index + 1];
      newFields[index + 1] = temp;
    }
    setFields(newFields);
  };

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

  const fieldTypeOptions = [
    { label: 'Text', value: 'TEXT' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'Text Area', value: 'TEXTAREA' },
  ];

  return (
    <Page
      breadcrumbs={[{ content: 'Forms', onAction: () => navigate('/app') }]}
      title={title || "Untitled Form"}
      primaryAction={{ 
        content: 'Publish', 
        onAction: () => handleSave('publish'), 
        loading: isSaving,
        disabled: fields.length === 0
      }}
      secondaryActions={[
        { 
          content: 'Save Draft', 
          onAction: () => handleSave('save_draft'),
          loading: isSaving
        }
      ]}
    >
      <Layout>
        {showToast && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setShowToast(false)}>
              Form saved successfully as {actionData.status.toLowerCase()}.
            </Banner>
          </Layout.Section>
        )}
        
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Fields</Text>
                
                {fields.length === 0 ? (
                  <Box padding="400" background="bg-surface-secondary" borderRadius="100">
                    <Text alignment="center" tone="subdued">No fields added yet. Add a field to get started.</Text>
                  </Box>
                ) : (
                  fields.map((field, index) => (
                    <Box key={field.id} padding="400" borderColor="border" borderWidth="025" borderRadius="200">
                      <FormLayout>
                        <InlineStack align="space-between">
                          <Text variant="headingSm" as="h3">Field {index + 1}</Text>
                          <InlineStack gap="200">
                            <Button 
                              icon={ArrowUpIcon} 
                              variant="tertiary"
                              disabled={index === 0} 
                              onClick={() => moveField(index, 'up')} 
                              accessibilityLabel="Move up"
                            />
                            <Button 
                              icon={ArrowDownIcon} 
                              variant="tertiary"
                              disabled={index === fields.length - 1} 
                              onClick={() => moveField(index, 'down')} 
                              accessibilityLabel="Move down"
                            />
                            <Button 
                              icon={DeleteIcon} 
                              tone="critical" 
                              variant="tertiary"
                              onClick={() => removeField(index)} 
                              accessibilityLabel="Delete field"
                            />
                          </InlineStack>
                        </InlineStack>
                        
                        <Select
                          label="Field Type"
                          options={fieldTypeOptions}
                          value={field.type}
                          onChange={(val) => updateField(index, 'type', val)}
                        />
                        <TextField
                          label="Label"
                          value={field.label}
                          onChange={(val) => updateField(index, 'label', val)}
                          autoComplete="off"
                        />
                        <TextField
                          label="Placeholder"
                          value={field.placeholder || ""}
                          onChange={(val) => updateField(index, 'placeholder', val)}
                          autoComplete="off"
                        />
                        <Checkbox
                          label="Required field"
                          checked={field.required}
                          onChange={(val) => updateField(index, 'required', val)}
                        />
                      </FormLayout>
                    </Box>
                  ))
                )}
                
                <Button icon={PlusIcon} onClick={addField}>Add Field</Button>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Form Settings</Text>
              <FormLayout>
                <TextField
                  label="Form Title"
                  value={title}
                  onChange={handleTitleChange}
                  autoComplete="off"
                  helpText="Only visible to you"
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={handleDescriptionChange}
                  multiline={3}
                  autoComplete="off"
                  helpText="Optional description to display above the form"
                />
                <Divider />
                <Text variant="headingSm" as="h3">Button Settings</Text>
                <TextField
                  label="Submit Button Text"
                  value={submitText}
                  onChange={handleSubmitTextChange}
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
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
