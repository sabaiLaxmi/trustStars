document.addEventListener('submit', function(event) {
  if (event.target && event.target.classList.contains('ts-form')) {
    event.preventDefault();
    
    // Hide the form
    event.target.style.display = 'none';
    
    // Extract the block ID from the form's ID (e.g. ts-form-12345)
    const blockId = event.target.id.replace('ts-form-', '');
    
    // Show the success message
    const successMessage = document.getElementById('ts-success-' + blockId);
    if (successMessage) {
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});
