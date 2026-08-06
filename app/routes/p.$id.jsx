import { useLoaderData, useActionData, Form, useNavigation, data } from "react-router";
import db from "../db.server";

export const loader = async ({ params }) => {
  const formId = params.id;
  const form = await db.form.findFirst({
    where: { id: formId },
    include: { fields: { orderBy: { order: 'asc' } } }
  });

  if (!form || form.status !== 'PUBLISHED') {
    throw new Response("Form Not Found or Not Published", { status: 404 });
  }

  return data({ form });
};

export const action = async ({ request, params }) => {
  const formId = params.id;
  
  const form = await db.form.findFirst({
    where: { id: formId, status: 'PUBLISHED' },
    include: { fields: true }
  });

  if (!form) {
    throw new Response("Form Not Found", { status: 404 });
  }

  const formData = await request.formData();
  
  // Validation
  const errors = {};
  const values = [];

  for (const field of form.fields) {
    const value = formData.get(field.id) || "";
    if (field.required && !value.toString().trim()) {
      errors[field.id] = "This field is required";
    }
    values.push({
      fieldId: field.id,
      value: value.toString()
    });
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors, success: false });
  }

  // Save submission
  await db.submission.create({
    data: {
      formId: form.id,
      shop: form.shop,
      values: {
        create: values
      }
    }
  });

  return data({ success: true });
};

export default function PublicForm() {
  const { form } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Thank You!</h1>
          <p style={styles.description}>Your submission has been received.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{form.title}</h1>
        {form.description && <p style={styles.description}>{form.description}</p>}
        
        <Form method="post" style={styles.form}>
          {form.fields.map((field) => {
            const error = actionData?.errors?.[field.id];
            return (
              <div key={field.id} style={styles.fieldGroup}>
                <label htmlFor={field.id} style={styles.label}>
                  {field.label} {field.required && <span style={styles.required}>*</span>}
                </label>
                
                {field.type === 'TEXTAREA' ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder || ""}
                    style={{...styles.input, ...styles.textarea, ...(error ? styles.inputError : {})}}
                    rows={4}
                  />
                ) : (
                  <input
                    type={field.type === 'EMAIL' ? 'email' : 'text'}
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder || ""}
                    style={{...styles.input, ...(error ? styles.inputError : {})}}
                  />
                )}
                
                {error && <span style={styles.errorText}>{error}</span>}
              </div>
            );
          })}
          
          <button 
            type="submit" 
            style={{...styles.button, ...(isSubmitting ? styles.buttonDisabled : {})}}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : (form.submitText || "Submit")}
          </button>
        </Form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '40px',
    width: '100%',
    maxWidth: '500px'
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827'
  },
  description: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    color: '#4B5563'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  required: {
    color: '#EF4444'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  },
  textarea: {
    resize: 'vertical'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  errorText: {
    color: '#EF4444',
    fontSize: '12px',
    marginTop: '4px'
  },
  button: {
    backgroundColor: '#000000',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  successIcon: {
    fontSize: '48px',
    color: '#10B981',
    marginBottom: '16px'
  }
};
