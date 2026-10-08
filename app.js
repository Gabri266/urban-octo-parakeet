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

/* =========================================================
   RETE P2P - PEERJS
========================================================= */

/* =========================================================
   RETE P2P - PEERJS
========================================================= */

let peer = null;
let p2pConnections = [];

let peerMap = {};
let knownPeers = [];

let reconnectTimer = null;


/* =========================================================
   STORAGE P2P
========================================================= */

function caricaPeerMap() {

    try {

        return JSON.parse(
            localStorage.getItem("peerMap") || "{}"
        );

    } catch (error) {

        console.error(
            "Errore caricamento peerMap:",
            error
        );

        return {};
    }

}


function salvaPeerMap() {

    localStorage.setItem(
        "peerMap",
        JSON.stringify(peerMap)
    );

}


function caricaKnownPeers() {

    try {

        return JSON.parse(
            localStorage.getItem("knownPeers") || "[]"
        );

    } catch (error) {

        return [];
    }

}


function salvaKnownPeers() {

    localStorage.setItem(
        "knownPeers",
        JSON.stringify(knownPeers)
    );

}


/* =========================================================
   AVVIO P2P
========================================================= */

function avviaP2P() {

    if (typeof Peer === "undefined") {

        console.error(
            "PeerJS non è stato caricato."
        );

        aggiornaStatoP2P(
            "🔴 PeerJS non disponibile"
        );

        return;
    }


    peerMap =
        caricaPeerMap();

    knownPeers =
        caricaKnownPeers();


    /*
        Proviamo a recuperare
        il Peer ID associato al nickname
    */

    const vecchioPeerID =
        currentNickname
            ? peerMap[currentNickname]
            : null;


    console.log(
        "Nickname:",
        currentNickname
    );

    console.log(
        "Vecchio Peer ID:",
        vecchioPeerID
    );


    /*
        Creiamo PeerJS.

        Se abbiamo già un ID,
        proviamo a riutilizzarlo.
    */

    try {

        if (vecchioPeerID) {

            peer =
                new Peer(vecchioPeerID);

        } else {

            peer =
                new Peer();

        }

    } catch (error) {

        console.error(
            "Errore creazione Peer:",
            error
        );

        peer =
            new Peer();
    }


    /* =====================================================
       PEER APERTO
    ===================================================== */

    peer.on(
        "open",
        function(id) {

            console.log(
                "ID P2P:",
                id
            );


            /*
                Associa nickname → Peer ID
            */

            if (currentNickname) {

                peerMap[currentNickname] =
                    id;

                salvaPeerMap();

            }


            /*
                Mostra ID solo per il test
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
                Prova subito a collegarsi
                ai peer conosciuti
            */

            collegaAConosciuti();


            /*
                Avvia controllo automatico
            */

            avviaControlloConnessioni();

        }
    );


    /* =====================================================
       RICEZIONE CONNESSIONE
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
                "Errore P2P:",
                error
            );


            /*
                Se l'ID era già occupato,
                significa che probabilmente
                il vecchio dispositivo è ancora
                collegato.

                Creiamo un nuovo ID.
            */

            if (
                error.type ===
                "unavailable-id"
            ) {

                console.log(
                    "Vecchio Peer ID occupato."
                );


                if (peer) {

                    try {
                        peer.destroy();
                    } catch (e) {}

                }


                /*
                    Creiamo nuovo Peer ID
                */

                setTimeout(
                    function() {

                        peer =
                            new Peer();

                        configuraNuovoPeer();

                    },
                    500
                );

                return;
            }


            aggiornaStatoP2P(
                "🟡 Riconnessione..."
            );

        }
    );
}


/* =========================================================
   CONFIGURA NUOVO PEER
========================================================= */

function configuraNuovoPeer() {

    peer.on(
        "open",
        function(id) {

            console.log(
                "Nuovo ID P2P:",
                id
            );


            if (currentNickname) {

                peerMap[currentNickname] =
                    id;

                salvaPeerMap();

            }


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


            collegaAConosciuti();

        }
    );


    peer.on(
        "connection",
        function(conn) {

            configuraConnessione(
                conn
            );

        }
    );


    peer.on(
        "error",
        function(error) {

            console.error(
                "Errore nuovo Peer:",
                error
            );

        }
    );
}


/* =========================================================
   COLLEGA PEER CONOSCIUTI
========================================================= */

function collegaAConosciuti() {

    if (!peer) {
        return;
    }


    if (peer.destroyed) {
        return;
    }


    knownPeers.forEach(
        function(peerID) {

            if (!peerID) {
                return;
            }


            /*
                Non collegare noi stessi
            */

            if (
                peerID ===
                peer.id
            ) {
                return;
            }


            /*
                Controlla se siamo
                già collegati
            */

            const giaConnesso =
                p2pConnections.some(
                    conn =>
                        conn.peer === peerID &&
                        conn.open
                );


            if (giaConnesso) {
                return;
            }


            console.log(
                "Tentativo connessione:",
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
                    "Errore connessione:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   CONFIGURA CONNESSIONE
========================================================= */

function configuraConnessione(conn) {

    if (!conn) {
        return;
    }


    /*
        Evita di registrare
        due volte la stessa connessione
    */

    const esistente =
        p2pConnections.find(
            c =>
                c.peer === conn.peer
        );


    if (esistente) {

        if (
            esistente.open
        ) {

            return;
        }

        p2pConnections =
            p2pConnections.filter(
                c =>
                    c !== esistente
            );

    }


    conn.on(
        "open",
        function() {

            console.log(
                "Connesso a:",
                conn.peer
            );


            /*
                Salviamo il peer
                tra quelli conosciuti
            */

            if (
                !knownPeers.includes(
                    conn.peer
                )
            ) {

                knownPeers.push(
                    conn.peer
                );

                salvaKnownPeers();

            }


            /*
                Aggiungiamo connessione
            */

            p2pConnections.push(
                conn
            );


            aggiornaStatoP2P(
                "🟢 Connesso"
            );


            aggiornaListaPeer();


            /*
                Mandiamo i nostri dati
            */

            inviaDatiCompleti(
                conn
            );

        }
    );


    conn.on(
        "data",
        function(data) {

            console.log(
                "Dati ricevuti:",
                data
            );


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
                    c =>
                        c !== conn
                );


            aggiornaListaPeer();


            aggiornaStatoP2P(
                "🟡 Riconnessione..."
            );

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
   INVIA DATI COMPLETI
========================================================= */

function inviaDatiCompleti(conn) {

    if (!conn) {
        return;
    }


    if (!conn.open) {
        return;
    }


    const utentiPubblici = {};


    /*
        Mandiamo SOLO nickname e punteggio.

        Le fotografie NON vengono inviate.
    */

    Object.keys(users).forEach(
        nickname => {

            const user =
                users[nickname];


            utentiPubblici[nickname] = {

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


    const dati = {

        tipo:
            "SYNC",

        utenti:
            utentiPubblici,

        mittente:
            currentNickname,

        peerID:
            peer
                ? peer.id
                : null

    };


    try {

        conn.send(
            dati
        );

    } catch (error) {

        console.error(
            "Errore invio dati:",
            error
        );

    }

}


/* =========================================================
   GESTIONE DATI
========================================================= */

function gestisciDatiP2P(
    data,
    conn
) {

    if (!data) {
        return;
    }


    /*
        Memorizziamo il Peer ID
        del dispositivo remoto
    */

    if (
        data.peerID &&
        data.peerID !== peer?.id
    ) {

        if (
            !knownPeers.includes(
                data.peerID
            )
        ) {

            knownPeers.push(
                data.peerID
            );

            salvaKnownPeers();

        }

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
            Dopo aver ricevuto la lista,
            proviamo a collegarci agli altri peer
        */

        collegaAConosciuti();

    }


    /* =====================================================
       UPDATE
    ===================================================== */

    if (
        data.tipo ===
        "UPDATE"
    ) {

        sincronizzaUtente(
            data.utente
        );

    }

}


/* =========================================================
   SINCRONIZZA UTENTI
========================================================= */

function sincronizzaUtenti(
    utentiRicevuti
) {

    if (!utentiRicevuti) {
        return;
    }


    let modificato =
        false;


    Object.keys(
        utentiRicevuti
    ).forEach(
        nickname => {

            const remoto =
                utentiRicevuti[
                    nickname
                ];


            /*
                Se l'utente non esiste
                localmente lo creiamo
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


                modificato =
                    true;

                return;
            }


            const locale =
                users[nickname];


            /*
                Prendiamo il punteggio
                più alto conosciuto.
            */

            if (
                Number(
                    remoto.score || 0
                ) >
                Number(
                    locale.score || 0
                )
            ) {

                locale.score =
                    Number(
                        remoto.score || 0
                    );

                modificato =
                    true;

            }

        }
    );


    if (modificato) {

        saveUsers();

        updateHome();

        updateRanking();

        updateGallery();

    }

}


/* =========================================================
   SINCRONIZZA SINGOLO UTENTE
========================================================= */

function sincronizzaUtente(
    utente
) {

    if (
        !utente ||
        !utente.nickname
    ) {

        return;
    }


    if (
        !users[
            utente.nickname
        ]
    ) {

        users[
            utente.nickname
        ] = {

            score:
                Number(
                    utente.score || 0
                ),

            month:
                utente.month ||
                getCurrentMonth(),

            photos:
                []

        };

    } else {

        users[
            utente.nickname
        ].score =
            Math.max(
                Number(
                    users[
                        utente.nickname
                    ].score || 0
                ),
                Number(
                    utente.score || 0
                )
            );

    }


    saveUsers();

    updateHome();

    updateRanking();

    updateGallery();

}


/* =========================================================
   INVIA AGGIORNAMENTO
========================================================= */

function inviaAggiornamentoP2P(
    utente
) {

    if (!utente) {
        return;
    }


    const messaggio = {

        tipo:
            "UPDATE",

        utente: {

            nickname:
                currentNickname,

            score:
                Number(
                    utente.score || 0
                ),

            month:
                utente.month ||
                getCurrentMonth()

        }

    };


    p2pConnections.forEach(
        conn => {

            if (
                conn &&
                conn.open
            ) {

                try {

                    conn.send(
                        messaggio
                    );

                } catch (error) {

                    console.error(
                        "Errore invio UPDATE:",
                        error
                    );

                }

            }

        }
    );

}


/* =========================================================
   CONTROLLO AUTOMATICO
========================================================= */

function avviaControlloConnessioni() {

    if (reconnectTimer) {

        clearInterval(
            reconnectTimer
        );

    }


    reconnectTimer =
        setInterval(
            function() {

                /*
                    Se PeerJS è morto,
                    lo ricreiamo
                */

                if (
                    !peer ||
                    peer.destroyed
                ) {

                    console.log(
                        "Peer non disponibile. Riavvio..."
                    );


                    avviaP2P();

                    return;
                }


                /*
                    Controlliamo i peer conosciuti
                */

                collegaAConosciuti();


                /*
                    Se non abbiamo connessioni
                    ma abbiamo peer conosciuti,
                    ritentiamo
                */

                if (
                    p2pConnections.length === 0 &&
                    knownPeers.length > 0
                ) {

                    aggiornaStatoP2P(
                        "🟡 Riconnessione..."
                    );

                    collegaAConosciuti();

                }


                aggiornaListaPeer();

            },
            2000
        );

}


/* =========================================================
   STATO P2P
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
   LISTA PEER
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


    elemento.innerHTML =
        p2pConnections
            .map(
                conn =>
                    `🟢 ${conn.peer}`
            )
            .join(
                "<br>"
            );

}


/* =========================================================
   PULSANTE COLLEGA
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


        avviaP2P();

    }
);


/* =========================================================
   COLLEGA MANUALMENTE
   (PER IL TEST)
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
            "⚠️ Non puoi collegarti a te stesso"
        );

        return;
    }


    /*
        Salviamo il peer
        per i prossimi caricamenti
    */

    if (
        !knownPeers.includes(id)
    ) {

        knownPeers.push(id);

        salvaKnownPeers();

    }


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
            "🔴 Errore connessione"
        );

    }

}

/* =========================================================
   AVVIO
========================================================= */

checkMonthlyReset();

initializeLoginScreen();
