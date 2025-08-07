document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Posts script loaded.");

    const searchInput = document.getElementById("searchPost");
    searchInput?.addEventListener("keyup", () => {
        searchPosts(searchInput.value.trim().toLowerCase());
    });

    document.getElementById("addPostBtn")?.addEventListener("click", addPost);

    const postTableBody = document.getElementById("postTableBody");
    postTableBody?.addEventListener("click", function (event) {
        const target = event.target;
        const row = target.closest("tr");
        const postId = row?.dataset.id;

        if (target.classList.contains("edit-btn")) {
            editPost(postId, row);
        } else if (target.classList.contains("delete-btn")) {
            deletePost(postId, row);
        }
    });
});

function searchPosts(query) {
    const rows = document.querySelectorAll("#postTableBody tr");
    rows.forEach(row => {
        const title = row.cells[1].innerText.toLowerCase();
        const domain = row.cells[2].innerText.toLowerCase();
        const desc = row.cells[3].innerText.toLowerCase();
        row.style.display = title.includes(query) || domain.includes(query) || desc.includes(query) ? "" : "none";
    });
}

function addPost() {
    const title = prompt("Enter post title:").trim();
    const description = prompt("Enter post description:").trim();
    const domainId = prompt("Enter domain ID for the post:").trim(); // You can use dropdown later

    if (!title || !description || !domainId) {
        alert("All fields are required!");
        return;
    }

    fetch("/add/post/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ title, description, domain_id: domainId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                const tableBody = document.getElementById("postTableBody");
                const newRow = document.createElement("tr");
                newRow.dataset.id = data.id;

                newRow.innerHTML = `
                    <td>${data.id}</td>
                    <td>${title}</td>
                    <td>${data.domain_name}</td>
                    <td>${description.substring(0, 15)}...</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            } else {
                alert("Failed to add post.");
            }
        });
}

function editPost(postId, row) {
    const newTitle = prompt("Edit title:", row.cells[1].innerText).trim();
    const newDescription = prompt("Edit description:", row.cells[3].innerText).trim();

    if (!newTitle || !newDescription) {
        alert("Title and description cannot be empty.");
        return;
    }

    fetch(`/edit/post/${postId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "updated") {
                row.cells[1].innerText = newTitle;
                row.cells[3].innerText = newDescription.substring(0, 15) + "...";
            } else {
                alert("Failed to update post.");
            }
        });
}

function deletePost(postId, row) {
    if (confirm("Are you sure you want to delete this post?")) {
        fetch(`/delete/post/${postId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken()
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    row.remove();
                } else {
                    alert("Error deleting post.");
                }
            });
    }
}

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
