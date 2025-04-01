function toggleForm() {
    const container = document.querySelector('.container');
    if (container) {
        container.classList.toggle('active');
        console.log("Toggle active state on container");
    } else {
        console.error("Element .container introuvable");
    }
}