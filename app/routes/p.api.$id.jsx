import { data } from "react-router";
import db from "../db.server";
import { authenticate } from "../shopify.server";

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

  return data({ form }, {
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
  const values = [];

  for (const field of form.fields) {
    const value = formData.get(field.id) || "";
    if (field.required && !value.toString().trim()) {
      errors[field.id] = "This field is required";
    }
    values.push({
      fieldId: field.id,
      value: value.toString()
    });
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors, success: false }, { status: 400 });
  }

  // Save submission
  await db.submission.create({
    data: {
      formId: form.id,
      shop: form.shop,
      values: {
        create: values
      }
    }
  });

  return data({ success: true });
};
