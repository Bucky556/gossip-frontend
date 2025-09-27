import AppConfig from "./AppConfig.js";

window.addEventListener("DOMContentLoaded", function () {
    getPostList();
});

let currentPage = 1;

function getPostList() {
    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        window.location.href = './login.html';
        return;
    }
    const lang = document.getElementById("current-lang").textContent;
    let size = 6;

    fetch(AppConfig.API + '/post/list?page=' + currentPage + '&size=' + size, {
        method: 'GET',
        headers: {
            'Accept-Language': lang,
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response)
            }
        })
        .then(data => {
            showPostList(data.content);
            showPagination(data.totalElements, size)
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function showPostList(postList) {
    const parent = document.getElementById("profile_post_container_id")
    parent.innerHTML = '';
    postList.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("position-relative", "post_box");

        const a = document.createElement("a");
        a.classList.add("profile_tab_btn");
        a.href = "./post-create.html?id=" + post.id;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete_btn");
        deleteBtn.onclick = () => deletePost(post.id);

        const imageDiv = document.createElement("div");
        imageDiv.classList.add("post_img__box");

        const img = document.createElement("img");
        if (post.photo.id && post.photo) {
            img.src = post.photo.url;
        } else {
            img.src = "./images/post-default-img.png"
        }
        img.classList.add("post_img");
        // imageDiv-ni ichidegi bolasini qushib quydik
        imageDiv.appendChild(img);

        const title = document.createElement("h3");
        title.classList.add("post_title");
        title.textContent = post.title;

        const createdDate = document.createElement("p");
        createdDate.classList.add("post_text");
        createdDate.textContent = formatDate(post.createdDate);

        // add elements to mani div
        div.appendChild(a);
        div.appendChild(deleteBtn);
        div.appendChild(imageDiv);
        div.appendChild(title);
        div.appendChild(createdDate);
        // add div elements to parent
        parent.appendChild(div);
    })
}

window.deletePost = deletePost;
function deletePost(postId) {
    if (!confirm("G'iybatni o'chirmoqchimisiz?")) {
        return;
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
        return;
    }

    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + '/post/delete/' + postId, {
        method: 'DELETE',
        headers: {
            'Accept-Language': lang,
            'Authorization': 'Bearer ' + jwt
        }
    })
        .then(response => {
            if (response.ok) {
                getPostList();
            } else {
                return Promise.reject(response)
            }
        })
        .then(data => {
            window.location.href = './profile-post-list.html';
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function showPagination(totalElements, size) {
    let totalPageCount = Math.ceil(totalElements / size);

    if (totalPageCount === 1) {
        document.getElementById("paginationWrapperId").style.display = "none"; // agar pagination page 1 ga teng bulsa, pagination kurinmaydi
        return;
    }

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
            addBtn("...", pageNumberWrapper, false, false)  // boya true edi
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
