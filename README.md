# PetCare

**PetCare** è un'applicazione web pensata per semplificare la gestione della salute e delle informazioni dei propri animali domestici.

L'obiettivo è offrire uno spazio digitale in cui raccogliere e consultare informazioni sanitarie, documenti veterinari, vaccinazioni, terapie e appuntamenti, con la possibilità di condividere l'accesso con altre persone.

## 🌐 Demo online

L'applicazione è disponibile online:

- **Frontend:** [PetCare – Vercel](https://pet-care-3h3yblu73-claudia-480a.vercel.app/login)
- **Backend:** [PetCare API – Render](https://petcarebackend-2cic.onrender.com)

È possibile accedere all'applicazione tramite il frontend. Il backend espone le API utilizzate dall'applicazione.

## ✨ Funzionalità

- **Gestione degli animali:** creazione e gestione delle schede dei propri animali domestici.
- **Scheda sanitaria:** raccolta di allergie, condizioni mediche e informazioni utili per la salute dell'animale.
- **Vaccinazioni:** registrazione e consultazione delle vaccinazioni e delle relative scadenze.
- **Terapie:** gestione delle terapie e monitoraggio del loro stato.
- **Documenti veterinari:** caricamento e consultazione di documenti e referti.
- **Appuntamenti:** gestione degli appuntamenti veterinari.
- **Condivisione:** possibilità di condividere l'accesso alla scheda di un animale con altri utenti, assegnando ruoli e permessi differenti.
- **QR Code:** accesso a una pagina pubblica con alcune informazioni dell'animale, selezionabili dal proprietario. Può essere utile in caso di smarrimento o emergenza.

## 🛠️ Tecnologie utilizzate

### Frontend
- React
- Vite
- React Bootstrap
- React Router
- React Bootstrap Icons

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token (JWT)

### Servizi esterni
- Cloudinary – gestione e archiviazione di immagini e documenti.
- Google OAuth – autenticazione tramite account Google.

## 📁 Struttura del progetto

```text
petCare/
│
├── backend/
│   ├── modules/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── ...
│
└── README.md
```

## 🚀 Installazione e avvio

### Requisiti
- Node.js
- npm
- MongoDB

### 1. Clonare il repository

```bash
git clone https://github.com/Claudia-Laici/petCare.git
cd petCare
```

### 2. Installare le dipendenze

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 3. Configurare le variabili d'ambiente

Creare un file `.env` nella cartella `backend` con le seguenti variabili:

```env
MONGO_URL=
PORT=9098
JWT_SECRET=
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:9098
```

Configurare inoltre le credenziali necessarie per i servizi esterni utilizzati dal progetto.

Nel frontend, configurare le variabili d'ambiente richieste, tra cui:

```env
VITE_API_URL=
VITE_APP_URL=
```

### 4. Avviare l'applicazione

Avviare backend e frontend in due terminali separati, utilizzando gli script definiti nei rispettivi `package.json`.

Il frontend Vite è configurato per essere raggiungibile localmente all'indirizzo:

```text
http://localhost:5173
```

## 🔐 Gestione degli accessi

PetCare prevede tre livelli di accesso alla scheda di un animale:

| Ruolo | Permessi |
|---|---|
| Owner | Gestione completa dell'animale e delle condivisioni |
| Editor | Consultazione e modifica delle informazioni |
| Viewer | Consultazione delle informazioni |

I permessi vengono verificati anche lato backend, per proteggere le operazioni e i dati degli animali.

## 📌 Stato del progetto

PetCare è un progetto in fase di sviluppo.

Le funzionalità vengono implementate e progressivamente migliorate, con particolare attenzione a:
- organizzazione e separazione delle responsabilità nel codice;
- gestione dei permessi e della sicurezza;
- validazione dei dati;
- riutilizzabilità dei componenti;
- esperienza utente e interfaccia grafica.

---

**PetCare – La salute dei tuoi amici a quattro zampe, sempre a portata di mano.** 🐶🐱