/**
* @fileoverview List of functions that will be massively used in almost every fronte-end page.
* @module utils
 */

/**
 * Function designed to check if the security token has expired by analyzing the content of the response sent by the server response header. <br>
 * If the response content is HTML, the redirection to the index page is triggered.  
 * 
 * @function checkIfExpired
 * @param {response} response The response object received from the server.
 * @returns {boolean} Returns true if the token has expired and triggers a redirection to the index page. 
 */

const checkIfExpired = (response) => {

    const contentType = response.headers.get('Content-type');

    if(contentType && contentType.includes('text/html')) {

        window.location.href = "/";

        return true;
    }

    return false;
};


/** Function meant to manipulate DOM and display only the wanted CRUD section. 
 * 
 * @function selectSection
 * @param {HTMLElement} targetSection -The id of the wanted section. 
 * @returns {HTMLElement} Display the wanted section and hides the others. 
 */
const selectSection = (targetSection) => {

    const message = document.getElementById('response-message');

    if(message){

        message.textContent = '';

    }

    document.querySelectorAll('.CRUD-sections').forEach(section => {

        section.style.display = 'none';

    });

    const target = document.getElementById(targetSection);

    if(target) {

        target.style.display = 'block'

    }
};


/**
 * Function created to manipulate DOM in order to manage the rendering of some subdivs. <br>
 * Is only used for users_script (update password and username divs) but is kept here for readability purposes. 
 * 
 * @function selectSubDiv
 * @param {HTMLElement} targetDiv -The id of the wanted div. 
 * @returns {HTMLElement} Displays the wanted div and hides the others. 
 */
const selectSubDiv = (targetDiv) => {

    const message = document.getElementById('response-message');

    if(message) {

        message.textContent = '';

    }

    document.querySelectorAll('.update-or-delete-divs').forEach(div => {

        div.style.display = 'none';

    })

    const target = document.getElementById(targetDiv)

    if(target) {

        target.style.display = 'block'

    }
};


/**
 * Function to manipulate DOM by sending a message to the user. <br>
 * The content of the message is either declared in the backend controller (when attached to a specific response status) or in the frontend script. 
 * 
 * @function sendMessage
 * @param {Object} data 
 * @returns {HTMLElement} Displays a message in a specific div after an action has been taken. 
 */
const sendMessage = (data) => {

    const message = document.getElementById('response-message');

    if(message) {

        message.textContent = '';

        const messageText = document.createElement('p');
        messageText.textContent = data;

        message.appendChild(messageText);

    }


};

/**
 * Function is meant to give a more user-friendly message when a 500 response occurs. 
 * 
 * @function messageFromCatch
 * @param {Object} error 
 * @returns {HTMLElement} Displays a message created by the backend controller to explain the error that occured. 
 */
const messageFromCatch = (error) => {

    const message = document.getElementById('response-message');

    if(message) {

        message.textContent = '';

        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message || error;

        message.appendChild(errorMessage);

    }
};

