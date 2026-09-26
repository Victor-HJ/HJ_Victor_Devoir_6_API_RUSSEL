/**
 * @fileoverview Front-end script to manage the catway_view page. Handles async request via fetch, dynamic section toggling
 * and DOM manipulation
 * @module catways_script
 * @requires window.fetch
 * @requires controllers/catways
 * @requires utils
 * @requires controllers/authentication
 */

/**
 * The number of the currently searched and saved catway in memory. null by default.
 * Acts as a global reference variable for update (PUT) and delete (DELETE) requests
 * @type {number|null}
 */

let searchedCatwayNumber = null;

/**
 * Sub-function to append a row to a table body.
 * 
 * @param {Object} item - One catway Object
 * @param {HTMLElement} targetTableBody - The tbody element to be completed
 */

const displayCatwayData = async (item, targetTableBody) => {

    if(!targetTableBody) {
        return;
    }

    const row = document.createElement('tr');

    const numberCell = document.createElement('td');
    const typeCell = document.createElement('td');
    const stateCell = document.createElement('td');

    numberCell.textContent = item.catwayNumber;
    typeCell.textContent = item.catwayType;
    stateCell.textContent = item.catwayState;

    row.appendChild(numberCell);
    row.appendChild(typeCell);
    row.appendChild(stateCell);

    targetTableBody.appendChild(row);
}


/**
 * Queries the API to fetch the function to get ALL catways (controller). <br>
 * 
 * @async
 * @function fetchGetAllCatways
 * @returns {Promise} Either a table with received data or an error message. 
 */

const fetchGetAllCatways = async () => {

    try {

        const response = await fetch('/catways');

        /* Checks for security token */
        checkIfExpired(response);

        const data = await response.json();

        const allCatways = document.getElementById('get-catways-table-body');

        /* Avoids multiple displays of the same list */
        allCatways.textContent = '';

        selectSection('get-catways-section');

        if(response.status === 200) {

            document.getElementById('get-all-catways-title').style.display = 'block';
            document.getElementById('get-one-catway-title').style.display = 'none';
            document.getElementById('update-catway-div').style.display = 'none';

            /* Creates a row for every existing catway and appends every catway's props to a cell */
            data.forEach(catway => {

                displayCatwayData(catway, allCatways);

            });

        } else {

           sendMessage(data);

        }
                
    } catch (error) {

        messageFromCatch(error);

    }
};

/**
 * Queries the API to fetch the function to get one catway (controller). <br>
 * 
 * @async
 * @function fetchOneCatway
 * @returns {Promise} Either a table with data from one catway or an error message.
 */

const fetchOneCatway = async () => {

    const inputElement = document.querySelector('#number');
    const catwayId = inputElement.value;

    try {

        const response = await fetch (`/catways/${catwayId}`);

        /* Checks token */
        checkIfExpired(response);
        
        const data = await response.json();

        const oneCatway = document.getElementById('get-catways-table-body');

        /* Resets table to prevent the display of several catways at once */
        oneCatway.textContent = '';

        selectSection('get-catways-section')

        if(response.status === 200) {

            document.getElementById('get-one-catway-title').style.display = 'block';
            document.getElementById('get-all-catways-title').style.display = 'none';

            selectSubDiv('update-catway-div');

            /* Uses the global variable to automatically fetch the catway number researched and saves it for the next opeation*/
            searchedCatwayNumber = data.catwayNumber;

            displayCatwayData(data, oneCatway);

        } else {

            sendMessage(data);

        }

    } catch (error) {

        messageFromCatch(error);

    }
};

/**
 * Queries the API to fetch the function allowing the update (PUT) of a catway state after this specific catway has been searched for.
 * 
 * @async
 * @function updateOneCatway
 * @returns {Promise} Either a table with new data or an error message. 
 */

const updateOneCatway = async () => {

    /* Security (if the global variable value wasn't saved for any reason whatsoever) */
    if(!searchedCatwayNumber) {
        return;
    }

    const stateInput = document.querySelector('#update-catway-form input[type="textarea"]');
    const newStateValue = stateInput.value.trim();

    /* Is necessary because the controller checks if every required data is sent with the request, otherwise it triggers an error */
    const typeCell = document.querySelector('#get-catways-table-body tr td:nth-child(2)');
    const currentType = typeCell.textContent.trim();

    try {

        const response = await fetch(`/catways/${searchedCatwayNumber}`, {

            method : 'PUT',
            headers: {
                'Content-type' : 'application/json'
            },

            body: JSON.stringify({
                catwayNumber : parseInt(searchedCatwayNumber),
                catwayType : currentType,
                catwayState : newStateValue
            })
        });

        /* Checks token*/
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 201) {

            const stateCell = document.querySelector('#get-catways-table-body tr td:nth-child(3)');

            /* Modifies the cell without having to send a new get request */
            if(stateCell) {

                stateCell.textContent = data.catwayState;
                        
            }

            sendMessage('Catway modifié avec succès');

        } else {

            sendMessage(data);

        }

        const resetForm = document.querySelector('#update-catway-form');
        resetForm.reset();

    } catch (error) {

        messageFromCatch(error);
    }
}

/**
 * Queries the API to fetch the delete function from the controller. <br>
 * Can only be accessed after a search by number has been performed. <br>
 * Asks for confirmation as an alert. <br>
 * 
 * @async
 * @function deleteOneCatway
 * @returns {Promise} Either a success / error message. 
 */

const deleteOneCatway = async () => {

    if(!searchedCatwayNumber) {
        return;
    }

    const confirmation = confirm('Etes-vous sûr de vouloir supprimer ce catway');

    if(!confirmation) {
        return;
    }

    try {

        const response = await fetch(`/catways/${searchedCatwayNumber}`, {

            method : 'DELETE'

        });

        /* Checks token */
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            sendMessage(data);

        } else {

            sendMessage(data);

        }

    } catch (error) {

        messageFromCatch(error);

    }
}

/**
 * Queries the API to fetch the create function from the controller (POST). <br>
 * Forces logout if session has expired.
 * 
 * @async
 * @function createOneCatway
 * @returns {Promise} Either a table with new data or an error message. 
 */

const createOneCatway = async () => {

    const desiredNumber = document.querySelector('#create-number');
    const givenNumber = desiredNumber.value.trim();

    const desiredType = document.querySelector('#create-type');
    const givenType = desiredType.value;

    const desiredState = document.querySelector('#create-state');
    const givenState = desiredState.value.trim();

    try {

        const response = await fetch('/catways', {

            method : 'POST',
            headers : {
                'Content-type' : 'application/json'
            },

            body : JSON.stringify({
                catwayNumber : givenNumber,
                catwayType : givenType,
                catwayState : givenState
            })
        });

        /* Checks token */
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 201) {

            /* Saves the number (if an update is sent right after the creation) */
            searchedCatwayNumber = data.catwayNumber;

            const tableBody = document.getElementById('get-catways-table-body');

            displayCatwayData(data, tableBody);

            /* Displays wanted section */
            selectSection('get-catways-section');

            /* Displays the update section (if an update is wanted right away) */
            selectSubDiv('update-catway-div');

            sendMessage('Catway créé avec succès');

        } else {

            sendMessage(data);
        }

        /* Resets the create form */
        const resetForm = document.querySelector('#create-one-catway-form');
        resetForm.reset();

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


/* Get allCatways section */
const displayAll = document.querySelector('#get-all-catways-button');

displayAll.addEventListener('click', (e) => {

        e.preventDefault();

        fetchGetAllCatways();
       
});


/* Get research form for one catway */
const getOne = document.querySelector('#get-one-catway-button');

    getOne.addEventListener('click', (e) => {

    e.preventDefault();

    const researchForm = document.getElementById('get-one-catway-form');

    researchForm.style.display = 'block';

    const message = document.getElementById('response-message');

    message.textContent = '';

});


/* Get creation form */
const displayCreationForm = document.querySelector('#create-one-catway-button');

displayCreationForm.addEventListener('click', (e) => {

    e.preventDefault();

    selectSection('create-one-catway-section');

});


/* get getOne (included in the createOne function) */
const createOne = document.querySelector('#create-one-catway-form');

createOne.addEventListener('submit', (e) => {

    e.preventDefault();

    createOneCatway();
});


/* get one catway section */
const displayOne = document.querySelector('#get-one-catway-form');

displayOne.addEventListener('submit', (e) => {

    e.preventDefault();

    const message = document.getElementById('response-message');

    message.textContent = '';

    fetchOneCatway();
});


/* get one catway section once a catway has been updated */
const displayUpdated = document.querySelector('#update-catway-form');

displayUpdated.addEventListener('submit', (e) => {

    e.preventDefault();

    selectSection('get-catways-section');

    updateOneCatway();
});


/* get all catways section once a catway has been deleted */
const displayAfterDeletion = document.querySelector('#delete-catway-button');

displayAfterDeletion.addEventListener('click', (e) => {

    e.preventDefault();

    deleteOneCatway();

});

/* Prevents default redirection : the cookie must be deleted first */
const logoutLink = document.querySelector('#logout');

logoutLink.addEventListener('click', async (e) => {

    e.preventDefault();

    fetchLogout();

});

