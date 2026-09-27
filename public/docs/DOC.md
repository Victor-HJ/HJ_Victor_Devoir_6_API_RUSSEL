# Documentation de l'API Port de Plaisance Russell

Ceci est la documentation de l'API. Avant tout chose, il convient de noter que toute requête envoyant des données doit inclure:  `Content-Type: application/json`.

---

## Authentification

Ce module gère l'accès sécurisé à l'API via des jetons JWT (Bearer Tokens) ou la déconnexion de celle-ci.

### 1. Connexion à l'API
Permet à un utilisateur de s'authentifier pour obtenir un jeton d'accès.

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
      "message": "Mot de passe incorrect."
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