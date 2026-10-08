/* =========================================================
   CONFIGURAZIONE
========================================================= */
console.log("SCRIPT.JS CARICATO CORRETTAMENTE");

const GAME_CONFIG = {

    obiettivo: {
        nome: "Reperto",
        punti: 1
    },

    livelli: [
        {
            nome: "LIVELLO 1",
            minimo: 0
        },
        {
            nome: "LIVELLO 2",
            minimo: 50
        },
        {
            nome: "LIVELLO 3",
            minimo: 100
        },
        {
            nome: "LIVELLO 4",
            minimo: 200
        },
        {
            nome: "LIVELLO 5",
            minimo: 500
        }
    ],

    /*
        TRUE = modalità test.
        In modalità test ogni fotografia viene considerata valida.

        Quando collegheremo il vero sistema di riconoscimento
        immagini, basterà mettere false.
    */
    modalitaTest: true

};


/* =========================================================
   ELEMENTI HTML
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const loginButton =
    document.getElementById("loginButton");

const nicknameInput =
    document.getElementById("nicknameInput");

const loginError =
    document.getElementById("loginError");

const app =
    document.getElementById("app");

const nicknameDisplay =
    document.getElementById("nicknameDisplay");

const scoreDisplay =
    document.getElementById("scoreDisplay");

const levelDisplay =
    document.getElementById("levelDisplay");

const addButton =
    document.getElementById("addButton");

const cameraInput =
    document.getElementById("cameraInput");

const statusMessage =
    document.getElementById("statusMessage");

const rankingContainer =
    document.getElementById("rankingContainer");

const gallery =
    document.getElementById("gallery");

const photoModal =
    document.getElementById("photoModal");

const previewImage =
    document.getElementById("previewImage");

const verificationResult =
    document.getElementById("verificationResult");

const closeModal =
    document.getElementById("closeModal");


/* =========================================================
   CONTROLLO ELEMENTI
========================================================= */

if (!loginScreen) {
    console.error("ERRORE: manca #loginScreen");
}

if (!loginButton) {
    console.error("ERRORE: manca #loginButton");
}

if (!nicknameInput) {
    console.error("ERRORE: manca #nicknameInput");
}

if (!app) {
    console.error("ERRORE: manca #app");
}


/* =========================================================
   COOKIE
========================================================= */

function getCookie(name) {

    const cookies =
        document.cookie.split("; ");

    for (const cookie of cookies) {

        const parts =
            cookie.split("=");

        const key =
            parts.shift();

        const value =
            parts.join("=");

        if (key === name) {
            return decodeURIComponent(value);
        }
    }

    return null;
}


function setCookie(name, value, days) {

    const date =
        new Date();

    date.setTime(
        date.getTime() +
        (days * 24 * 60 * 60 * 1000)
    );

    document.cookie =
        `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}


function deleteCookie(name) {

    document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;

}


/* =========================================================
   NICKNAME ATTUALE
========================================================= */

let currentNickname =
    getCookie("nickname");

let isAdmin = false;

function pulisciNickname(nickname) {

    if (nickname.startsWith("!%")) {
        return nickname.substring(2);
    }

    return nickname;
}

function controllaAdmin(nickname) {

    return nickname.startsWith("!%");
}
/* =========================================================
   DATABASE LOCALE
========================================================= */

let users = loadUsers();


function loadUsers() {

    try {

        const saved =
            localStorage.getItem("usersData");

        if (!saved) {
            return {};
        }

        const parsed =
            JSON.parse(saved);

        if (
            typeof parsed !== "object" ||
            parsed === null
        ) {
            return {};
        }

        return parsed;

    } catch (error) {

        console.error(
            "Errore nel caricamento degli utenti:",
            error
        );

        return {};
    }

}


function saveUsers() {

    try {

        localStorage.setItem(
            "usersData",
            JSON.stringify(users)
        );

    } catch (error) {

        console.error(
            "Errore nel salvataggio:",
            error
        );

    }

}
/* =========================================================
   DATABASE FOTO - INDEXEDDB
========================================================= */

const PHOTO_DB_NAME = "PuntiPhotosDB";
const PHOTO_STORE_NAME = "photos";

function openPhotoDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(PHOTO_DB_NAME, 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
                db.createObjectStore(PHOTO_STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

async function salvaFotoDB(photoId, imageData) {
    const db = await openPhotoDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            PHOTO_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(PHOTO_STORE_NAME);

        store.put({
            id: photoId,
            image: imageData
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function caricaFotoDB(photoId) {
    const db = await openPhotoDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            PHOTO_STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = store.get(photoId);

        request.onsuccess = function() {
            resolve(request.result ? request.result.image : null);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

async function eliminaFotoDB(photoId) {
    const db = await openPhotoDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            PHOTO_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(PHOTO_STORE_NAME);

        store.delete(photoId);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

/* =========================================================
   CREAZIONE UTENTE
========================================================= */

function createUser(nickname) {

    if (!users[nickname]) {

        users[nickname] = {

            score: 0,

            month:
                getCurrentMonth(),

            photos: []

        };

        saveUsers();
    }

}


/* =========================================================
   MESE CORRENTE
========================================================= */

function getCurrentMonth() {

    const date =
        new Date();

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0")
    );

}


/* =========================================================
   RESET MENSILE
========================================================= */

function checkMonthlyReset() {

    const currentMonth =
        getCurrentMonth();

    let changed = false;

    Object.keys(users).forEach(
        nickname => {

            const user =
                users[nickname];

            if (!user) {
                return;
            }

            if (!Array.isArray(user.photos)) {
                user.photos = [];
                changed = true;
            }

            if (
                typeof user.score !== "number"
            ) {
                user.score = 0;
                changed = true;
            }

            if (
                user.month !== currentMonth
            ) {

                user.score = 0;

                user.month =
                    currentMonth;

                changed = true;
            }

        }
    );

    if (changed) {
        saveUsers();
    }

}


/* =========================================================
   LOGIN
========================================================= */

function login() {

    if (!nicknameInput) {
        return;
    }

   const nicknameInserito = nicknameInput.value.trim();
   
   if (nicknameInserito === "") {
       if (loginError) {
           loginError.textContent =
               "Inserisci un nickname.";
       }
   
       nicknameInput.focus();
       return;
   }
   
   const admin = controllaAdmin(nicknameInserito);
   
   const nickname = pulisciNickname(nicknameInserito);

    /*
        Controllo nickname vuoto
    */

    if (nickname === "") {

        if (loginError) {

            loginError.textContent =
                "Inserisci un nickname.";

        }

        nicknameInput.focus();

        return;
    }

    /*
        Controllo lunghezza
    */

    if (nickname.length > 20) {

        if (loginError) {

            loginError.textContent =
                "Il nickname è troppo lungo.";

        }

        nicknameInput.focus();

        return;
    }

    /*
        Salviamo nickname
    */

    currentNickname =
        nickname;
isAdmin = admin;

setCookie(
    "isAdmin",
    admin ? "1" : "0",
    365
);
    setCookie(
        "nickname",
        currentNickname,
        365
    );

    /*
        Creiamo l'utente
        se non esiste
    */

    createUser(
        currentNickname
    );

    /*
        Puliamo eventuale errore
    */

    if (loginError) {

        loginError.textContent =
            "";

    }

    /*
        Nascondi login
    */

    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }

    /*
        Mostra app
    */

    if (app) {

        app.classList.remove(
            "hidden"
        );

    }

    /*
        Avvio applicazione
    */

    initializeApplication();

}


/* =========================================================
   ENTER DA TASTIERA
========================================================= */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        login
    );

}


if (nicknameInput) {

    nicknameInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                login();

            }

        }
    );

}


/* =========================================================
   AVVIO APPLICAZIONE
========================================================= */

function initializeApplication() {

    if (!currentNickname) {
        return;
    }

    createUser(
        currentNickname
    );
inviaAggiornamentoP2P(user);
    checkMonthlyReset();

    updateHome();

    updateRanking();

    updateGallery();

}


/* =========================================================
   HOME
========================================================= */

function updateHome() {

    if (!currentNickname) {
        return;
    }

    const user =
        users[currentNickname];

    if (!user) {
        return;
    }

    if (nicknameDisplay) {

        nicknameDisplay.textContent =
            currentNickname;

    }

    if (scoreDisplay) {

        scoreDisplay.textContent =
            user.score;

    }

    if (levelDisplay) {

        levelDisplay.textContent =
            getLevel(user.score);

    }

}


/* =========================================================
   LIVELLO
========================================================= */

function getLevel(score) {

    let selectedLevel =
        GAME_CONFIG.livelli[0];

    for (
        const level
        of GAME_CONFIG.livelli
    ) {

        if (
            score >= level.minimo
        ) {

            selectedLevel =
                level;

        }

    }

    return selectedLevel.nome;

}


/* =========================================================
   AGGIUNGI FOTO
========================================================= */

if (addButton) {

    addButton.addEventListener(
        "click",
        function () {

            if (cameraInput) {

                cameraInput.click();

            }

        }
    );

}


/* =========================================================
   INPUT FOTO
========================================================= */

if (cameraInput) {

    cameraInput.addEventListener(
        "change",
        handlePhoto
    );

}


/* =========================================================
   GESTIONE FOTO
========================================================= */

async function handlePhoto(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    if (!currentNickname) {

        return;
    }

    if (statusMessage) {

        statusMessage.textContent =
            "Controllo della fotografia...";

    }

    try {

        const imageData =
            await fileToDataURL(file);

        /*
            Mostra anteprima
        */

        if (previewImage) {

            previewImage.src =
                imageData;

        }

        if (verificationResult) {

            verificationResult.innerHTML =
                "";

        }

        if (photoModal) {

            photoModal.classList.remove(
                "hidden"
            );

        }

        /*
            Verifica fotografia
        */

        const result =
            await verificaFoto(file);

        /*
            Se riconosciuta
        */

        if (result.trovato) {

            addPoint(
                imageData
            );

        } else {

            showVerificationFailed();

        }

    } catch (error) {

        console.error(
            "Errore durante la gestione della foto:",
            error
        );

        if (verificationResult) {

            verificationResult.innerHTML = `
                <div class="verification-fail">
                    ✕ Errore durante la verifica
                </div>
                <p>
                    Riprova.
                </p>
            `;

        }

    } finally {

        if (statusMessage) {

            statusMessage.textContent =
                "";

        }

        if (cameraInput) {

            cameraInput.value =
                "";

        }

    }

}


/* =========================================================
   FILE → DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };

            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Impossibile leggere l'immagine."
                        )
                    );

                };

            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   VERIFICA FOTO
========================================================= */

async function verificaFoto(file) {

    console.log(
        "Fotografia:",
        file.name
    );

    console.log(
        "Modalità test:",
        GAME_CONFIG.modalitaTest
    );

    /*
        MODALITÀ TEST

        Per ora accettiamo qualsiasi immagine.
        Questo permette di verificare che:

        FOTO →
        MODALE →
        PUNTI →
        CLASSIFICA →
        GALLERIA

        funzionino.

        Successivamente questa funzione verrà
        sostituita con il vero riconoscimento
        dell'immagine.
    */

    if (
        GAME_CONFIG.modalitaTest
    ) {

        return {

            trovato: true,

            affidabilita: 100

        };

    }

    /*
        Qui andrà il vero sistema AI.
    */

    return {

        trovato: false,

        affidabilita: 0

    };

}


/* =========================================================
   FOTO NON RICONOSCIUTA
========================================================= */

function showVerificationFailed() {

    if (!verificationResult) {
        return;
    }

    verificationResult.innerHTML = `

        <div class="verification-fail">
            ✕ Oggetto non riconosciuto
        </div>

        <p>
            Nessun punto assegnato.
        </p>

    `;

}


/* =========================================================
   AGGIUNTA PUNTI
========================================================= */

async function addPoint(imageData) {
    if (!currentNickname) return;

    const user = users[currentNickname];

    if (!user) return;

    const points = 1;

    const photoId =
        currentNickname +
        "_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 9);

    try {
        await salvaFotoDB(photoId, imageData);

        user.score += points;

        user.photos.push({
            id: photoId,
            points: points,
            date: new Date().toISOString(),
            object: GAME_CONFIG.obiettivo.nome,
            valid: true
        });

        saveUsers();

        if (typeof inviaAggiornamentoP2P === "function") {
            inviaAggiornamentoP2P(user);
        }

        updateHome();
        updateRanking();
        updateGallery();

        if (verificationResult) {
            verificationResult.innerHTML = `
                <div class="verification-success">
                    ✓ Oggetto riconosciuto
                </div>
                <p>+1 punto</p>
            `;
        }

    } catch (error) {

        console.error(
            "Errore salvataggio foto:",
            error
        );

        if (verificationResult) {
            verificationResult.innerHTML = `
                <div class="verification-fail">
                    ✕ Errore salvataggio foto
                </div>
            `;
        }
    }
}


/* =========================================================
   CLASSIFICA
========================================================= */

function updateRanking() {

    if (!rankingContainer) {
        return;
    }

    rankingContainer.innerHTML =
        "";

    const ranking =
        Object.keys(users)
            .map(
                nickname => {

                    const user =
                        users[nickname];

                    return {

                        nickname:
                            nickname,

                        score:
                            Number(
                                user.score || 0
                            )

                    };

                }
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            );

    /*
        Se non ci sono utenti
    */

    if (ranking.length === 0) {

        rankingContainer.innerHTML = `

            <p>
                Nessun giocatore presente.
            </p>

        `;

        return;
    }

    /*
        Creiamo una classifica
        semplice e ordinata
    */

    ranking.forEach(
        (user, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "ranking-item";

            const position =
                document.createElement(
                    "span"
                );

            position.className =
                "ranking-position";

            position.textContent =
                "#" + (index + 1);

            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "ranking-name";

            name.textContent =
                user.nickname;

            const score =
                document.createElement(
                    "span"
                );

            score.className =
                "ranking-score";

            score.textContent =
                user.score + " pt";

            row.appendChild(
                position
            );

            row.appendChild(
                name
            );

            row.appendChild(
                score
            );

            rankingContainer.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   GALLERIA
========================================================= */

async function updateGallery() {

    if (!gallery) return;

    gallery.innerHTML = "";

    if (!currentNickname) return;

    const user = users[currentNickname];

    if (!user) return;

    const photos = Array.isArray(user.photos)
        ? user.photos
        : [];

    if (photos.length === 0) {

        gallery.innerHTML = `
            <p class="empty-gallery">
                Non hai ancora nessun reperto.
            </p>
        `;

        return;
    }

    const reversedPhotos = [...photos].reverse();

    for (const photo of reversedPhotos) {

        const item = document.createElement("div");

        item.className = "gallery-item";

        const image = document.createElement("img");

        image.alt = "Reperto";

        image.className = "gallery-photo";

        try {

            const imageData =
                await caricaFotoDB(photo.id);

            if (imageData) {
                image.src = imageData;
            } else {
                image.alt = "Foto non disponibile";
            }

        } catch (error) {

            console.error(
                "Errore caricamento foto:",
                error
            );

        }

        const info = document.createElement("div");

        info.className = "gallery-info";

        info.textContent =
            `+${photo.points} punto • ${photo.object}`;

        item.appendChild(image);
        item.appendChild(info);

        gallery.appendChild(item);
    }
}

/* =========================================================
   NAVIGAZIONE
========================================================= */

const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );


navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const pageID =
                    button.dataset.page;

                if (!pageID) {
                    return;
                }

                /*
                    Nascondi tutte le pagine
                */

                document
                    .querySelectorAll(".page")
                    .forEach(
                        page => {

                            page.classList.remove(
                                "active"
                            );

                        }
                    );

                /*
                    Mostra pagina selezionata
                */

                const selectedPage =
                    document.getElementById(
                        pageID
                    );

                if (selectedPage) {

                    selectedPage.classList.add(
                        "active"
                    );

                }

                /*
                    Aggiorna pulsanti
                */

                navButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

            }
        );

    }
);


/* =========================================================
   MODALE
========================================================= */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            if (photoModal) {

                photoModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   CHIUSURA MODALE CLICCANDO FUORI
========================================================= */

if (photoModal) {

    photoModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                photoModal
            ) {

                photoModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   INIZIALIZZAZIONE LOGIN
========================================================= */

function initializeLoginScreen() {

    /*
        Se esiste già un nickname salvato,
        possiamo riaprire direttamente l'app.
    */

    if (currentNickname) {

        createUser(
            currentNickname
        );

        if (loginScreen) {

            loginScreen.classList.add(
                "hidden"
            );

        }

        if (app) {

            app.classList.remove(
                "hidden"
            );

        }

        initializeApplication();

        return;
    }

    /*
        Nessun nickname:
        mostra login
    */

    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }

    if (app) {

        app.classList.add(
            "hidden"
        );

    }

}
/* =========================================================
   RETE P2P - PEERJS
========================================================= */

/* =========================================================
   RETE P2P - PEERJS
========================================================= */

/* =========================================================
   RETE P2P - PEERJS
========================================================= */
/* =========================================================
   RETE P2P - PEERJS
   ID STABILE LEGATO AL NICKNAME
========================================================= */

let peer = null;
let p2pConnections = [];

let knownPeers = {};
let receivedMessages = new Set();

let reconnectTimer = null;


/* =========================================================
   ID STABILE
========================================================= */

function creaPeerID(nickname) {

    /*
        Trasforma il nickname in un ID stabile.

        Esempio:

        Gabriele
        ↓
        punti-gabriele

        Quindi ad ogni refresh
        viene usato sempre lo stesso ID.
    */

    const pulito =
        nickname
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z0-9_-]/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );

    return (
        "punti-" +
        pulito
    );
}


/* =========================================================
   STORAGE PEER
========================================================= */

function caricaPeerSalvati() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "knownPeers"
            ) || "{}"
        );

    } catch (error) {

        return {};

    }

}


function salvaPeerSalvati() {

    localStorage.setItem(
        "knownPeers",
        JSON.stringify(
            knownPeers
        )
    );

}


/* =========================================================
   SALVA PEER
========================================================= */

function salvaPeer(
    nickname,
    peerID
) {

    if (!nickname || !peerID) {
        return;
    }

    knownPeers[nickname] =
        peerID;

    salvaPeerSalvati();

}


/* =========================================================
   AVVIO P2P
========================================================= */

function avviaP2P() {

    if (
        typeof Peer ===
        "undefined"
    ) {

        console.error(
            "PeerJS non è stato caricato."
        );

        aggiornaStatoP2P(
            "🔴 PeerJS non disponibile"
        );

        return;

    }


    if (!currentNickname) {

        console.log(
            "Nessun nickname."
        );

        return;

    }


    knownPeers =
        caricaPeerSalvati();


    /*
        CREA ID STABILE
    */

    const mioPeerID =
        creaPeerID(
            currentNickname
        );


    console.log(
        "Nickname:",
        currentNickname
    );

    console.log(
        "Peer ID stabile:",
        mioPeerID
    );


    aggiornaStatoP2P(
        "🟡 Connessione..."
    );


    /*
        Se esiste già un Peer
        lo chiudiamo.
    */

    if (peer) {

        try {
            peer.destroy();
        } catch (error) {}

    }


    /*
        CREIAMO IL PEER
        CON ID STABILE
    */

    peer =
        new Peer(
            mioPeerID
        );


    /* =====================================================
       PEER PRONTO
    ===================================================== */

    peer.on(
        "open",
        function(id) {

            console.log(
                "🟢 Peer aperto:",
                id
            );


            /*
                Mostra il tuo ID
            */

            const idElement =
                document.getElementById(
                    "myPeerId"
                );


            if (idElement) {

                idElement.textContent =
                    id;

            }


            aggiornaStatoP2P(
                "🟢 Online"
            );


            /*
                Collegamento automatico
                ai peer già conosciuti
            */

            collegaPeerSalvati();


            /*
                Controllo ogni 2 secondi
            */

            avviaControlloP2P();

        }
    );


    /* =====================================================
       QUALCUNO SI COLLEGA A NOI
    ===================================================== */

    peer.on(
        "connection",
        function(conn) {

            configuraConnessione(
                conn
            );

        }
    );


    /* =====================================================
       ERRORE
    ===================================================== */

    peer.on(
        "error",
        function(error) {

            console.error(
                "Errore PeerJS:",
                error
            );


            if (
                error.type ===
                "unavailable-id"
            ) {

                /*
                    Lo stesso nickname/ID
                    è già aperto altrove.
                */

                aggiornaStatoP2P(
                    "⚠️ Questo nickname è già connesso"
                );

                return;

            }


            aggiornaStatoP2P(
                "🟡 Connessione persa..."
            );

        }
    );


    peer.on(
        "disconnected",
        function() {

            console.log(
                "Peer disconnesso."
            );


            aggiornaStatoP2P(
                "🟡 Riconnessione..."
            );


            /*
                Proviamo a ricollegare
                lo stesso Peer ID.
            */

            setTimeout(
                function() {

                    if (
                        peer &&
                        peer.destroyed === false
                    ) {

                        try {

                            peer.reconnect();

                        } catch (error) {

                            console.error(
                                error
                            );

                        }

                    }

                },
                500
            );

        }
    );

}


/* =========================================================
   COLLEGA PEER SALVATI
========================================================= */

function collegaPeerSalvati() {

    if (!peer) {
        return;
    }


    Object.keys(
        knownPeers
    ).forEach(
        function(nickname) {

            const peerID =
                knownPeers[
                    nickname
                ];


            if (!peerID) {
                return;
            }


            /*
                Non collegarsi a se stessi
            */

            if (
                peerID ===
                peer.id
            ) {

                return;

            }


            /*
                Controlliamo se è già connesso
            */

            const giaConnesso =
                p2pConnections.some(
                    function(conn) {

                        return (
                            conn.peer ===
                            peerID
                            &&
                            conn.open
                        );

                    }
                );


            if (giaConnesso) {
                return;
            }


            console.log(
                "🔗 Connessione automatica:",
                nickname,
                peerID
            );


            try {

                const conn =
                    peer.connect(
                        peerID,
                        {
                            reliable: true
                        }
                    );


                configuraConnessione(
                    conn
                );

            } catch (error) {

                console.error(
                    "Errore collegamento:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   CONFIGURA CONNESSIONE
========================================================= */

function configuraConnessione(
    conn
) {

    if (!conn) {
        return;
    }


    conn.on(
        "open",
        function() {

            console.log(
                "🟢 Collegato a:",
                conn.peer
            );


            /*
                Evita duplicati
            */

            const esistente =
                p2pConnections.find(
                    function(c) {

                        return (
                            c.peer ===
                            conn.peer
                        );

                    }
                );


            if (!esistente) {

                p2pConnections.push(
                    conn
                );

            }


            aggiornaStatoP2P(
                "🟢 Rete connessa"
            );


            aggiornaListaPeer();


            /*
                Prima cosa:
                ci presentiamo.
            */

            inviaMessaggio(
                conn,
                {
                    tipo:
                        "HELLO",

                    nickname:
                        currentNickname,

                    peerID:
                        peer.id
                }
            );


            /*
                Poi mandiamo la classifica.
            */

            inviaDatiCompleti(
                conn
            );

        }
    );


    conn.on(
        "data",
        function(data) {

            gestisciDatiP2P(
                data,
                conn
            );

        }
    );


    conn.on(
        "close",
        function() {

            p2pConnections =
                p2pConnections.filter(
                    function(c) {

                        return c !== conn;

                    }
                );


            aggiornaListaPeer();

        }
    );


    conn.on(
        "error",
        function(error) {

            console.error(
                "Errore connessione:",
                error
            );

        }
    );

}


/* =========================================================
   INVIA MESSAGGIO
========================================================= */

function inviaMessaggio(
    conn,
    messaggio
) {

    if (
        !conn ||
        !conn.open
    ) {

        return;

    }


    try {

        conn.send(
            messaggio
        );

    } catch (error) {

        console.error(
            "Errore invio:",
            error
        );

    }

}


/* =========================================================
   HELLO / SINCRONIZZAZIONE PEER
========================================================= */

function gestisciDatiP2P(
    data,
    conn
) {

    if (!data) {
        return;
    }


    /* =====================================================
       HELLO
    ===================================================== */

    if (
        data.tipo ===
        "HELLO"
    ) {

        if (
            data.nickname &&
            data.peerID
        ) {

            salvaPeer(
                data.nickname,
                data.peerID
            );

        }


        /*
            Ora che conosciamo il peer,
            possiamo provare a collegarci
            automaticamente in futuro.
        */

        return;

    }


    /* =====================================================
       SYNC
    ===================================================== */

    if (
        data.tipo ===
        "SYNC"
    ) {

        sincronizzaUtenti(
            data.utenti
        );


        /*
            Riceviamo anche gli altri peer
            conosciuti dal dispositivo.
        */

        if (
            data.peers
        ) {

            Object.keys(
                data.peers
            ).forEach(
                function(nickname) {

                    if (
                        nickname !==
                        currentNickname
                    ) {

                        salvaPeer(
                            nickname,
                            data.peers[
                                nickname
                            ]
                        );

                    }

                }
            );

        }


        /*
            Proviamo a collegarci
            agli altri.
        */

        collegaPeerSalvati();

        return;

    }


    /* =====================================================
       PUNTO AGGIUNTO
    ===================================================== */

    if (
        data.tipo ===
        "POINT"
    ) {

        /*
            Evita di applicare
            due volte lo stesso punto.
        */

        if (
            !data.eventID
        ) {

            return;

        }


        if (
            receivedMessages.has(
                data.eventID
            )
        ) {

            return;

        }


        receivedMessages.add(
            data.eventID
        );


        const nickname =
            data.nickname;


        if (!nickname) {
            return;
        }


        /*
            Crea utente se non esiste
        */

        if (
            !users[nickname]
        ) {

            users[nickname] = {

                score:
                    0,

                month:
                    getCurrentMonth(),

                photos:
                    []

            };

        }


        /*
            Aggiunge ESATTAMENTE 1 punto
        */

        users[nickname].score += 1;


        saveUsers();


        updateHome();

        updateRanking();

        updateGallery();


        /*
            Propaga agli altri peer,
            escluso quello da cui è arrivato.
        */

        p2pConnections.forEach(
            function(otherConn) {

                if (
                    otherConn !== conn &&
                    otherConn.open
                ) {

                    inviaMessaggio(
                        otherConn,
                        data
                    );

                }

            }
        );


        return;

    }

}


/* =========================================================
   INVIA SYNC
========================================================= */

function inviaDatiCompleti(
    conn
) {

    const utenti =
        {};


    Object.keys(
        users
    ).forEach(
        function(nickname) {

            const user =
                users[nickname];


            utenti[nickname] = {

                score:
                    Number(
                        user.score || 0
                    ),

                month:
                    user.month ||
                    getCurrentMonth()

            };

        }
    );


    inviaMessaggio(
        conn,
        {

            tipo:
                "SYNC",

            utenti:
                utenti,

            peers:
                knownPeers,

            mittente:
                currentNickname,

            peerID:
                peer
                    ? peer.id
                    : null

        }
    );

}


/* =========================================================
   SINCRONIZZA UTENTI
========================================================= */

function sincronizzaUtenti(utentiRicevuti) {

    if (!utentiRicevuti) {
        return;
    }

    let modificato = false;

    Object.keys(utentiRicevuti).forEach(
        function(nickname) {

            const remoto =
                utentiRicevuti[nickname];

            /*
                Se l'utente non esiste localmente,
                lo creiamo.
            */

            if (!users[nickname]) {

                users[nickname] = {

                    score:
                        Number(
                            remoto.score || 0
                        ),

                    month:
                        remoto.month ||
                        getCurrentMonth(),

                    photos:
                        []

                };

                modificato = true;

                return;
            }

            /*
                L'utente esiste già.

                NON sostituiamo mai il suo punteggio
                con uno più basso.
            */

            const locale =
                Number(
                    users[nickname].score || 0
                );

            const remotoScore =
                Number(
                    remoto.score || 0
                );

            if (remotoScore > locale) {

                users[nickname].score =
                    remotoScore;

                modificato = true;
            }
        }
    );

    /*
        Salviamo SOLO se qualcosa è cambiato.
    */

    if (modificato) {

        saveUsers();

    }

    /*
        In ogni caso aggiorniamo la classifica
        usando i dati LOCALI.
    */

    updateHome();
    updateRanking();
    updateGallery();
}


/* =========================================================
   INVIA +1
========================================================= */

function inviaAggiornamentoP2P(
    user
) {

    if (
        !user ||
        !currentNickname
    ) {

        return;

    }


    const eventID =
        currentNickname +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8);


    /*
        Lo segniamo come già ricevuto
        sul nostro dispositivo.
    */

    receivedMessages.add(
        eventID
    );


    const messaggio = {

        tipo:
            "POINT",

        eventID:
            eventID,

        nickname:
            currentNickname

    };


    p2pConnections.forEach(
        function(conn) {

            if (
                conn &&
                conn.open
            ) {

                inviaMessaggio(
                    conn,
                    messaggio
                );

            }

        }
    );

}


/* =========================================================
   CONTROLLO OGNI 2 SECONDI
========================================================= */

function avviaControlloP2P() {

    if (reconnectTimer) {

        clearInterval(
            reconnectTimer
        );

    }


    reconnectTimer =
        setInterval(
            function() {

                if (!peer) {
                    return;
                }


                /*
                    Peer disconnesso
                */

                if (
                    peer.disconnected &&
                    !peer.destroyed
                ) {

                    try {

                        peer.reconnect();

                    } catch (error) {

                        console.error(
                            error
                        );

                    }

                }


                /*
                    Ricollega i peer salvati
                */

                collegaPeerSalvati();


                aggiornaListaPeer();

            },
            2000
        );

}


/* =========================================================
   STATO
========================================================= */

function aggiornaStatoP2P(
    testo
) {

    const elemento =
        document.getElementById(
            "p2pStatus"
        );


    if (elemento) {

        elemento.textContent =
            testo;

    }

}


/* =========================================================
   LISTA CONNESSIONI
========================================================= */

function aggiornaListaPeer() {

    const elemento =
        document.getElementById(
            "connectedPeers"
        );


    if (!elemento) {
        return;
    }


    if (
        p2pConnections.length === 0
    ) {

        elemento.textContent =
            "Nessun giocatore collegato.";

        return;

    }


    /*
        Mostriamo i nickname,
        NON i Peer ID.
    */

    const nomi =
        p2pConnections.map(
            function(conn) {

                const nickname =
                    Object.keys(
                        knownPeers
                    ).find(
                        function(nome) {

                            return (
                                knownPeers[nome] ===
                                conn.peer
                            );

                        }
                    );


                return (
                    "🟢 " +
                    (
                        nickname ||
                        conn.peer
                    )
                );

            }
        );


    elemento.innerHTML =
        nomi.join(
            "<br>"
        );

}


/* =========================================================
   COLLEGAMENTO MANUALE
   SOLO PER IL PRIMO COLLEGAMENTO
========================================================= */

function collegaPeer() {

    const input =
        document.getElementById(
            "peerIdInput"
        );


    if (!input) {
        return;
    }


    const id =
        input.value.trim();


    if (!id) {

        aggiornaStatoP2P(
            "⚠️ Inserisci un ID"
        );

        return;

    }


    if (!peer) {

        aggiornaStatoP2P(
            "⚠️ P2P non pronto"
        );

        return;

    }


    if (
        id === peer.id
    ) {

        aggiornaStatoP2P(
            "⚠️ Questo è il tuo ID"
        );

        return;

    }


    /*
        Salviamo l'ID.

        Anche se non conosciamo ancora
        il nickname, lo salviamo con
        un identificatore tecnico.
    */

    let trovato =
        Object.keys(
            knownPeers
        ).find(
            function(nome) {

                return (
                    knownPeers[nome] ===
                    id
                );

            }
        );


    if (!trovato) {

        trovato =
            "peer-" +
            id;

    }


    knownPeers[trovato] =
        id;


    salvaPeerSalvati();


    aggiornaStatoP2P(
        "🟡 Connessione..."
    );


    try {

        const conn =
            peer.connect(
                id,
                {
                    reliable: true
                }
            );


        configuraConnessione(
            conn
        );

    } catch (error) {

        console.error(
            error
        );

        aggiornaStatoP2P(
            "🔴 Errore"
        );

    }

}


/* =========================================================
   AVVIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const button =
            document.getElementById(
                "connectPeerButton"
            );


        if (button) {

            button.addEventListener(
                "click",
                collegaPeer
            );

        }


        checkMonthlyReset();

        updateHome();
        updateRanking();
        updateGallery();

        avviaP2P();

    }
);

/* =========================================================
   AVVIO
========================================================= */

checkMonthlyReset();

initializeLoginScreen();
