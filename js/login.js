import AppConfig from "./AppConfig.js";

window.login = login;
function login() {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const username = usernameInput.value;
    const password = passwordInput.value;
    const usernameError = document.getElementById("usernameErrorSpan");
    const passwordError = document.getElementById("passwordErrorSpan");

    usernameError.style.display = "none";
    usernameInput.style.borderColor = "#ddd";
    passwordInput.nextElementSibling.style.display = "none";
    passwordInput.style.borderColor = "#ddd";

    let hasError = false;
    if (username === null || username === undefined || username.length === 0) {
        usernameError.style.display = "block";
        usernameInput.style.borderColor = "#ff0000";
        hasError = true;
    }

    if (password === null || password === undefined || password.length === 0) {
        passwordInput.nextElementSibling.style.display = "block";
        passwordInput.style.borderColor = "#ff0000";
        hasError = true;
    }

    if (hasError === true) {  // 2 ta input-da ham xato chiqsa birdaniga chiqarish uchun
        return;
    }

    const body = {
        username: username,
        password: password
    }

    const lang = document.getElementById("current-lang").innerText.trim();

    fetch(AppConfig.API + "/auth/login", {
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
            localStorage.setItem("userDetails", JSON.stringify(data));
            localStorage.setItem("jwtToken", data.accessToken);

            usernameInput.value = '';
            passwordInput.value = ''; // login bulgandan keyin inputlari tozalanib ketadi (clean)

            localStorage.removeItem("registrationEmailMessage")
            window.location.href = "./profile-post-list.html"
        })
        .catch(error => {
            error.json().then(err => {
                const errorText = err.message;
                if (errorText.includes("yoki") || errorText.includes("or") || errorText.includes("или")) {
                    usernameError.style.display = "block";
                    usernameError.innerText = errorText;
                    usernameInput.style.borderColor = "#ff0000";
                    passwordInput.nextElementSibling.style.display = "block";
                    passwordError.innerText = errorText;
                    passwordInput.style.borderColor = "#ff0000";
                } else {
                    alert("Something went wrong, please try again later.");
                }
            })
        })

}