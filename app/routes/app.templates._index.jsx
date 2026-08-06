import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { Page, Layout, Grid, Card, BlockStack, Text, Button, Icon, Badge, InlineStack } from "@shopify/polaris";
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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <Page title="Form Template Gallery">
      <div className="gallery-grid">
        <Layout>
          <Layout.Section>
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <Grid>
                {templates.map((template) => (
                    <Grid.Cell key={template.id} columnSpan={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
                       <TemplateCard template={template} navigate={navigate} />
                    </Grid.Cell>
                ))}
              </Grid>
            </motion.div>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
