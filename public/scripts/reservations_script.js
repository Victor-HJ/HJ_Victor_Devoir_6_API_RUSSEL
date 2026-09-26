/**
 * @fileoverview Front-end script to manage the reservations_view page. Handles async requests via fetch and DOM manipulation.
 * 
 * @module reservations_script
 * @requires window.fetch
 * @requires utils
 */

/**
 * The ID of the currently searched and saved reservation, null by default. <br>
 * Acts as a global reference variable for PUT and DELETE requests.
 * @type {string || null}
 */
let searchedReservation = null;

/**
 * The number of the currently searched and saved catway, null by default. <br>
 * Acts as a global reference variable, used to display every reservations made for one catway in the future.
 * @type {number || null}
 */
let searchedCatway = null;

/** The saved client name global variable. Will be included in payloads further down the code to prevent 400 responses.
 * @type {string || null}
  */
savedClientName = null;

/** The saved boat name global variable. Will be included in payloads further down the code to prevent 400 responses.
 * @type {string || null}
  */
savedBoatName = null;

/**
 * Sub-function to append a row to a table body.
 * 
 * @param {Object} item - One reservation object
 * @param {HTMLElement} targetTableBody - The tbody element to be completed 
 */

const displayReservationData = (item, targetTableBody) => {

    if(!targetTableBody){
        return;
    }

    const row = document.createElement('tr');

    const idCell = document.createElement('td');
    const catwayCell = document.createElement('td');
    const clientCell = document.createElement('td');
    const boatCell = document.createElement('td');
    const startCell = document.createElement('td');
    const endCell = document.createElement('td');

    const formattedStartDate = new Date(item.startDate).toLocaleDateString('fr-FR');
    const formattedEndDate = new Date(item.endDate).toLocaleDateString('fr-FR');

    idCell.textContent = item._id;
    catwayCell.textContent = item.catwayNumber;
    clientCell.textContent = item.clientName;
    boatCell.textContent = item.boatName;
    startCell.textContent = formattedStartDate;
    endCell.textContent = formattedEndDate;

    row.appendChild(idCell);
    row.appendChild(catwayCell);
    row.appendChild(clientCell);
    row.appendChild(boatCell);
    row.appendChild(startCell);
    row.appendChild(endCell);

    targetTableBody.appendChild(row);
};

/**
 * Fetches all existing reservations. <br>
 * Renders either a table with received data or an error message. 
 * 
 * @async
 * @function fetchGetAllReservations
 * @requires utils
 */

const fetchGetAllReservations = async () => {

    try {

        const response = await fetch('/reservations');

        /* Checks if security token is still there */
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            /* Displays the wanted section */
            selectSection('get-reservation-section');

            document.getElementById('response-message').textContent = '';

            const reservationTableBody = document.getElementById('get-reservation-table-body');

            if(reservationTableBody){
                reservationTableBody.textContent = '';
            }

            /* Uses a display function to avoid redundancies in the code */
            data.forEach(reservation => {
                displayReservationData(reservation, reservationTableBody);
            });

        } else {

            sendMessage(data)

        }

    } catch (error) {

        messageFromCatch(error);

    }
};

/**
 * Fetches all existing reservations on one specific catway. <br>
 * Renders either a table with received data or an error message. 
 * 
 * @async
 * @function fetchGetAllReservationsFromCatway
 * @requires utils
 */

const fetchGetAllReservationsFromCatway = async () => {

    searchResult = document.querySelector('#get-all-for-catway');

    /* Specifying used radix + security if searchResult is not here */
    searchedCatway = searchResult ? parseInt(searchResult.value, 10) : null;

    if(!searchedCatway) {
        sendMessage('Veuillez renseigner un numéro de catway');
        return;
    }

    try {

        document.querySelector('#catway-get-all-form').style.display = 'none';

        const response = await fetch(`/catways/${searchedCatway}/reservations`);

        /* Checks if security token is still here */
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            /* Displays the wanted section */
            selectSection('get-reservation-section');

            document.getElementById('response-message').textContent = '';

            const reservationTableBody = document.getElementById('get-reservation-table-body');

            if(reservationTableBody){
                reservationTableBody.textContent = '';
            }

            /* Uses a display function to avoid redundancies in the code */
            data.forEach(reservation => {
                displayReservationData(reservation, reservationTableBody);
            });

        } else {

            sendMessage(data);

        }

    } catch (error) {

        messageFromCatch(error);

    }
};

/**
 * Fetches one specific reservation made on a specific catway. <br>
 * Renders either a table with received data or an error message. 
 * 
 * @async
 * @function fetchGetOneReservation
 * @requires utils
 */

const fetchGetOneReservation = async () => {

    /* select radix (numerical base 10)*/
    const searchResult = document.querySelector('#associatedCatway');
    searchedCatway = searchResult ? parseInt(searchResult.value, 10) : null;

    const searchedId = document.querySelector('#id');
    searchedReservation = searchedId ? searchedId.value : null;

    if(!searchedCatway) {
        sendMessage('Veuillez renseigner un numéro de catway');
        return;
    }

    if(!searchedReservation) {
        sendMessage("Veuillez renseigner l'identifiant de la réservation");
        return;
    }

    try {

        document.querySelector('#get-one-reservation-form').style.display = 'none';

        const response = await fetch(`/catways/${searchedCatway}/reservations/${searchedReservation}`);

        /* Checks if security token is still here */
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            savedClientName = data.clientName;
            savedBoatName = data.boatName;

            /* Displays wanted section */
            selectSection('get-reservation-section');

            /* Add displays of wanted div, which was not rendered properly during testing */
            selectSubDiv('update-reservation-div');

            document.getElementById('response-message').textContent = '';

            const reservationTableBody = document.getElementById('get-reservation-table-body');

            if(reservationTableBody){
                reservationTableBody.textContent = '';
            }

            /* Uses general DOM manipulation function for a more compact code */
            displayReservationData(data, reservationTableBody);

        } else {

            sendMessage(data);

        }

    } catch(error) {
        
        messageFromCatch(error);

    }
};

/** Queries the API to fetch the Update function from the reservations controller. <br>
 * Renders data as a table or an error message. <br>
 * Performs front end verification to ensure sent data is coherent. <br>
 * Requires the displayReservationData function and utils function (expired section or messages).
 * 
 * @async
 * @function fetchUpdateReservation
 * @requires utils
 */

const fetchUpdateReservation = async () => {

    if(!searchedCatway){
        return;
    }

    if(!searchedReservation){
        return;
    }

    const startInput = document.querySelector('#new-start-date');
    const endInput = document.querySelector('#new-end-date');

    newStart = startInput ? startInput.value : '';
    newEnd = endInput ? endInput.value : '';

    if(new Date (newStart) > new Date(newEnd)){
        sendMessage('La date de fin ne peut être antérieure à la date de début');
        return;
    }

/* Payload must include every subdata (because I created models using the required attribute) 
    even if they are not being modified */

    const payload = {
        catwayNumber : parseInt(searchedCatway),
        clientName : savedClientName,
        boatName : savedBoatName,
        startDate : newStart,
        endDate : newEnd
    }

    try {

        const response = await fetch(`/catways/${searchedCatway}/reservations/${searchedReservation}`, {
            method : 'PUT',
            headers : {'Content-type' : 'application/json'},
            body : JSON.stringify(payload)
        });

        checkIfExpired(response);

        const data = await response.json();

        document.querySelector('#update-reservation-form').reset();

        if(response.status === 201){

            sendMessage('Réservation modifiée avec succès');

            const startCell = document.querySelector('#get-reservation-table-body tr td:nth-child(5)');
            const endCell = document.querySelector('#get-reservation-table-body tr td:nth-child(6)');

            if(startCell && endCell) {

                startCell.textContent = new Date(newStart).toLocaleDateString('fr-FR');
                endCell.textContent = new Date(newEnd).toLocaleDateString('fr-FR');

            }

        } else {

            sendMessage(data);

        }

    } catch (error) {

        messageFromCatch(error);

    }
};

/**Queries the API to fetch the Create function from the reservations controller. <br>
 * Renders data as a table or an error message. <br>
 * Performs front end verifications to ensure sent data is coherent. <br>
 * Requires the displayReservationData function and utils function (expired section or messages). 
 * 
 * @async
 * @function fetchCreateReservation
 * @requires utils
 */

const fetchCreateReservation = async () => {

    const catwayNumber = document.querySelector('#catway-number').value.trim();
    const clientName = document.querySelector('#client-name').value.trim();
    const boatName = document.querySelector('#boat-name').value.trim();
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;

    const catwayId = parseInt(catwayNumber, 10);

    if(!catwayNumber || !clientName || !boatName || !startDate || !endDate){

        sendMessage('Un ou plusieurs champs sont manquants');
        return;
    }

    if(boatName.length < 3) {

        sendMessage('Le nom du bateau ne peut faire moins de 3 caractères');
        return;
    }

    if(clientName.length < 3) {

        sendMessage('Le nom du client ne peut faire moins de 3 caractères');
        return;
    }

    if(isNaN(catwayNumber)) {

        sendMessage("Erreur : le numéro de catway renseigné n'est pas un nombre");
        return;
    }

    if(new Date(startDate) > new Date(endDate)) {

        sendMessage('La date de fin ne peut être antérieure à la date de début');
        return;
    }

    /* Payload must include every subdata (because I created models using the required attribute) 
    even if they are not being modified */
    const payload = {

        catwayNumber : catwayId,
        clientName : clientName,
        boatName : boatName,
        startDate : startDate,
        endDate : endDate

    };

    try {

        const response = await fetch(`/catways/${catwayId}/reservations`, {

            method : 'POST',
            headers : {'Content-type' : 'application/json'},
            body : JSON.stringify(payload)

        });

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 201) {

            searchedReservation = data._id;
            searchedCatway = data.catwayNumber;

            selectSection('get-reservation-section');

            const tableReservationBody = document.getElementById('get-reservation-table-body');

            if(tableReservationBody) {
                tableReservationBody.textContent = '';
            }

            sendMessage('Réservation créée avec succès');

            displayReservationData(data, tableReservationBody);

        } else {

            sendMessage(data);

        }

    } catch(error) {

        messageFromCatch(error);

    }
};

/** Queries the API to fetch the Delete function from the reservations controller. <br>
 * Displays a message (either a success or an error) upon completion. 
 * 
 * @async
 * @function fetchDeleteOneReservation
 * @requires utils
 */

const fetchDeleteOneReservation = async () => {

    if(!searchedReservation){
        return;
    }

    const confirmation = confirm('Etes vous-sûr de vouloir supprimer cette réservation ? ');

    if(!confirmation){
        return;
    }

    try {
        /* No need the redeclare searchedCatway and searchedReservation as they are already declared in the get function,
        which is mandatory to perform any delete operation anyway. */
        const response = await fetch(`/catways/${searchedCatway}/reservations/${searchedReservation}`, {

            method : 'DELETE'

        });

        /* Checks for token */
        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            sendMessage('Réservation supprimée');

            const hide = document.getElementById('get-reservation-section');

            hide.style.display = 'none';

        } else {

            sendMessage(data);

        }

    } catch (error) {

        messageFromCatch(error);

    }
}; 

/** Queries the API to fetch the logout function from the authentication controller. <br>
 * Ensures session cookie is destroyed before redirection is performed. 
 * 
 * @async
 * @function fetchLogout
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

/* Triggers the get all function */
document.querySelector('#get-all-reservations-button').addEventListener('click', (e) => {

    e.preventDefault();

    fetchGetAllReservations();
});

/* Displays form to research all reservations made on one catway */
document.querySelector('#get-all-reservations-for-one-catway-button').addEventListener('click', (e) => {

    e.preventDefault();

    document.getElementById('response-message').textContent = '';

    document.querySelector('#catway-get-all-form').reset()

    selectSection('catway-get-all-form');
});

/* Triggers the get all for one catway function */
document.querySelector('#catway-get-all-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchGetAllReservationsFromCatway();

});

/* Displays form to get one specific reservation */
document.querySelector('#get-one-reservation-button').addEventListener('click', (e) => {

    e.preventDefault();

    document.getElementById('response-message').textContent = '';

    document.querySelector('#get-one-reservation-form').reset();

    selectSection('get-one-reservation-form');

});

/* Triggers the get one function */
document.querySelector('#get-one-reservation-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchGetOneReservation();
}); 

/* Triggers the update function */
document.querySelector('#update-reservation-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchUpdateReservation();
});

/* Displays the creation form */
document.querySelector('#create-one-reservation-button').addEventListener('click', (e) => {

    e.preventDefault();

    document.getElementById('response-message').textContent = '';

    document.querySelector('#create-one-reservation-form').reset();

    selectSection('create-reservation-section');
});

/* Triggers the creation function */
document.querySelector('#create-one-reservation-form').addEventListener('submit', (e) => {

    e.preventDefault();

    selectSubDiv('update-reservation-div');

    fetchCreateReservation();

});

/* Triggers the deletion function */
document.querySelector('#delete-reservation-button').addEventListener('click', (e) => {
    
    e.preventDefault();

    fetchDeleteOneReservation();

});

/* Allows the cookie deletion */
document.querySelector('#logout').addEventListener('click', (e) => {

    e.preventDefault();

    fetchLogout();
});