import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { Page, Card, Text, Button, InlineStack, BlockStack, Icon } from "@shopify/polaris";
import * as LucideIcons from 'lucide-react';
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import dashboardStyles from "../styles/dashboard.css?url";

export const links = () => [{ rel: "stylesheet", href: dashboardStyles }];

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
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <div className="saas-dashboard">
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px', paddingTop: '40px', paddingBottom: '60px' }}>
          
          {/* Top Hero / Welcome Section */}
          <motion.div 
            className="saas-hero-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ marginBottom: '48px', textAlign: 'center' }}
          >
            <h1 style={{ margin: 0, padding: 0 }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--app-text-primary)', letterSpacing: '-0.02em' }}>Welcome to the </span>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--app-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                {"TrustStars".split("").map((char, index) => (
                  <span 
                    key={index} 
                    className="truststars-letter" 
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h1>

            <div style={{ maxWidth: '600px', margin: '32px auto 0' }}>
              <BlockStack gap="400" inlineAlign="center">
                <Text variant="headingLg" as="p" tone="subdued">
                  Create, customize, and add powerful forms to your Shopify storefront with TrustStars.
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Button size="large" variant="primary" onClick={() => navigate('/app/templates')}>
                    Explore Templates
                  </Button>
                </div>
              </BlockStack>
            </div>
          </motion.div>

          {/* Quick Overview Cards */}
          <div style={{ marginBottom: '64px' }}>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="custom-grid-3">
              
              <motion.div variants={itemVariants} className="metric-card-wrapper" style={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/app/templates')}>
                <Card padding="500">
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <div style={{ padding: '12px', background: '#F0F9FF', borderRadius: '12px', color: '#0284C7' }}>
                        <LucideIcons.LayoutTemplate size={24} />
                      </div>
                    </InlineStack>
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">Templates</Text>
                      <Text tone="subdued" as="p">Create and manage your form templates to collect customer data effectively.</Text>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="metric-card-wrapper" style={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/app/wishlist')}>
                <Card padding="500">
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '12px', color: '#DC2626' }}>
                        <LucideIcons.Heart size={24} />
                      </div>
                    </InlineStack>
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">Wishlist</Text>
                      <Text tone="subdued" as="p">Access your saved templates quickly and deploy them to your store.</Text>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="metric-card-wrapper" style={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/app/pricing')}>
                <Card padding="500">
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '12px', color: '#16A34A' }}>
                        <LucideIcons.CreditCard size={24} />
                      </div>
                    </InlineStack>
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">Pricing</Text>
                      <Text tone="subdued" as="p">Choose the perfect plan that fits your store's growing needs.</Text>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </motion.div>

            </motion.div>
          </div>

          {/* Feature Section */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <Text variant="headingXl" as="h2">Build forms your way</Text>
            </div>
            
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="custom-grid-4">
              
              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <Card padding="400">
                  <BlockStack gap="200">
                    <LucideIcons.Wand2 size={20} color="#008060" />
                    <Text variant="headingSm" as="h3">Ready-to-use Templates</Text>
                    <Text tone="subdued" variant="bodySm">Start instantly with professionally designed forms.</Text>
                  </BlockStack>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <Card padding="400">
                  <BlockStack gap="200">
                    <LucideIcons.Settings size={20} color="#008060" />
                    <Text variant="headingSm" as="h3">Easy Customization</Text>
                    <Text tone="subdued" variant="bodySm">Tailor fields and styling directly in Shopify.</Text>
                  </BlockStack>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <Card padding="400">
                  <BlockStack gap="200">
                    <LucideIcons.Smartphone size={20} color="#008060" />
                    <Text variant="headingSm" as="h3">Responsive Forms</Text>
                    <Text tone="subdued" variant="bodySm">Looks perfect on desktop, tablet, and mobile.</Text>
                  </BlockStack>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <Card padding="400">
                  <BlockStack gap="200">
                    <LucideIcons.Store size={20} color="#008060" />
                    <Text variant="headingSm" as="h3">Theme Integration</Text>
                    <Text tone="subdued" variant="bodySm">Native App Blocks for Shopify Online Store 2.0.</Text>
                  </BlockStack>
                </Card>
              </motion.div>

            </motion.div>
          </div>

          {/* Quick Actions Area */}
          <div style={{ marginBottom: '40px' }}>
            <Card padding="600">
              <BlockStack gap="400" inlineAlign="center">
                <Text variant="headingLg" as="h2" alignment="center">Ready to get started?</Text>
                <InlineStack gap="300" align="center">
                  <Button onClick={() => navigate('/app/templates')}>
                    Browse Templates
                  </Button>
                  <Button onClick={() => navigate('/app/pricing')}>
                    View Pricing
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </div>

        </div>
      </div>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
