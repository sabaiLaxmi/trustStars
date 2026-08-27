import nodemailer from 'nodemailer';

/**
 * Sends an email notification with form submission details.
 * Defaults to using Ethereal Email (a free testing service) if no SMTP credentials are provided in .env.
 */
export async function sendSubmissionEmail(shopEmail, formName, values) {
  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use configured SMTP
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
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      console.log("No SMTP credentials found. Using Ethereal Email for testing...");
      let testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    // Format the email body
    let htmlContent = `<h2>New submission for: ${formName}</h2>`;
    htmlContent += `<table style="width: 100%; border-collapse: collapse;">`;
    
    values.forEach(val => {
      htmlContent += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${val.fieldId}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${val.value}</td>
        </tr>
      `;
    });
    
    htmlContent += `</table>`;
    htmlContent += `<p><small>Powered by TrustStars</small></p>`;

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"TrustStars Forms" <noreply@truststars.app>',
      to: shopEmail, // send to the shop's email
      subject: `New Form Submission: ${formName}`,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (nodemailer.getTestMessageUrl(info)) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      console.log("=========================================");
      console.log("👉 OPEN THE LINK ABOVE TO VIEW THE EMAIL 👈");
      console.log("=========================================");
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
