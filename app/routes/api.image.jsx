import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  try {
    // Only verify it's a valid app proxy request
    await authenticate.public.appProxy(request);
  } catch (error) {
    if (!(error instanceof Response && error.status === 400)) {
      throw error;
    }
  }

  const url = new URL(request.url);
  const formId = url.searchParams.get("formId");
  const index = parseInt(url.searchParams.get("index"), 10);

  if (!formId || isNaN(index)) {
    return new Response("Missing params", { status: 400 });
  }

  const form = await db.form.findUnique({ where: { id: formId } });
  if (!form || !form.images) {
    return new Response("Not found", { status: 404 });
  }

  let images = [];
  try {
    images = JSON.parse(form.images);
  } catch(e) {}

  const dataUri = images[index];
  if (!dataUri) {
    return new Response("Not found", { status: 404 });
  }

  // dataUri is "data:image/png;base64,iVBORw0KGgo..."
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    return new Response("Invalid image data", { status: 400 });
  }

  const contentType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
