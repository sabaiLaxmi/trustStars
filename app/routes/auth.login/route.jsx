import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import { motion } from "framer-motion";
import { Store, LogIn, AlertCircle, Star, FileCheck } from "lucide-react";
import loginStyles from "../../styles/login.css?url";

export const links = () => [{ rel: "stylesheet", href: loginStyles }];

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  }
};

const floatVariants = {
  float: {
    y: [0, -15, 0],
    rotate: [0, 5, -5, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  }
};

const floatVariants2 = {
  float: {
    y: [0, 20, 0],
    rotate: [0, -10, 5, 0],
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
  }
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  const isLoggingIn = navigation.state === "submitting";

  return (
    <div className="login-container">
      {/* LEFT SIDE - BRANDING */}
      <div className="login-left">
        {/* Floating Icons Background */}
        <div className="floating-icon-container">
          <motion.div 
            variants={floatVariants} 
            animate="float"
            style={{ position: 'absolute', top: '15%', right: '20%', opacity: 0.6 }}
          >
            <Star size={120} color="#FF8C00" fill="#FF8C00" />
          </motion.div>
          <motion.div 
            variants={floatVariants2} 
            animate="float"
            style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.8 }}
          >
            <div style={{ position: 'relative' }}>
               <FileCheck size={140} color="#007BFF" />
            </div>
          </motion.div>
          <motion.div 
            variants={floatVariants} 
            animate="float"
            style={{ position: 'absolute', top: '40%', left: '40%', opacity: 0.2 }}
          >
            <Star size={60} color="#FF8C00" fill="#FF8C00" />
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ zIndex: 10 }}
        >
          <motion.h1 variants={itemVariants} className="brand-title">
            Build Trust.<br />
            Collect <span>Stars.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="brand-subtitle">
            The ultimate custom form builder for Shopify. Design beautiful forms, collect zero-party data, and elevate your customer experience seamlessly.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 123, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} color="#FF8C00" />
              </div>
              <span style={{ fontWeight: 500, color: '#E2E8F0' }}>Easy Setup</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 140, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={20} color="#007BFF" />
              </div>
              <span style={{ fontWeight: 500, color: '#E2E8F0' }}>100% Customizable</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="login-right">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
          className="login-card"
        >
          <h2>Welcome Back</h2>
          <p>Enter your Shopify store domain to continue.</p>
          
          <Form method="post">
            <div className="input-group">
              <label htmlFor="shop">Shop Domain</label>
              <div className="input-wrapper">
                <Store size={18} className="input-icon" />
                <input
                  id="shop"
                  name="shop"
                  type="text"
                  className="shop-input"
                  placeholder="example.myshopify.com"
                  value={shop}
                  onChange={(e) => setShop(e.currentTarget.value)}
                  autoComplete="on"
                  required
                />
              </div>
              {errors?.shop && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.shop}</span>
                </div>
              )}
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Log in to TrustStars</span>
                </>
              )}
            </button>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
