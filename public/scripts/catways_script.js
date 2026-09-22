/**
 * @fileoverview Front-end script to manage the catway_view page. Handles async request via fetch, dynamic section toggling
 * and DOM manipulation
 * @module catways_script
 * @requires window.fetch
 */

/**
 * The number of the currently searched and saved catway in memory. null by default.
 * Acts as a global reference variable for update (PUT) and delete (DELETE) requests
 * @type {number|null}
 */

let searchedCatwayNumber = null;


/**
 * Queries the API to fetch the function to get ALL catways (controller). <br>
 * Manipulates DOM to render as a table the data received. <br>
 * Redirects user to root path if the security token has expired. 
 * 
 * @async
 * @function fetchGetAllCatways
 */

const fetchGetAllCatways = async () => {

    try {

        const response = await fetch('/catways');

        checkIfExpired(response);

        const data = await response.json();

        const allCatways = document.getElementById('get-all-catways-table-body');

        allCatways.textContent = '';

        selectSection('get-all-catways-section');

        if(response.status === 200) {

            /* Creates a row for every existing catway and appends every catway's props to a cell */

            data.forEach(catway => {

                const row = document.createElement('tr');

                    const numberCell = document.createElement('td');
                    const typeCell = document.createElement('td');
                    const stateCell = document.createElement('td');

                    numberCell.textContent = catway.catwayNumber;
                    typeCell.textContent = catway.catwayType;
                    stateCell.textContent = catway.catwayState;

                    row.appendChild(numberCell);
                    row.appendChild(typeCell);
                    row.appendChild(stateCell);

                    allCatways.appendChild(row);
                });

        } else {

            /* Creates one row to display the error as a table cell */

            const errorRow = document.createElement('tr');
            const errorCell = document.createElement('td');

            errorCell.colSpan = 3;
            errorCell.textContent = data;
                    
            errorRow.appendChild(errorCell);
            allCatways.appendChild(errorRow);

        }
                
    } catch (error) {

        messageFromCatch(error);

    }
};

/**
 * Queries the API to fetch the function to get one catway (controller). <br>
 * Manipulates DOM to render the received data as a table. <br>
 * Forces logout if the security token has expired.
 * 
 * @async
 * @function fetchOneCatway
 */
const fetchOneCatway = async () => {

    const inputElement = document.querySelector('#number');
    const catwayId = inputElement.value;

    try {

        const response = await fetch (`/catways/${catwayId}`);

        checkIfExpired(response);
        
        const data = await response.json();

        const oneCatway = document.getElementById('get-one-catway-table-body');

        /* Resets table to prevent the display of several catways at once */

        oneCatway.textContent = '';

        selectSection('get-one-catway-section')

        if(response.status === 200) {

            /* Uses the global variable to automatically fetch the catway number researched and saves it for the next opeation*/
            searchedCatwayNumber = data.catwayNumber;

            /* Creates a table row to display the researched catway and appends every info to a cell */

            const row = document.createElement('tr');

            const numberCell = document.createElement('td');
            const typeCell = document.createElement('td');
            const stateCell = document.createElement('td');

            numberCell.textContent = data.catwayNumber;
            typeCell.textContent = data.catwayType;
            stateCell.textContent = data.catwayState;

            row.appendChild(numberCell);
            row.appendChild(typeCell);
            row.appendChild(stateCell);

            oneCatway.appendChild(row);

        } else {

            /* Resets the global variable */
            searchedCatwayNumber = null;

            /* Still displaying an error as a table cell */
            const errorRow = document.createElement('tr');
            const errorCell = document.createElement('td');
            errorCell.colSpan = 3;

            errorRow.appendChild(errorCell);
            oneCatway.appendChild(errorRow);

            errorCell.textContent = data;

        }
            
        /* Resets the research form */
        const resetForm = document.querySelector('#get-one-catway-form');
        resetForm.reset();

    } catch (error) {

        searchedCatwayNumber = null;

        messageFromCatch(error);

    }
};

/**
 * Queries the API to fetch the function allowing the update (PUT) of a catway state after this specific catway has been searched for. <br>
 * Manpiuluates DOM to display updated data as a table. <br>
 * Forces logout if security token has expired.
 * 
 * @async
 * @function updateOneCatway
 */

const updateOneCatway = async () => {

    /* Security (if the global variable value wasn't saved for any reason whatsoever) */
    if(!searchedCatwayNumber) {

        return;

    }

    const stateInput = document.querySelector('#update-catway-form input[type="textarea"]');
    const newStateValue = stateInput.value.trim();

    /* Is necessary because the controller checks if every required data is sent with the request, otherwise it triggers an error */
    const typeCell = document.querySelector('#get-one-catway-table-body tr td:nth-child(2)');
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

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 201) {

            const stateCell = document.querySelector('#get-one-catway-table-body tr td:nth-child(3)');

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
 * Manipulates DOM to render all the remaining catways after the deletion of a specific one. <br>
 * Forces logout if session has expired.
 * 
 * @async
 * @function deleteOneCatway
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
 * Manipulates DOM to render the new data as a table. <br>
 * Forces logout if session has expired.
 * 
 * @async
 * @function createOneCatway
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

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 201) {

            searchedCatwayNumber = data.catwayNumber;

            const tableBody = document.getElementById('get-one-catway-table-body');

            /* Displaying a row allows to avoid another request (getOne) */
            if(tableBody){

                tableBody.textContent = '';

                const row = document.createElement('tr');
                const numberCell = document.createElement('td');
                const typeCell = document.createElement('td');
                const stateCell = document.createElement('td');

                numberCell.textContent = data.catwayNumber;
                typeCell.textContent = data.catwayType;
                stateCell.textContent = data.catwayState;

                row.appendChild(numberCell);
                row.appendChild(typeCell);
                row.appendChild(stateCell);

                tableBody.appendChild(row);

            }

            selectSection('get-one-catway-section');

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
const createOne = document.querySelector('#submit-new-catway');

createOne.addEventListener('click', (e) => {

    e.preventDefault();

    createOneCatway();
});


/* get one catway section */
const displayOne = document.querySelector('#submit-number');

displayOne.addEventListener('click', (e) => {

    e.preventDefault();

    const message = document.getElementById('response-message');

    message.textcontent = '';

    fetchOneCatway();
});


/* get one catway section once a catway has been updated */
const displayUpdated = document.querySelector('#update-catway-confirm');

displayUpdated.addEventListener('click', (e) => {

    e.preventDefault();

    selectSection('get-one-catway-section');

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

