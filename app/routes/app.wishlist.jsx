import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { Page, BlockStack, Text, EmptyState } from "@shopify/polaris";
import { templates } from "../data/templates";
import { useNavigate, useLoaderData } from "react-router";
import { motion } from "framer-motion";
import galleryStyles from "../styles/gallery.css?url";
import { TemplateCard } from "../components/TemplateCard";
import db from "../db.server";

export const links = () => [{ rel: "stylesheet", href: galleryStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Fetch only wishlisted IDs for this specific shop
  const wishlistedTemplates = await db.templateWishlist.findMany({
    where: { shop: session.shop },
    select: { templateId: true }
  });
  
  const wishlistedIds = wishlistedTemplates.map(w => w.templateId);
  
  // Map IDs to actual template objects
  const savedTemplates = templates.filter(t => wishlistedIds.includes(t.id));

  return { savedTemplates };
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { savedTemplates } = useLoaderData();

  return (
    <Page title="My Wishlist" fullWidth>
      <div className="gallery-grid">
        <BlockStack gap="400">
          <Text variant="bodyLg" as="p" tone="subdued">
            Your saved templates are here.
          </Text>

          {savedTemplates.length === 0 ? (
            <div style={{ marginTop: '40px' }}>
              <EmptyState
                heading="My Wishlist is empty"
                action={{
                  content: 'Explore Templates',
                  onAction: () => navigate('/app/templates'),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Save templates you love by clicking the heart icon.</p>
              </EmptyState>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ marginTop: '24px' }}>
              <div className="templates-grid">
                {savedTemplates.map((template) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    navigate={navigate} 
                    initialWishlisted={true} 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </BlockStack>
      </div>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
