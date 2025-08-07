// Initialize Google Map
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 20.5937, lng: 78.9629 } // Center of India
    });

    const charityClubs = [
        { name: "Feeding India", lat: 28.7041, lng: 77.1025 },
        { name: "Robin Hood Army", lat: 19.0760, lng: 72.8777 },
        { name: "Helping Hands", lat: 12.9716, lng: 77.5946 }
    ];

    charityClubs.forEach(club => {
        new google.maps.Marker({
            position: { lat: club.lat, lng: club.lng },
            map,
            title: club.name
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const domainName = params.get("domain") || "Charity";

    document.getElementById("domain-name").innerText = domainName;
    document.getElementById("domain-name-bottom").innerText = domainName;

    // Search Charity
    const searchBox = document.getElementById("search-box");
    const searchBtn = document.getElementById("search-btn");

    if (searchBox && searchBtn) {
        searchBtn.addEventListener("click", function() {
            const query = searchBox.value.toLowerCase();
            alert("Searching for " + query);
        });
    }

    // Load Charity Clubs Dynamically
    const charityGrid = document.querySelector(".charity-grid");
    if (charityGrid) {
        charityGrid.innerHTML += `
            <div class="charity-card">
                <img src="/static/images/charity1.jpg" alt="Charity">
                <h3>Feeding India</h3>
                <p>Providing meals to the needy.</p>
                <a href="#">More Info</a>
            </div>
        `;
    }

    // Logout Confirmation
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to logout?")) {
                window.location.href = "/logout/";
            }
        });
    }

    // Profile Toggle
    const profileBtn = document.getElementById("profile-btn");
    const profileSection = document.getElementById("profile-section");
    if (profileBtn && profileSection) {
        profileBtn.addEventListener("click", () => {
            profileSection.classList.toggle("hidden");
        });
    }

    // Bar Graph Data (Check if element exists)
    const donationChartCanvas = document.getElementById("donationChart");
    if (donationChartCanvas) {
        const ctx = donationChartCanvas.getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{
                    label: "Donation Amount (₹)",
                    data: [1000, 500, 1200, 800, 950, 1100],
                    backgroundColor: "#2AB7CA"
                }]
            }
        });
    }
});

