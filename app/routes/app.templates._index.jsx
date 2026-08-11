import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { Page } from "@shopify/polaris";
import { templates } from "../data/templates";
import { useNavigate, useLoaderData } from "react-router";

import { motion } from "framer-motion";
import galleryStyles from "../styles/gallery.css?url";
import { TemplateCard } from "../components/TemplateCard";
import db from "../db.server";

export const links = () => [{ rel: "stylesheet", href: galleryStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const wishlistedTemplates = await db.templateWishlist.findMany({
    where: { shop: session.shop },
    select: { templateId: true }
  });
  const wishlistedIds = wishlistedTemplates.map(w => w.templateId);
  return { wishlistedIds };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");
  const templateId = parseInt(formData.get("templateId"), 10);

  if (!templateId) return { error: "Invalid templateId" };

  if (actionType === "addWishlist") {
    await db.templateWishlist.upsert({
      where: { shop_templateId: { shop: session.shop, templateId } },
      create: { shop: session.shop, templateId },
      update: {}
    });
  } else if (actionType === "removeWishlist") {
    await db.templateWishlist.deleteMany({
      where: { shop: session.shop, templateId }
    });
  }

  return { success: true };
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};



export default function Index() {
  const navigate = useNavigate();
  const { wishlistedIds } = useLoaderData();

  return (
    <Page title="Form Template Gallery" fullWidth>
      <div className="gallery-grid">
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="templates-grid">
            {templates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  navigate={navigate} 
                  initialWishlisted={wishlistedIds.includes(template.id)} 
                />
            ))}
          </div>
        </motion.div>
      </div>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
