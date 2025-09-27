window.addEventListener("DOMContentLoaded", function () {
    const userDetailJson = localStorage.getItem("userDetails");
    if (!userDetailJson) {
        return;
    }

    const loginBtn = document.getElementById("header_btn_login");
    loginBtn.style.display = "none";

    const userDetailObj = JSON.parse(userDetailJson);

    document.getElementById("header_user_name_id").textContent = userDetailObj.name;
    document.getElementById("profile_settings_name").textContent = userDetailObj.name;
    document.getElementById("profile_settings_username").textContent = userDetailObj.username;

    if(userDetailObj.photo && userDetailObj.photo.url){
        document.getElementById("profile_settings_photo_id").src = userDetailObj.photo.url;
    } else {
        document.getElementById("profile_settings_photo_id").src = "/photo.png";
    }
});

window.goToProfileDetailEditPage = goToProfileDetailEditPage;
function goToProfileDetailEditPage(){
    window.location.href = "./profile-settings-edit.html";
}
