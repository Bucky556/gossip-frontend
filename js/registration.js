import AppConfig from "./AppConfig.js";

document.getElementById("registrationForm")
    .addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const phoneEmailRedLineBorder = document.getElementById("phoneEmail");
        const phoneEmail = phoneEmailRedLineBorder.value;
        const redLineBorderPassword = document.getElementById("password");
        const password = redLineBorderPassword.value;
        const redLineBorderConfirm = document.getElementById("confirmPassword");
        const confirmPassword = redLineBorderConfirm.value;
        const errorTextConfirmation = document.getElementById("errorTextConfirmation");
        const errorTextPhoneEmail = document.getElementById("errorTextPhoneEmail");
        const redLineBorderPhoneEmail = document.getElementById("phoneEmail")

        //Har submitda default rangni qaytarib qo'yamiz agar tugri bulsa
        errorTextConfirmation.style.display = "none";
        errorTextPhoneEmail.style.display = "none";
        redLineBorderConfirm.style.borderColor = "#ddd";
        redLineBorderPassword.style.borderColor = "#ddd";
        phoneEmailRedLineBorder.style.borderColor = "#ddd";

        const body = {
            name: name,
            username: phoneEmail,
            password: password,
            confirmPassword: confirmPassword
        }

        const lang = document.getElementById("current-lang").innerText.trim();

        fetch(AppConfig.API + "/auth/registration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": lang,
            },
            body: JSON.stringify(body)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            })
            .then(data => {
                const emailOrPhone = checkPhoneOrEmail(phoneEmail);
                if (emailOrPhone === 'Email') {
                    localStorage.setItem("registrationEmailMessage", data.message);

                    const currentLang = localStorage.getItem("current-lang") || "UZ";
                    alert(data.message);  // backend-dan kelgan tilga mos xabar keladi
                    window.location.href = "./login.html"; // va login page ga redirect qiladi
                } else if (emailOrPhone === 'Phone') {
                    localStorage.setItem("userPhoneNumber", phoneEmail);

                    const currentLang = localStorage.getItem("current-lang") || "UZ";
                    window.location.href = "./sms-confirm.html";
                } else if (emailOrPhone === 'Invalid') {
                    errorTextPhoneEmail.style.display = "block";
                    errorTextPhoneEmail.innerText = data.data;
                    redLineBorderPhoneEmail.style.borderColor = "#ff0000";
                }
            })
            .catch(error => {
                error.json().then(err => {
                    const errorText = err.message;
                    if (errorText.includes("already") || errorText.includes("allaqachon") || errorText.includes("уже")) {
                        errorTextPhoneEmail.style.display = "block";
                        errorTextPhoneEmail.innerText = errorText;
                        phoneEmailRedLineBorder.style.borderColor = "#ff0000";
                    } else if (errorText.includes("Passwords") || errorText.includes("Parollar") || errorText.includes("Пароли")) {
                        errorTextConfirmation.style.display = "block";
                        errorTextConfirmation.innerText = errorText;
                        redLineBorderConfirm.style.borderColor = "#ff0000";
                        redLineBorderPassword.style.borderColor = "#ff0000";
                    } else {
                        alert("Something went wrong, please try again later.");
                    }
                });
            })
    })

function checkPhoneOrEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^998\d{9}$/;

    if (emailRegex.test(value)) {
        return "Email";
    } else if (phoneRegex.test(value)) {
        return "Phone";
    } else {
        return "Invalid";
    }
}
