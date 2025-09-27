function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01-12
    const day = date.getDate().toString().padStart(2, '0'); // 01-31
    return `${day}-${month}-${year}`;
}

function showPopup(message) {
    let container = document.getElementById("popup-container");
    // Create new popup element
    let popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = message;

    // Append popup to container
    container.appendChild(popup);

    // Remove popup after 3 seconds
    setTimeout(() => {
        popup.classList.add("hide"); // Fade out
        setTimeout(() => popup.remove(), 500); // Remove from DOM
    }, 3000);
}
