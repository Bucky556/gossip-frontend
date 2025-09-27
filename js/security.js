window.addEventListener("DOMContentLoaded", function () {
    const profileStr = localStorage.getItem("userDetails");
    const userDetails = JSON.parse(profileStr);
    let isAdmin = false;
    userDetails.roles.forEach(role => {
        if (role === 'ROLE_ADMIN') {
            isAdmin = true;
        }
    });

    const elementList = document.querySelectorAll(".securityRequired");
    elementList.forEach((element) => {
        if (isAdmin) {
            element.style.display = 'block';
        } else {
            element.remove();
        }
    });
});
