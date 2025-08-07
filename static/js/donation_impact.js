document.addEventListener("DOMContentLoaded", () => {
    const donationImpactDiv = document.getElementById("donationImpact");
    const donationAmountInput = document.getElementById("donationAmount");
    const calculateButton = document.getElementById("calculateBtn");

    const quotes = [
        "“No one has ever become poor by giving.” – Anne Frank",
        "“We make a living by what we get, but we make a life by what we give.” – Winston Churchill",
        "“The simplest acts of kindness are by far more powerful than a thousand heads bowing in prayer.” – Gandhi",
        "“If you can't feed a hundred people, then just feed one.” – Mother Teresa",
        "“Giving is not just about making a donation. It is about making a difference.” – Kathy Calvin",
        "“You have not lived today until you have done something for someone who can never repay you.” – John Bunyan"
    ];

    function showLoadingState() {
        donationImpactDiv.innerHTML = `
            <p>🔄 Calculating...</p>
        `;
        donationImpactDiv.style.color = "#2AB7CA";
    }

    function calculateImpact() {
        const amount = donationAmountInput.value.trim();
        
        // Show loading state
        showLoadingState();

        // Delay to simulate calculation time
        setTimeout(() => {
            if (!amount || isNaN(amount) || amount < 1) {
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                donationImpactDiv.innerHTML = `
                    <p>❌ Please enter a valid donation amount!</p>
                    <p><em>${randomQuote}</em></p>`;
                donationImpactDiv.style.color = "red";
                return;
            }

            const parsedAmount = parseFloat(amount);
            const peopleHelped = Math.floor(parsedAmount / 100);
            const mealsProvided = Math.floor(parsedAmount / 50);

            donationImpactDiv.innerHTML = `
                <p>💙 Your donation of ₹${parsedAmount.toFixed(2)} can help <strong>${peopleHelped} people</strong>.</p>
                <p>🍲 This can provide <strong>${mealsProvided} meals</strong> to the needy.</p>`;
            donationImpactDiv.style.color = "#2AB7CA";
        }, 1000); // Simulate a short delay for calculation
    }

    calculateButton.addEventListener("click", calculateImpact);
    donationAmountInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") calculateImpact();
    });
});
