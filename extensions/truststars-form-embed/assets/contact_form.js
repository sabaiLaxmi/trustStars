document.addEventListener('DOMContentLoaded', function() {
  const wrappers = document.querySelectorAll('.ts-block-wrapper');
  
  wrappers.forEach(async (wrapper) => {
    const formId = wrapper.getAttribute('data-form-id');
    const blockId = wrapper.getAttribute('data-block-id');
    const container = document.getElementById(`ts-form-container-${blockId}`);
    
    if (!formId) return;

    try {
      // Fetch form configuration
      const response = await fetch(`/apps/truststars/api/${formId}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === "NoPublishedForms") {
          throw new Error('NoPublishedForms');
        }
        throw new Error('Form not found');
      }
      
      if (!data.form) throw new Error('Form data invalid');
      
      const form = data.form;
      
      // Build Form HTML
      let fieldsHtml = '';
      form.fields.forEach(field => {
        const requiredAttr = field.required ? 'required' : '';
        const requiredAsterisk = field.required ? '<span class="ts-required" style="color: inherit;">*</span>' : '';
        
        if (field.type === 'TEXTAREA') {
          fieldsHtml += `
            <div class="ts-form-group">
              <label class="ts-label" for="${field.id}" style="color: inherit; font-family: inherit;">${field.label} ${requiredAsterisk}</label>
              <textarea id="${field.id}" name="${field.id}" class="ts-input ts-textarea" placeholder="${field.placeholder || ''}" rows="4" style="font-family: inherit;" ${requiredAttr}></textarea>
            </div>
          `;
        } else {
          const type = field.type === 'EMAIL' ? 'email' : 'text';
          fieldsHtml += `
            <div class="ts-form-group">
              <label class="ts-label" for="${field.id}" style="color: inherit; font-family: inherit;">${field.label} ${requiredAsterisk}</label>
              <input type="${type}" id="${field.id}" name="${field.id}" class="ts-input" placeholder="${field.placeholder || ''}" style="font-family: inherit;" ${requiredAttr} />
            </div>
          `;
        }
      });

      const bgColor = form.backgroundColor || form.accentColor || 'transparent';
      const txtColor = form.textColor || 'inherit';
      const fontFam = form.fontFamily && form.fontFamily !== 'Default' ? form.fontFamily : 'inherit';
      const btnBg = form.backgroundColor ? txtColor : '';
      const btnText = form.backgroundColor ? bgColor : '';
      const btnStyle = btnBg ? `style="background-color: ${btnBg}; color: ${btnText}; border: none;"` : '';

      container.innerHTML = `
        <div class="ts-form-inner" style="background-color: ${bgColor}; color: ${txtColor}; font-family: ${fontFam}; padding: 24px; border-radius: 8px;">
          ${form.title ? `<h3 class="ts-form-title" style="color: ${txtColor}; font-family: ${fontFam};">${form.title}</h3>` : ''}
          ${form.description ? `<p class="ts-form-description" style="color: ${txtColor}; font-family: ${fontFam};">${form.description}</p>` : ''}
          
          <form id="ts-form-${blockId}" class="ts-form" action="/apps/truststars/api/${formId}" method="POST">
            ${fieldsHtml}
            
            <div style="display: none;" aria-hidden="true">
              <label for="a_password">Password</label>
              <input type="text" id="a_password" name="a_password" tabindex="-1" autocomplete="off" />
            </div>
            
            <button type="submit" class="ts-submit-btn button btn" ${btnStyle}>${form.submitText || 'Submit'}</button>
          </form>
          
          <div id="ts-success-${blockId}" class="ts-success-message" style="display: none;">
            <div class="ts-success-icon">✓</div>
            <h3 class="ts-success-text">Thank You!</h3>
            <p>Your submission has been received.</p>
          </div>
          
          <div id="ts-error-${blockId}" class="ts-error-message" style="display: none; color: red; margin-top: 10px;">
            There was an error submitting the form. Please check your inputs.
          </div>
        </div>
      `;
      
      // Handle Submission
      const formEl = document.getElementById(`ts-form-${blockId}`);
      formEl.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = formEl.querySelector('.ts-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        const formData = new FormData(formEl);
        
        try {
          const res = await fetch(formEl.action, {
            method: 'POST',
            body: formData
          });
          const result = await res.json();
          
          if (result.success) {
            formEl.style.display = 'none';
            document.getElementById(`ts-success-${blockId}`).style.display = 'block';
            document.getElementById(`ts-error-${blockId}`).style.display = 'none';
          } else {
            throw new Error('Submission failed');
          }
        } catch (err) {
          const errorEl = document.getElementById(`ts-error-${blockId}`);
          errorEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = form.submitText || 'Submit';
        }
      });
      
    } catch (err) {
      if (err.message === 'NoPublishedForms') {
        container.innerHTML = `
          <div style="padding: 40px; text-align: center; background: #f4f6f8; border-radius: 8px;">
            <p style="margin: 0; color: #333; font-family: sans-serif;">No published forms yet — publish a form in the TrustStars app to display it here.</p>
          </div>
        `;
      } else {
        container.innerHTML = `<div class="ts-error-state">Unable to load form. Make sure your Form ID is correct.</div>`;
      }
    }
  });
});
