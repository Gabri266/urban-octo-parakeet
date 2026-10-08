/* =========================================================
   CONFIGURAZIONE
========================================================= */
console.log("SCRIPT.JS CARICATO CORRETTAMENTE");

const GAME_CONFIG = {

    obiettivo: {
        nome: "Reperto",
        punti: 10
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

    const nickname =
        nicknameInput.value.trim();

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

function addPoint(imageData) {

    if (!currentNickname) {
        return;
    }

    const user =
        users[currentNickname];

    if (!user) {
        return;
    }

    const points =
        GAME_CONFIG.obiettivo.punti;

    /*
        Aggiungiamo punti
    */

    user.score +=
        points;

    /*
        Salviamo fotografia
    */

    user.photos.push({

        image:
            imageData,

        points:
            points,

        date:
            new Date().toISOString(),

        object:
            GAME_CONFIG.obiettivo.nome

    });

    /*
        Salvataggio
    */

    saveUsers();

    /*
        Aggiornamento interfaccia
    */

    updateHome();

    updateRanking();

    updateGallery();

    /*
        Risultato
    */

    if (verificationResult) {

        verificationResult.innerHTML = `

            <div class="verification-success">
                ✓ Oggetto riconosciuto
            </div>

            <p>
                +${points} punto${points === 1 ? "" : "i"}
            </p>

        `;

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

function updateGallery() {

    if (!gallery) {
        return;
    }

    gallery.innerHTML =
        "";

    if (!currentNickname) {
        return;
    }

    const user =
        users[currentNickname];

    if (!user) {
        return;
    }

    const photos =
        Array.isArray(user.photos)
            ? user.photos
            : [];

    /*
        Nessuna foto
    */

    if (photos.length === 0) {

        gallery.innerHTML = `

            <p class="empty-gallery">
                Non hai ancora nessun reperto.
            </p>

        `;

        return;
    }

    /*
        Dalla più recente alla più vecchia
    */

    const reversedPhotos =
        [...photos].reverse();

    reversedPhotos.forEach(
        photo => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "gallery-item";

            /*
                Immagine
            */

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                photo.image;

            image.alt =
                "Reperto";

            /*
                Informazioni
            */

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "gallery-info";

            info.textContent =
                `+${photo.points} punti • ${photo.object}`;

            item.appendChild(
                image
            );

            item.appendChild(
                info
            );

            gallery.appendChild(
                item
            );

        }
    );

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

let peer = null;
let p2pConnections = [];

/* Avvia P2P */
function avviaP2P() {

    if (typeof Peer === "undefined") {
        console.error("PeerJS non è stato caricato.");
        return;
    }

    peer = new Peer();

    peer.on("open", function(id) {

        console.log("ID P2P:", id);

        const idElement = document.getElementById("myPeerId");

        if (idElement) {
            idElement.textContent = id;
        }

        aggiornaStatoP2P("🟢 Online - pronto per collegarsi");
    });

    /* Quando QUALCUNO si collega a noi */
    peer.on("connection", function(conn) {

        configuraConnessione(conn);

    });

    peer.on("error", function(error) {

        console.error("Errore P2P:", error);

        aggiornaStatoP2P(
            "🔴 Errore: " + error.type
        );
    });
}


/* Collega questo dispositivo a un altro */
function collegaPeer() {

    const input = document.getElementById("peerIdInput");

    if (!input) return;

    const id = input.value.trim();

    if (!id) {
        aggiornaStatoP2P("⚠️ Inserisci un ID");
        return;
    }

    if (!peer) {
        aggiornaStatoP2P("⚠️ P2P non ancora pronto");
        return;
    }

    aggiornaStatoP2P("🟡 Connessione in corso...");

    const conn = peer.connect(id, {
        reliable: true
    });

    configuraConnessione(conn);
}


/* Configura una connessione */
function configuraConnessione(conn) {

    if (!conn) return;

    conn.on("open", function() {

        console.log(
            "Connesso a:",
            conn.peer
        );

        p2pConnections.push(conn);

        aggiornaStatoP2P(
            "🟢 Connesso a " + conn.peer
        );

        aggiornaListaPeer();

        /* Mandiamo subito i nostri dati */
        inviaDatiCompleti(conn);
    });


    conn.on("data", function(data) {

        console.log(
            "Dati ricevuti:",
            data
        );

        gestisciDatiP2P(data);
    });


    conn.on("close", function() {

        p2pConnections =
            p2pConnections.filter(
                c => c !== conn
            );

        aggiornaListaPeer();

        aggiornaStatoP2P(
            "🟡 Connessione chiusa"
        );
    });


    conn.on("error", function(error) {

        console.error(
            "Errore connessione:",
            error
        );
    });
}


/* Invia i nostri dati */
function inviaDatiCompleti(conn) {

    const dati = {
        tipo: "SYNC",
        utenti: caricaDatiP2P(),
        mittente:
            typeof currentNickname !== "undefined"
                ? currentNickname
                : null
    };

    conn.send(dati);
}


/* Recupera i dati locali */
function caricaDatiP2P() {

    try {

        const dati =
            localStorage.getItem("usersData");

        if (!dati) {
            return {};
        }

        return JSON.parse(dati);

    } catch (error) {

        console.error(
            "Errore lettura dati P2P:",
            error
        );

        return {};
    }
}


/* Ricezione dati */
function gestisciDatiP2P(data) {

    if (!data || !data.tipo) {
        return;
    }

    if (data.tipo === "SYNC") {

        console.log(
            "Sincronizzazione ricevuta:",
            data.utenti
        );

        sincronizzaUtenti(data.utenti);

    }

    if (data.tipo === "UPDATE") {

        sincronizzaUtente(data.utente);

    }
}


/* Sincronizza tutti gli utenti */
function sincronizzaUtenti(utentiRicevuti) {

    if (!utentiRicevuti) return;

    let utentiLocali = caricaDatiP2P();

    let modificato = false;

    Object.keys(utentiRicevuti).forEach(
        nickname => {

            if (!utentiLocali[nickname]) {

                utentiLocali[nickname] =
                    utentiRicevuti[nickname];

                modificato = true;

            } else {

                /*
                 * Per ora prendiamo il punteggio
                 * più alto conosciuto.
                 */

                const locale =
                    utentiLocali[nickname];

                const remoto =
                    utentiRicevuti[nickname];

                if (
                    remoto.score >
                    locale.score
                ) {

                    locale.score =
                        remoto.score;

                    modificato = true;
                }
            }
        }
    );


    if (modificato) {

        localStorage.setItem(
            "usersData",
            JSON.stringify(utentiLocali)
        );

        console.log(
            "Classifica sincronizzata!"
        );

        /*
         * Aggiorna la schermata
         * se le funzioni esistono.
         */

        if (
            typeof aggiornaRanking ===
            "function"
        ) {
            aggiornaRanking();
        }

        if (
            typeof aggiornaInterfaccia ===
            "function"
        ) {
            aggiornaInterfaccia();
        }
    }
}


/* Sincronizza un singolo utente */
function sincronizzaUtente(utente) {

    if (!utente || !utente.nickname) {
        return;
    }

    const utenti = caricaDatiP2P();

    utenti[utente.nickname] = utente;

    localStorage.setItem(
        "usersData",
        JSON.stringify(utenti)
    );
}


/* Invia un aggiornamento a tutti */
function inviaAggiornamentoP2P(utente) {

    const messaggio = {
        tipo: "UPDATE",
        utente: utente
    };

    p2pConnections.forEach(conn => {

        if (conn.open) {
            conn.send(messaggio);
        }

    });
}


/* Stato P2P */
function aggiornaStatoP2P(testo) {

    const elemento =
        document.getElementById("p2pStatus");

    if (elemento) {
        elemento.textContent = testo;
    }
}


/* Lista dispositivi collegati */
function aggiornaListaPeer() {

    const elemento =
        document.getElementById(
            "connectedPeers"
        );

    if (!elemento) return;

    if (p2pConnections.length === 0) {

        elemento.textContent =
            "Nessun giocatore collegato.";

        return;
    }

    elemento.innerHTML =
        p2pConnections
            .map(
                conn =>
                    `🟢 ${conn.peer}`
            )
            .join("<br>");
}


/* Pulsante collega */
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

        avviaP2P();
    }
);

/* =========================================================
   AVVIO
========================================================= */

checkMonthlyReset();

initializeLoginScreen();
