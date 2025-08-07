document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin Sections JS loaded.");

  // Section toggling
  const showSection = (sectionId) => {
    document.querySelectorAll('.manage-section').forEach(sec => sec.classList.add('hidden'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.remove('hidden');
  };

  const sectionMap = {
    manageDomainsBtn: 'manageDomainsSection',
    manageCharitiesBtn: 'manageCharitiesSection',
    managePostsBtn: 'managePostsSection',
    manageUsersBtn: 'userTableContainer'
  };

  Object.entries(sectionMap).forEach(([btnId, sectionId]) => {
    document.getElementById(btnId)?.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(sectionId);
    });
  });

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.manage-section')?.classList.add('hidden');
    });
  });

  // ADD DOMAIN
  document.getElementById("addDomainBtn")?.addEventListener("click", () => {
    const name = prompt("Enter new domain name:");
    if (!name) return;

    fetch("/add/domain/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({ name })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "added") {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.id}</td>
          <td>${name}</td>
          <td>${new Date().toLocaleDateString()}</td>
          <td>
            <button class="edit-btn" data-id="${data.id}">Edit</button>
            <button class="delete-btn" data-id="${data.id}">Delete</button>
          </td>`;
        document.getElementById("domainTableBody").appendChild(row);
      }
    });
  });

  // EDIT DOMAIN
  document.getElementById("domainTableBody")?.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const row = e.target.closest("tr");
      const id = e.target.dataset.id;
      const currentName = row.cells[1].innerText;
      const newName = prompt("Edit domain name:", currentName);
      if (!newName) return;

      fetch(`/edit/domain/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ name: newName })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "updated") {
          row.cells[1].innerText = newName;
        }
      });
    }
  });

  // ADD CHARITY
  document.getElementById("addCharityBtn")?.addEventListener("click", () => {
    const name = prompt("Charity name:");
    const contact = prompt("Charity contact:");
    const domain = prompt("Domain name (case-sensitive, must match):");

    if (!name || !contact || !domain) return alert("All fields are required.");

    fetch("/add/charity/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({ name, contact, domain })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "added") {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.id}</td>
          <td>${name}</td>
          <td>${domain}</td>
          <td>${contact}</td>
          <td>
            <button class="edit-btn" data-id="${data.id}">Edit</button>
            <button class="delete-btn" data-id="${data.id}">Delete</button>
          </td>`;
        document.getElementById("charityTableBody").appendChild(row);
      }
    });
  });

  // EDIT CHARITY
  document.getElementById("charityTableBody")?.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const row = e.target.closest("tr");
      const id = e.target.dataset.id;

      const currentName = row.cells[1].innerText;
      const currentContact = row.cells[3].innerText;

      const newName = prompt("Edit charity name:", currentName);
      const newContact = prompt("Edit contact:", currentContact);
      if (!newName || !newContact) return;

      fetch(`/edit/charity/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ name: newName, contact: newContact })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "updated") {
          row.cells[1].innerText = newName;
          row.cells[3].innerText = newContact;
        }
      });
    }
  });
});

  // DELETE DOMAIN or CHARITY
  document.querySelectorAll("#domainTableBody, #charityTableBody").forEach(tbody => {
    tbody.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const row = e.target.closest("tr");
        const id = e.target.dataset.id;
        const isDomain = tbody.id === "domainTableBody";
        const url = isDomain ? `/delete/domain/${id}/` : `/delete/charity/${id}/`;

        if (confirm(`Are you sure you want to delete this ${isDomain ? "domain" : "charity"}?`)) {
          fetch(url, {
            method: "POST",
            headers: {
              "X-CSRFToken": getCookie("csrftoken"),
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data.status === "success") {
              row.remove();
              console.log(`${isDomain ? "Domain" : "Charity"} deleted successfully.`);
            } else {
              alert("Failed to delete. Please try again.");
            }
          })
          .catch(err => {
            console.error("Error deleting:", err);
            alert("An error occurred during deletion.");
          });
        }
      }
    });
  });

  
// CSRF Token helper
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
