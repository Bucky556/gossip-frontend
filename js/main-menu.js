import AppConfig from "./AppConfig.js";

window.addEventListener("DOMContentLoaded", function () {
    getMainPostList();
});

let currentPage = 1;

function getMainPostList() {
    const lang = document.getElementById("current-lang").textContent;
    let size = 10;

    const body = {
        "query": null
    }

    fetch(AppConfig.API + '/post/filter?page=' + currentPage + '&size=' + size, {
        method: 'POST',
        headers: {
            'Accept-Language': lang,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response)
            }
        })
        .then(data => {
            if (data.content && data.content.length > 0) {
                showMainPost(data.content.shift()) // remove post[0] and put to main
                showPostsList(data.content); // remove [0]
                showPagination(data.totalElements, size)
            }

        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function showMainPost(contentElement) {
    const mainImage = document.getElementById("main-card-imageId")
    if (contentElement.photo && contentElement.photo.url) {
        mainImage.src = contentElement.photo.url;
    } else {
        mainImage.src = "./images/default_image.png";
    }

    document.getElementById("main-card-dateId").textContent = formatDate(contentElement.createdDate);
    document.getElementById("main-card-titleId").textContent = contentElement.title;

    const batafsilBtn = document.getElementById("main-card-detailBtnId");
    batafsilBtn.onclick = () => {
        const jwt = localStorage.getItem("jwtToken");
        if (!jwt) {
            alert("Please login first to see post");
            window.location.href = "./login.html";
            return false;
        } else {
            document.getElementById("main-card-detailBtnId").href = "./post-detail.html?id=" + contentElement.id;
        }
    }

}

function showPostsList(content) {
    const parent = document.getElementById("post_container_id")
    parent.innerHTML = '';
    content.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("post_box");

        const a = document.createElement("a");
        a.href = "./post-detail.html?id=" + post.id;

        const imageDiv = document.createElement("div");
        imageDiv.classList.add("post_img__box");

        const img = document.createElement("img");
        if (post.photo.url && post.photo) {
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

        // add elements to a
        a.appendChild(imageDiv);
        a.appendChild(title);
        a.appendChild(createdDate);
        // add <a> to mani div
        div.appendChild(a);
        // add div elements to parent
        parent.appendChild(div);
    })
}

function showPagination(totalElements, size) {
    let totalPageCount = Math.ceil(totalElements / size);

    const paginationWrapper = document.getElementById("paginationWrapperId");
    paginationWrapper.innerHTML = '';

    if (totalPageCount <= 1) {  // Agar bitta sahifa bo‘lsa, pagination ko‘rsatma
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
            getMainPostList();
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
            getMainPostList();
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
                getMainPostList();
            }
        }
    }

    btnWrapper.appendChild(btn);
    pageNumberWrapper.appendChild(btnWrapper);
}