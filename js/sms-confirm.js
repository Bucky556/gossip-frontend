import AppConfig from "./AppConfig.js";

const input1 = document.getElementById('input1');
const input2 = document.getElementById('input2');
const input3 = document.getElementById('input3');
const input4 = document.getElementById('input4');
const userPhone = localStorage.getItem("userPhoneNumber");  // from registration.js
document.getElementById('userPhone').textContent = userPhone;

/// bu method bizda 4 ta bosh inputlar bulsa birnichsini tersak keyingisiga automatik tarzda utkazib yuboradi
function handleInput(event) {
    /*  const enteredValue = event.target .value;
      const elementId = event.target.id;
      const nextInput = event.target.nextElementSibling;*/

    const enteredValue = event.target.value;
    const nextInput = event.target.nextElementSibling;
    if (enteredValue && nextInput) {
        nextInput.focus();
    } else if (nextInput === null) {  // last element
        handleSubmit();
    }
}

// code ni yozganda automatik submit button ishlab profile page utkazib yuboradi
window.handleSubmit = handleSubmit;
function handleSubmit() {
    // send confirm request
    let code = null;
    if (input1.value && input2.value && input3.value && input4.value) {
        code = input1.value + input2.value + input3.value + input4.value;
    }
    if (code == null) { // todo
        return;
    }

    const body = {
        "phone": userPhone,
        "code": code
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/auth/registration/sms-verification", {
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
            clearInput()
            localStorage.setItem("userDetails", JSON.stringify(json));
            localStorage.setItem("jwtToken", json.accessToken);
            localStorage.removeItem("registrationEmailMessage")

            window.location.href = "./profile-post-list.html"
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

window.resendSms = resendSms;
function resendSms() {
    // sms ni qayta jo'natish
    const body = {
        "phone": userPhone
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/auth/registration/sms-verification/resend", {
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
            alert(json.data);
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

function clearInput() {
    input1.value = '';
    input2.value = '';
    input3.value = '';
    input4.value = '';
}

input1.addEventListener('input', handleInput);
input2.addEventListener('input', handleInput);
input3.addEventListener('input', handleInput);
input4.addEventListener('input', handleInput);