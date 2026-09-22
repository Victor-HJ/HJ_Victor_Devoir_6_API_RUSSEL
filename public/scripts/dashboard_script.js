/**
 * @fileoverview Front-end logic for dashboard page. <br>
 * @module dashboard-script
 * @requires window.fetch
 */

/** Queries the API to fetch all reservations via the controller's function getAll. <br>
 * Displays all active reservation by building a table (or a message if no reservation is active). <br>
 * Forces logout if session has expired.
 * 
 * @async
 * @function fetchGetAllReservations
 */

const fetchGetAllReservations = async () => {

    const tableBody = document.getElementById('current-reservations-table-body');
    const noReservations = document.getElementById('no-current-reservations');
    const table = document.getElementById('current-reservations');

    try {

        const response = await fetch('/reservations');

        const contentType = response.headers.get('content-type');

        if(contentType && contentType.includes('text/html')) {

            window.location.href = "/";
            return ;

        }

        const data = await response.json();

        /* Resets to ensure everything is clean when the function starts */
        tableBody.textContent = '';
        noReservations.textContent = '';

        if(response.status === 200) {

            data.forEach(reservation => {
                
                const row = document.createElement('tr');

                const numberCell = document.createElement('td');
                const clientCell = document.createElement('td');
                const boatCell = document.createElement('td');
                const startCell = document.createElement('td');
                const endCell = document.createElement('td');

                const formattedStartDate = new Date(reservation.startDate).toLocaleDateString('fr-FR');
                const formattedEndDate = new Date(reservation.endDate).toLocaleDateString('fr-FR');

                numberCell.textContent = reservation.catwayNumber;
                clientCell.textContent = reservation.clientName;
                boatCell.textContent = reservation.boatName;
                startCell.textContent = formattedStartDate;
                endCell.textContent = formattedEndDate;

                row.appendChild(numberCell);
                row.appendChild(clientCell);
                row.appendChild(boatCell);
                row.appendChild(startCell);
                row.appendChild(endCell);

                tableBody.appendChild(row);
            });

        } else if (response.status === 404) {

            table.style.display = 'none';

            sendMessage('Aucune réservation en cours')

        } else {

            table.style.display = 'none';

            sendMessage(data);
        }

    } catch (error) {

        messageFromCatch(error)

    }
}

window.addEventListener('DOMContentLoaded', () => {

    fetchGetAllReservations();

});