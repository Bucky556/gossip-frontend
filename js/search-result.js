import AppConfig from "./AppConfig.js";

let currentPage = 1;
let query = null;

window.addEventListener("DOMContentLoaded", function () {
    const url = new URL(window.location.href); // www.test.com?id=dasdasd
    const urlQuery = url.searchParams.get("query");
    if (urlQuery) {
        query = urlQuery;
        getPostList();
    }
});

function getPostList() {
    const lang = document.getElementById("current-lang").textContent;
    let size = 3;
    const body = {
        "query": query
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
                showPostList(data.content); // remove [0]
                showPagination(data.totalElements, size)
                document.getElementById("searchQueryId").textContent = "'" + query + "'" + " qidirildi";
                document.getElementById("searchQueryNumId").textContent = data.totalElements + " topildi";
                document.getElementById("header-search-inputId").value = query;
            } else {
                document.getElementById("paginationWrapperId").style.display = "none";
            }

        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function showPostList(postList) {
    const parent = document.getElementById("post-search-result-containerId")
    parent.innerHTML = '';
    if (postList.length === 0) {
        return;
    }
    postList.forEach(post => {
        const mainDiv = document.createElement("div");
        mainDiv.classList.add("post_box");
        const aHref = document.createElement("a");
        aHref.href = "./post-detail.html?id=" + post.id;
        const imgDiv = document.createElement("div");
        imgDiv.classList.add("post_img__box");
        const img = document.createElement("img");
        if (post.photo && post.photo.url) {
            img.src = post.photo.url;
        }
        img.classList.add("post_img");
        imgDiv.appendChild(img);
        const title = document.createElement("h3")
        title.classList.add("post_title")
        title.textContent = post.title;
        const date = document.createElement("p");
        date.classList.add("post_text");
        date.textContent = formatDate(post.createdDate)

        aHref.appendChild(imgDiv);
        aHref.appendChild(title);
        aHref.appendChild(date);

        mainDiv.appendChild(aHref);

        parent.appendChild(mainDiv);
    })
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