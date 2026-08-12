export const templates = [
  {
    id: 1,
    name: "Contact Form",
    plan: "FREE",
    description: "A clean, responsive way for customers to reach your support team directly.",
    category: "Customer Support",
    estimatedConversion: "18% - 22%",
    fieldsCount: 4,
    setupTime: "2 mins",
    iconName: "MessageSquare",
    thumbnail: "/images/template1.png",
    formHeading: "Contact Us",
    formDescription: "Please fill out the form below and we will get back to you as soon as possible.",
    imageLimit: 0,
    previewColor: "#EA580C", // Brand Orange
    hasImagePlaceholder: false,
    features: ["Spam Protection", "File Attachments"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXTAREA', label: 'Message', placeholder: 'How can we help you?', required: false, order: 2 }
    ]
  },
  {
    id: 2,
    name: "Newsletter Signup",
    plan: "BASIC",
    description: "Capture leads quickly with a high-converting email subscription form.",
    category: "Marketing",
    estimatedConversion: "25% - 35%",
    fieldsCount: 2,
    setupTime: "1 min",
    iconName: "Mail",
    thumbnail: "/images/template2.png",
    formHeading: "Stay in the Loop!",
    formDescription: "Get the latest updates and offers straight to your inbox.",
    imageLimit: 2,
    previewColor: "#F97316", // Brand Orange lighter
    hasImagePlaceholder: true,
    features: ["Hero Image", "High Conversion"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 }
    ]
  },
  {
    id: 3,
    name: "Product Request Form",
    plan: "PRO",
    description: "Allow customers to request out-of-stock items or custom products.",
    category: "Sales",
    estimatedConversion: "12% - 15%",
    fieldsCount: 5,
    setupTime: "3 mins",
    iconName: "PackagePlus",
    thumbnail: "/images/template3.png",
    formHeading: "Can't find what you're looking for?",
    formDescription: "Tell us what you need and we'll try to source it.",
    imageLimit: 2,
    previewColor: "#C2410C", // Brand Orange darker
    hasImagePlaceholder: true,
    features: ["Product Links", "Stock Alerts"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXT', label: 'Product Name / Details', placeholder: 'What product do you need?', required: true, order: 2 },
      { type: 'TEXTAREA', label: 'Additional Information', placeholder: 'Any other details?', required: false, order: 3 }
    ]
  },
  {
    id: 4,
    name: "Feedback Form",
    plan: "BASIC",
    description: "Gather valuable insights and reviews from your recent buyers.",
    category: "Store Operations",
    estimatedConversion: "10% - 18%",
    fieldsCount: 6,
    setupTime: "4 mins",
    iconName: "Star",
    thumbnail: "/images/template4.png",
    formHeading: "We'd love your feedback",
    formDescription: "Your experience helps us improve.",
    imageLimit: 1,
    previewColor: "#EA580C", // Brand Orange
    hasImagePlaceholder: false,
    features: ["Star Ratings", "Customer Insights"],
    defaultFields: [
      { type: 'TEXT', label: 'Order Number (Optional)', placeholder: '#12345', required: false, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXT', label: 'Rating (1-5)', placeholder: '5', required: true, order: 2 },
      { type: 'TEXTAREA', label: 'Feedback / Comments', placeholder: 'How did we do?', required: true, order: 3 }
    ]
  },
  {
    id: 5,
    name: "Order Customization Form",
    plan: "PRO",
    description: "Collect detailed personalization requirements before an order is placed.",
    category: "Sales",
    estimatedConversion: "8% - 12%",
    fieldsCount: 7,
    setupTime: "5 mins",
    iconName: "Settings2",
    thumbnail: "/images/template5.png",
    formHeading: "Make it yours",
    formDescription: "Tell us how you'd like your order customized.",
    imageLimit: 3,
    previewColor: "#F97316", // Brand Orange lighter
    hasImagePlaceholder: true,
    features: ["Order Integration", "File Uploads"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXT', label: 'Order Number (Optional)', placeholder: '#12345', required: false, order: 2 },
      { type: 'TEXTAREA', label: 'Customization Details', placeholder: 'Enter your custom requirements here', required: true, order: 3 }
    ]
  },
  {
    id: 6,
    name: "Event Registration Form",
    plan: "PRO",
    description: "Register attendees for webinars, pop-ups, or in-store events.",
    category: "Marketing",
    estimatedConversion: "20% - 28%",
    fieldsCount: 5,
    setupTime: "3 mins",
    iconName: "CalendarDays",
    thumbnail: "/images/template6.png",
    formHeading: "Reserve your spot",
    formDescription: "Register below to join us.",
    imageLimit: 0,
    previewColor: "#C2410C", // Brand Orange darker
    hasImagePlaceholder: false,
    features: ["Calendar Sync", "Capacity Limits"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXT', label: 'Phone Number (Optional)', placeholder: '555-0192', required: false, order: 2 },
      { type: 'TEXT', label: 'Company (Optional)', placeholder: 'Acme Corp', required: false, order: 3 }
    ]
  },
  {
    id: 7,
    name: "Support Request",
    plan: "BASIC",
    description: "A structured form to categorize and prioritize merchant support tickets.",
    category: "Customer Support",
    estimatedConversion: "20% - 25%",
    fieldsCount: 5,
    setupTime: "3 mins",
    iconName: "LifeBuoy",
    thumbnail: "/images/template7.png",
    formHeading: "Need help? We're here for you",
    formDescription: "Describe your issue and we'll get back to you soon.",
    imageLimit: 2,
    previewColor: "#EA580C", // Brand Orange
    hasImagePlaceholder: false,
    features: ["Ticket Routing", "Priority Levels"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXT', label: 'Issue Category', placeholder: 'Shipping, Returns, etc.', required: true, order: 2 },
      { type: 'TEXTAREA', label: 'Description of Issue', placeholder: 'Please explain what went wrong', required: true, order: 3 }
    ]
  },
  {
    id: 8,
    name: "Complaint Form",
    plan: "BASIC",
    description: "Give dissatisfied customers a private channel to resolve issues before leaving bad reviews.",
    category: "Customer Support",
    estimatedConversion: "15% - 20%",
    fieldsCount: 4,
    setupTime: "2 mins",
    iconName: "Frown",
    thumbnail: "/images/template8.png",
    formHeading: "We're sorry to hear that",
    formDescription: "Please share the details so we can make it right.",
    imageLimit: 3,
    previewColor: "#C2410C", // Brand Orange darker
    hasImagePlaceholder: false,
    features: ["Private Resolution", "Order Lookup"],
    defaultFields: [
      { type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 },
      { type: 'EMAIL', label: 'Email Address', placeholder: 'jane@example.com', required: true, order: 1 },
      { type: 'TEXT', label: 'Order Number (Optional)', placeholder: '#12345', required: false, order: 2 },
      { type: 'TEXTAREA', label: 'Complaint Details', placeholder: 'What happened?', required: true, order: 3 }
    ]
  }
];
