# 🚀 Guide Rapide : Déployer le Backend sur Render

Ce guide est conçu pour vous aider, étape par étape, à déployer le backend (API) de votre projet sur [Render](https://render.com/), une plateforme d'hébergement gratuite et simple d'utilisation, tout en conservant le fonctionnement local de votre application.

## 🛠️ Étape 1 : Préparer et Pousser votre code sur GitHub
Render se connecte directement à votre compte GitHub pour récupérer et déployer votre code automatiquement.

1. Allez sur [GitHub](https://github.com/) et créez un nouveau dépôt (repository) privé ou public.
2. Poussez votre projet (`Backend` et `Frontend`) sur ce dépôt si ce n'est pas déjà fait.

## 🗄️ Étape 2 : Créer la Base de Données sur Render
Render utilise **PostgreSQL** au lieu de MySQL pour ses bases de données managées. Notre projet est compatible avec les deux (grâce à `SQLAlchemy`).

1. Connectez-vous à votre [Dashboard Render](https://dashboard.render.com/).
2. Cliquez sur le bouton **"New"** en haut à droite, puis sélectionnez **"PostgreSQL"**.
3. Remplissez le formulaire :
   - **Name** : `booking-db` (ou le nom de votre choix)
   - Laissez les autres champs par défaut (sélectionnez la région la plus proche, par ex. Franckfurt ou Paris).
   - Choisissez l'option gratuite (**Free tier**).
4. Cliquez sur **"Create Database"**.
5. Une fois la base de données créée, faites défiler la page jusqu'à la section **"Connections"** et copiez la valeur de **"Internal Database URL"**. Vous en aurez besoin à l'étape suivante.

## 🌐 Étape 3 : Créer le Service Web Backend
Maintenant, nous allons déployer le code Python (Flask).

1. Retournez au Dashboard et cliquez sur **"New"** puis **"Web Service"**.
2. Connectez votre compte GitHub et sélectionnez le dépôt contenant votre projet.
3. Remplissez le formulaire de configuration :
   - **Name** : `booking-backend` (ou similaire)
   - **Root Directory** : `Backend` *(Très important ! Indique à Render que le code de l'API se trouve dans le dossier `Backend`)*.
   - **Environment** : `Python 3`
   - **Region** : Même région que votre base de données.
   - **Branch** : `main` (ou la branche que vous utilisez).
   - **Build Command** : `pip install -r requirements.txt` *(Installation des librairies)*
   - **Start Command** : `gunicorn run:app` *(Lancement du serveur en production)*
4. Sélectionnez le plan gratuit (**Free tier**).

## ⚙️ Étape 4 : Configurer les Variables d'Environnement
Toujours sur la page de configuration du Web Service, descendez jusqu'à la section **"Environment Variables"** et cliquez sur **"Add Environment Variable"** pour ajouter les éléments suivants :

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | *(collez l'Internal Database URL copiée à l'étape 2)* | Dit à Flask d'utiliser la base PostgreSQL de Render. |
| `FLASK_ENV` | `production` | Désactive le mode debug et optimise l'application. |
| `SECRET_KEY` | `une-cle-secrete-très-longue-et-complexe` | Clé pour sécuriser l'application Flask (mettez quelque chose de difficile à deviner). |
| `JWT_SECRET_KEY` | `votre-cle-jwt-secrete-ici` | Clé pour sécuriser les tokens d'authentification (générez une chaîne aléatoire). |

**Note :** Vous pouvez rajouter d'autres clés nécessaires comme vos ID Google ou Facebook (`GOOGLE_CLIENT_ID`, `MAIL_PASSWORD`, etc.) si votre application les utilise.

## 🚀 Étape 5 : Déploiement et Test
1. Cliquez sur le bouton **"Create Web Service"** tout en bas.
2. Render va commencer à télécharger votre code, installer les dépendances et lancer le serveur. Vous verrez les logs défiler à l'écran.
3. Attendez quelques minutes jusqu'à voir le message `Your service is live 🎉`.
4. Render vous fournira un lien en haut à gauche de la page (ex: `https://booking-backend-xxxxx.onrender.com`).
5. Cliquez sur ce lien ou ajoutez `/api/health` à la fin (`https://booking-backend-xxxxx.onrender.com/api/health`). Si vous obtenez une réponse avec `'status': 'ok'`, félicitations, votre backend fonctionne en production !

---

## 🔗 Étape 6 : Lier avec le Frontend Vercel
Votre frontend est déjà déployé sur Vercel (`https://supnum-booking.vercel.app`).

1. Dans le code ou la configuration Vercel de votre Frontend, assurez-vous de changer la variable locale (`http://localhost:5000`) qui pointe vers votre backend.
2. Remplacez-la par l'URL publique fournie par Render (ex: `https://booking-backend-xxxxx.onrender.com`).
3. **CORS :** Bonne nouvelle, le backend (dans `app/__init__.py`) est déjà configuré (`CORS(app, resources={r"/api/*": {"origins": "*"}})`) pour accepter n'importe quel site (dont votre frontend Vercel). Vous n'avez aucune ligne de code à modifier côté backend pour le CORS !

---

## 💻 Et le développement en local ?
Vous pouvez continuer à travailler sur votre machine :
1. Lancez simplement `python run.py` (ou `python3 run.py`) dans le terminal depuis votre dossier `Backend`.
2. Votre backend s'exécutera toujours localement sur `http://localhost:5000`.
3. Grâce au fichier `.env` local (qui **n'est pas envoyé à Render** si correctement configuré dans le `.gitignore`), Flask continuera d'utiliser votre base de données MySQL ou SQLite locale ! Render, lui, utilisera la base de données configurée dans ses propres variables (`DATABASE_URL`).
