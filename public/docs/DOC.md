# Documentation de l'API Port de Plaisance Russell

Ceci est la documentation de l'API. Avant tout chose, il convient de noter que toute requête envoyant des données doit inclure:  `Content-Type: application/json`.

---

## Authentification

Ce module gère l'accès sécurisé à l'API via des jetons JWT (Bearer Tokens) ou la déconnexion de celle-ci.

### 1. Connexion à l'API
Permet à un utilisateur de s'authentifier pour obtenir un jeton d'accès. Une authentification réussie déclenche une redirection vers la page tableau de bord (`/dashboard_view.ejs`). 

* **URL :** `/authentication/login`
* **Méthode HTTP :** `POST`
* **Corps de la requête (JSON) :**
  ```json
  {
    "email": "user@example.com",
    "password": "Motdepasse"
  }
  ```
  *(Note : Le mot de passe doit comporter un minimum de 8 caractères).*

* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
    }
    ```
  * **401 Unauthorized (Echec) :**
    ```json
    {
      "status": 401,
      "message": "Informations de connexion incorrectes."
    }
    ```
  * **404 Not Found (Echec) :**
    ```json
    {
      "status": 404,
      "message": "L'utilisateur n'existe pas."
    }
    ```
---

### 2. Déconnexion
Permet à l'utilisateur de se déconnecter en supprimant son token d'authentification. 

* **URL :** `/authentication/logout`
* **Méthode HTTP :** `GET`
* **Fonctionnement :** Le serveur supprime le cookie contenant le jeton (`token`) stocké dans le navigateur et déclenche une redirection vers la page de connexion (`/index_view.ejs`).

**Réponse attendue :**
  * **200 OK (Succès) :**
    ```json
        "Vous vous êtes déconnecté"
    ```

---

## Gestion des Catways

Toutes les routes de ce module nécessitent une authentification (et donc un `token` valide).

### 1. Récupérer tous les catways

Renvoie la liste complète de tous les catways enregistrés, triés par numéro dans un ordre décroissant.

* **URL :** `/catways`
* **Méthode HTTP :** `GET`
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    [
      {
        "_id": "651c3f8f1234567890abcdef",
        "catwayNumber": 42,
        "catwayType": "long",
        "catwayState": "Bon état",
        "__v": 0
      },
      {
        "_id": "651c3f8f1234567890abcde1",
        "catwayNumber": 15,
        "catwayType": "short",
        "catwayState": "En réparation",
        "__v": 0
      }
    ]
    ```
  * **404 Not Found (Aucune donnée) :**
    ```json
    "Aucun catway trouvé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la récupération des catways"
    ```

---

### 2. Récupérer un catway par son numéro
Recherche et renvoie les détails d'un catway spécifique à partir de son numéro.

* **URL :** `/catways/:id`
* **Méthode HTTP :** `GET`
* **Paramètres d'URL :** `id` (Le numéro du catway, ex: `/catways/42`)
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    {
      "_id": "651c3f8f1234567890abcdef",
      "catwayNumber": 42,
      "catwayType": "long",
      "catwayState": "Bon état",
      "__v": 0
    }
    ```
  * **404 Not Found :**
    ```json
    "Aucun catway avec ce numéro trouvé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la récupération de ce catway"
    ```

---

### 3. Créer un catway
Enregistre un nouveau catway dans la base de données.

* **URL :** `/catways`
* **Méthode HTTP :** `POST`
* **Sécurité :** `checkJWT` requis
* **Corps de la requête (JSON) :**
  ```json
  {
    "catwayNumber": 23,
    "catwayType": "short", 
    "catwayState": "Bon état"
  }
  ```
  *(Note : Le champ `catwayType` accepte uniquement les valeurs `"short"` ou `"long"`).*
* **Réponses attendues :**
  * **201 Created (Succès) :** Renvoyé avec l'objet nouvellement créé.
    ```json
    {
      "_id": "651c4a1e1234567890abcdef",
      "catwayNumber": 23,
      "catwayType": "short",
      "catwayState": "Bon état",
      "__v": 0
    }
    ```
  * **400 Bad Request (Champs invalides) :**
    ```json
    "Tous les champs sont requis" // Si un champ manque
    // OU
    "Aucun champ ne peut être vide" // Si une chaîne est vide ou composée d'espaces
    // OU
    "Un catway ne peut être que de type \"long\" ou \"short\""
    ```
  * **409 Conflict (Doublon) :**
    ```json
    "Un catway est déjà associé à ce numéro"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la création du catway"
    ```

---

### 4. Modifier l'état d'un catway
Permet de mettre à jour **uniquement** l'état d'un catway existant. Le numéro et le type ne peuvent pas être modifiés.

* **URL :** `/catways/:id`
* **Méthode HTTP :** `PUT`
* **Paramètres d'URL :** `id` (Le numéro du catway à modifier)
* **Sécurité :** `checkJWT` requis
* **Corps de la requête (JSON) :**
  ```json
  {
    "catwayNumber": 65,
    "catwayType": "short",
    "catwayState": "Bon état"
  }
  ```
  *(Attention : Les valeurs de `catwayNumber` et `catwayType` envoyées dans le body doivent correspondre à celles existant en base pour autoriser la modification).*
* **Réponses attendues :**
  * **201 Created (Succès de la mise à jour) :**
    ```json
    {
      "_id": "651c3f8f1234567890abcdef",
      "catwayNumber": 65,
      "catwayType": "short",
      "catwayState": "Bon état",
      "__v": 0
    }
    ```
  * **400 Bad Request :**
    ```json
    "L'état du catway doit être renseigné et celui-ci ne peut être vide"
    // OU
    "Seul l'état du catway peut être modifié"
    ```
  * **404 Not Found :**
    ```json
    "Catway non trouvé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la modification du catway"
    ```

---

### 5. Supprimer un catway
Supprime définitivement un catway de la base de données.

* **URL :** `/catways/:id`
* **Méthode HTTP :** `DELETE`
* **Paramètres d'URL :** `id` (Le numéro du catway à supprimer)
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    "Le catway a été supprimé"
    ```
  * **404 Not Found :**
    ```json
    "Le catway que vous voulez supprimer n'existe pas"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la suppression du catway"
    ```

---

## Gestion des Utilisateurs

Toutes les routes de ce module nécessitent une authentification via le middleware `checkJWT`.

### 1. Récupérer tous les utilisateurs
Renvoie la liste complète de tous les utilisateurs, triés par ordre alphabétique.

* **URL :** `/users`
* **Méthode HTTP :** `GET`
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    [
      {
        "_id": "651c5b2e1234567890abcdef",
        "username": "Alex",
        "email": "alex@example.com",
        "__v": 0
      },
      {
        "_id": "651c5b2e1234567890abcde1",
        "username": "Marcel Gnouf",
        "email": "marcelbg@example.com",
        "__v": 0
      }
    ]
    ```
  * **404 Not Found (Aucune donnée) :**
    ```json
    "Aucun utilisateur trouvé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur lors de la récupération des utilisateurs"
    ```

---

### 2. Récupérer un utilisateur par email
Recherche et renvoie les informations complètes d'un compte utilisateur grâce à son adresse mail.

* **URL :** `/users/:email`
* **Méthode HTTP :** `GET`
* **Paramètres d'URL :** `email` (L'adresse e-mail de la cible, ex: `/users/bob@example.com`)
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    {
      "_id": "651c5b2e1234567890abcdef",
      "username": "Robin",
      "email": "robin@example.com",
      "__v": 0
    }
    ```
  * **404 Not Found :**
    ```json
    "Aucun utilisateur n'est associé à cet email"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur lors de la récupération de cet utilisateur"
    ```

---

### 3. Créer un utilisateur
Enregistre un nouvel utilisateur après validation des contraintes du modèle.

* **URL :** `/users`
* **Méthode HTTP :** `POST`
* **Sécurité :** `checkJWT` requis
* **Corps de la requête (JSON) :**
  ```json
  {
    "username": "Nouvel utilisateur",
    "email": "membre@example.com",
    "password": "12345678"
  }
  ```
* **Contraintes de validation :**
  * `username` : Doit comporter entre 3 et 20 caractères (les espaces de début et de fin sont nettoyés) et doit être unique.
  * `password` : Doit contenir au moins 8 caractères.
  * `email` : Ne peut pas être vide (les espaces superflus sont nettoyés) et doit être unique. 

* **Réponses attendues :**
  * **201 Created (Succès de la création) :**
    ```json
    {
      "_id": "651c6c3f1234567890abcdef",
      "username": "NouveauMembre",
      "email": "membre@example.com",
      "__v": 0
    }
    ```
    *(Note : l'id unique n'est pas renseigné à la création et est défini automatiquement par mongoose).*
  * **400 Bad Request (Erreur de saisie) :**
    ```json
    "Tous les champs sont requis"
    // OU
    "Le champ email est vide"
    // OU
    "Le nom d'utilisateur doit faire entre 3 et 20 caractères"
    // OU
    "Le mot de passe ne peut pas faire moins de 8 caractères"
    ```
  * **409 Conflict (Doublon en base) :**
    ```json
    "Ce nom d'utilisateur est déjà utilisé"
    // OU
    "Cet email est déjà utilisé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la création de l'utilisateur"
    ```

---

### 4. Modifier un utilisateur
Permet de modifier le nom d'utilisateur ou le mot de passe d'un compte. Requiert la confirmation du mot de passe actuel.

* **URL :** `/users/:email`
* **Méthode HTTP :** `PUT`
* **Paramètres d'URL :** `email` (L'adresse e-mail de l'utilisateur (non modifiable))
* **Sécurité :** `checkJWT` requis
* **Corps de la requête (JSON) :**
  ```json
  {
    "currentPassword": "AncienMDP",
    "username": "Nouveau",
    "password": "NouveauMDP"
  }
  ```
* **Réponses attendues :**
  * **201 Created (Mise à jour réussie) :** Renvoie l'objet utilisateur actualisé.
  * **400 Bad Request :**
    ```json
    "Le nom d'utilisateur doit faire entre 3 et 20 caractères"
    // OU
    "Le mot de passe doit faire au moins 8 caractères"
    // OU
    "Ce nom d'utilisateur est déjà pris"
    ```
  * **401 Unauthorized (Échec d'identité) :**
    ```json
    "Mot de passe incorrect, action refusée"
    ```
  * **404 Not Found :**
    ```json
    "Aucun utilisateur associé à cet email trouvé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la modification de l'utilisateur"
    ```

---

### 5. Supprimer un utilisateur
Efface définitivement un compte utilisateur. Requiert le mot de passe de ce dernier.

* **URL :** `/users/:email`
* **Méthode HTTP :** `DELETE`
* **Paramètres d'URL :** `email` (L'e-mail du compte à supprimer)
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    "L'utilisateur a été supprimé"
    ```
  * **404 Not Found :**
    ```json
    "Aucun utilisateur associé à cet email trouvé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la suppression de l'utilisateur"
    ```

---


## Gestion des Réservations

Toutes les routes de ce module nécessitent une authentification. Le `token` doit être présent.

### 1. Récupérer toutes les réservations
Renvoie la liste complète de toutes les réservations, triées par numéro de catway en ordre croissant. Les réservations sont affichées directement à l'arrivée sur le tableau de bord de l'API (`/dashboard_view.ejs`). 

* **URL :** `/reservations`
* **Méthode HTTP :** `GET`
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    [
      {
        "_id": "651c7d1f1234567890abcdef",
        "catwayNumber": 15,
        "clientName": "Jean Dupont",
        "boatName": "L'Océane",
        "startDate": "2026-10-01T12:00:00.000Z",
        "endDate": "2026-10-15T12:00:00.000Z",
        "__v": 0
      }
      {
        "_id": "651c3f8f123987654abcdef",
        "catwayNumber": 22,
        "clientName": "Alfred",
        "boatName": "Le Fast",
        "startDate": "2026-09-08T12:00:00.000Z",
        "endDate": "2026-12-27T12:00:00.000Z",
        "__v": 0
      }
    ]
    ```
  * **404 Not Found :**
    ```json
    "Aucune réservation n'existe"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la récupération des réservations"
    ```

---

### 2. Récupérer toutes les réservations d'un catway spécifique
Renvoie l'ensemble des réservations planifiées sur un même numéro de catway.

* **URL :** `/catways/:id/reservations`
* **Méthode HTTP :** `GET`
* **Paramètres d'URL :** `id` (Le numéro du catway cible, ex: `/catways/42/reservations`)
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :** Renvoie un tableau d'objets réservations.
  * **404 Not Found :**
    ```json
    "Aucune réservation n'est associée à ce catway"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la récupération des réservations associées à ce catway"
    ```

---

### 3. Récupérer une réservation spécifique par ses identifiants
Recherche une réservation précise selon le numéro du catway et l'identifiant de la réservation.

* **URL :** `/catways/:id/reservations/:idReservation`
* **Méthode HTTP :** `GET`
* **Paramètres d'URL :** 
  * `id` : Le numéro du catway
  * `idReservation` : L'identifiant MongoDB unique de la réservation
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :** Renvoie l'objet réservation correspondant.
  * **404 Not Found :**
    ```json
    "Aucune réservation correspondante n'a été trouvée"
    ```
  * **500 Internal Server Error :**
    ```json
    "Cette réservation n'existe pas"
    ```

---

### 4. Créer une réservation
Crée un nouvel enregistrement de réservation pour un catway donné, après vérification des disponibilités de dates.

* **URL :** `/catways/:id/reservations`
* **Méthode HTTP :** `POST`
* **Paramètres d'URL :** `id` (Le numéro du catway à réserver)
* **Sécurité :** `checkJWT` requis
* **Corps de la requête (JSON) :**
  ```json
  {
    "clientName": "Pierre Martin",
    "boatName": "Le Poséidon",
    "startDate": "2026-11-01T10:00:00.000Z",
    "endDate": "2026-11-07T16:00:00.000Z"
  }
  ```
  *(Note : l'id unique n'est pas renseigné à la création et est défini automatiquement par mongoose).*
* **Contraintes de validation :**
  * `clientName` et `boatName` : Obligatoires, longueur minimale de 3 caractères.
  * `endDate` : Ne peut pas être antérieure à la date `startDate`.
  * Le catway ciblé par le numéro doit exister dans la base.

* **Réponses attendues :**
  * **201 Created (Succès) :**
    ```json
    {
      "_id": "651c8e2f1234567890abcdef",
      "catwayNumber": 42,
      "clientName": "Pierre Martin",
      "boatName": "Le Poséidon",
      "startDate": "2026-11-01T10:00:00.000Z",
      "endDate": "2026-11-07T16:00:00.000Z",
      "__v": 0
    }
    ```
  * **400 Bad Request :**
    ```json
    "Un ou plusieurs champs sont manquants"
    // OU
    "Le nom du client et du navire doivent faire au moins 3 caractères"
    // OU
    "La date de fin ne peut être antérieure à la date de début"
    ```
  * **404 Not Found :**
    ```json
    "Ce catway n'existe pas"
    ```
  * **409 Conflict (Dates indisponibles) :**
    ```json
    "Créneau déjà réservé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la création de la réservation"
    ```

---

### 5. Mettre à jour les dates d'une réservation
Permet de modifier uniquement les dates de début et de fin d'une réservation. Les noms associés ne peuvent pas être changés. Pour modifier le catway ou le nom du client / du bateau, une nouvelle réservation devra être créée et l'ancienne supprimée, par souci de simplicité. 

* **URL :** `/catways/:id/reservations/:idReservation`
* **Méthode HTTP :** `PUT`
* **Paramètres d'URL :**
  * `id` : Le numéro du catway
  * `idReservation` : L'identifiant unique de la réservation
* **Sécurité :** `checkJWT` requis
* **Corps de la requête (JSON) :**
  ```json
  {
    "clientName": "Pierre Martin",
    "boatName": "Le Poséidon",
    "startDate": "2026-11-03T10:00:00.000Z",
    "endDate": "2026-11-09T16:00:00.000Z"
  }
  ```
* **Contraintes de validation :**
  * `clientName` et `boatName` fournis doivent correspondre aux valeurs de base (interdiction de les modifier).
  * La nouvelle date de fin ne peut pas être antérieure à la nouvelle date de début.
  * Les nouvelles dates ne doivent pas chevaucher une autre réservation sur le même catway.

* **Réponses attendues :**
  * **201 Created (Modification validée) :** Renvoie l'objet réservation modifié.
  * **400 Bad Request :**
    ```json
    "Les nouvelles dates désirées sont requises"
    // OU
    "La date de fin ne peut être antérieure à la date de début"
    // OU
    "Les noms du client et du navire associés à la réservation ne peuvent être modifiés"
    ```
  * **404 Not Found :**
    ```json
    "Cette réservation n'existe pas"
    ```
  * **409 Conflict (Dates indisponibles) :**
    ```json
    "Créneau déjà utilisé"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la modification de la réservation"
    ```

---

### 6. Supprimer une réservation
Annule et retire définitivement une réservation de la base de données.

* **URL :** `/catways/:id/reservations/:idReservation`
* **Méthode HTTP :** `DELETE`
* **Paramètres d'URL :**
  * `id` : Le numéro du catway associé
  * `idReservation` : L'identifiant de la réservation à supprimer
* **Sécurité :** `checkJWT` requis
* **Réponses attendues :**
  * **200 OK (Succès) :**
    ```json
    "Le catway a été supprimé"
    ```
  * **404 Not Found :**
    ```json
    "Le catway que vous voulez supprimer n'existe pas"
    ```
  * **500 Internal Server Error :**
    ```json
    "Erreur serveur lors de la suppression du catway"
    ```