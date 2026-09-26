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

savedClientName = null;

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
 */

const fetchGetAllReservations = async () => {

    try {

        const response = await fetch('/reservations');

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            selectSection('get-reservation-section');

            document.getElementById('response-message').textContent = '';

            const reservationTableBody = document.getElementById('get-reservation-table-body');

            if(reservationTableBody){
                reservationTableBody.textContent = '';
            }

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
 * 
 */

const fetchGetAllReservationsFromCatway = async () => {

    searchResult = document.querySelector('#get-all-for-catway');

    /* Specifying used radix + security if searchedResult is not here */
    searchedCatway = searchResult ? parseInt(searchResult.value, 10) : null;

    if(!searchedCatway) {
        sendMessage('Veuillez renseigner un numéro de catway');
        return;
    }

    try {

        document.querySelector('#catway-get-all-form').style.display = 'none';

        const response = await fetch(`/catways/${searchedCatway}/reservations`);

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            selectSection('get-reservation-section');

            document.getElementById('response-message').textContent = '';

            const reservationTableBody = document.getElementById('get-reservation-table-body');

            if(reservationTableBody){
                reservationTableBody.textContent = '';
            }

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
 * 
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

        checkIfExpired(response);

        const data = await response.json();

        if(response.status === 200) {

            savedClientName = data.clientName;
            savedBoatName = data.boatName;

            selectSection('get-reservation-section');

            selectSubDiv('update-reservation-div');

            document.getElementById('response-message').textContent = '';

            const reservationTableBody = document.getElementById('get-reservation-table-body');

            if(reservationTableBody){
                reservationTableBody.textContent = '';
            }

            displayReservationData(data, reservationTableBody);

        } else {

            sendMessage(data);

        }

    } catch(error) {
        
        messageFromCatch(error);

    }
};

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

const fetchDeleteOneReservation = async () => {

    if(!searchedReservation){
        return;
    }

    const confirmation = confirm('Etes vous-sûr de vouloir supprimer cette réservation ? ');

    if(!confirmation){
        return;
    }

    try {

        const response = await fetch(`/catways/${searchedCatway}/reservations/${searchedReservation}`, {

            method : 'DELETE'

        });

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

document.querySelector('#get-one-reservation-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchGetOneReservation();
}); 

document.querySelector('#update-reservation-form').addEventListener('submit', (e) => {

    e.preventDefault();

    fetchUpdateReservation();
});

document.querySelector('#create-one-reservation-button').addEventListener('click', (e) => {

    e.preventDefault();

    document.getElementById('response-message').textContent = '';

    document.querySelector('#create-one-reservation-form').reset();

    selectSection('create-reservation-section');
});

document.querySelector('#create-one-reservation-form').addEventListener('submit', (e) => {

    e.preventDefault();

    selectSubDiv('update-reservation-div');

    fetchCreateReservation();

});

document.querySelector('#delete-reservation-button').addEventListener('click', (e) => {
    
    e.preventDefault();

    fetchDeleteOneReservation();

});

/* Allows the cookie deletion */
document.querySelector('#logout').addEventListener('click', (e) => {

    e.preventDefault();

    fetchLogout();
});