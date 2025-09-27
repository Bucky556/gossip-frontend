import AppConfig from "./AppConfig.js";

let currentPost = null;

window.createPost = createPost;
async function createPost() {

    const fileInput = document.getElementById('post_image_id');
    const file = fileInput.files[0];
    const titleValue = document.getElementById("post_title_id").value;
    const contentValue = document.getElementById("post_content_id").value;

    if (!file || !titleValue || !contentValue) {
        alert("Enter all inputs")
        return;
    }

    // image upload, biz wait qilamiz bulmasa method paralel birdaniga ishlap ketadi
    const imageId = await uploadImage();

    const body = {
        "title": titleValue,
        "content": contentValue,
        "photo": {
            "id": imageId
        }
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
        return;
    }
    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + '/post/create', {
        method: 'POST',
        headers: {
            'Accept-Language': lang,
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json',
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
            showPopup(data.message);

            // pop-up message vaqti bilan bir xil timeout buladi va vaqti tugagandan keyin keyingi page ga redirect qilinadi.
            setTimeout(() => {
                window.location.href = './profile-post-list.html';
            }, 3500);
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });

}

// ------------ Image preview ------------
window.previewImage = previewImage;
function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const imgContainer = document.getElementById('post_image_block');
        imgContainer.style.backgroundImage = 'url(' + reader.result + ')';
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}

// ------------ Image upload ------------
async function uploadImage() {
    const fileInput = document.getElementById('post_image_id');
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

        return fetch(AppConfig.API + '/attach/upload', {
            method: 'POST',
            headers: {
                'Accept-Language': lang,
                'Authorization': 'Bearer ' + jwt
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.id) {
                    return data.id;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                return null;
            });
    }
}

window.addEventListener("DOMContentLoaded", function () {
    var url_string = window.location.href; // www.test.com?id=dasdasd
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    if (id) {
        getPostById(id);
        document.getElementById("post_create_btn_group").classList.add("display-none");
        document.getElementById("post_update_btn_group").classList.remove("display-none");
        document.getElementById("post_page_title_id").textContent = 'G\'iybatni o\'zgartirsh';
    }
});

function getPostById(postId) {
    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + '/post/get/by-id/' + postId, {
        method: 'GET',
        headers: {
            'Accept-Language': lang,
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
            currentPost = data;

            if (data.photo && data.photo.id) {
                const imgContainer = document.getElementById("post_image_block");
                imgContainer.style.backgroundImage = 'url(' + data.photo.url + ')';
            }
            const title = document.getElementById("post_title_id");
            const content = document.getElementById("post_content_id");
            title.value = data.title;
            content.value = data.content;
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}

window.updatePost = updatePost;
async function updatePost() {
    if (currentPost == null) {
        return;
    }

    const fileInput = document.getElementById('post_image_id');
    const file = fileInput.files[0];

    let imageId = null;
    if (file) {
        imageId = await uploadImage();
    } else {
        imageId = currentPost.photo.id;
    }

    const titleValue = document.getElementById("post_title_id").value;
    const contentValue = document.getElementById("post_content_id").value;

    if (!imageId || !titleValue || !contentValue) {
        alert("Enter all inputs")
        return;
    }

    const body = {
        "title": titleValue,
        "content": contentValue,
        "photo": {
            "id": imageId
        }
    }

    const jwt = localStorage.getItem('jwtToken');
    if (!jwt) {
        alert("Please, login again")
        window.location.href = './login.html';
        return;
    }
    const lang = document.getElementById("current-lang").textContent;

    fetch(AppConfig.API + '/post/update/' + currentPost.id, {
        method: 'PUT',
        headers: {
            'Accept-Language': lang,
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
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
            showPopup(data.message);
            window.location.href = './profile-post-list.html';
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}