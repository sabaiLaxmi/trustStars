import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { Page, Layout, InlineGrid, Card, BlockStack, Text, Button, Icon, Badge, InlineStack } from "@shopify/polaris";
import { LockIcon } from "@shopify/polaris-icons";
import { templates } from "../data/templates";
import { useNavigate } from "react-router";
import * as LucideIcons from 'lucide-react';
import { motion } from "framer-motion";
import galleryStyles from "../styles/gallery.css?url";
import { TemplateCard } from "../components/TemplateCard";

export const links = () => [{ rel: "stylesheet", href: galleryStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function Index() {
  const navigate = useNavigate();

  const categoryOrder = [
    "Customer Support",
    "Marketing",
    "Sales",
    "Store Operations"
  ];

  const featuredTemplate = templates.find(t => t.name === "Contact Form");
  
  const templatesByCategory = categoryOrder.map(category => ({
    category,
    templates: templates.filter(t => t.category === category && t.id !== featuredTemplate?.id)
  })).filter(g => g.templates.length > 0);

  return (
    <Page title="Form Template Gallery">
      <div className="gallery-grid">
        <Layout>
          {featuredTemplate && (
            <Layout.Section>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Featured Template</Text>
                <InlineGrid columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} gap="400">
                  <TemplateCard template={featuredTemplate} navigate={navigate} />
                </InlineGrid>
              </BlockStack>
            </Layout.Section>
          )}

          <Layout.Section>
            <BlockStack gap="800">
              {templatesByCategory.map(({ category, templates }) => (
                <BlockStack key={category} gap="400">
                  <Text variant="headingLg" as="h2">
                    {category}
                  </Text>
                  <motion.div variants={containerVariants} initial="hidden" animate="show">
                    <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }} gap="400">
                      {templates.map((template) => (
                          <TemplateCard key={template.id} template={template} navigate={navigate} />
                      ))}
                    </InlineGrid>
                  </motion.div>
                </BlockStack>
              ))}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
