import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Mousewheel, Keyboard, Pagination, Navigation } from 'swiper/modules';
import { Card, Text, Button, Badge, InlineStack } from '@shopify/polaris';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export function FeaturedCarousel({ templates }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ padding: '40px 0', width: '100%' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text variant="headingLg" as="h2">Featured Templates</Text>
      </div>

      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={false}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 }
        }}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        mousewheel={true}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[EffectCoverflow, Autoplay, Mousewheel, Keyboard, Pagination, Navigation]}
        style={{ width: '100%', padding: '20px 0 60px', overflow: 'hidden' }}
      >
        {templates.map((template) => {
          const IconComponent = LucideIcons[template.iconName] || LucideIcons.FileText;

          return (
            <SwiperSlide key={template.id} style={{ height: 'auto', display: 'flex' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Card padding="0">
                  <div style={{ 
                    height: '160px', 
                    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    <IconComponent size={48} color="#9CA3AF" strokeWidth={1.5} />
                  </div>
                  
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', minHeight: '220px' }}>
                    <div>
                      <InlineStack align="space-between" blockAlign="center">
                        <Badge tone="info">{template.category}</Badge>
                        <Text tone="subdued" variant="bodySm">{template.fieldsCount} Fields</Text>
                      </InlineStack>
                      
                      <div style={{ margin: '12px 0 8px' }}>
                        <Text as="h3" variant="headingMd" fontWeight="bold">{template.name}</Text>
                      </div>
                      
                      <Text tone="subdued" variant="bodySm">{template.description}</Text>
                      
                      <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                        <InlineStack blockAlign="center" gap="100">
                          <LucideIcons.TrendingUp size={14} color="#10B981" />
                          <Text variant="bodySm" fontWeight="medium">Expected Conv: {template.estimatedConversion}</Text>
                        </InlineStack>
                      </div>
                    </div>
                    
                    <Button variant="primary" fullWidth onClick={() => navigate(`/app/templates/${template.id}`)}>
                      Preview Template
                    </Button>
                  </div>
                </Card>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </motion.div>
  );
}
