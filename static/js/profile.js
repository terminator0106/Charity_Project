function toggleDropdown(e) {
    e.preventDefault();
    const menu = document.getElementById("profile-dropdown");
    if (menu) {
        menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
    }
}

document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("profile-dropdown");
    const clickedInside = event.target.closest(".dropdown");

    if (dropdown && !clickedInside) {
        dropdown.style.display = "none";
    }
});
