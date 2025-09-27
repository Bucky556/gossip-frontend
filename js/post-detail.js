import AppConfig from "./AppConfig.js";

window.addEventListener("DOMContentLoaded", function () {
    const url = new URL(window.location.href);  // www.com.?id=1321123
    const id = url.searchParams.get("id");
    if (id) {
        getPostById(id);
        getDetailPostList(id);
    }
});

function getPostById(postId) {
    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + '/post/get/by-id/' + postId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': lang
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
            document.getElementById("postDetailDateId").textContent = formatDate(data.createdDate);
            document.getElementById("postDetailTitleId").textContent = data.title;
            const image = document.getElementById("postDetailImgId");
            if (data.photo && data.photo.url) {
                image.src = data.photo.url;
            } else {
                image.src = "./images/default_image.png";
            }
            document.getElementById("postDetailContentId").textContent = data.content;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function getDetailPostList(postId) {
    let currentPage = 1;
    let currentSize = 3;
    const lang = document.getElementById("current-lang").textContent;

    const jwt = localStorage.getItem("jwtToken");
    if (!jwt) {
        alert("Please, login again")
        window.location.href = "./login.html";
        return;
    }

    fetch(AppConfig.API + '/post/list?page=' + currentPage + "&size=" + currentSize, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': lang,
            'Authorization': 'Bearer ' + jwt
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
            // foydalanuvchining boshqa postlari
            let filteredPosts = data.content.filter(post => post.id !== postId);

            if (filteredPosts.length === 0) {
                // Agar boshqa postlar yo‘q bo‘lsa, umumiy oxirgi postlarni olish
                fetch(AppConfig.API + '/post/filter?page=0&size=3', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': lang
                    },
                    body: JSON.stringify({query: null}) // bo‘sh filter = barcha postlar
                })
                    .then(res => res.json())
                    .then(allPostsData => {
                        showPostList(allPostsData.content.filter(post => post.id !== postId));
                    })
                    .catch(err => console.error(err));
            } else {
                showPostList(filteredPosts);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

function showPostList(postList) {
    const parent = document.getElementById("similar-post-container-id")
    parent.innerHTML = '';
    postList.forEach(postItem => {

        const div = document.createElement("div");
        div.classList.add("post_box");
        // button
        const a = document.createElement("a");
        // editButton.classList.add("profile_tab_btn");
        a.href = "./post-detail.html?id=" + postItem.id;
        // image_div
        const imageDiv = document.createElement("div");
        imageDiv.classList.add("post_img__box");
        // image
        const img = document.createElement("img");
        if (postItem.photo && postItem.photo.id) {
            img.src = postItem.photo.url;
        } else {
            img.src = './images/post-default-img.jpg';
        }
        img.classList.add('post_img');
        imageDiv.appendChild(img);

        // title
        const title = document.createElement("h3");
        title.classList.add("post_title");
        title.textContent = postItem.title

        // created_date
        const createdDate = document.createElement("p");
        createdDate.classList.add("post_text");
        createdDate.textContent = formatDate(postItem.createdDate);

        // add elements to a
        a.appendChild(imageDiv)
        a.appendChild(title);
        a.appendChild(createdDate);
        // add elements to main div
        div.appendChild(a);
        //
        parent.appendChild(div);
    });
}