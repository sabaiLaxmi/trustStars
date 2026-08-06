import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { Page, Card, Text, Button, InlineStack, Badge } from "@shopify/polaris";
import { BarChart3, FileText, UserCheck, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import dashboardStyles from "../styles/dashboard.css?url";
import { templates } from "../data/templates";
import { TemplateCard } from "../components/TemplateCard";

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [tableRef, tableInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Page fullWidth>
      <div className="saas-dashboard">
        
        {/* Hero Section */}
        <motion.div 
          className="saas-hero-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="saas-hero-content">
            <InlineStack align="space-between" blockAlign="center">
              <div>
                <h1 className="saas-hero-title">Welcome to TrustStars</h1>
                <p className="saas-hero-subtitle">Here's what's happening with your forms today.</p>
              </div>
              <div className="saas-action-button primary">
                <Button 
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/app/templates')}
                >
                  New Form
                </Button>
              </div>
            </InlineStack>
          </div>
        </motion.div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          
          {/* Metrics Grid */}
          <div style={{ marginBottom: '40px' }}>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="custom-grid-3">
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="metric-card-wrapper" style={{ height: '100%' }}>
                <Card padding="400">
                  <div className="metric-label">Total Submissions</div>
                  <div className="metric-value">1,248</div>
                  <div className="metric-trend positive">
                    <BarChart3 size={14} color="#10B981" />
                    <span style={{ marginLeft: '4px' }}>+12% this week</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="metric-card-wrapper" style={{ height: '100%' }}>
                <Card padding="400">
                  <div className="metric-label">Active Forms</div>
                  <div className="metric-value">8</div>
                  <div className="metric-trend neutral">
                    <FileText size={14} color="#6B7280" />
                    <span style={{ marginLeft: '4px' }}>3 drafts pending</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="metric-card-wrapper" style={{ height: '100%' }}>
                <Card padding="400">
                  <div className="metric-label">Conversion Rate</div>
                  <div className="metric-value">24.5%</div>
                  <div className="metric-trend positive">
                    <UserCheck size={14} color="#10B981" />
                    <span style={{ marginLeft: '4px' }}>+2.4% this week</span>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Featured Templates Grid */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Text variant="headingLg" as="h2">Featured Templates</Text>
            </div>
            
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="custom-grid-4">
              {templates.slice(0, 4).map((template) => (
                <TemplateCard key={template.id} template={template} navigate={navigate} />
              ))}
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div style={{ marginBottom: '40px' }}>
            <motion.div 
              ref={tableRef}
              initial={{ opacity: 0, x: -30 }}
              animate={tableInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, type: "spring" }}
              className="saas-table-card"
            >
              <Card padding="0">
                <div className="saas-table-header">
                  <Text variant="headingMd" fontWeight="bold">Recent Activity</Text>
                </div>
                
                <div className="saas-table-row">
                  <div>
                    <Text variant="bodyMd" fontWeight="bold">Product Feedback Form</Text>
                    <Text tone="subdued" variant="bodySm">New submission from Sarah J.</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-badge active">Completed</span>
                    <div style={{ marginTop: '4px' }}>
                        <Text tone="subdued" variant="bodySm">2 mins ago</Text>
                    </div>
                  </div>
                </div>

                <div className="saas-table-row">
                  <div>
                    <Text variant="bodyMd" fontWeight="bold">Newsletter Signup</Text>
                    <Text tone="subdued" variant="bodySm">New submission from Mike T.</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-badge active">Completed</span>
                    <div style={{ marginTop: '4px' }}>
                        <Text tone="subdued" variant="bodySm">1 hour ago</Text>
                    </div>
                  </div>
                </div>

                <div className="saas-table-row">
                  <div>
                    <Text variant="bodyMd" fontWeight="bold">Wholesale Inquiry</Text>
                    <Text tone="subdued" variant="bodySm">Form published</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-badge active">Published</span>
                    <div style={{ marginTop: '4px' }}>
                        <Text tone="subdued" variant="bodySm">Yesterday</Text>
                    </div>
                  </div>
                </div>

                <div className="saas-table-row">
                  <div>
                    <Text variant="bodyMd" fontWeight="bold">Holiday Promo Survey</Text>
                    <Text tone="subdued" variant="bodySm">Form created</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-badge draft">Draft</span>
                    <div style={{ marginTop: '4px' }}>
                        <Text tone="subdued" variant="bodySm">Yesterday</Text>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                  <Button variant="plain">View all activity</Button>
                </div>
              </Card>
            </motion.div>
          </div>

        </div>
      </div>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
