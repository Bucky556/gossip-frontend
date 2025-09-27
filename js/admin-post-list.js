import AppConfig from "./AppConfig.js";

window.addEventListener("DOMContentLoaded", function () {
    getPostList();

    const postInput = document.getElementById("admin_post_list_post_input_id");
    const profileInput = document.getElementById("admin_post_list_profile_input_id");

    [postInput, profileInput].forEach((element) => {
        element.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                currentPage = 1;
                getPostList();
            }
        })
    })
});
let currentPage = 1;
let pageSize = 10;

window.getPostList = getPostList;
function getPostList(isSearch = false) {
    const postQuery = document.getElementById("admin_post_list_post_input_id").value.trim();
    const profileQuery = document.getElementById("admin_post_list_profile_input_id").value.trim();

    if (isSearch && !postQuery && !profileQuery) {
        return;
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
        return;
    }

    const body = {
        "postQuery": postQuery,
        "profileQuery": profileQuery
    }

    fetch(AppConfig.API + "/post/admin/filter/posts?page=" + currentPage + "&size=" + pageSize, {
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
            showAdminPostList(data.content);
            showPagination(data.totalElements, pageSize);
        } catch (error) {
            console.log(error);
        }
    }).catch(error => {
        console.error('Error:', error);
        return null;
    })
}

function showAdminPostList(postList) {
    const parent = document.getElementById("admin_post_list_table_id");
    parent.innerHTML = '';
    postList.forEach((postItem, postCount) => {
        const tr = document.createElement("tr");
        tr.classList.add("tr");
        const id = document.createElement("td");
        id.classList.add("td", "text-center");
        id.innerHTML = (currentPage - 1) * pageSize + postCount + 1;
        const imageTd = document.createElement("td");
        imageTd.classList.add("td");
        const image = document.createElement("img");
        image.classList.add("table_photo");
        if (postItem.photo && postItem.photo.id) {
            image.src = postItem.photo.url;
        } else {
            image.src = "./images/default_image.png";
        }
        imageTd.appendChild(image);
        const title = document.createElement("td");
        title.classList.add("td");
        title.textContent = postItem.title;
        const createdDate = document.createElement("td");
        createdDate.classList.add("td");
        createdDate.textContent = formatDate(postItem.createdDate)
        const profile = document.createElement("td");
        profile.classList.add("td");
        profile.innerHTML = postItem.profile.name + "<br>" + postItem.profile.username;
        const deleteTd = document.createElement("td");
        deleteTd.classList.add("td", "d-flex");
        const infoImage = document.createElement("img");
        infoImage.classList.add("table_basket", "hover-pointer");
        infoImage.src = "./images/info.png";
        infoImage.onclick = function () {
            window.open("./post-detail.html?id=" + postItem.id, "_blank"); // yangi window-dan ochiladi
        }
        const deleteBtn = document.createElement("img");
        deleteBtn.classList.add("table_basket", "hover-pointer");
        deleteBtn.src = "./images/delete-ioc.png";
        deleteBtn.onclick = function () {
            deletePost(postItem.id);
        }
        deleteTd.appendChild(infoImage);
        deleteTd.appendChild(deleteBtn);

        tr.appendChild(id)
        tr.appendChild(imageTd);
        tr.appendChild(title);
        tr.appendChild(createdDate);
        tr.appendChild(profile);
        tr.appendChild(deleteTd);

        parent.appendChild(tr);
    })
}

window.deletePost = deletePost;
function deletePost(profileId) {
    if (!confirm("Are you sure you want to delete this post?")) {
        return;
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login first");
        window.location.href = "./login.html";
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + "/post/delete/" + profileId, {
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
        getPostList();
    }).catch(error => {
        console.error('Error:', error);
        return null;
    })
}

function showPagination(totalElements, size) {
    let totalPageCount = Math.ceil(totalElements / size);

    const paginationWrapper = document.getElementById("paginationWrapperId");
    paginationWrapper.innerHTML = '';

    // previous button
    const prevDiv = document.createElement("div");
    prevDiv.classList.add("pagination_btn__box");

    const prevButton = document.createElement("button");
    prevButton.classList.add("pagination_btn", "pagination-back");
    prevButton.textContent = "Oldingi";
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            getPostList();
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
            getPostList();
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
                getPostList();
            }
        }
    }

    btnWrapper.appendChild(btn);
    pageNumberWrapper.appendChild(btnWrapper);
}
