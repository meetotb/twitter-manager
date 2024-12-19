document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('hiringForm');
    const twitterExpRadios = document.getElementsByName('twitter-exp');
    const web3ExpRadios = document.getElementsByName('web3-exp');
    const twitterExpDetails = document.getElementById('twitter-exp-details');
    const web3ExpDetails = document.getElementById('web3-exp-details');

    // Show/hide experience details based on radio selection
    twitterExpRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                twitterExpDetails.style.display = 'block';
            } else {
                twitterExpDetails.style.display = 'none';
            }
        });
    });

    web3ExpRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                web3ExpDetails.style.display = 'block';
            } else {
                web3ExpDetails.style.display = 'none';
            }
        });
    });

    // Form submission handling
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            whatsapp: `${document.getElementById('countryCode').value} ${document.getElementById('whatsapp').value}`,
            instagram: document.getElementById('instagram').value,
            twitter: document.getElementById('twitter').value || 'Not provided',
            linkedin: document.getElementById('linkedin').value || 'Not provided',
            twitterExperience: document.querySelector('input[name="twitter-exp"]:checked')?.value || 'no',
            twitterExperienceDetails: document.getElementById('exp-details')?.value || 'N/A',
            web3Experience: document.querySelector('input[name="web3-exp"]:checked')?.value || 'no',
            web3ExperienceDetails: document.getElementById('web3-details')?.value || 'N/A'
        };

        try {
            const response = await fetch('/api/submit-application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = 'success.html';
            } else {
                throw new Error(data.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your application. Please try again.');
            submitBtn.textContent = 'Submit Application';
            submitBtn.disabled = false;
        }
    });
}); 