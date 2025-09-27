import AppConfig from "./AppConfig.js";

window.addEventListener("DOMContentLoaded", function () {
    getProfileList();
});
let currentPage = 1;
let pageSize = 10;

function getProfileList() {
    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login first");
        window.location.href = "./login.html";
    }

    const body = {
        "query": null
    }

    fetch(AppConfig.API + "/profile/filter?page=" + currentPage + "&size=" + pageSize, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then(data => {
        try {
            const currentUser = localStorage.getItem("userDetails");
            const parsedUser = JSON.parse(currentUser);

            const filteredUsers = data.content.filter( profile => profile.username !== parsedUser.username);

            showProfileList(filteredUsers);
            showPagination(data.totalElements, pageSize);
        } catch (error) {
            console.log(error);
        }
    }).catch(error => {
        console.error('Error:', error);
        return null;
    })
}

function showProfileList(profileList) {
    const parent = document.getElementById("profile_list_container_id");
    parent.innerHTML = '';
    profileList.forEach((profileItem, idCount) => {
        const tr = document.createElement("tr");
        tr.classList.add("tr");
        const id = document.createElement("td");
        id.classList.add("td");
        id.innerHTML = (currentPage - 1) * pageSize + idCount + 1; // har bir pagination ga utganda ham id in order chiqadi
        const imageTd = document.createElement("td");
        imageTd.classList.add("td");
        const image = document.createElement("img");
        image.classList.add("table_photo");
        if (profileItem.photo && profileItem.photo.id) {
            image.src = profileItem.photo.url;
        } else {
            image.src = "./images/default-user.png"
        }
        imageTd.appendChild(image);
        const name = document.createElement("td");
        name.classList.add("td");
        name.innerHTML = profileItem.name;
        const username = document.createElement("td");
        username.classList.add("td");
        username.innerHTML = profileItem.username;
        const createdDate = document.createElement("td");
        createdDate.classList.add("td");
        createdDate.textContent = formatDate(profileItem.createdDate)
        const postCount = document.createElement("td");
        postCount.classList.add("td");
        postCount.textContent = profileItem.postCount;
        const role = document.createElement("td");
        role.classList.add("td");
        role.innerHTML = profileItem.roles.join("<br>");
        const statusTd = document.createElement("td");
        statusTd.classList.add("td");
        const status = document.createElement("button");
        status.classList.add("table_btn");
        if (profileItem.status === "ACTIVE") {
            status.classList.add("table_btn_active");
            status.innerHTML = "ACTIVE";
            status.onclick = function () {
                changeStatus(profileItem.id, "BLOCKED");
            }
        } else if (profileItem.status === "BLOCKED") {
            status.classList.add("table_btn_block");
            status.innerHTML = "BLOCKED";
            status.onclick = function () {
                changeStatus(profileItem.id, "ACTIVE");
            }
        } else if (profileItem.status === "IN_REGISTRATION") {
            status.classList.add("table_btn_in_registration");
            status.innerHTML = "IN_REGISTRATION";
        }

        statusTd.appendChild(status);
        const deleteTd = document.createElement("td");
        deleteTd.classList.add("td");
        const deleteImg = document.createElement("img");
        deleteImg.classList.add("table_basket", "hover-pointer");
        deleteImg.src = "./images/delete-ioc.png";
        deleteImg.onclick = function () {
            deleteProfile(profileItem.id);
        }
        deleteTd.appendChild(deleteImg);

        tr.appendChild(id);
        tr.appendChild(imageTd);
        tr.appendChild(name);
        tr.appendChild(username);
        tr.appendChild(createdDate);
        tr.appendChild(postCount);
        tr.appendChild(role);
        tr.appendChild(statusTd);
        tr.appendChild(deleteTd);

        parent.appendChild(tr);

    })
}

function showPagination(totalElements, size) {
    let totalPageCount = Math.ceil(totalElements / size);

    const paginationWrapper = document.getElementById("paginationWrapperId");
    paginationWrapper.innerHTML = '';

    if (totalPageCount <= 1) {  // bitta page ga sig'sa kursatmemiz
        return;
    }

    // previous button
    const prevDiv = document.createElement("div");
    prevDiv.classList.add("pagination_btn__box");

    const prevButton = document.createElement("button");
    prevButton.classList.add("pagination_btn", "pagination-back");
    prevButton.textContent = "Oldingi";
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            getProfileList();
        }
    }
    prevDiv.appendChild(prevButton);
    paginationWrapper.appendChild(prevDiv);

    // page numbers
    const pageNumberWrapper = document.createElement("div");
    pageNumberWrapper.classList.add("pagination_block");

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPageCount, currentPage + 2);

    if (startPage > 1) { // show first page
        addBtn(1, pageNumberWrapper, false, false)
        if (startPage > 2) { // add ...
            addBtn("...", pageNumberWrapper, false, true)
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        addBtn(i, pageNumberWrapper, i === currentPage)
    }

    if (endPage < totalPageCount) { // show last page
        if (endPage < totalPageCount - 1) { // add ...
            addBtn("...", pageNumberWrapper, false, true)  // boya true edi
        }
        addBtn(totalPageCount, pageNumberWrapper, false, false)
    }


    paginationWrapper.appendChild(pageNumberWrapper);

    // next button
    const nextDiv = document.createElement("div");
    nextDiv.classList.add("pagination_btn__box");
    const nextButton = document.createElement("button");
    nextButton.classList.add("pagination_btn", "pagination-forward");
    nextButton.textContent = "Keyingi";
    nextButton.onclick = () => {
        if (currentPage < totalPageCount) {
            currentPage++;
            getProfileList();
        }
    }

    nextDiv.appendChild(nextButton);
    paginationWrapper.appendChild(nextDiv);
}

function addBtn(btnText, pageNumberWrapper, isSelected, isDots) {
    const btnWrapper = document.createElement("div");
    btnWrapper.classList.add("pagination_btn__box");
    const btn = document.createElement("button");
    btn.textContent = btnText;
    if (isDots) {
        btn.classList.add("pagination_btn_dots");
    } else {
        if (isSelected) {
            btn.classList.add("pagination_active");
        } else {
            btn.classList.add("pagination_btn");

            btn.onclick = () => {
                currentPage = btnText;
                getProfileList();
            }
        }
    }

    btnWrapper.appendChild(btn);
    pageNumberWrapper.appendChild(btnWrapper);
}

window.changeStatus = changeStatus;
function changeStatus(profileId, status) {
    if (!confirm("Are you sure you want to change status?")) {
        return;
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login first");
        window.location.href = "./login.html";
    }

    const lang = document.getElementById("current-lang").textContent;

    const body = {
        "status": status
    }

    fetch(AppConfig.API + "/profile/status/" + profileId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt,
            "Accept-Language": lang,
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then(data => {
        showPopup(data.message);
        getProfileList();
    }).catch(error => {
        console.error('Error:', error);
        return null;
    })
}

window.deleteProfile = deleteProfile;
function deleteProfile(profileId) {
    if (!confirm("Are you sure you want to delete this profile?")) {
        return;
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login first");
        window.location.href = "./login.html";
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/profile/delete/" + profileId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt,
            "Accept-Language": lang,
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }).then(data => {
        showPopup(data.message);
        getProfileList();
    }).catch(error => {
        console.error('Error:', error);
        return null;
    })
}