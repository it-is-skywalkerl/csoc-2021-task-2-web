import axios from 'axios';
function displaySuccessToast(message) {
    iziToast.success({
        title: 'Success',
        message: message
    });
}

function displayErrorToast(message) {
    iziToast.error({
        title: 'Error',
        message: message
    });
}

function displayInfoToast(message) {
    iziToast.info({
        title: 'Info',
        message: message
    });
}

const API_BASE_URL = 'https://todo-app-csoc.herokuapp.com/';

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login/';
}

function registerFieldsAreValid(firstName, lastName, email, username, password) {
    if (firstName === '' || lastName === '' || email === '' || username === '' || password === '') {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        displayErrorToast("Please enter a valid email address.")
        return false;
    }
    return true;
}

function loginFieldsAreValid(username, password) {
    if (username === "" || password === "") {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    return true;
}

function register() {
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (registerFieldsAreValid(firstName, lastName, email, username, password)) {
        displayInfoToast("Please wait...");

        const dataForApiRequest = {
            name: firstName + " " + lastName,
            email: email,
            username: username,
            password: password
        };

        axios({
            url: API_BASE_URL + 'auth/register/',
            method: 'post',
            data: dataForApiRequest,
        }).then(function({data, status}) {
          localStorage.setItem('token', data.token);
          window.location.href = '/';
        }).catch(function(err) {
          displayErrorToast('An account using same email or username is already created');
        })
    }
}

function login() {
    /***
     * @todo Complete this function.
     * @todo 1. Write code for form validation.
     * @todo 2. Fetch the auth token from backend and login the user.
     */
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (loginFieldsAreValid(username, password)) {
        displayInfoToast("Logging in...");
        axios({
            url: API_BASE_URL + "auth/login/",
            method: "post",
            data: { username, password }
        }).then(function ({ data, status }) {
            localStorage.setItem("token", data.token);
            window.location.href = "/";
        }).catch(function (err) {
            displayErrorToast("Username and/or password is incorrect.");
        });
    }
}

function addTask() {
    /**
     * @todo Complete this function.
     * @todo 1. Send the request to add the task to the backend server.
     * @todo 2. Add the task in the dom.
     */
    const taskEntry = document.querySelector(".todo-add-task input").value.trim();

    if (!taskEntry) {
        displayErrorToast("Enter a task to add it")
        return;
    }

    axios({
        headers: {
            Authorization: "Token " + localStorage.getItem("token")
        },
        url: API_BASE_URL + "todo/create/",
        method: "post",
        data: { title: taskEntry }
    })
        .then(function (response) {
            axios({
                headers: {
                    Authorization: "Token " + localStorage.getItem("token")
                },
                url: API_BASE_URL + "todo/",
                method: "get"
            }).then(function ({ data, status }) {
                const newtask = data[data.length - 1];
                const taskNo = newtask.id;
                newEntry(taskEntry, taskNo)
            });
        })
        .catch(function (err) {
            displayErrorToast("An error occurred.");
        });
}

function editTask(id) {
    document.getElementById('task-' + id).classList.add('hideme');
    document.getElementById('task-actions-' + id).classList.add('hideme');
    document.getElementById('input-button-' + id).classList.remove('hideme');
    document.getElementById('done-button-' + id).classList.remove('hideme');
}

function deleteTask(id) {
    /**
     * @todo Complete this function.
     * @todo 1. Send the request to delete the task to the backend server.
     * @todo 2. Remove the task from the dom.
     */
    axios({
        headers: {
            Authorization: "Token " + localStorage.getItem("token")
        },
        url: API_BASE_URL + "todo/" + id + "/",
        method: "delete"
    })
        .then(function ({ data, status }) {
            document.querySelector(`#todo-${id}`).remove();
        })
        .catch(function (err) {
            displayErrorToast("An error occurred.");
        });
}

function updateTask(id) {
    /**
     * @todo Complete this function.
     * @todo 1. Send the request to update the task to the backend server.
     * @todo 2. Update the task in the dom.
     */
     const taskEntry = document.getElementById("input-button-" + id).value;
     if (!taskEntry) {
         return;
     }
     axios({
         headers: {
             Authorization: "Token " + localStorage.getItem("token")
         },
         url: API_BASE_URL + "todo/" + id + "/",
         method: "patch",
         data: { title: taskEntry }
     })
         .then(function ({ data, status }) {
             document.getElementById("task-" + id).classList.remove("hideme");
             document.getElementById("task-actions-" + id).classList.remove("hideme");
             document.getElementById("input-button-" + id).classList.add("hideme");
             document.getElementById("done-button-" + id).classList.add("hideme");
             document.getElementById("task-" + id).innerText = taskEntry;
         })
         .catch(function (err) {
             displayErrorToast("An error occurred.");
         });
}

function newEntry(taskEntry, taskNo) {
    const availableTasks = document.querySelector(".todo-available-tasks");
    const newTaskNode = document.createElement("li");
    newTaskNode.innerHTML = `
    <input id="input-button-${taskNo}" type="text" class="form-control todo-edit-task-input hideme" placeholder="Edit The Task">
    <div id="done-button-${taskNo}" class="input-group-append hideme">
        <button class="btn btn-outline-secondary todo-update-task" type="button" id="update-task-${taskNo}">Done</button>
    </div>

    <div id="task-${taskNo}" class="todo-task">
        ${taskEntry}
    </div>
    <span id="task-actions-${taskNo}">
        <button style="margin-right:5px;" type="button" id="edit-task-${taskNo}"
            class="btn btn-outline-warning">
            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486663/CSOC/edit.png"
                width="18px" height="20px">
        </button>
        <button type="button" class="btn btn-outline-danger" id="delete-task-${taskNo}">
            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486661/CSOC/delete.svg"
                width="18px" height="22px">
        </button>
    </span>`;

    newTaskNode.id = `todo-${taskNo}`;
    newTaskNode.classList.add(
        "list-group-item",
        "d-flex",
        "justify-content-between",
        "align-items-center"
    );
    newTaskNode.id = `todo-${taskNo}`;
    newTaskNode.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    availableTasks.appendChild(newTaskNode);

    document.querySelector(`#edit-task-${taskNo}`).addEventListener("click", () => editTask(taskNo));
    document.querySelector(`#update-task-${taskNo}`).addEventListener("click", () => updateTask(taskNo));
    document.querySelector(`#delete-task-${taskNo}`).addEventListener("click", () => deleteTask(taskNo));
    document.getElementById("input-button-" + taskNo).value = taskEntry;
}

const registerButton = document.querySelector("#register-btn");
if (registerButton) registerButton.onclick = register;
const loginButton = document.querySelector("#login-btn");
if (loginButton) loginButton.onclick = login;

if (localStorage.getItem("token")) {
document.querySelector("#logout-btn").onclick = logout;
document.querySelector("#addtask-btn").onclick = addTask;
}

export {editTask, updateTask, deleteTask, newEntry};
