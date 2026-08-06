import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Mousewheel, Keyboard, Pagination, Navigation } from 'swiper/modules';
import { Text } from '@shopify/polaris';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { TemplateCard } from './TemplateCard';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export function FeaturedCarousel({ templates }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
      style={{ padding: '24px 0 40px', width: '100%' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Text variant="headingLg" as="h2" fontWeight="semibold">Featured Templates</Text>
      </div>

      <Swiper
        grabCursor={true}
        centeredSlides={false}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
          1280: { slidesPerView: 4, spaceBetween: 24 }
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        mousewheel={true}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={true}
        modules={[Autoplay, Mousewheel, Keyboard, Pagination, Navigation]}
        style={{ width: '100%', padding: '10px 4px 40px', overflow: 'hidden' }}
      >
        {templates.map((template) => (
          <SwiperSlide key={template.id} style={{ height: 'auto' }}>
            <TemplateCard template={template} navigate={navigate} />
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
