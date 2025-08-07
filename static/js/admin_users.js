document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Users script loaded.");

    const searchInput = document.getElementById("searchUser");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            searchUsers(this.value.trim().toLowerCase());
        });
    }

    const tableBody = document.getElementById("userTableBody");
    if (!tableBody) return;

    tableBody.addEventListener("click", function (event) {
        const target = event.target;
        const row = target.closest("tr");
        const userId = row?.dataset.id;

        if (target.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this user?")) {
                fetch(`/delete/user/${userId}/`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": getCSRFToken(),
                    },
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === "success") {
                            row.remove();
                        }
                    });
            }
        } else if (target.classList.contains("edit-btn")) {
            document.getElementById("editUserId").value = userId;
            document.getElementById("editUserName").value = row.cells[1].innerText;
            document.getElementById("editUserEmail").value = row.cells[2].innerText;
            document.getElementById("editUserRole").value = row.cells[3].innerText;
            document.getElementById("editForm").classList.remove("hidden");
        }
    });

    document.getElementById("addUserBtn")?.addEventListener("click", addUser);
    document.getElementById("saveEditBtn")?.addEventListener("click", saveEdit);
    document.getElementById("cancelEditBtn")?.addEventListener("click", closeEditForm);
});

function searchUsers(query) {
    const rows = document.querySelectorAll("#userTableBody tr");
    rows.forEach(row => {
        const name = row.cells[1].innerText.toLowerCase();
        const email = row.cells[2].innerText.toLowerCase();
        const role = row.cells[3].innerText.toLowerCase();
        row.style.display = name.includes(query) || email.includes(query) || role.includes(query) ? "" : "none";
    });
}

function saveEdit() {
    const userId = document.getElementById("editUserId").value;
    const username = document.getElementById("editUserName").value.trim();
    const email = document.getElementById("editUserEmail").value.trim();
    const contact = "0000000000"; // Optional field or fetch from a hidden input if needed
    const role = document.getElementById("editUserRole").value;

    fetch(`/edit/user/${userId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ username, email, contact }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "updated") {
                const rows = document.querySelectorAll("#userTableBody tr");
                rows.forEach(row => {
                    if (row.dataset.id === userId) {
                        row.cells[1].innerText = username;
                        row.cells[2].innerText = email;
                        row.cells[3].innerText = role;
                    }
                });
                closeEditForm();
            }
        });
}

function closeEditForm() {
    document.getElementById("editForm").classList.add("hidden");
}

function addUser() {
    const username = prompt("Enter user name:");
    const email = prompt("Enter user email:");
    const contact = prompt("Enter user contact:");
    const role = prompt("Enter role (Admin/User):");

    if (!username || !email || !contact || !["admin", "user"].includes(role.toLowerCase())) {
        alert("Invalid input.");
        return;
    }

    fetch("/add/user/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ username, email, contact }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const tableBody = document.getElementById("userTableBody");
                const newRow = document.createElement("tr");
                newRow.dataset.id = data.id;
                newRow.innerHTML = `
                    <td>${data.id}</td>
                    <td>${username}</td>
                    <td>${email}</td>
                    <td>${role}</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            }
        });
}

// Utility to get CSRF token
function getCSRFToken() {
    const name = "csrftoken";
    const cookies = document.cookie.split(";").map(c => c.trim());
    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return decodeURIComponent(cookie.split("=")[1]);
        }
    }
    return "";
}
