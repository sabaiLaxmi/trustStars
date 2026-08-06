import { Text, Button, Badge, InlineStack, Modal, BlockStack, List, Box } from "@shopify/polaris";
import { motion } from "framer-motion";
import * as LucideIcons from 'lucide-react';
import { useSubmit } from "react-router";
import { useState, useCallback } from "react";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

// Simulated merchant plan for demonstration
const CURRENT_PLAN = "FREE";
const PLAN_LEVELS = { FREE: 1, BASIC: 2, PRO: 3 };

export function TemplateCard({ template, navigate }) {
  const IconComponent = LucideIcons[template.iconName] || LucideIcons.FileText;
  const submit = useSubmit();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const isUpgradeRequired = PLAN_LEVELS[template.plan] > PLAN_LEVELS[CURRENT_PLAN];

  const handleUseTemplate = useCallback(() => {
    if (isUpgradeRequired) {
      setIsUpgradeModalOpen(true);
      return;
    }
    submit({}, { method: "post", action: `/app/templates/${template.id}` });
  }, [isUpgradeRequired, submit, template.id]);

  const handlePreview = useCallback(() => {
    if (isUpgradeRequired) {
      setIsUpgradeModalOpen(true);
      return;
    }
    navigate(`/app/templates/${template.id}`);
  }, [isUpgradeRequired, navigate, template.id]);

  const handleCloseModal = useCallback(() => setIsUpgradeModalOpen(false), []);
  const handleUpgrade = useCallback(() => {
    navigate('/app/pricing');
  }, [navigate]);

  const requiredPlanName = template.plan === "PRO" ? "Pro" : "Basic";

  return (
    <>
      <motion.div 
        variants={itemVariants} 
        whileHover={{ y: -2 }} 
        transition={{ duration: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div 
          className="gallery-card"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            transition: 'all 0.25s ease'
          }}
        >
          {/* Large Thumbnail Preview */}
          <div style={{ 
            height: '200px', 
            backgroundColor: '#F6F8FB',
            position: 'relative',
            borderBottom: '1px solid #E5E7EB',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            {/* Abstract Form UI Representation */}
            <div style={{
              marginTop: '24px',
              width: '80%',
              height: '200px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px 8px 0 0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E5E7EB',
              borderBottom: 'none',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                 <IconComponent size={16} color="#008060" />
                 <div style={{ width: '40%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px' }} />
              </div>
              {Array.from({ length: Math.min(3, template.fieldsCount || 3) }).map((_, i) => (
                 <div key={i} style={{ width: '100%', height: '24px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px', marginBottom: '10px' }} />
              ))}
              <div style={{ width: '35%', height: '28px', backgroundColor: '#008060', borderRadius: '4px', opacity: 0.9, marginTop: '12px' }} />
            </div>
            
            {/* Subtle Favorite Icon */}
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px', 
              cursor: 'pointer', 
              zIndex: 10, 
              background: '#FFFFFF', 
              padding: '6px', 
              borderRadius: '50%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E5E7EB',
              transition: 'transform 0.15s ease'
            }}>
               <LucideIcons.Heart size={16} color="#6D7175" />
            </div>
          </div>
          
          {/* Content Area */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <Badge tone="attention">{template.category}</Badge>
                {template.plan === "PRO" ? (
                  <Badge tone="magic">Pro</Badge>
                ) : template.plan === "BASIC" ? (
                  <Badge tone="info">Starter</Badge>
                ) : (
                  <Badge tone="success">Free</Badge>
                )}
              </InlineStack>
              
              <InlineStack gap="100" blockAlign="center">
                <LucideIcons.Clock size={14} color="#6D7175" />
                <Text tone="subdued" variant="bodySm">{template.setupTime || '2 mins'}</Text>
              </InlineStack>
            </InlineStack>
            
            <div style={{ margin: '16px 0 8px' }}>
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                {template.name}
              </Text>
            </div>
            
            <div style={{ flexGrow: 1, marginBottom: '24px' }}>
              <Text as="p" tone="subdued" variant="bodyMd">
                {template.description}
              </Text>
            </div>
            
            {/* Action Buttons */}
            <InlineStack gap="300" blockAlign="center" align="stretch" wrap={false}>
              <div style={{ flex: 1, display: 'flex' }}>
                <Button onClick={handlePreview} fullWidth>
                  Preview
                </Button>
              </div>
              <div style={{ flex: 1, display: 'flex' }}>
                <Button variant="primary" onClick={handleUseTemplate} fullWidth>
                  Use Template
                </Button>
              </div>
            </InlineStack>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Modal */}
      <Modal
        open={isUpgradeModalOpen}
        onClose={handleCloseModal}
        title={`Upgrade to ${requiredPlanName} Plan`}
        primaryAction={{
          content: 'Upgrade Plan',
          onAction: handleUpgrade,
        }}
        secondaryActions={[
          {
            content: 'Back',
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p">
              The <strong>{template.name}</strong> template is a premium feature available on the {requiredPlanName} plan and above. 
              Upgrade your plan to unlock this template and access powerful new tools for your store.
            </Text>
            
            <Box paddingBlockStart="400">
              <Text variant="headingSm" as="h3">What you get when you upgrade:</Text>
              <Box paddingBlockStart="200">
                <List type="bullet">
                  <List.Item>Full access to all {requiredPlanName} templates and features</List.Item>
                  <List.Item>Increased monthly form submission limits</List.Item>
                  <List.Item>Priority support from our team</List.Item>
                </List>
              </Box>
            </Box>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
