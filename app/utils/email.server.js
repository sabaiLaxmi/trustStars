import nodemailer from 'nodemailer';

async function getTransporterConfig() {
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log("No SMTP credentials found. Using Ethereal Email for testing...");
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '"TrustStars Forms" <noreply@truststars.com>';
  return { transporter, fromAddress };
}

/**
 * Sends an email notification to the merchant with form submission details.
 */
export async function sendSubmissionEmail(shopEmail, formName, values) {
  try {
    const { transporter, fromAddress } = await getTransporterConfig();

    let htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <h1 style="color: #111827; margin: 0; font-size: 24px;">New Form Submission</h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Someone filled out the <strong>${formName}</strong> form on your store.</p>
      </div>
      
      <div style="padding: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
    `;
    
    values.forEach(val => {
      const formattedLabel = val.fieldId.charAt(0).toUpperCase() + val.fieldId.slice(1).replace(/_/g, ' ');
      htmlContent += `
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%; vertical-align: top;">${formattedLabel}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; vertical-align: top;">${val.value || '<span style="color: #9ca3af; font-style: italic;">Empty</span>'}</td>
            </tr>
      `;
    });
    
    htmlContent += `
          </tbody>
        </table>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eaeaea; color: #9ca3af; font-size: 14px;">
        <p style="margin: 0;">Powered by <strong>TrustStars</strong></p>
      </div>
    </div>
    `;

    let info = await transporter.sendMail({
      from: fromAddress,
      to: shopEmail,
      subject: `New Submission: ${formName}`,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    
    if (nodemailer.getTestMessageUrl(info)) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.error("\n\n\n");
      console.error("=====================================================");
      console.error("🚀 EMAIL HAS BEEN SENT SUCCESSFULLY! 🚀");
      console.error("👉 OPEN THIS LINK TO VIEW IT: " + previewUrl);
      console.error("=====================================================");
      console.error("\n\n\n");
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Sends a confirmation email to the customer who submitted the form.
 */
export async function sendCustomerConfirmationEmail(customerEmail, formName, values) {
  try {
    const { transporter, fromAddress } = await getTransporterConfig();

    let htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <h1 style="color: #111827; margin: 0; font-size: 24px;">Thank You!</h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">We've received your submission for <strong>${formName}</strong>.</p>
      </div>
      
      <div style="padding: 24px 0;">
        <p style="color: #374151; font-size: 15px; margin-bottom: 16px;">Here is a copy of what you submitted:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
    `;
    
    values.forEach(val => {
      const formattedLabel = val.fieldId.charAt(0).toUpperCase() + val.fieldId.slice(1).replace(/_/g, ' ');
      htmlContent += `
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%; vertical-align: top;">${formattedLabel}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #111827; vertical-align: top;">${val.value || '<span style="color: #9ca3af; font-style: italic;">Empty</span>'}</td>
            </tr>
      `;
    });
    
    htmlContent += `
          </tbody>
        </table>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eaeaea; color: #9ca3af; font-size: 14px;">
        <p style="margin: 0;">Powered by <strong>TrustStars</strong></p>
      </div>
    </div>
    `;

    let info = await transporter.sendMail({
      from: fromAddress,
      to: customerEmail,
      subject: `We've received your submission: ${formName}`,
      html: htmlContent,
    });

    console.log("Customer email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending customer email:", error);
    return false;
  }
}
