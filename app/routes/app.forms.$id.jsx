import { useState, useEffect, useRef } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useSubmit, useActionData, useNavigation, useRouteError } from "react-router";
import { Page, Layout, Card, TextField, Button, BlockStack, Text, Checkbox, Banner, Box, Divider, InlineStack, Badge, Icon, ProgressBar, Popover, ActionList, Modal, Thumbnail } from "@shopify/polaris";
import { LockIcon, DeleteIcon } from "@shopify/polaris-icons";
import db from "../db.server";
import { templates } from "../data/templates";
import { CURRENT_PLAN } from "../config/billing";

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
  const accentColor = formData.get("accentColor");
  const backgroundColor = formData.get("backgroundColor");
  const textColor = formData.get("textColor");
  const fontFamily = formData.get("fontFamily");
  const removeBranding = formData.get("removeBranding") === "true";
  const images = formData.get("images");

  let parsedFields = [];
  try {
    parsedFields = JSON.parse(fieldsJson);
  } catch(e) {
    console.error("Failed to parse fields", e);
  }

  const status = intent === "publish" ? "PUBLISHED" : "DRAFT";

  console.log("Saving images to DB. Type:", typeof images, "Value:", images ? images.substring(0, 100) + "..." : images);

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

  return { success: true, status };
};

export default function FormEditor() {
  const { form } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();

  const template = templates.find(t => t.id === form.templateId) || templates[0];
  
  const hasStarter = true; // temporarily unlocked // template.plan === "BASIC" || template.plan === "PRO";
  const hasPro = true; // temporarily unlocked // template.plan === "PRO";
  const submissionLimit = CURRENT_PLAN === "FREE" ? 50 : CURRENT_PLAN === "STARTER" ? 150 : "Unlimited";

  const imageLimit = template.imageLimit || 0;

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");
  const [submitText, setSubmitText] = useState(form.submitText || "Submit");
  
  const DEFAULT_TEXT_COLOR = "#FFFFFF";
  const DEFAULT_BG_COLOR = "#008060";
  const [textColor, setTextColor] = useState(form.textColor || DEFAULT_TEXT_COLOR);
  const [bgColor, setBgColor] = useState(form.backgroundColor || form.accentColor || DEFAULT_BG_COLOR);
  
  const [fields, setFields] = useState(form.fields || []);
  const [showToast, setShowToast] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);

  // New state variables for UI interactivity
  const [selectedFont, setSelectedFont] = useState(form.fontFamily || "Default");
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Minimal");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState(form?.images ? JSON.parse(form.images) : []);
  const fileInputRef = useRef(null);
  const [removeBranding, setRemoveBranding] = useState(form?.removeBranding || false);
  const [customDesigns, setCustomDesigns] = useState([]);

  useEffect(() => {
    setTitle(form?.title || "Untitled Form");
    setDescription(form?.description || "");
    setSubmitText(form?.submitText || "Submit");
    setBgColor(form?.backgroundColor || form?.accentColor || DEFAULT_BG_COLOR);
    setTextColor(form?.textColor || DEFAULT_TEXT_COLOR);
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
        newImages.push(event.target.result);
        processedCount++;
        if (processedCount === filesToProcess.length) {
          setUploadedImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = null; // reset input
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (intent) => {
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
    
    submit(formData, { method: "post" });
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
          <BlockStack gap="600">
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
                
                {/* Font Customization */}
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

                {/* Design & Colors Customization */}
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
                      {/* Live Preview */}
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

                      {/* Presets */}
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

                      {/* Text Color Row */}
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">Text Color</Text>
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
                      </BlockStack>

                      {/* Background Color Row */}
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">Background Color</Text>
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
                      </BlockStack>

                      {/* Save Custom Design */}
                      {isCustomCombo && (
                        <Box paddingBlockStart="200">
                          <InlineStack>
                            <Button onClick={handleSaveCustomDesign}>Save as My Design</Button>
                          </InlineStack>
                        </Box>
                      )}
                    </BlockStack>
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

                <Divider />

                {/* Image Upload */}
                {imageLimit > 0 && (
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

                <Divider />

                {/* Branding Removal */}
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

              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Actions</Text>
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
                    <button
                      onClick={() => handleSave('publish')}
                      disabled={isSaving}
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: bgColor === '#FFFFFF' ? '1px solid #e3e3e3' : 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        transition: 'background-color 0.2s',
                        minHeight: '44px'
                      }}
                    >
                      {isSaving ? "Saving..." : "Publish"}
                    </button>
                  </div>
                </InlineStack>
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
