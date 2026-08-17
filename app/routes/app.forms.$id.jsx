import { useState, useEffect, useRef } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useSubmit, useActionData, useNavigation, useRouteError } from "react-router";
import { Page, Layout, Card, TextField, Button, BlockStack, Text, Checkbox, Banner, Box, Divider, InlineStack, Badge, Icon, ProgressBar, Popover, ActionList, Modal, Thumbnail } from "@shopify/polaris";
import { LockIcon, DeleteIcon } from "@shopify/polaris-icons";
import db from "../db.server";
import { templates } from "../data/templates";
import { verifyAndSyncPlan } from "../utils/billing.server";

const FONT_MAP = {
  'Serif': 'Georgia, serif',
  'Rounded': '"Varela Round", "Nunito", ui-rounded, sans-serif',
  'Modern': '"Inter", "Roboto", "Helvetica Neue", sans-serif',
  'Default': 'inherit'
};

export const links = () => [
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Varela+Round&display=swap" }
];

export const loader = async ({ request, params }) => {
  const { session, admin } = await authenticate.admin(request);
  const formId = params.id;
  
  const currentPlan = await verifyAndSyncPlan(admin, session);

  const form = await db.form.findFirst({
    where: { id: formId, shop: session.shop },
    include: { fields: { orderBy: { order: 'asc' } } }
  });

  if (!form) {
    throw new Response("Form Not Found", { status: 404 });
  }

  return { form, currentPlan };
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
  let intent = formData.get("intent");
  let title = formData.get("title");
  let description = formData.get("description");
  let submitText = formData.get("submitText");
  let fieldsJson = formData.get("fields");
  let accentColor = formData.get("accentColor");
  let backgroundColor = formData.get("backgroundColor");
  let textColor = formData.get("textColor");
  let fontFamily = formData.get("fontFamily");
  let removeBranding = formData.get("removeBranding") === "true";
  let images = formData.get("images");


  let parsedFields = [];
  try {
    parsedFields = JSON.parse(fieldsJson);
  } catch(e) {
    console.error("Failed to parse fields", e);
  }

  const status = intent === "publish" ? "PUBLISHED" : "DRAFT";

  await db.$transaction([
    db.formField.deleteMany({ where: { formId } }),
    db.form.update({
      where: { id: formId },
      data: {
        title,
        description,
        submitText,
        accentColor,
        backgroundColor,
        textColor,
        fontFamily,
        removeBranding,
        images,
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

  console.log(`[DEBUG UPLOAD] Form ID: ${formId}`);
  console.log(`[DEBUG UPLOAD] Saved images data (first 100 chars): ${images ? images.substring(0, 100) : 'null'}`);

  return { success: true, status };
};

export default function FormEditor() {
  const { form, currentPlan } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();

  const template = templates.find(t => t.id === form.templateId) || templates[0];
  
  const hasStarter = currentPlan === "STARTER" || currentPlan === "PRO";
  const hasPro = currentPlan === "PRO";
  const isFree = currentPlan === "FREE";
  const submissionLimit = currentPlan === "FREE" ? 50 : currentPlan === "STARTER" ? 150 : "Unlimited";

  const imageLimit = currentPlan === "PRO" ? 4 : currentPlan === "STARTER" ? 1 : 0;

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [submitText, setSubmitText] = useState(form.submitText || "Submit");
  
  const DEFAULT_TEXT_COLOR = isFree ? "#000000" : "#FFFFFF";
  const DEFAULT_BG_COLOR = isFree ? "#FFFFFF" : "#008060";
  const [textColor, setTextColor] = useState(isFree ? "#000000" : (form.textColor || DEFAULT_TEXT_COLOR));
  const [bgColor, setBgColor] = useState(isFree ? "#FFFFFF" : (form.backgroundColor || form.accentColor || DEFAULT_BG_COLOR));
  
  const [fields, setFields] = useState(form.fields || []);
  const [showToast, setShowToast] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);

  const [selectedFont, setSelectedFont] = useState(form.fontFamily || "Default");
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Minimal");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState(form?.images ? JSON.parse(form.images) : []);
  const fileInputRef = useRef(null);
  const [removeBranding, setRemoveBranding] = useState(form?.removeBranding || false);
  const [customDesigns, setCustomDesigns] = useState([]);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setTitle(form?.title || "Untitled Form");
    setDescription(form?.description || "");
    setSubmitText(form?.submitText || "Submit");
    setBgColor(isFree ? "#FFFFFF" : (form?.backgroundColor || form?.accentColor || DEFAULT_BG_COLOR));
    setTextColor(isFree ? "#000000" : (form?.textColor || DEFAULT_TEXT_COLOR));
    setSelectedFont(form?.fontFamily || "Default");
    setFields(form?.fields || []);
    setUploadedImages(form?.images ? JSON.parse(form.images) : []);
    setRemoveBranding(form?.removeBranding || false);
  }, [form]);

  useEffect(() => {
    if (actionData?.success) {
      if (actionData.status === 'PUBLISHED') {
        setShowPublishToast(true);
        setTimeout(() => setShowPublishToast(false), 5000);
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  }, [actionData]);

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([...fields, { type: 'TEXT', label: 'New Field', placeholder: '', required: false, order: fields.length }]);
  };

  const handleRemoveField = (indexToRemove) => {
    setFields(fields.filter((_, index) => index !== indexToRemove));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const remainingSlots = imageLimit - uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) return;

    const newImages = [];
    let processedCount = 0;

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress large images to max 1200px width/height and 0.8 quality JPEG
          // This ensures base64 strings stay well under the 1MB text field limit
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Output as JPEG to save space (unless it's a small PNG we don't want to compress as much)
          // Always use jpeg for compression to avoid giant base64 payloads
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          newImages.push(compressedDataUrl);
          processedCount++;
          if (processedCount === filesToProcess.length) {
            setUploadedImages(prev => [...prev, ...newImages]);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = null;
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (intent) => {
    setSaveError(null);
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("submitText", submitText);
    formData.append("accentColor", bgColor);
    formData.append("backgroundColor", bgColor);
    formData.append("textColor", textColor);
    formData.append("fontFamily", selectedFont);
    formData.append("removeBranding", removeBranding);
    formData.append("images", JSON.stringify(uploadedImages));
    formData.append("fields", JSON.stringify(fields));

    // Approximate size check for base64 strings to avoid 413 Payload Too Large silently failing
    let totalSize = 0;
    for (let [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        totalSize += value.length;
      }
    }
    
    // Warn if payload is over ~2.5MB (standard limit is often 3MB-5MB for form-data, better to be safe)
    if (totalSize > 2.5 * 1024 * 1024) {
      setSaveError("Images are too large. Please upload smaller images to save successfully.");
      return;
    }
    
    try {
      submit(formData, { method: "post", encType: "multipart/form-data" });
    } catch (e) {
      setSaveError("Failed to submit form due to a network error.");
    }
  };

  const PRESET_DESIGNS = [
    { id: 'ocean', name: 'Ocean Blue', text: '#FFFFFF', bg: '#005BD3' },
    { id: 'sunset', name: 'Warm Sunset', text: '#FFFFFF', bg: '#F49342' },
    { id: 'mono', name: 'Minimal Mono', text: '#FFFFFF', bg: '#000000' },
    { id: 'lavender', name: 'Soft Lavender', text: '#FFFFFF', bg: '#8A2BE2' },
    { id: 'classic', name: 'Classic Green', text: '#FFFFFF', bg: '#008060' }
  ];

  const TEXT_COLORS = ["#FFFFFF", "#000000", "#333333", "#F4F6F8", "#E32C2B"];
  const BG_COLORS = ["#008060", "#E32C2B", "#005BD3", "#000000", "#F49342", "#8A2BE2", "#FFFFFF", "#F4F6F8"];

  const isCustomCombo = !PRESET_DESIGNS.concat(customDesigns).some(d => d.text === textColor && d.bg === bgColor);

  const handleResetDesign = () => {
    setTextColor(DEFAULT_TEXT_COLOR);
    setBgColor(DEFAULT_BG_COLOR);
  };

  const handleSaveCustomDesign = () => {
    setCustomDesigns([...customDesigns, { 
      id: `custom-${Date.now()}`, 
      name: `My Design ${customDesigns.length + 1}`,
      text: textColor,
      bg: bgColor
    }]);
  };

  const isSaving = navigation.state === "submitting";

  return (
    <Page
      breadcrumbs={[{ content: 'Forms', onAction: () => navigate('/app') }]}
      title={title || "Untitled Form"}
      titleMetadata={
        <InlineStack gap="200" blockAlign="center">
          <Badge tone={form.status === 'PUBLISHED' ? "success" : "info"}>
            {form.status === 'PUBLISHED' ? "Published" : "Draft"}
          </Badge>
          <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}>
            {template.plan === "PRO" ? (
              <Badge tone="magic">Pro Template</Badge>
            ) : template.plan === "BASIC" ? (
              <Badge tone="info">Starter Template</Badge>
            ) : (
              <Badge tone="success">Free Template</Badge>
            )}
          </div>
        </InlineStack>
      }
    >
      <Layout>
        <Layout.Section>
          {saveError && (
            <Box paddingBlockEnd="400">
              <Banner title="Failed to save form" tone="critical" onDismiss={() => setSaveError(null)}>
                <p>{saveError}</p>
              </Banner>
            </Box>
          )}
          <BlockStack gap="400">
            {showToast && (
              <Banner tone="success" onDismiss={() => setShowToast(false)}>
                Form saved successfully.
              </Banner>
            )}
            {showPublishToast && (
              <Banner tone="success" onDismiss={() => setShowPublishToast(false)}>
                Your form is now live! Add it to your store from the Theme Editor to display it to customers.
              </Banner>
            )}
            
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Fields</Text>
                <BlockStack gap="600">
                  {fields.map((field, index) => (
                    <div key={field.id || index} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <BlockStack gap="200">
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
                      </div>
                      <Button tone="critical" variant="plain" icon={DeleteIcon} onClick={() => handleRemoveField(index)} />
                    </div>
                  ))}
                </BlockStack>
                
                <Box paddingBlockStart="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasPro ? "base" : "subdued"}>Add / Remove Fields</Text>
                      {!hasPro && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasPro && <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}><Badge tone="magic">Pro</Badge></div>}
                  </InlineStack>
                  <Box paddingBlockStart="200">
                    <div style={{ opacity: hasPro ? 1 : 0.5, pointerEvents: hasPro ? 'auto' : 'none' }}>
                      <Button disabled={!hasPro} onClick={handleAddField}>Add Field</Button>
                    </div>
                  </Box>
                </Box>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Settings & Customization</Text>
                
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasStarter ? "base" : "subdued"}>Font Customization</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}><Badge tone="info">Starter</Badge></div>}
                  </InlineStack>
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <Popover
                      active={isFontOpen}
                      activator={
                        <Button disabled={!hasStarter} onClick={() => setIsFontOpen(true)}>
                          Customize Fonts ({selectedFont})
                        </Button>
                      }
                      onClose={() => setIsFontOpen(false)}
                    >
                      <ActionList
                        actionRole="menuitem"
                        items={["Default", "Serif", "Rounded", "Modern"].map(font => ({
                          content: font,
                          onAction: () => { setSelectedFont(font); setIsFontOpen(false); }
                        }))}
                      />
                    </Popover>
                  </div>
                </BlockStack>

                <Divider />

                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasStarter ? "base" : "subdued"}>Form Design</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}><Badge tone="info">Starter</Badge></div>}
                  </InlineStack>
                  
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <BlockStack gap="400">
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: bgColor, 
                        color: textColor, 
                        fontFamily: selectedFont && FONT_MAP[selectedFont] ? FONT_MAP[selectedFont] : 'inherit',
                        borderRadius: '8px', 
                        textAlign: 'center',
                        border: '1px solid #e3e3e3'
                      }}>
                        {uploadedImages.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
                            {uploadedImages.map((src, i) => (
                              <img key={i} src={src} alt="Form visual preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'cover', flex: 1, minWidth: 0 }} />
                            ))}
                          </div>
                        )}
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Live Preview</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>This is how your form will look.</div>
                        {!removeBranding && (
                          <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>Powered by <strong>TrustStars</strong></div>
                        )}
                      </div>

                      {!isFree && (
                        <>
                          <BlockStack gap="200">
                            <InlineStack align="space-between" blockAlign="center">
                              <Text variant="headingSm" as="h3">Choose a Design</Text>
                          <Button variant="plain" onClick={handleResetDesign}>Reset to Default</Button>
                        </InlineStack>
                        <InlineStack gap="300" wrap>
                          {[...PRESET_DESIGNS, ...customDesigns].map(preset => (
                            <div key={preset.id} role="button" tabIndex={0} onKeyDown={() => { setTextColor(preset.text); setBgColor(preset.bg); }} onClick={() => { setTextColor(preset.text); setBgColor(preset.bg); }}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{
                                width: '60px', height: '40px', borderRadius: '4px',
                                backgroundColor: preset.bg, color: preset.text,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: (textColor === preset.text && bgColor === preset.bg) ? '2px solid #202223' : '1px solid #e3e3e3',
                                fontSize: '12px', fontWeight: 'bold'
                              }}>
                                Aa
                              </div>
                              <div style={{ fontSize: '12px' }}>{preset.name}</div>
                            </div>
                          ))}
                        </InlineStack>
                      </BlockStack>

                          <Divider />
                        </>
                      )}

                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">Text Color</Text>
                        {isFree ? (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#000000', border: '3px solid #E5E7EB', boxShadow: '0 0 0 2px #202223' }} />
                        ) : (
                          <InlineStack gap="200">
                            {TEXT_COLORS.map(color => (
                              <div key={color} role="button" tabIndex={0} onKeyDown={() => setTextColor(color)} onClick={() => setTextColor(color)}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  backgroundColor: color, cursor: 'pointer',
                                  border: textColor === color ? '3px solid #E5E7EB' : '1px solid #e3e3e3',
                                  boxShadow: textColor === color ? '0 0 0 2px #202223' : 'none'
                                }}
                              />
                            ))}
                          </InlineStack>
                        )}
                      </BlockStack>

                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">Background Color</Text>
                        {isFree ? (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '3px solid #E5E7EB', boxShadow: '0 0 0 2px #202223' }} />
                        ) : (
                          <InlineStack gap="200">
                            {BG_COLORS.map(color => (
                              <div key={color} role="button" tabIndex={0} onKeyDown={() => setBgColor(color)} onClick={() => setBgColor(color)}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  backgroundColor: color, cursor: 'pointer',
                                  border: bgColor === color ? '3px solid #E5E7EB' : '1px solid #e3e3e3',
                                  boxShadow: bgColor === color ? '0 0 0 2px #202223' : 'none'
                                }}
                              />
                            ))}
                          </InlineStack>
                        )}
                      </BlockStack>

                      {isCustomCombo && !isFree && (
                        <Box paddingBlockStart="200">
                          <InlineStack>
                            <Button onClick={handleSaveCustomDesign}>Save as My Design</Button>
                          </InlineStack>
                        </Box>
                      )}
                    </BlockStack>
                  </div>
                </BlockStack>

                {!isFree && <Divider />}

                {!isFree && (
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text tone={hasStarter ? "base" : "subdued"}>Theme Access</Text>
                      {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasStarter && <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}><Badge tone="info">Starter</Badge></div>}
                  </InlineStack>
                  <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                    <Button disabled={!hasStarter} onClick={() => setIsThemeModalOpen(true)}>Browse Themes</Button>
                  </div>
                  
                  <Modal
                    open={isThemeModalOpen}
                    onClose={() => setIsThemeModalOpen(false)}
                    title="Select a Theme Style"
                  >
                    <Modal.Section>
                      <InlineStack gap="400">
                        {["Minimal", "Bold", "Classic"].map(theme => (
                          <div key={theme} role="button" tabIndex={0} 
                            onKeyDown={() => {
                              setSelectedTheme(theme);
                              if (theme === "Minimal") { setBgColor("#FFFFFF"); setTextColor("#000000"); setSelectedFont("Default"); }
                              if (theme === "Bold") { setBgColor("#000000"); setTextColor("#FFFFFF"); setSelectedFont("Modern"); }
                              if (theme === "Classic") { setBgColor("#F4F6F8"); setTextColor("#333333"); setSelectedFont("Serif"); }
                            }} 
                            onClick={() => {
                              setSelectedTheme(theme);
                              if (theme === "Minimal") { setBgColor("#FFFFFF"); setTextColor("#000000"); setSelectedFont("Default"); }
                              if (theme === "Bold") { setBgColor("#000000"); setTextColor("#FFFFFF"); setSelectedFont("Modern"); }
                              if (theme === "Classic") { setBgColor("#F4F6F8"); setTextColor("#333333"); setSelectedFont("Serif"); }
                            }}
                            style={{ 
                              padding: '24px', 
                              border: selectedTheme === theme ? '2px solid #000' : '1px solid #ccc',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: selectedTheme === theme ? 'bold' : 'normal',
                              background: selectedTheme === theme ? '#f4f4f4' : 'transparent'
                            }}
                          >
                            {theme}
                          </div>
                        ))}
                      </InlineStack>
                    </Modal.Section>
                  </Modal>
                  </BlockStack>
                )}

                {imageLimit > 0 && !isFree && <Divider />}

                {/* Image Upload */}
                {imageLimit > 0 && !isFree && (
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text tone={hasStarter ? "base" : "subdued"}>Image Upload (Max {imageLimit})</Text>
                        {!hasStarter && <Icon source={LockIcon} tone="subdued" />}
                      </InlineStack>
                      {!hasStarter && <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}><Badge tone="info">Starter</Badge></div>}
                    </InlineStack>
                    <div style={{ opacity: hasStarter ? 1 : 0.5, pointerEvents: hasStarter ? 'auto' : 'none' }}>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleImageUpload} />
                      <Button disabled={!hasStarter} onClick={() => fileInputRef.current?.click()}>
                        Upload Image
                      </Button>
                      
                      {uploadedImages.length > 0 && (
                        <Box paddingBlockStart="200">
                          <InlineStack gap="200">
                            {uploadedImages.map((src, idx) => (
                              <div key={idx} style={{ position: 'relative' }}>
                                <Thumbnail source={src} alt="Uploaded" size="large" />
                                <button 
                                  onClick={() => removeImage(idx)}
                                  style={{
                                    position: 'absolute', top: '-8px', right: '-8px',
                                    background: 'black', color: 'white', borderRadius: '50%',
                                    width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: 'none', cursor: 'pointer', fontSize: '12px', zIndex: 1
                                  }}
                                >x</button>
                              </div>
                            ))}
                          </InlineStack>
                        </Box>
                      )}
                    </div>
                  </BlockStack>
                )}

                {hasPro && <Divider />}

                {/* Branding Removal */}
                {hasPro && (
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text tone={hasPro ? "base" : "subdued"}>Remove Branding</Text>
                      {!hasPro && <Icon source={LockIcon} tone="subdued" />}
                    </InlineStack>
                    {!hasPro && <div role="button" tabIndex={0} onKeyDown={() => navigate('/app/pricing')} onClick={() => navigate('/app/pricing')} style={{ cursor: 'pointer' }}><Badge tone="magic">Pro</Badge></div>}
                  </InlineStack>
                  <div style={{ opacity: hasPro ? 1 : 0.5, pointerEvents: hasPro ? 'auto' : 'none' }}>
                    <Checkbox label="Remove TrustStars branding" checked={removeBranding} onChange={setRemoveBranding} disabled={!hasPro} />
                  </div>
                </BlockStack>
                )}

              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Actions</Text>
                <style>{`
                  .gradient-actions-wrapper button {
                    background: linear-gradient(to right, orange, blue) !important;
                    color: white !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  .gradient-actions-wrapper button:hover {
                    opacity: 0.9 !important;
                  }
                  .gradient-actions-wrapper button:disabled {
                    opacity: 0.5 !important;
                  }
                  .gradient-actions-wrapper button svg {
                    fill: white !important;
                  }
                `}</style>
                <div className="gradient-actions-wrapper">
                  <InlineStack gap="300">
                    <div style={{ flex: 1 }}>
                      <Button 
                        size="large" 
                        onClick={() => handleSave('draft')} 
                        loading={isSaving && submitText !== 'Publishing...'} 
                        fullWidth
                      >
                        Save Changes
                      </Button>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Button 
                        size="large" 
                        onClick={() => handleSave('publish')} 
                        disabled={isSaving}
                        fullWidth
                      >
                        Publish
                      </Button>
                    </div>
                  </InlineStack>
                </div>
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
