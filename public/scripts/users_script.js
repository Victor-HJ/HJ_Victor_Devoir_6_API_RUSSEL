/**
 * @fileoverview front-end logic to fetch every user-related function from the users controller and to manipulate DOM in order
 * to display received data or to send data.
 * @module users_script
 * @requires window.fetch
 * @requires controllers/users
 * @requires controllers/authentication
 * @requires utils
 */

/** The email of the currently searched and saved user in memory (null by default). <br>
 * Acts as a global reference variable for update (PUT) and delete (DELETE) operations.
 * @type {string | null} 
 */

let searchedUserEmail = null;

/**
 * The username of the currently searched and saved user in memory (null by default). <br>
 * Acts as a global reference variable for updating the password.
 */
let searchedUsername = null;

/**
 * Manipulates DOM to render data as a table row
 * @param {Object} item - One user object
 * @param {HTMLElement} targetTableBody - The tbody needing to be updated
 */

const displayUserData = (item, targetTableBody) => {

    if(!targetTableBody){
        return;
    }

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const mailCell = document.createElement('td');

    nameCell.textContent = item.username;
    mailCell.textContent = item.email;

    row.appendChild(nameCell);
    row.appendChild(mailCell);

    targetTableBody.appendChild(row);
}


/** QUeries the API to fetch the getAll function from the controller; <br>
 * 
 * @async
 * @function fetchGetAllUsers
 * @returns {Promise} Either a table with every user data (except password) or an error message.
 */

const fetchGetAllUsers = async () => {

    try {

        const response = await fetch('/users');

        checkIfExpired(response);

        const data = await response.json();

        const allUsers = document.getElementById('get-users-table-body');
        allUsers.textContent = '';

        selectSection('get-users-section');

        document.getElementById('update-user-div').style.display = 'none';

        if(response.status === 200){

            document.getElementById('get-all-users-title').style.display = 'block';
            document.getElementById('get-one-user-title').style.display = 'none';

            data.forEach(user => {
                displayUserData(user, allUsers)
            });

        } else {

            sendMessage(data);
        }

    } catch (error) {

        messageFromCatch(error);
    }
};

/** Queries the API to fetch the getOne function from the users controller. <br>
 * 
 * @async
 * @function fetchGetOneUser
 * @returns {Promise} Either a table with received data or an error message. 
 */

const fetchGetOneUser = async () => {

    const emailInput = document.querySelector('#email');
    const userId = emailInput.value.trim();

    if(!userId.trim()) {

        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Veuillez renseigner un email'

        message.appendChild(errorMessage);

    }

    try {

        const response = await fetch(`/users/${userId}`);

        checkIfExpired(response);

        const data = await response.json();

        const oneUser = document.getElementById('get-users-table-body');
        const message = document.getElementById('response-message');
        message.textContent = '';
        oneUser.textContent = '';

        if(response.status === 200) {

            selectSection('get-users-section');

            document.getElementById('update-user-div').style.display = 'block';
            document.getElementById('get-all-users-title').style.display = 'none';
            document.getElementById('get-one-user-title').style.display = 'block';

            /* Saves user email for future operations */
            searchedUserEmail = data.email;
            /* Username will be used in the body of future put requests */
            searchedUsername = data.username;

            displayUserData(data, oneUser);

        } else {

            sendMessage(data);

        }

    } catch (error) {

        messageFromCatch(error);

    }
};

/** Queries the API to fetch the updateOne function from the users controller. <br>
 * Function for password is spearated from function for username (for simplicity purposes), even though the request is handled by the same controller. <br>
 * Function performs front-end validity checks. 
 * 
 * @async 
 * @function fetchUpdatePassword
 * @returns {Promise} Either a success or error message. 
 */

const fetchUpdatePassword = async () => {

    if(!searchedUserEmail){

        return;

    }

    const userId = searchedUserEmail.trim();

    const newPassword = document.querySelector('#new-password').value.trim();
    const confirmPassword = document.querySelector('#new-password-confirm').value.trim();
    const oldPassword = document.querySelector('#old-password').value.trim();

    const message = document.getElementById('response-message');
    message.textContent = '';

    if(newPassword.length < 8) {

        sendMessage('Le mot de passe ne peut faire moins de 8 caractères');

        document.querySelector('#update-password-form').reset();
    }

    if(newPassword !== confirmPassword){

        sendMessage("Erreur : le mot de passe confirmé est différent de l'original");

        document.querySelector('#update-password-form').reset();
    }

   const payload = {

    username : searchedUsername,
    email : searchedUserEmail,
    currentPassword : oldPassword,
    password : newPassword

   };

   try {

    const response = await fetch(`/users/${userId}`, {
        method : 'PUT',
        headers : { 'Content-type' : 'application/json'},
        body : JSON.stringify(payload)
    });

    checkIfExpired(response);

    const data = await response.json();

    if(response.status === 200){

        sendMessage('Mot de passe modifié avec succès');

    } else {

        sendMessage(data);

    }

   } catch (error) {

        messageFromCatch(error);

   }
};

/** Queries the API to fetch the updateOne function from the users controller. <br>
 * Function performs front-end validity checks (length, etc).
 * 
 * @async
 * @function fetchUpdateUsername
 * @returns {Promise} An updated table with the new username
 */
const fetchUpdateUsername = async () => {

    if(!searchedUserEmail) {
        return;
    }

    const userId = searchedUserEmail.trim();

    const newUsername = document.querySelector('#new-username').value.trim();
    const currentPassword = document.querySelector('#current-password').value.trim();

    document.getElementById('response-message').textContent = '';

    if(!newUsername) {
        sendMessage("Un nouveau nom d'utilisateur doit être renseigné");
        return;
    }

    if(newUsername.length < 3) {
        sendMessage("Le nom d'utilisateur ne peut être inférieur à 3 caractères");
        document.querySelector('#update-username-form').reset();
        return;
    }

    if(newUsername.length > 20) {
        sendMessage("Le nom d'utilisateur ne peut excéder 20 caractères");
        document.querySelector('#update-username-form').reset();
        return;
    }

    const payload = {
        username : newUsername,
        email : searchedUserEmail,
        currentPassword : currentPassword
    };

    try {

        const response = await fetch(`/users/${userId}`, {
            method : 'PUT',
            headers : {'Content-type' : 'application/json'},
            body : JSON.stringify(payload)
        });

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            sendMessage("Nom d'utilisateur modifié avec succès");

            /* Avoids sending another get request, may as well perform a front-end update */
            const newCell = document.querySelector('#get-users-table-body tr td:nth-child(1)');

            if(newCell){

                newCell.textContent = data.username;

            }

            document.querySelector('#update-username-form').reset();

        } else {

            sendMessage(data);

        }

    } catch(error) {

        messageFromCatch(error);

    }
};

/** Queries the API to fetch the createOne function from the controller. <br>
 * Performs front-end validity checks regarding length, etc. <br>
 * 
 * @async
 * @function fetchCreateOneUser
 * @returns {Promise} A table with the new user data.
 */
const fetchCreateOneUser = async () => {

    const username = document.querySelector('#wanted-username').value.trim();
    const email = document.querySelector('#wanted-email').value.trim();
    const password = document.querySelector('#wanted-password').value.trim();
    const passwordConfirm = document.querySelector('#wanted-password-confirm').value.trim();

    if(!username || !email || password) {
        sendMessage('Un ou plusieurs champs sont manquants');
    }

    if(password !== passwordConfirm) {
        sendMessage('Confirmation du mot de passe incorrecte');
    }

    if(username.length < 3 || username.length > 20){
        sendMessage("Le nom d'utilisateur doit faire entre 3 et 20 caractères");
    }

    if(password.length < 8){
        sendMessage("Le mot de passe doit faire au moins 8 caractères");
    }

    try {

        const response = await fetch (`/users`, {
            method : 'POST',
            headers : {'Content-type' : 'application/json'},
            body : JSON.stringify ({
                username : username,
                email : email,
                password : password
            })
        });

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 201) {

            searchedUserEmail = data.email;

            const tableBody = document.getElementById('get-users-table-body');

            /* Prevents multiple users from being displayed if previous actions have been taken */
            tableBody.textContent = '';

            if(tableBody) {

                displayUserData(data, tableBody);

                selectSection('get-users-section');

                document.getElementById('update-user-div').style.display = 'block';

                sendMessage('Utilisateur créé avec succès');

            } 

        } else {

            sendMessage(data);
        }

    } catch (error) {
        
        messageFromCatch(error);

        }

    document.querySelector('#create-user-form').reset();

};

/** Queries the API to fetch the deleteOne function from the controller.
 * 
 * @async
 * @function fetchDeleteOneUser
 * @returns {Promise} Either a success or error message. 
 */

const fetchDeleteOneUser = async () => {

    /* Security if no user email has been saved for any reason */

    if(!searchedUserEmail) {
        return;
    }

    const confirmation = confirm('Etes-vous sûr de vouloir supprimer cet utilisateur ?');

    if(!confirmation) {
        return;
    }

    try {
        const response = await fetch(`/users/${searchedUserEmail}`, {
            method : 'DELETE'
        });

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200){

            sendMessage('Utilisateur supprimé');

            const hide = document.getElementById('get-users-section');

            hide.style.display = 'none';

        } else {

            sendMessage(data);
        }
    } catch (error) {

        messageFromCatch(error);

    }
};


/**
 * Queries the API to use the logout function from the controller.
 * 
 * @async
 * @function fetchLogout
 * 
 */

const fetchLogout = async () => {

    try {

        const response = await fetch('/authentication/logout', {

            credentials : 'include'
        });

        window.location.href = "/";

    } catch (error) {

        console.log(error);

    }
};

/* Displays all users */
const displayAll = document.querySelector('#get-all-users-button');
displayAll.addEventListener('click', (e) => {

    e.preventDefault();

    fetchGetAllUsers();

});

/* Displays the form to look for one user */
const searchOne = document.querySelector('#get-one-user-button');
searchOne.addEventListener('click', (e) => {

    e.preventDefault();

    selectSection('get-one-user-form');

})

/* Displays the looked up user */
const displayOne = document.querySelector('#get-one-user-form');
displayOne.addEventListener('submit', (e) => {

    e.preventDefault();

    fetchGetOneUser();
})

/* Displays the div allowing to update password */
document.querySelector('#update-password').addEventListener('click', (e) => {

    e.preventDefault();

    selectSubDiv('password-update-div');
});

/* Fetch the update password function and displays the result */
document.querySelector('#update-password-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchUpdatePassword();

    document.querySelector('#update-password-form').reset();
});

/* Displays the div allowing to update username */
document.querySelector('#update-username').addEventListener('click', (e) =>{

    e.preventDefault();

    selectSubDiv('username-update-div');
});

/* Fetch the update username function and displays the result */
document.querySelector('#update-username-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchUpdateUsername();

    document.querySelector('#update-username-form').reset();
});

/* Displays the create user section */
document.querySelector('#create-one-user-button').addEventListener('click', (e) => {

    e.preventDefault();

    selectSection('create-one-user-section');
});

/* Fetches the creation function and displays the result */
document.querySelector('#create-user-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchCreateOneUser();

    document.querySelector('#create-user-form').reset();
});

/* Triggers the fetchDelete */
document.querySelector('#delete-user').addEventListener('click', (e) => {

    e.preventDefault();

    fetchDeleteOneUser();

    document.querySelector('#get-users-section').style.display = 'none';
});

/* Allows the cookie deletion */
document.querySelector('#logout').addEventListener('click', (e) => {

    e.preventDefault();

    fetchLogout();
});