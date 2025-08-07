document.addEventListener("DOMContentLoaded", () => {
    const donationImpactDiv = document.getElementById("donationImpact");
    const donationAmountInput = document.getElementById("donationAmount");
    const calculateButton = document.getElementById("calculateBtn");

    const motivationalQuotes = [
        "“No one has ever become poor by giving.” – Anne Frank",
        "“We make a living by what we get, but we make a life by what we give.” – Winston Churchill",
        "“The simplest acts of kindness are by far more powerful than a thousand heads bowing in prayer.” – Mahatma Gandhi",
        "“If you can't feed a hundred people, then just feed one.” – Mother Teresa",
        "“Giving is not just about making a donation. It is about making a difference.” – Kathy Calvin",
        "“You have not lived today until you have done something for someone who can never repay you.” – John Bunyan"
    ];

    const displayImpact = (amount) => {
        const peopleHelped = Math.floor(amount / 100);
        const mealsProvided = Math.floor(amount / 50);

        donationImpactDiv.innerHTML = `
            <p>💙 Your donation of ₹${amount.toFixed(2)} can help <strong>${peopleHelped} people</strong>.</p>
            <p>🍲 This can provide <strong>${mealsProvided} meals</strong> to the needy.</p>`;
        donationImpactDiv.style.color = "#2AB7CA";
    };

    const displayError = () => {
        const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        donationImpactDiv.innerHTML = `
            <p>❌ Please enter a valid donation amount!</p>
            <p><em>${quote}</em></p>`;
        donationImpactDiv.style.color = "red";
    };

    const calculateImpact = () => {
        const amount = parseFloat(donationAmountInput.value.trim());
        if (isNaN(amount) || amount < 1) {
            displayError();
        } else {
            displayImpact(amount);
        }
    };

    calculateButton?.addEventListener("click", calculateImpact);
    donationAmountInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") calculateImpact();
    });
});
