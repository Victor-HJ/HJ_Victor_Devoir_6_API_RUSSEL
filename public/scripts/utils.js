const checkIfExpired = (response) => {

    const contentType = response.headers.get('Content-type');

    if(contentType && contentType.includes('text/html')) {

        window.location.href = "/";

        return true;
    }

    return false;
}



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
}



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
}



const sendMessage = (data) => {

    const message = document.getElementById('response-message');

    if(message) {

        message.textContent = '';

        const messageText = document.createElement('p');
        messageText.textContent = data;

        message.appendChild(messageText);

    }


}

const messageFromCatch = (error) => {

    const message = document.getElementById('response-message');

    if(message) {

        message.textContent = '';

        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message || error;

        message.appendChild(errorMessage);

    }
}

