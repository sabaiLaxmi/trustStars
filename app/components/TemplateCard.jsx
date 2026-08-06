import { Text, Button, Badge, InlineStack } from "@shopify/polaris";
import { motion } from "framer-motion";
import * as LucideIcons from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function TemplateCard({ template, navigate }) {
  const IconComponent = LucideIcons[template.iconName] || LucideIcons.FileText;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        overflow: 'hidden',
        border: '1px solid #F3F4F6',
        transition: 'all 0.3s ease'
      }}>
        {/* Large Thumbnail Area */}
        <div style={{ 
          height: '220px', 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          borderBottom: '1px solid #E2E8F0'
        }}>
          {/* Favorite Icon */}
          <div style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            cursor: 'pointer', 
            zIndex: 10, 
            background: 'rgba(255,255,255,0.9)', 
            padding: '8px', 
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
             <LucideIcons.Heart size={18} color="#64748B" />
          </div>

          <IconComponent size={72} color="#94A3B8" strokeWidth={1.2} />
        </div>
        
        {/* Content Area */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200" blockAlign="center">
              <Badge tone="info">{template.category}</Badge>
              {template.isPro ? (
                <Badge tone="warning">Pro</Badge>
              ) : (
                <Badge tone="success">Free</Badge>
              )}
            </InlineStack>
            
            <InlineStack gap="100" blockAlign="center">
              <LucideIcons.Clock size={14} color="#64748B" />
              <Text tone="subdued" variant="bodySm">{template.setupTime || '2 mins'}</Text>
            </InlineStack>
          </InlineStack>
          
          <div style={{ margin: '20px 0 12px' }}>
            <Text as="h3" variant="headingLg" fontWeight="bold">
              {template.name}
            </Text>
          </div>
          
          <div style={{ flexGrow: 1, marginBottom: '28px' }}>
            <Text as="p" tone="subdued" variant="bodyMd">
              {template.description}
            </Text>
          </div>
          
          {/* Action Buttons */}
          <InlineStack gap="300" blockAlign="center" align="stretch" wrap={false}>
            <div style={{ flex: 1, display: 'flex' }}>
              <Button onClick={() => navigate(`/app/templates/${template.id}`)} fullWidth>
                Preview
              </Button>
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
              <Button variant="primary" onClick={() => navigate(`/app/templates/${template.id}`)} fullWidth>
                Use Template
              </Button>
            </div>
          </InlineStack>
        </div>
      </div>
    </motion.div>
  );
}
