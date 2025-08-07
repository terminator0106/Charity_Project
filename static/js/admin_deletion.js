document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Deletion script loaded.");

    // Event delegation for delete buttons (to support dynamic rows too)
    document.querySelectorAll("tbody").forEach(tbody => {
        tbody.addEventListener("click", event => {
            const button = event.target;
            if (button.classList.contains("delete-btn")) {
                const id = button.getAttribute("data-id");
                const type = button.closest("tbody").id;

                let url = "";
                if (type === "charityTableBody") url = `/delete/charity/${id}/`;
                else if (type === "postTableBody") url = `/delete/post/${id}/`;
                else if (type === "userTableBody") url = `/delete/user/${id}/`;
                else if (type === "domainTableBody") url = `/delete/domain/${id}/`;

                if (!url) {
                    console.warn("Invalid deletion type or URL.");
                    return;
                }

                if (confirm("Are you sure you want to delete this entry?")) {
                    fetch(url, {
                        method: "POST",
                        headers: {
                            "X-CSRFToken": getCookie("csrftoken"),
                        },
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === "success") {
                            console.log(`Deleted: ${id}`);
                            location.reload();
                        } else {
                            alert("Deletion failed. Please try again.");
                        }
                    })
                    .catch(err => {
                        console.error("Error during deletion:", err);
                        alert("An error occurred while deleting.");
                    });
                }
            }
        });
    });
});

// Helper to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
