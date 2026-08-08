import { authenticate } from "./app/shopify.server.js";
import { Request } from "node-fetch";

async function test() {
  const req = new Request("https://trust-stars.vercel.app/p/123", {
    method: "GET",
    headers: {
      "user-agent": "Shopify-Theme-Editor"
    }
  });
  
  try {
    await authenticate.public.appProxy(req);
    console.log("Success");
  } catch (err) {
    console.log("Error type:", err.constructor.name);
    console.log("Error status:", err.status);
  }
}

test();
