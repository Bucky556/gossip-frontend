import AppConfig from "./AppConfig.js";

window.resetPasswordConfirm = resetPasswordConfirm;
function resetPasswordConfirm() {
    const confirmCodeValue = document.getElementById("confirm_code").value;
    const newPasswordValue = document.getElementById("new_password").value;
    const username = localStorage.getItem("username");

    if (!confirmCodeValue && !newPasswordValue && !username) {
        alert("Please fill all inputs");
        return;
    }

    const body = {
        "username": username,
        "confirmCode": confirmCodeValue,
        "newPassword": newPasswordValue,
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/auth/reset/password/confirm", {
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
            window.location.href = "./login.html"
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