import sys

file_path = 'app/routes/app.forms.$id.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update action to handle JSON
old_action_parse = '''  const formData = await request.formData();
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
  const images = formData.get("images");'''

new_action_parse = '''  let intent, title, description, submitText, fieldsJson, accentColor, backgroundColor, textColor, fontFamily, removeBranding, images;

  if (request.headers.get("content-type")?.includes("application/json")) {
    const data = await request.json();
    intent = data.intent;
    title = data.title;
    description = data.description;
    submitText = data.submitText;
    fieldsJson = data.fields;
    accentColor = data.accentColor;
    backgroundColor = data.backgroundColor;
    textColor = data.textColor;
    fontFamily = data.fontFamily;
    removeBranding = data.removeBranding;
    images = data.images;
  } else {
    const formData = await request.formData();
    intent = formData.get("intent");
    title = formData.get("title");
    description = formData.get("description");
    submitText = formData.get("submitText");
    fieldsJson = formData.get("fields");
    accentColor = formData.get("accentColor");
    backgroundColor = formData.get("backgroundColor");
    textColor = formData.get("textColor");
    fontFamily = formData.get("fontFamily");
    removeBranding = formData.get("removeBranding") === "true";
    images = formData.get("images");
  }'''

code = code.replace(old_action_parse, new_action_parse)

# 2. Update handleSave to send JSON
old_handle_save = '''  const handleSave = (intent) => {
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
  };'''

new_handle_save = '''  const handleSave = (intent) => {
    const data = {
      intent,
      title,
      description,
      submitText,
      accentColor: bgColor,
      backgroundColor: bgColor,
      textColor,
      fontFamily: selectedFont,
      removeBranding,
      images: JSON.stringify(uploadedImages),
      fields: JSON.stringify(fields)
    };
    
    submit(data, { method: "post", encType: "application/json" });
  };'''

code = code.replace(old_handle_save, new_handle_save)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Patched formData parsing successfully!")
