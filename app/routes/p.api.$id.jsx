import { data } from "react-router";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { sendSubmissionEmail } from "../utils/email.server";

export const handle = { isProxy: true };

export const loader = async ({ request, params }) => {
  try {
    await authenticate.public.appProxy(request);
  } catch (error) {
    if (!(error instanceof Response && error.status === 400)) {
      throw error;
    }
  }
  
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const formId = params.id;
  let form;

  if (formId === "default" && shop) {
    form = await db.form.findFirst({
      where: { shop: shop, status: "PUBLISHED" },
      orderBy: { updatedAt: 'desc' },
      include: { fields: { orderBy: { order: 'asc' } } }
    });
    
    if (!form) {
      return data({ error: "NoPublishedForms" }, { status: 404 });
    }
  } else {
    form = await db.form.findFirst({
      where: { id: formId },
      include: { fields: { orderBy: { order: 'asc' } } }
    });

    if (!form) {
      return data({ error: "Form Not Found" }, { status: 404 });
    }
  }

  return data({ 
    form, 
    emailjsConfig: {
      publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
      serviceId: process.env.EMAILJS_SERVICE_ID || "",
      templateCustomer: process.env.EMAILJS_TEMPLATE_CUSTOMER || "",
      templateMerchant: process.env.EMAILJS_TEMPLATE_MERCHANT || ""
    }
  }, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache"
    }
  });
};

export const action = async ({ request, params }) => {
  try {
    await authenticate.public.appProxy(request);
  } catch (error) {
    if (!(error instanceof Response && error.status === 400)) {
      throw error;
    }
  }
  
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const formId = params.id;
  let form;
  
  if (formId === "default" && shop) {
    form = await db.form.findFirst({
      where: { shop: shop, status: "PUBLISHED" },
      orderBy: { updatedAt: 'desc' },
      include: { fields: true }
    });
    
    if (!form) {
      return data({ error: "NoPublishedForms" }, { status: 404 });
    }
  } else {
    form = await db.form.findFirst({
      where: { id: formId },
      include: { fields: true }
    });

    if (!form) {
      return data({ error: "Form Not Found" }, { status: 404 });
    }
  }

  const formData = await request.formData();
  
  // Anti-Spam Honeypot Check
  const honeypot = formData.get("a_password");
  if (honeypot) {
    return data({ success: true });
  }

  // Validation
  const errors = {};
  const valuesForDb = [];
  const valuesForEmail = [];
  let submitterEmail = null;

  for (const field of form.fields) {
    const value = formData.get(field.id) || "";
    
    // Check if this field is an email field to send an auto-responder
    if (field.type === 'EMAIL' || field.label.toLowerCase().includes('email')) {
      if (value.toString().trim()) {
        submitterEmail = value.toString().trim();
      }
    }

    if (field.required && !value.toString().trim()) {
      errors[field.id] = "This field is required";
    }
    
    // For database: Must use the exact relation field ID
    valuesForDb.push({
      fieldId: field.id,
      value: value.toString()
    });
    
    // For email: Use the human-readable label
    valuesForEmail.push({
      fieldId: field.label || field.id,
      value: value.toString()
    });
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors, success: false }, { status: 400 });
  }

  // Save submission
  try {
    await db.submission.create({
      data: {
        formId: form.id,
        shop: form.shop,
        values: {
          create: valuesForDb
        }
      }
    });
    
    // Get shop email to notify merchant
    const session = await db.session.findFirst({
      where: { shop: form.shop, email: { not: null } }
    });
    
    if (session && session.email) {
      // Send email
      sendSubmissionEmail(session.email, form.title, valuesForEmail).catch(console.error);
    }
  } catch (err) {
    console.error("Database save error:", err);
    return data({ error: "Failed to save submission", success: false }, { status: 500 });
  }

  return data({ success: true });
};
