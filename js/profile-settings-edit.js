import AppConfig from "./AppConfig.js";

window.addEventListener("DOMContentLoaded", function () {
    const userDetailJon = localStorage.getItem("userDetails");
    if (!userDetailJon) {
        return;
    }

    const userDetailObj = JSON.parse(userDetailJon);
    const loginBtn = document.getElementById("header_btn_login");
    loginBtn.style.display = "none";

    document.getElementById("header_user_name_id").textContent = userDetailObj.name;
    document.getElementById("profile_settings_name").value = userDetailObj.name;
    document.getElementById("profile_settings_username").value = userDetailObj.username;

    if (userDetailObj.photo && userDetailObj.photo.url) {
        document.getElementById("profile_settings_photo_id").src = userDetailObj.photo.url;
    } else {
        document.getElementById("profile_settings_photo_id").src = "/photo.png";
    }
});

window.profileNameUpdate = profileNameUpdate;

function profileNameUpdate() {
    const name = document.getElementById("profile_settings_name").value
    if (!name) {
        alert("Fill input, please")
        return;
    }

    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
        window.location.href = "./login.html";
        return;
    }

    const nameMessage = document.getElementById("trueNameMessageSpan");
    nameMessage.style.display = "none";

    const body = {
        "name": name
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/profile/update/name", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
            "Authorization": "Bearer " + jwtToken,
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
            nameMessage.style.display = "inline-block";
            nameMessage.innerText = data.message;

            setTimeout(() => {
                nameMessage.style.display = "none";
            }, 5000)

            // update localStorage
            const userDetailJon = localStorage.getItem("userDetails");
            const userDetail = JSON.parse(userDetailJon);
            userDetail.name = name;
            localStorage.setItem("userDetails", JSON.stringify(userDetail));

            // refresh qilmasdan boshqa joylarda ham automatik uzgarib ketadi update bulgan qiymatga
            document.getElementById("header_user_name_id").textContent = name;
            document.getElementById("profile_settings_name").value = name;
        })
        .catch(error => {
            alert("Something went wrong, please try again later.");
        })
}

window.profilePasswordUpdate = profilePasswordUpdate;

function profilePasswordUpdate() {
    const currentPswd = document.getElementById("profile_settings_current_pswd").value
    const newPswd = document.getElementById("profile_settings_new_pswd").value
    if (!currentPswd || !newPswd) {
        alert("Enter all inputs")
        return;
    }

    const jwtToken = localStorage.getItem("jwtToken");

    const passwordMessage = document.getElementById("truePasswordMessageSpan");
    const errorPasswordMessage = document.getElementById("ErrorCurrentPasswordMessageSpan");
    passwordMessage.style.display = "none";
    errorPasswordMessage.style.display = "none";
    passwordMessage.style.borderColor = "#ddd";
    errorPasswordMessage.style.borderColor = "#ddd";

    const body = {
        "currentPassword": currentPswd,
        "newPassword": newPswd
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        window.location.href = './login.html';
        return;
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/profile/update/password", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
            "Authorization": "Bearer " + jwtToken,
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
            passwordMessage.style.display = "inline-block";
            passwordMessage.innerText = data.data;

            document.getElementById("profile_settings_current_pswd").value = '';
            document.getElementById("profile_settings_new_pswd").value = '';

            setTimeout(() => {  // 5 sekund kurinib turadi keyn yuq buladi
                passwordMessage.style.display = "none";
            }, 5000)

        })
        .catch(async (response) => {
            let errorText = "Something went wrong in password";
            try {
                const data = await response.json(); // serverdan kelgan JSONni o'qish
                errorText = data.message || data.data || errorText;
            } catch (e) {
                alert("Can not retrieve the data");
            }

            const errorPasswordMessage = document.getElementById("ErrorCurrentPasswordMessageSpan");
            errorPasswordMessage.style.display = "block";
            errorPasswordMessage.innerText = errorText;
            errorPasswordMessage.style.borderColor = "#ff0000";

            setTimeout(() => {
                errorPasswordMessage.style.display = "none";
            }, 5000)
        });
}

window.profileUserNameChange = profileUserNameChange;

function profileUserNameChange() {
    const username = document.getElementById("profile_settings_username").value
    const errorUsernameMessage = document.getElementById("ErrorUsernameMessageSpan");
    const confirmCodeSent = document.getElementById("confirmModalResultId")
    if (!username) {
        alert("Enter all inputs")
        return;
    }
    const body = {
        "username": username
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/profile/update/username", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
            "Authorization": "Bearer " + jwt,
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
            confirmCodeSent.textContent = data.message;

            openModal()
        })
        .catch(async (response) => {
            let errorText = "Something went wrong in username";
            try {
                const data = await response.json(); // serverdan kelgan JSONni o'qish
                errorText = data.message || data.data || errorText;
            } catch (e) {
                alert("Can not retrieve the data");
            }

            errorUsernameMessage.style.display = "block";
            errorUsernameMessage.innerText = errorText;
            errorUsernameMessage.style.borderColor = "#ff0000";

            setTimeout(() => {
                errorUsernameMessage.style.display = "none";
            }, 5000)
        });
}

window.profileUserNameChangeConfirm = profileUserNameChangeConfirm;

function profileUserNameChangeConfirm() {
    const confirmCode = document.getElementById("profileUserNameChaneConfirmInputId").value
    const errorCodeMessage = document.getElementById("ErrorCodeSpan");
    const usernameMessage = document.getElementById("trueUsernameMessageSpan")
    const username = document.getElementById("profile_settings_username").value
    if (!confirmCode) {
        alert("Enter all inputs")
    }

    const code = document.getElementById("profileUserNameChaneConfirmInputId").value

    const body = {
        "code": code
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/update/username/confirm", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
            "Authorization": "Bearer " + jwt,
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
            usernameMessage.style.display = "inline-block";
            usernameMessage.innerText = data.message;

            setTimeout(() => {
                usernameMessage.style.display = "none";
            }, 5000)

            localStorage.setItem("jwtToken", data.data); // jwt-ni yangisiga set qilish

            const userDetailsJson = localStorage.getItem("userDetails");
            const userDetails = JSON.parse(userDetailsJson);
            userDetails.username = username;
            userDetails.accessToken = data.data
            localStorage.setItem("userDetails", JSON.stringify(userDetails)); // userDetails-ni yangisiga set qilish
            localStorage.setItem("username", username) // username-ni yangisiga set qilish

            closeModal()
        })
        .catch(async (response) => {
            let errorText = "Something went wrong in username";
            try {
                const data = await response.json(); // serverdan kelgan JSONni o'qish
                errorText = data.message || data.data || errorText;

                errorCodeMessage.style.display = "block";
                errorCodeMessage.textContent = errorText;
            } catch (e) {
                alert("Can not retrieve the data");
            }

            setTimeout(() => {
                errorCodeMessage.style.display = "none";
            }, 5000)
        });
}

//------------ Change username confirm modal start ------------

const modal = document.getElementById('simpleModalId');

window.openModal = openModal

function openModal() {
    modal.style.display = 'block';
}

window.closeModal = closeModal

function closeModal() {
    modal.style.display = "none";
}

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

//------------ Change username confirm modal end ------------

// ------------ Image preview ------------
window.previewImage = previewImage;

function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const img = document.getElementById('profile_settings_photo_id');
        img.src = reader.result;
    };

    if (file) {
        reader.readAsDataURL(file);
        document.getElementById('profile_settings_upload_img_btn_id').style.display = 'inline-block';
    }
}

// ------------ Image upload ------------
window.uploadImage = uploadImage;

function uploadImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const jwt = localStorage.getItem('jwtToken');
        if (!jwt) {
            alert("Please, login again")
            window.location.href = './login.html';
            return;
        }
        const lang = document.getElementById("current-lang").textContent;

        fetch(AppConfig.API + '/attach/upload', {
            method: 'POST',
            headers: {
                'Accept-Language': lang,
                'Authorization': 'Bearer ' + jwt
            },
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            })
            .then(data => {
                    if (data.id) {
                        updateProfileImage(data.id)

                        const userDetailsJson = localStorage.getItem("userDetails");
                        if (userDetailsJson) {
                            const userDetailsObj = JSON.parse(userDetailsJson);
                            // photo obyektini update qilamiz
                            userDetailsObj.photo = {
                                id: data.id,
                                url: data.url
                            };
                            // yangilangan objectni saqlaymiz
                            localStorage.setItem("userDetails", JSON.stringify(userDetailsObj));
                        }

                        // DOMdagi rasmni ham update qilamiz (header va profile page)
                        document.getElementById('header_photo_id').src = data.url;
                        document.getElementById('profile_settings_photo_id').src = data.url;
                    } else {
                        alert("Attach photo not found")
                    }
                }
            )
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

window.updateProfileImage = updateProfileImage;

function updateProfileImage(photoId) {
    const photoMessage = document.getElementById("truePhotoMessageSpan")
    if (!photoId) {
        return;
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
        return;
    }

    const body = {
        "photoId": photoId,
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + '/profile/update/photo', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': lang,
            'Authorization': 'Bearer ' + jwt
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
                document.getElementById('profile_settings_upload_img_btn_id').style.display = 'none';
                photoMessage.textContent = data.message;
                photoMessage.style.display = "inline-block";

                setTimeout(() => {
                    photoMessage.style.display = "none";
                }, 3000)

                const userDetailsJson = localStorage.getItem("userDetails");
                if (userDetailsJson) {
                    const userDetailsObj = JSON.parse(userDetailsJson);
                    // photo obyektini update qilamiz
                    userDetailsObj.photo = {
                        id: photoId,
                        url: `${AppConfig.API}/attach/open/${photoId}`,
                    };
                    // yangilangan objectni saqlaymiz
                    localStorage.setItem("userDetails", JSON.stringify(userDetailsObj));
                }
            }
        )
        .catch(error => {
            console.error('Error:', error);
            alert("Error occurred");
        });
}