import AppConfig from "./AppConfig.js";

window.resetPassword = resetPassword;
function resetPassword() {
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value;

    if (!username) {
        return;
    }

    const body = {
        username: username
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/auth/reset/password", {
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
        .then(json => {
            alert(json.message);
            localStorage.setItem("username", username);
            window.location.href = "./reset-password-confirm.html"
        })
        .catch(error => {
            error.json().then(err => {
                const errorText = err.message;
                alert(errorText);
            }).catch(() => {
                alert("Something went wrong! Please try again later.");
            })
        })
}