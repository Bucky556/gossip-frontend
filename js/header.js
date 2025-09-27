// til strelkasini bossek tillar ichiladi
window.toggleLanguageDropdown = toggleLanguageDropdown;
function toggleLanguageDropdown() {
    const dropdownContent = document.getElementById("dropdown-content");
    const dropdownToggle = document.querySelector(".dropdown_toggle");

    dropdownContent.classList.toggle("show");
    dropdownToggle.classList.toggle("active");
}

// bosilgan strelka orqali ochilgan tilni tanlab strealka yana yopiladi yani toggleLanguageDropdown() buladi
window.setSelectedLanguage = setSelectedLanguage;
function setSelectedLanguage(lang) {
    document.getElementById("current-lang").textContent = lang;
    localStorage.setItem("current-lang", lang);
    toggleLanguageDropdown(); // Закрыть dropdown после выбора
}

// Close language dropdown when click outside
// agar strelkadan tashqariga click bosilsa strelka yopiladi
window.onclick = function (event) {
    if (!event.target.closest(".dropdown_toggle")) {
        const dropdownContent = document.getElementById("dropdown-content");
        const dropdownToggle = document.querySelector(".dropdown_toggle");

        if (dropdownContent.classList.contains("show")) {
            dropdownContent.classList.remove("show");
            dropdownToggle.classList.remove("active"); // Убираем класс, когда меню закрывается
        }
    }
};

//Siz yuqoridagi foydalanuvchi ismi tugmasini bosasiz → menyu (header_entrance__menu) ochiladi yoki yopiladi.
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".header_entrance__toggle");
    const menu = document.querySelector(".header_entrance__menu");

    toggleButton.addEventListener("click", () => {
        menu.classList.toggle("header_entrance__show");
    });

    // close username-menu on header if it is clicked outside
    document.addEventListener("click", (e) => {
        if (!toggleButton.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove("header_entrance__show");
        }
    });
    // selected lan
    let currentLang = localStorage.getItem("current-lang");
    if (!currentLang) {
        currentLang = "UZ"; // default language
    }

    localStorage.setItem("current-lang", currentLang);
    if (currentLang) {
        document.getElementById("current-lang").textContent = currentLang;
    }
    //Show profile menu on header
    const userDetailStr = localStorage.getItem("userDetails");
    const loginBtn = document.getElementById("header_btn_login");
    const registerBtn = document.getElementById("header_btn_registration");
    const userNameButton = document.getElementById("header_entrance");

    // Hozirgi sahifa login sahifa ekanligini tekshiramiz
    const isLoginPage = window.location.pathname.includes("login.html");

    if (userDetailStr && !isLoginPage) {
        const userDetail = JSON.parse(userDetailStr);
        const name = userDetail.name;

        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (userNameButton) userNameButton.style.display = "block";

        loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        userNameButton.style.display = "block";
        document.getElementById("header_user_name_id").textContent = name;

        const userDetailObj = JSON.parse(userDetailStr); // header username photo
        if (userDetailObj.photo && userDetailObj.photo.url) {
            document.getElementById("header_photo_id").src = userDetailObj.photo.url;
        }
    } else {
        if (loginBtn) loginBtn.style.display = "block";
        if (registerBtn) registerBtn.style.display = "block";
        if (userNameButton) userNameButton.style.display = "none";    }

    // search input
    const searchBtn = document.getElementById("header-search-buttonId");
    if (searchBtn) {
        // when press search button
        searchBtn.addEventListener("click", () => {
            const query = document.getElementById("header-search-inputId").value;
            if (query && query.trim() !== "") { // bosh space qidirmaydi
                window.location.href = "./search-result-page.html?query=" + query.trim();
            }
        })
    }

    const searchEnter = document.getElementById("header-search-inputId");
    if (searchEnter) {
        // when press 'Enter'
        searchEnter.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const query = searchEnter.value;
                if (query && query.trim() !== "") { // bosh space qidirmaydi
                    window.location.href = "./search-result-page.html?query=" + query.trim();
                }
            }
        })
    }
});

window.logout = logout;
function logout() {
    const loginBtn = document.getElementById("header_btn_login");
    if (loginBtn) loginBtn.style.display = "block";
    const userNameButton = document.getElementById("header_entrance");
    if (userNameButton) userNameButton.style.display = "none";

    localStorage.removeItem("userDetails");
    localStorage.removeItem("jwtToken");
    if (localStorage.getItem("username")) {
        localStorage.removeItem("username");
    }
    localStorage.removeItem("current-lang");
    window.location.href = "./main-menu.html";
}

