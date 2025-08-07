document.addEventListener('DOMContentLoaded', () => {
    const domainSelect = document.getElementById('domainSelect');
    const charityList = document.getElementById('charityList');
    const charityCheckboxes = document.getElementById('charityCheckboxes');
    const amountSection = document.getElementById('amountSection');
    const submitBtn = document.getElementById('submitDonationBtn');
    const utilizationSummary = document.getElementById('utilizationSummary');
    const utilizationList = document.getElementById('utilizationList');
    const donationAmountInput = document.getElementById('donationAmountInput');
    const paymentMethod = document.getElementById('paymentMethod');
    const paymentDetails = document.getElementById('paymentDetails');
    const paymentStatus = document.getElementById('paymentStatus');
    const donationForm = document.getElementById('donationForm');
    const paymentSection = document.getElementById('paymentSection');

    let domainName = '';

    function getCSRFToken() {
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='));
        return csrfToken ? csrfToken.split('=')[1] : '';
    }

    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    domainSelect.addEventListener('change', () => {
        const domainId = domainSelect.value;
        domainName = domainSelect.options[domainSelect.selectedIndex].text.toLowerCase();

        if (!domainId) {
            charityCheckboxes.innerHTML = '';
            charityList.classList.add('hidden');
            amountSection.classList.add('hidden');
            submitBtn.classList.add('hidden');
            utilizationSummary.classList.add('hidden');
            return;
        }

        fetch(`/user_dashboard/get-charities/${domainId}/`)
            .then(response => response.json())
            .then(data => {
                charityCheckboxes.innerHTML = '';

                if (!data.length) {
                    charityCheckboxes.innerHTML = '<p>No charities found for this domain.</p>';
                    return;
                }

                data.forEach(charity => {
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'charities';
                    radio.value = charity.id;
                    radio.classList.add('charity-radio');

                    const label = document.createElement('label');
                    label.textContent = toTitleCase(charity.name);
                    label.classList.add('charity-label');

                    const container = document.createElement('div');
                    container.classList.add('charity-container');
                    container.appendChild(radio);
                    container.appendChild(label);

                    charityCheckboxes.appendChild(container);
                });

                charityList.classList.remove('hidden');
                amountSection.classList.remove('hidden');
                submitBtn.classList.remove('hidden');
            })
            .catch(err => {
                console.error(err);
                charityCheckboxes.innerHTML = '<p>Error loading charities.</p>';
                charityList.classList.remove('hidden');
            });
    });

    donationAmountInput.addEventListener('input', () => {
        const amount = parseFloat(donationAmountInput.value);
        utilizationList.innerHTML = '';
        if (!amount) {
            utilizationSummary.classList.add('hidden');
            paymentSection.classList.add('hidden');
            return;
        }

        paymentSection.classList.remove('hidden');

        let breakdown = '';

        const breakdownMap = {
            food: [
                `${Math.floor(amount / 50)} meals provided`,
                `₹${(amount * 0.1).toFixed(2)} for logistics`,
                `₹${(amount * 0.15).toFixed(2)} for admin`
            ],
            education: [
                `₹${(amount * 0.6).toFixed(2)} for tuition fees`,
                `₹${(amount * 0.3).toFixed(2)} for books`,
                `₹${(amount * 0.1).toFixed(2)} for other resources`
            ],
            health: [
                `₹${(amount * 0.5).toFixed(2)} for treatment & medicines`,
                `₹${(amount * 0.3).toFixed(2)} for staff & equipment`,
                `₹${(amount * 0.2).toFixed(2)} for patient care`
            ],
            children: [
                `₹${(amount * 0.4).toFixed(2)} for child programs`,
                `₹${(amount * 0.35).toFixed(2)} for nutrition`,
                `₹${(amount * 0.25).toFixed(2)} for education`
            ],
            disaster: [
                `₹${(amount * 0.5).toFixed(2)} for supplies`,
                `₹${(amount * 0.3).toFixed(2)} for shelter`,
                `₹${(amount * 0.2).toFixed(2)} for logistics`
            ],
            environment: [
                `₹${(amount * 0.5).toFixed(2)} for conservation`,
                `₹${(amount * 0.3).toFixed(2)} for education`,
                `₹${(amount * 0.2).toFixed(2)} for rescue`
            ],
            rights: [
                `₹${(amount * 0.4).toFixed(2)} for legal aid`,
                `₹${(amount * 0.35).toFixed(2)} for awareness`,
                `₹${(amount * 0.25).toFixed(2)} for support`
            ],
            religious: [
                `₹${(amount * 0.5).toFixed(2)} for services`,
                `₹${(amount * 0.3).toFixed(2)} for education`,
                `₹${(amount * 0.2).toFixed(2)} for maintenance`
            ],
            arts: [
                `₹${(amount * 0.4).toFixed(2)} for preservation`,
                `₹${(amount * 0.35).toFixed(2)} for artists`,
                `₹${(amount * 0.25).toFixed(2)} for events`
            ],
            animal: [
                `₹${(amount * 0.5).toFixed(2)} for shelter`,
                `₹${(amount * 0.3).toFixed(2)} for rescue`,
                `₹${(amount * 0.2).toFixed(2)} for adoption`
            ]
        };

        let matched = false;
        for (let key in breakdownMap) {
            if (domainName.includes(key)) {
                breakdown = breakdownMap[key].map(item => `<li>${item}</li>`).join('');
                matched = true;
                break;
            }
        }

        if (!matched) {
            breakdown = `<li>₹${amount.toFixed(2)} will be used as per domain needs.</li>`;
        }

        utilizationList.innerHTML = breakdown;
        utilizationSummary.classList.remove('hidden');
    });

    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const amount = parseFloat(donationAmountInput.value);
        const domainId = domainSelect.value;
        const charityId = document.querySelector('input[name="charities"]:checked')?.value;
        const domainText = domainSelect.options[domainSelect.selectedIndex].text;

        if (!amount || !domainId || !charityId) {
            alert("Please fill all donation fields.");
            return;
        }

        fetch('/user_dashboard/create-order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ amount: amount * 100 })
        })
        .then(res => res.json())
        .then(data => {
            if (typeof Razorpay === 'undefined') {
                alert("Razorpay script not loaded. Please check your internet or contact support.");
                return;
            }

            const options = {
                key: "rzp_test_ZNBcrwR3B5htxX", // Replace with your Razorpay key
                amount: data.amount,
                currency: "INR",
                name: "HopeHub Donations",
                description: "Charity Support",
                order_id: data.order_id,
                handler: function (response) {
                    fetch('/user_dashboard/save-donation/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCSRFToken()
                        },
                        body: JSON.stringify({
                            amount,
                            domain_id: domainId,
                            domain_name: domainText,
                            charity_id: charityId,
                            payment_method: "razorpay",
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'success') {
                            alert("Thank you! Your donation was successful.");
                            donationForm.reset();
                            paymentStatus.innerHTML = '';
                            utilizationSummary.classList.add('hidden');
                            charityList.classList.add('hidden');
                            submitBtn.classList.add('hidden');
                            paymentSection.classList.add('hidden');
                        } else {
                            alert("Donation processed but saving failed.");
                        }
                    });
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        })
        .catch(err => {
            console.error("Error creating order:", err);
            alert("Something went wrong while initiating payment.");
        });
    });
});
