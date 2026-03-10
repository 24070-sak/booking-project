# 🚀 Guide Rapide : Déployer le Projet (Frontend + Backend) sur Render

Ce guide est conçu pour vous aider, étape par étape, à déployer l'intégralité de votre projet (**Backend Python/Flask** et **Frontend React/Vite**) sur [Render](https://render.com/), une plateforme d'hébergement gratuite et simple d'utilisation.

---

## 🛠️ Étape 1 : Préparer et Pousser votre code sur GitHub
Render se connecte directement à votre compte GitHub pour récupérer et déployer votre code automatiquement.

1. Allez sur [GitHub](https://github.com/) et assurez-vous que votre projet (`Backend` et `Frontend`) est poussé sur votre dépôt.
2. Assurez-vous d'être sur la bonne branche (ex: `main` ou `sak`).

---

## 🗄️ Étape 2 : Créer la Base de Données (PostgreSQL)
Render utilise PostgreSQL pour ses bases de données managées.

1. Connectez-vous au [Dashboard Render](https://dashboard.render.com/).
2. Cliquez sur **"New"** en haut à droite, puis sélectionnez **"PostgreSQL"**.
3. Remplissez le formulaire :
   - **Name** : `booking-db`
   - Choisissez l'option gratuite (**Free tier**).
4. Cliquez sur **"Create Database"**.
5. Faites défiler jusqu'à la section **"Connections"** et **copiez la valeur de "Internal Database URL"**. Vous en aurez besoin à l'étape suivante.

---

## 🌐 Étape 3 : Déployer l'API Backend (Flask)

1. Cliquez sur **"New"** puis **"Web Service"**.
2. Connectez votre compte GitHub et sélectionnez votre dépôt.
3. Remplissez la configuration :
   - **Name** : `booking-backend` (ou similaire)
   - **Root Directory** : `Backend` *(Très important !)*.
   - **Environment** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn run:app`
   - **Instance Type** : `Free` (Plan gratuit)
4. Descendez jusqu'à **"Environment Variables"** et ajoutez :

| Key | Value |
|---|---|
| `DATABASE_URL` | *(collez l'Internal Database URL copiée à l'étape 2)* |
| `FLASK_ENV` | `production` |
| `SECRET_KEY` | `votre-cle-secrete-ici` |
| `JWT_SECRET_KEY` | `votre-cle-jwt-secrete-ici` |

*(Ajoutez aussi `MAIL_USERNAME`, `MAIL_PASSWORD`, etc. si nécessaire pour l'envoi d'emails)*

5. Cliquez sur **"Create Web Service"**.
6. Une fois le déploiement terminé (message `Your service is live 🎉`), **copiez l'URL de votre backend** (elle ressemble à `https://booking-backend-xxx.onrender.com`).

---

## 💻 Étape 4 : Déployer le Frontend (React/Vite)

Maintenant, nous allons déployer l'interface utilisateur et la relier au backend.

1. Retournez au [Dashboard Render](https://dashboard.render.com/) et cliquez sur **"New"**, puis sélectionnez **"Static Site"** (Site statique).
2. Sélectionnez toujours le même dépôt GitHub.
3. Remplissez la configuration :
   - **Name** : `booking-frontend` (ou similaire)
   - **Root Directory** : `Frontend` *(Très important !)*
   - **Build Command** : `npm install && npm run build`
   - **Publish directory** : `dist` *(C'est le dossier généré par Vite)*
   
4. **Très Important (Liaison avec le Backend) :**
   Descendez jusqu'à la section **"Environment Variables"**  cliquez sur "Add Environment Variable" et ajoutez :
   
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | *(Collez l'URL complète de votre backend avec /api à la fin. Ex: `https://booking-backend-xxx.onrender.com/api`)* |

5. Cliquez sur **"Create Static Site"**.

---

## 🔄 Étape 5 : Configurer le Routage du Frontend (C'est essentiel !)
Puisque React fonctionne comme une "Single Page Application" (SPA), il faut dire à Render de rediriger toutes les requêtes d'URL vers `index.html`. Sinon, si l'utilisateur rafraîchit la page `/dashboard`, il aura une Erreur 404 (Not Found).

1. Allez sur la page de votre **Front-end Service** sur Render.
2. Dans le menu de gauche, cliquez sur **"Redirects/Rewrites"**.
3. Ajoutez une nouvelle règle avec ces paramètres exacts :
   - **Source** : `/*`
   - **Destination** : `/index.html`
   - **Action** : `Rewrite`
4. Cliquez sur **"Save Changes"**.

🎉 **C'est fini !**
Votre projet entier (Backend et Frontend) est maintenant déployé, sécurisé, et complètement gratuit et fonctionnel. Vous pouvez aller sur l'URL de votre site Static (Frontend) pour naviguer sur votre application !
