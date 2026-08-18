export default function PrivacyPolicy() {
  const appName = "TrustStars";
  const lastUpdated = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Privacy Policy for {appName}</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}><strong>Last updated:</strong> {lastUpdated}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>1. Introduction</h2>
          <p>
            This Privacy Policy describes how {appName} ("we", "us", or "our") collects, uses, and shares your personal information when you install or use the App in connection with your Shopify-supported store. 
            We are committed to protecting your privacy and complying with all applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>2. Information We Collect</h2>
          <p>When you install the App, we are automatically able to access certain types of information from your Shopify account:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li><strong>Store Information:</strong> We collect your Shopify store domain, email address, and store settings necessary for the App to function.</li>
            <li><strong>Form Data:</strong> We collect and process the data submitted by your customers through the forms created using our App. We do not use this data for our own purposes; we process it strictly on your behalf to provide the App's functionality.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>3. How We Use Your Information</h2>
          <p>We use the personal information we collect from you and your customers to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Provide and operate the App, including rendering custom forms on your storefront.</li>
            <li>Process and store form submissions so you can view them in your dashboard.</li>
            <li>Communicate with you regarding updates, support requests, or changes to our policies.</li>
            <li>Comply with our legal obligations and Shopify's API Terms.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>4. Sharing Your Information</h2>
          <p>We do not sell, trade, or rent your personal information to others. We only share information in the following circumstances:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li><strong>With Shopify:</strong> As required to integrate the App with your store and fulfill mandatory webhook requests (e.g., data redaction).</li>
            <li><strong>Legal Compliance:</strong> We may share your information to comply with applicable laws and regulations, or to respond to lawful requests for information we receive.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>5. Data Retention & Deletion</h2>
          <p>
            We retain your data only for as long as your store has our App installed. Upon uninstallation, we receive a mandatory webhook from Shopify and automatically delete all associated store and form data within 48 hours, in strict compliance with Shopify's data protection policies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>6. Your Rights</h2>
          <p>
            If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>7. Contact Us</h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>support@truststars.app</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
