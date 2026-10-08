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
        Ogni fotografia viene considerata valida.
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

const profileNickname =
    document.getElementById("profileNickname");

const profileScore =
    document.getElementById("profileScore");

const adminArea =
    document.getElementById("adminArea");

const adminPhotosButton =
    document.getElementById("adminPhotosButton");

const adminConsoleButton =
    document.getElementById("adminConsoleButton");


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

let isAdmin =
    getCookie("isAdmin") === "1";


function pulisciNickname(nickname) {

    if (
        typeof nickname === "string" &&
        nickname.startsWith("!%")
    ) {
        return nickname.substring(2).trim();
    }

    return nickname;
}


function controllaAdmin(nickname) {

    return (
        typeof nickname === "string" &&
        nickname.startsWith("!%")
    );

}


/* =========================================================
   DATABASE LOCALE
========================================================= */

let users =
    loadUsers();


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
            parsed === null ||
            Array.isArray(parsed)
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
            "Errore nel salvataggio degli utenti:",
            error
        );

    }

}


/* =========================================================
   DATABASE FOTO - INDEXEDDB
========================================================= */

const PHOTO_DB_NAME =
    "PuntiPhotosDB";

const PHOTO_STORE_NAME =
    "photos";


function openPhotoDB() {

    return new Promise(
        (resolve, reject) => {

            if (!("indexedDB" in window)) {

                reject(
                    new Error(
                        "IndexedDB non disponibile."
                    )
                );

                return;
            }

            const request =
                indexedDB.open(
                    PHOTO_DB_NAME,
                    1
                );

            request.onupgradeneeded =
                function(event) {

                    const db =
                        event.target.result;

                    if (
                        !db.objectStoreNames.contains(
                            PHOTO_STORE_NAME
                        )
                    ) {

                        db.createObjectStore(
                            PHOTO_STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };


            request.onsuccess =
                function() {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


async function salvaFotoDB(
    photoId,
    imageData
) {

    const db =
        await openPhotoDB();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    PHOTO_STORE_NAME,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    PHOTO_STORE_NAME
                );

            store.put({
                id: photoId,
                image: imageData
            });

            transaction.oncomplete =
                function() {

                    db.close();
                    resolve();

                };

            transaction.onerror =
                function() {

                    db.close();
                    reject(
                        transaction.error
                    );

                };

        }
    );

}


async function caricaFotoDB(
    photoId
) {

    const db =
        await openPhotoDB();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    PHOTO_STORE_NAME,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    PHOTO_STORE_NAME
                );

            const request =
                store.get(photoId);

            request.onsuccess =
                function() {

                    db.close();

                    resolve(
                        request.result
                            ? request.result.image
                            : null
                    );

                };

            request.onerror =
                function() {

                    db.close();

                    reject(
                        request.error
                    );

                };

        }
    );

}


async function eliminaFotoDB(
    photoId
) {

    const db =
        await openPhotoDB();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    PHOTO_STORE_NAME,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    PHOTO_STORE_NAME
                );

            store.delete(
                photoId
            );

            transaction.oncomplete =
                function() {

                    db.close();
                    resolve();

                };

            transaction.onerror =
                function() {

                    db.close();

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =========================================================
   CREAZIONE UTENTE
========================================================= */

function createUser(nickname) {

    if (!nickname) {
        return;
    }

    if (!users[nickname]) {

        users[nickname] = {

            score: 0,

            month:
                getCurrentMonth(),

            photos: []

        };

        saveUsers();

        return;
    }

    /*
        Sistema eventuali dati vecchi/mancanti.
    */

    if (
        typeof users[nickname] !== "object" ||
        users[nickname] === null
    ) {

        users[nickname] = {

            score: 0,

            month:
                getCurrentMonth(),

            photos: []

        };

        saveUsers();

        return;
    }

    if (
        typeof users[nickname].score !== "number"
    ) {

        users[nickname].score = 0;

    }

    if (
        !Array.isArray(
            users[nickname].photos
        )
    ) {

        users[nickname].photos = [];

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
        function(nickname) {

            let user =
                users[nickname];

            /*
                Riparazione dati corrotti.
            */

            if (
                !user ||
                typeof user !== "object"
            ) {

                users[nickname] = {

                    score: 0,

                    month:
                        currentMonth,

                    photos: []

                };

                changed = true;
                return;
            }


            if (
                !Array.isArray(
                    user.photos
                )
            ) {

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


    const nicknameInserito =
        nicknameInput.value.trim();


    /*
        Controllo vuoto.
    */

    if (
        nicknameInserito === ""
    ) {

        if (loginError) {

            loginError.textContent =
                "Inserisci un nickname.";

        }

        nicknameInput.focus();

        return;
    }


    /*
        Controllo ADMIN.
        !%Gaciolas -> Gaciolas
    */

    const admin =
        controllaAdmin(
            nicknameInserito
        );


    const nickname =
        admin
            ? pulisciNickname(
                nicknameInserito
            )
            : nicknameInserito;


    /*
        Controllo nickname vuoto
        dopo !%.
    */

    if (
        nickname === ""
    ) {

        if (loginError) {

            loginError.textContent =
                "Inserisci un nickname dopo !%.";

        }

        nicknameInput.focus();

        return;
    }


    /*
        Controllo lunghezza
        sul nickname effettivo.
    */

    if (
        nickname.length > 22
    ) {

        if (loginError) {

            loginError.textContent =
                "Il nickname è troppo lungo.";

        }

        nicknameInput.focus();

        return;
    }


    /*
        LOGIN
    */

    currentNickname =
        nickname;

    isAdmin =
        admin;


    /*
        Salvataggio cookie.
    */

    setCookie(
        "nickname",
        currentNickname,
        365
    );

    setCookie(
        "isAdmin",
        isAdmin
            ? "1"
            : "0",
        365
    );


    /*
        Crea utente.
    */

    createUser(
        currentNickname
    );


    /*
        Pulizia errore.
    */

    if (loginError) {

        loginError.textContent =
            "";

    }


    /*
        Nasconde login.
    */

    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }


    /*
        Mostra app.
    */

    if (app) {

        app.classList.remove(
            "hidden"
        );

    }


    /*
        Avvio applicazione.
        Comprende anche il P2P.
    */

    initializeApplication();

}


/* =========================================================
   ENTER DA TASTIERA
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginBtn =
        document.getElementById("loginButton");

    const nicknameField =
        document.getElementById("nicknameInput");

    if (!loginBtn) {
        console.error("ERRORE: loginButton non trovato");
        return;
    }

    if (!nicknameField) {
        console.error("ERRORE: nicknameInput non trovato");
        return;
    }

    console.log("✅ LOGIN PRONTO");

    loginBtn.addEventListener("click", function () {

        console.log("✅ CLICK LOGIN");

        login();

    });

    nicknameField.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            console.log("✅ ENTER LOGIN");

            login();

        }

    });

});


/* =========================================================
   PROFILO
========================================================= */

function updateProfile() {

    if (!currentNickname) {
        return;
    }

    const user =
        users[currentNickname];


    if (!user) {
        return;
    }


    if (profileNickname) {

        profileNickname.textContent =
            currentNickname;

    }


    if (profileScore) {

        profileScore.textContent =
            Number(
                user.score || 0
            );

    }


    if (adminArea) {

        if (isAdmin) {

            adminArea.classList.remove(
                "hidden"
            );

        } else {

            adminArea.classList.add(
                "hidden"
            );

        }

    }

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

    updateProfile();


    /*
        Avvia il P2P dopo il login.
    */

    avviaP2P();

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
            Number(
                user.score || 0
            );

    }


    if (levelDisplay) {

        levelDisplay.textContent =
            getLevel(
                Number(
                    user.score || 0
                )
            );

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
            score >=
            level.minimo
        ) {

            selectedLevel =
                level;

        }

    }


    return selectedLevel.nome;

}


/* =========================================================
   PULSANTE AGGIUNGI
========================================================= */

if (addButton) {

    addButton.addEventListener(
        "click",
        function() {

            if (!currentNickname) {

                return;
            }


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

        /*
            File -> Data URL
        */

        const imageData =
            await fileToDataURL(
                file
            );


        /*
            Anteprima.
        */

        if (previewImage) {

            previewImage.src =
                imageData;

        }


        if (verificationResult) {

            verificationResult.innerHTML =
                "";

        }


        /*
            Apre modale.
        */

        if (photoModal) {

            photoModal.classList.remove(
                "hidden"
            );

        }


        /*
            Verifica fotografia.
        */

        const result =
            await verificaFoto(
                file
            );


        /*
            Foto valida.
        */

        if (result.trovato) {

            await addPoint(
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
   FILE -> DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function() {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function() {

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
        Futuro sistema AI.
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
   AGGIUNTA PUNTO
========================================================= */

async function addPoint(imageData) {

    if (!currentNickname) {
        return;
    }


    const user =
        users[currentNickname];


    if (!user) {
        return;
    }


    /*
        Protezione dati vecchi.
    */

    if (
        !Array.isArray(
            user.photos
        )
    ) {

        user.photos = [];

    }


    const points = 1;


    /*
        ID univoco della foto.
    */

    const photoId =
        currentNickname +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9);


    try {

        /*
            Prima salviamo fisicamente
            la foto in IndexedDB.
        */

        await salvaFotoDB(
            photoId,
            imageData
        );


        /*
            Aggiungiamo il punto.
        */

        user.score += points;


        /*
            Salviamo i dati della foto
            in localStorage.
        */

        user.photos.push({

            id:
                photoId,

            points:
                points,

            date:
                new Date().toISOString(),

            object:
                GAME_CONFIG.obiettivo.nome,

            valid:
                true

        });


        saveUsers();


        /*
            Aggiornamento P2P.
        */

if (
    typeof inviaAggiornamentoP2P ===
    "function"
) {

    inviaAggiornamentoP2P(
        user
    );

}

const ultimaFoto =
    user.photos[user.photos.length - 1];

if (
    ultimaFoto &&
    typeof inviaFotoP2P ===
    "function"
) {

    inviaFotoP2P(
        currentNickname,
        ultimaFoto
    );

}


        /*
            Aggiornamento interfaccia.
        */

        updateHome();

        updateRanking();

        updateGallery();

        updateProfile();


        /*
            Risultato.
        */

        if (verificationResult) {

            verificationResult.innerHTML = `

                <div class="verification-success">
                    ✓ Oggetto riconosciuto
                </div>

                <p>
                    +1 punto
                </p>

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
            .filter(
                function(nickname) {

                    return (
                        users[nickname] &&
                        typeof users[nickname] ===
                        "object"
                    );

                }
            )
            .map(
                function(nickname) {

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
                function(a, b) {

                    return (
                        b.score -
                        a.score
                    );

                }
            );


    /*
        Nessun utente.
    */

    if (
        ranking.length === 0
    ) {

        rankingContainer.innerHTML = `

            <p>
                Nessun giocatore presente.
            </p>

        `;

        return;
    }


    /*
        Creazione classifica.
    */

    ranking.forEach(
        function(user, index) {

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
                "#" +
                (index + 1);


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
                user.score +
                " pt";


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
        Nessuna foto.
    */

    if (
        photos.length === 0
    ) {

        gallery.innerHTML = `

            <p class="empty-gallery">
                Non hai ancora nessun reperto.
            </p>

        `;

        return;
    }


    /*
        Più recente prima.
    */

    const reversedPhotos =
        [...photos].reverse();


    for (
        const photo
        of reversedPhotos
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "gallery-item";


        const image =
            document.createElement(
                "img"
            );


        image.alt =
            "Reperto";


        image.className =
            "gallery-photo";


        try {

            const imageData =
                await caricaFotoDB(
                    photo.id
                );


            if (imageData) {

                image.src =
                    imageData;

            } else {

                image.alt =
                    "Foto non disponibile";

            }

        } catch (error) {

            console.error(
                "Errore caricamento foto:",
                error
            );

            image.alt =
                "Foto non disponibile";

        }


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "gallery-info";


        info.textContent =
            `+${Number(photo.points || 1)} punto • ${photo.object || GAME_CONFIG.obiettivo.nome}`;


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

}


/* =========================================================
   NAVIGAZIONE
========================================================= */

const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );


navButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const pageID =
                    button.dataset.page;


                if (!pageID) {
                    return;
                }


                /*
                    Nascondi tutte
                    le pagine.
                */

                document
                    .querySelectorAll(
                        ".page"
                    )
                    .forEach(
                        function(page) {

                            page.classList.remove(
                                "active"
                            );

                        }
                    );


                /*
                    Mostra pagina scelta.
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
                    Aggiorna pulsanti.
                */

                navButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                /*
                    Aggiorna profilo
                    quando viene aperto.
                */

                if (
                    pageID ===
                    "profilePage"
                ) {

                    updateProfile();

                }

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
        function() {

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
        function(event) {

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
   LOGIN AUTOMATICO DA COOKIE
========================================================= */

function initializeLoginScreen() {

    const savedNickname =
        getCookie("nickname");


    if (savedNickname) {

        currentNickname =
            savedNickname;

        isAdmin =
            getCookie("isAdmin") === "1";


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
        Nessun login salvato.
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

let peer =
    null;


let p2pConnections =
    [];


let knownPeers =
    {};


let receivedMessages =
    new Set();
let photoTransfers =
    new Map();

let reconnectTimer =
    null;


/* =========================================================
   ID STABILE
========================================================= */

function creaPeerID(nickname) {

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

        const saved =
            localStorage.getItem(
                "knownPeers"
            );


        if (!saved) {
            return {};
        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {

            return {};

        }


        return parsed;

    } catch (error) {

        console.error(
            "Errore knownPeers:",
            error
        );

        return {};

    }

}


function salvaPeerSalvati() {

    try {

        localStorage.setItem(
            "knownPeers",
            JSON.stringify(
                knownPeers
            )
        );

    } catch (error) {

        console.error(
            "Errore salvataggio peer:",
            error
        );

    }

}


/* =========================================================
   SALVA PEER
========================================================= */

function salvaPeer(
    nickname,
    peerID
) {

    if (
        !nickname ||
        !peerID
    ) {

        return;
    }


    knownPeers[nickname] =
        peerID;


    salvaPeerSalvati();

}

/* =========================================================
   INVIO FOTO A PEZZI
========================================================= */

async function inviaFotoP2P(
    nickname,
    photo
) {

    if (
        !nickname ||
        !photo
    ) {
        return;
    }

    try {

        const imageData =
            await caricaFotoDB(
                photo.id
            );

        if (!imageData) {

            console.warn(
                "Immagine non trovata:",
                photo.id
            );

            return;
        }


        for (
            const conn of p2pConnections
        ) {

            if (
                conn &&
                conn.open
            ) {

                await inviaSingolaFotoP2P(
                    conn,
                    nickname,
                    photo,
                    imageData
                );

            }

        }

    } catch (error) {

        console.error(
            "Errore invio foto P2P:",
            error
        );

    }

}


/* =========================================================
   INVIA TUTTE LE FOTO DI UN UTENTE
========================================================= */

async function inviaFotoUtenteP2P(
    conn,
    nickname
) {

    if (
        !conn ||
        !conn.open ||
        !nickname
    ) {

        return;
    }


    const user =
        users[nickname];

    if (
        !user ||
        !Array.isArray(user.photos)
    ) {

        return;
    }


    for (
        const photo of user.photos
    ) {

        await inviaSingolaFotoDaDB(
            conn,
            nickname,
            photo
        );

    }

}


/* =========================================================
   INVIA SINGOLA FOTO
========================================================= */

async function inviaSingolaFotoDaDB(
    conn,
    nickname,
    photo
) {

    try {

        const imageData =
            await caricaFotoDB(
                photo.id
            );

        if (!imageData) {
            return;
        }

        await inviaSingolaFotoP2P(
            conn,
            nickname,
            photo,
            imageData
        );

    } catch (error) {

        console.error(
            "Errore invio singola foto:",
            error
        );

    }

}


/* =========================================================
   TRASFERIMENTO A BLOCCHI
========================================================= */

async function inviaSingolaFotoP2P(
    conn,
    nickname,
    photo,
    imageData
) {

    if (
        !conn ||
        !conn.open
    ) {

        return;
    }


    const transferID =
        nickname +
        "-" +
        photo.id +
        "-" +
        Date.now();


    /*
        Blocchi piccoli per evitare
        messaggi WebRTC troppo grandi.
    */

    const CHUNK_SIZE =
        32000;


    const totalChunks =
        Math.ceil(
            imageData.length /
            CHUNK_SIZE
        );


    /*
        START
    */

    inviaMessaggio(
        conn,
        {

            tipo:
                "PHOTO_START",

            transferID:
                transferID,

            nickname:
                nickname,

            totalChunks:
                totalChunks,

            photo: {

                id:
                    photo.id,

                points:
                    photo.points,

                date:
                    photo.date,

                object:
                    photo.object,

                valid:
                    photo.valid !== false

            }

        }
    );


    /*
        CHUNKS
    */

    for (
        let i = 0;
        i < totalChunks;
        i++
    ) {

        if (!conn.open) {
            return;
        }


        const start =
            i *
            CHUNK_SIZE;


        const chunk =
            imageData.substring(
                start,
                start +
                CHUNK_SIZE
            );


        inviaMessaggio(
            conn,
            {

                tipo:
                    "PHOTO_CHUNK",

                transferID:
                    transferID,

                index:
                    i,

                chunk:
                    chunk

            }
        );


        /*
            Piccola pausa per
            non saturare il canale.
        */

        await new Promise(
            function(resolve) {

                setTimeout(
                    resolve,
                    5
                );

            }
        );

    }


    /*
        END
    */

    if (conn.open) {

        inviaMessaggio(
            conn,
            {

                tipo:
                    "PHOTO_END",

                transferID:
                    transferID

            }
        );

    }

}


/* =========================================================
   RICHIEDI TUTTE LE FOTO AGLI ALTRI
========================================================= */

function richiediTutteLeFotoP2P() {

    const richiesta = {

        tipo:
            "PHOTO_REQUEST",

        mittente:
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
                    richiesta
                );

            }

        }
    );

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
            "Nessun nickname: P2P non avviato."
        );

        return;

    }


    knownPeers =
        caricaPeerSalvati();


    /*
        ID stabile basato sul nickname.
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
        Chiudi peer precedente.
    */

    if (peer) {

        try {

            peer.destroy();

        } catch (error) {

            console.error(
                "Errore chiusura peer precedente:",
                error
            );

        }

    }


    p2pConnections =
        [];


    /*
        Crea peer con ID stabile.
    */

    try {

        peer =
            new Peer(
                mioPeerID
            );

    } catch (error) {

        console.error(
            "Errore creazione PeerJS:",
            error
        );

        aggiornaStatoP2P(
            "🔴 Errore PeerJS"
        );

        return;

    }


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
                Collegamento automatico.
            */

            collegaPeerSalvati();


            /*
                Controllo ogni 2 secondi.
            */

            avviaControlloP2P();

        }
    );


    /* =====================================================
       QUALCUNO SI COLLEGA
    ===================================================== */

    peer.on(
        "connection",
        function(conn) {

            configuraConnessione(
                conn
            );
            inviaTutteLeFoto(
                conn
            );
        }
    );


    /* =====================================================
       ERRORE PEER
    ===================================================== */

    peer.on(
        "error",
        function(error) {

            console.error(
                "Errore PeerJS:",
                error
            );


            if (
                error &&
                error.type ===
                "unavailable-id"
            ) {

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


    /* =====================================================
       PEER DISCONNESSO
    ===================================================== */

    peer.on(
        "disconnected",
        function() {

            console.log(
                "Peer disconnesso."
            );


            aggiornaStatoP2P(
                "🟡 Riconnessione..."
            );


            setTimeout(
                function() {

                    if (
                        peer &&
                        !peer.destroyed
                    ) {

                        try {

                            peer.reconnect();

                        } catch (error) {

                            console.error(
                                "Errore reconnect:",
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


    if (
        peer.destroyed
    ) {

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
                Non collegarsi a se stessi.
            */

            if (
                peerID ===
                peer.id
            ) {

                return;

            }


            /*
                Controllo duplicati.
            */

            const giaConnesso =
                p2pConnections.some(
                    function(conn) {

                        return (
                            conn &&
                            conn.peer ===
                            peerID &&
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
                Evita duplicati.
            */

            const esistente =
                p2pConnections.find(
                    function(c) {

                        return (
                            c &&
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
                HELLO
            */

            inviaMessaggio(
                conn,
                {

                    tipo:
                        "HELLO",

                    nickname:
                        currentNickname,

                    peerID:
                        peer
                            ? peer.id
                            : null

                }
            );


            /*
                SYNC
            */

            inviaDatiCompleti(
                conn
            );
            for (
                const nickname of Object.keys(users)
            ) {
            
                inviaFotoUtenteP2P(
                    conn,
                    nickname
                );
            
            }
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

                        return (
                            c !== conn
                        );

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
   GESTIONE DATI P2P
========================================================= */
async function inviaTutteLeFoto(conn) {

    if (
        !conn ||
        !conn.open
    ) {
        return;
    }

    for (
        const nickname of Object.keys(users)
    ) {

        const user =
            users[nickname];

        if (
            !user ||
            !Array.isArray(user.photos)
        ) {
            continue;
        }

        for (
            const photo of user.photos
        ) {

            try {

                const imageData =
                    await caricaFotoDB(
                        photo.id
                    );

                if (!imageData) {
                    continue;
                }

                inviaMessaggio(
                    conn,
                    {

                        tipo: "PHOTO",

                        eventID:
                            "sync-" +
                            photo.id,

                        nickname:
                            nickname,

                        photo: {

                            id:
                                photo.id,

                            points:
                                photo.points,

                            date:
                                photo.date,

                            object:
                                photo.object,

                            valid:
                                photo.valid !== false

                        },

                        image:
                            imageData

                    }
                );

            } catch (error) {

                console.error(
                    "Errore invio foto:",
                    error
                );

            }

        }

    }

}
/* =========================================================
   GESTIONE DATI P2P
========================================================= */

async function gestisciDatiP2P(data, conn) {

    if (!data) {
        return;
    }


    /* =====================================================
       HELLO
    ===================================================== */

    if (data.tipo === "HELLO") {

        if (
            data.nickname &&
            data.peerID
        ) {

            salvaPeer(
                data.nickname,
                data.peerID
            );

            aggiornaListaPeer();

        }

        return;
    }


    /* =====================================================
       SYNC
    ===================================================== */

    if (data.tipo === "SYNC") {

        sincronizzaUtenti(
            data.utenti
        );

        if (
            data.peers &&
            typeof data.peers === "object"
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
                            data.peers[nickname]
                        );

                    }

                }
            );

        }

        collegaPeerSalvati();

        return;
    }


    /* =====================================================
       POINT
    ===================================================== */

    if (data.tipo === "POINT") {

        if (!data.eventID) {
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


        if (!users[nickname]) {

            users[nickname] = {

                score: 0,

                month:
                    getCurrentMonth(),

                photos: []

            };

        }


        if (
            typeof users[nickname].score !==
            "number"
        ) {

            users[nickname].score = 0;

        }


        users[nickname].score += 1;

        saveUsers();


        updateHome();
        updateRanking();
        updateGallery();
        updateProfile();


        p2pConnections.forEach(
            function(otherConn) {

                if (
                    otherConn &&
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


    /* =====================================================
       RICHIESTA FOTO
    ===================================================== */

    if (data.tipo === "PHOTO_REQUEST") {

        if (data.nickname) {

            await inviaFotoUtenteP2P(
                conn,
                data.nickname
            );

        } else {

            for (
                const nickname of Object.keys(users)
            ) {

                await inviaFotoUtenteP2P(
                    conn,
                    nickname
                );

            }

        }

        return;
    }


    /* =====================================================
       PHOTO_START
    ===================================================== */

    if (data.tipo === "PHOTO_START") {

        if (
            !data.transferID ||
            !data.nickname ||
            !data.photo
        ) {

            return;
        }


        photoTransfers.set(
            data.transferID,
            {

                nickname:
                    data.nickname,

                photo:
                    data.photo,

                totalChunks:
                    Number(
                        data.totalChunks || 0
                    ),

                chunks:
                    [],

                received:
                    0

            }
        );

        return;
    }


    /* =====================================================
       PHOTO_CHUNK
    ===================================================== */

    if (data.tipo === "PHOTO_CHUNK") {

        const transfer =
            photoTransfers.get(
                data.transferID
            );


        if (!transfer) {
            return;
        }


        if (
            typeof data.index !== "number" ||
            typeof data.chunk !== "string"
        ) {

            return;
        }


        if (
            typeof transfer.chunks[data.index] ===
            "undefined"
        ) {

            transfer.chunks[data.index] =
                data.chunk;

            transfer.received += 1;

        }

        return;
    }


    /* =====================================================
       PHOTO_END
    ===================================================== */

    if (data.tipo === "PHOTO_END") {

        const transfer =
            photoTransfers.get(
                data.transferID
            );


        if (!transfer) {
            return;
        }


        if (
            transfer.received !==
            transfer.totalChunks
        ) {

            console.warn(
                "Trasferimento foto incompleto:",
                data.transferID
            );

            return;
        }


        const imageData =
            transfer.chunks.join("");


        try {

            await salvaFotoDB(
                transfer.photo.id,
                imageData
            );


            if (
                !users[transfer.nickname]
            ) {

                users[transfer.nickname] = {

                    score: 0,

                    month:
                        getCurrentMonth(),

                    photos: []

                };

            }


            const user =
                users[transfer.nickname];


            if (
                !Array.isArray(
                    user.photos
                )
            ) {

                user.photos = [];

            }


            const giaPresente =
                user.photos.some(
                    function(photo) {

                        return (
                            photo.id ===
                            transfer.photo.id
                        );

                    }
                );


            if (!giaPresente) {

                user.photos.push({

                    id:
                        transfer.photo.id,

                    points:
                        Number(
                            transfer.photo.points || 1
                        ),

                    date:
                        transfer.photo.date ||
                        new Date().toISOString(),

                    object:
                        transfer.photo.object ||
                        GAME_CONFIG.obiettivo.nome,

                    valid:
                        transfer.photo.valid !== false

                });


                saveUsers();

            }


            updateHome();
            updateRanking();
            updateGallery();
            updateProfile();


            aggiornaAdminFotoOverlay();


        } catch (error) {

            console.error(
                "Errore salvataggio foto ricevuta:",
                error
            );

        }


        photoTransfers.delete(
            data.transferID
        );

        return;
    }

}

    /* =====================================================
       PUNTO AGGIUNTO
    ===================================================== */


/* =========================================================
   INVIA SYNC COMPLETO
========================================================= */

function inviaDatiCompleti(
    conn
) {

    if (!conn) {
        return;
    }


    const utenti =
        {};


    Object.keys(
        users
    ).forEach(
        function(nickname) {

            const user =
                users[nickname];


            if (
                !user ||
                typeof user !==
                "object"
            ) {

                return;

            }


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

function sincronizzaUtenti(
    utentiRicevuti
) {

    if (
        !utentiRicevuti ||
        typeof utentiRicevuti !==
        "object"
    ) {

        return;
    }


    let modificato =
        false;


    Object.keys(
        utentiRicevuti
    ).forEach(
        function(nickname) {

            const remoto =
                utentiRicevuti[nickname];


            if (
                !remoto ||
                typeof remoto !==
                "object"
            ) {

                return;

            }


            const remotoScore =
                Number(
                    remoto.score || 0
                );


            /*
                Se l'utente non esiste
                localmente lo creiamo.
            */

            if (
                !users[nickname]
            ) {

                users[nickname] = {

                    score:
                        remotoScore,

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


            /*
                Ripristina struttura
                se necessario.
            */

            if (
                !Array.isArray(
                    users[nickname].photos
                )
            ) {

                users[nickname].photos = [];

                modificato =
                    true;

            }


            if (
                typeof users[nickname].score !==
                "number"
            ) {

                users[nickname].score = 0;

                modificato =
                    true;

            }


            const locale =
                Number(
                    users[nickname].score || 0
                );


            /*
                Non sostituiamo
                un punteggio alto con uno basso.
            */

            if (
                remotoScore >
                locale
            ) {

                users[nickname].score =
                    remotoScore;

                modificato =
                    true;

            }

        }
    );


    if (modificato) {

        saveUsers();

    }


    updateHome();

    updateRanking();

    updateGallery();

    updateProfile();

}


/* =========================================================
   INVIA +1
========================================================= */

function inviaAggiornamentoP2P(
    user,
    photo,
    imageData
) {

    if (
        !user ||
        !photo ||
        !currentNickname ||
        !imageData
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

    receivedMessages.add(
        eventID
    );

    const messaggio = {

        tipo: "PHOTO",

        eventID: eventID,

        nickname: currentNickname,

        photo: {
            id: photo.id,
            points: photo.points,
            date: photo.date,
            object: photo.object,
            valid: photo.valid
        },

        image: imageData

    };

    /*
        Invia foto a tutti
        i peer connessi.
    */

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

                if (
                    !peer
                ) {

                    return;

                }


                if (
                    peer.destroyed
                ) {

                    return;

                }


                /*
                    Peer disconnesso.
                */

                if (
                    peer.disconnected
                ) {

                    try {

                        peer.reconnect();

                    } catch (error) {

                        console.error(
                            "Errore reconnect:",
                            error
                        );

                    }

                }


                /*
                    Ricollega peer salvati.
                */

                if (
                    !peer.disconnected
                ) {

                    collegaPeerSalvati();

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


    /*
        Mantiene solo connessioni realmente aperte.
    */

    p2pConnections =
        p2pConnections.filter(
            function(conn) {

                return (
                    conn &&
                    conn.open
                );

            }
        );


    if (
        p2pConnections.length ===
        0
    ) {

        elemento.textContent =
            "Nessun giocatore collegato.";

        return;

    }


    /*
        Mostra nickname,
        non Peer ID quando conosciuto.
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
        peer.destroyed
    ) {

        aggiornaStatoP2P(
            "⚠️ Peer non disponibile"
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
        Controlla se l'ID
        è già conosciuto.
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


    /*
        Se non conosce il nickname,
        crea un identificatore tecnico.
    */

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


    /*
        Evita connessioni duplicate.
    */

    const giaConnesso =
        p2pConnections.some(
            function(conn) {

                return (
                    conn &&
                    conn.peer ===
                    id &&
                    conn.open
                );

            }
        );


    if (giaConnesso) {

        aggiornaStatoP2P(
            "🟢 Già connesso"
        );

        return;

    }


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
            "Errore collegamento manuale:",
            error
        );


        aggiornaStatoP2P(
            "🔴 Errore"
        );

    }

}


/* =========================================================
   PULSANTE COLLEGA PEER
========================================================= */

function inizializzaP2PUI() {

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

}


/* =========================================================
   AVVIO DOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
            P2P UI.
        */

        inizializzaP2PUI();


        /*
            Aggiornamento iniziale.
        */

        checkMonthlyReset();

        updateHome();

        updateRanking();

        updateGallery();

        updateProfile();

    }
);

/* =========================================================
   ADMIN - FOTO DI TUTTI GLI UTENTI
========================================================= */

async function apriAdminFoto() {

    if (!isAdmin) {
        return;
    }


    let overlay =
        document.getElementById(
            "adminPhotosOverlay"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "adminPhotosOverlay";

        overlay.style.position =
            "fixed";

        overlay.style.inset =
            "0";

        overlay.style.background =
            "rgba(0,0,0,0.88)";

        overlay.style.zIndex =
            "99999";

        overlay.style.overflowY =
            "auto";

        overlay.style.padding =
            "20px";

        overlay.style.boxSizing =
            "border-box";


        document.body.appendChild(
            overlay
        );

    }


    /*
        Disegna immediatamente
        le foto disponibili.
    */

    aggiornaAdminFotoOverlay();


    /*
        Chiede agli altri peer
        tutte le foto.
    */

    richiediTutteLeFotoP2P();

}
function aggiornaAdminFotoOverlay() {

    const overlay =
        document.getElementById(
            "adminPhotosOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.innerHTML =
        "";


    const box =
        document.createElement(
            "div"
        );


    box.style.maxWidth =
        "700px";

    box.style.margin =
        "0 auto";

    box.style.background =
        "#222";

    box.style.borderRadius =
        "15px";

    box.style.padding =
        "20px";

    box.style.color =
        "white";


    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        "📷 FOTO DI TUTTI GLI UTENTI";


    box.appendChild(
        title
    );


    const info =
        document.createElement(
            "p"
        );


    info.textContent =
        "Richiesta foto agli altri dispositivi...";


    box.appendChild(
        info
    );


    const close =
        document.createElement(
            "button"
        );


    close.textContent =
        "✕ CHIUDI";


    close.style.width =
        "100%";

    close.style.marginBottom =
        "20px";


    close.addEventListener(
        "click",
        function() {

            overlay.remove();

        }
    );


    box.appendChild(
        close
    );


    let trovate =
        false;


    Object.keys(users).forEach(
        function(nickname) {

            const user =
                users[nickname];


            if (
                !user ||
                !Array.isArray(user.photos) ||
                user.photos.length === 0
            ) {

                return;

            }


            trovate =
                true;


            const userTitle =
                document.createElement(
                    "h3"
                );


            userTitle.textContent =
                `${nickname} — ${Number(user.score || 0)} punti`;


            box.appendChild(
                userTitle
            );


            [...user.photos]
                .reverse()
                .forEach(
                    function(photo) {

                        const item =
                            document.createElement(
                                "div"
                            );


                        item.style.background =
                            "#333";

                        item.style.borderRadius =
                            "12px";

                        item.style.padding =
                            "10px";

                        item.style.marginBottom =
                            "15px";


                        const image =
                            document.createElement(
                                "img"
                            );


                        image.style.width =
                            "100%";

                        image.style.maxHeight =
                            "400px";

                        image.style.objectFit =
                            "contain";

                        image.style.display =
                            "block";

                        image.style.borderRadius =
                            "10px";


                        caricaFotoDB(
                            photo.id
                        )
                        .then(
                            function(imageData) {

                                if (imageData) {

                                    image.src =
                                        imageData;

                                } else {

                                    image.alt =
                                        "Foto non disponibile";

                                }

                            }
                        )
                        .catch(
                            function(error) {

                                console.error(
                                    "Errore foto admin:",
                                    error
                                );

                            }
                        );


                        item.appendChild(
                            image
                        );


                        const infoFoto =
                            document.createElement(
                                "p"
                            );


                        infoFoto.textContent =
                            `${photo.object || "Reperto"} — +${Number(photo.points || 1)} punto`;


                        item.appendChild(
                            infoFoto
                        );


                        const validLabel =
                            document.createElement(
                                "p"
                            );


                        validLabel.textContent =
                            photo.valid === false
                                ? "❌ FOTO NON VALIDA"
                                : "✅ FOTO VALIDA";


                        item.appendChild(
                            validLabel
                        );


                        box.appendChild(
                            item
                        );

                    }
                );

        }
    );


    if (!trovate) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "Nessuna fotografia ancora disponibile.";

        box.appendChild(
            empty
        );

    }


    overlay.appendChild(
        box
    );

}
/* =========================================================
   ADMIN - CONSOLE
========================================================= */

function apriAdminConsole() {

    if (!isAdmin) {
        return;
    }

    let overlay =
        document.getElementById("adminConsoleOverlay");

    if (!overlay) {

        overlay = document.createElement("div");

        overlay.id = "adminConsoleOverlay";

        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0,0,0,0.9)";
        overlay.style.zIndex = "99999";
        overlay.style.padding = "20px";
        overlay.style.boxSizing = "border-box";

        document.body.appendChild(
            overlay
        );
    }

    overlay.innerHTML = "";

    const box =
        document.createElement("div");

    box.style.maxWidth = "900px";
    box.style.margin = "0 auto";
    box.style.background = "#111";
    box.style.color = "#00ff66";
    box.style.padding = "20px";
    box.style.borderRadius = "15px";
    box.style.fontFamily = "monospace";

    const title =
        document.createElement("h2");

    title.textContent =
        "💻 CONSOLE ADMIN";

    box.appendChild(
        title
    );

    const close =
        document.createElement("button");

    close.textContent =
        "✕ CHIUDI";

    close.style.width = "100%";
    close.style.marginBottom = "20px";

    close.addEventListener(
        "click",
        function() {

            overlay.remove();

        }
    );

    box.appendChild(
        close
    );


    const consoleArea =
        document.createElement("div");

    consoleArea.style.background =
        "#000";

    consoleArea.style.padding =
        "15px";

    consoleArea.style.borderRadius =
        "10px";

    consoleArea.style.minHeight =
        "300px";

    consoleArea.style.whiteSpace =
        "pre-wrap";

    let testo =
        "=== PUNTI ADMIN CONSOLE ===\n\n";

    testo +=
        `Admin: ${currentNickname}\n`;

    testo +=
        `Utenti: ${Object.keys(users).length}\n`;

    testo +=
        `Peer conosciuti: ${Object.keys(knownPeers).length}\n`;

    testo +=
        `Connessioni attive: ${p2pConnections.length}\n`;

    testo +=
        `Peer ID: ${peer ? peer.id : "non disponibile"}\n\n`;

    testo +=
        "=== UTENTI ===\n";

    Object.keys(users).forEach(
        function(nickname) {

            const user =
                users[nickname];

            testo +=
                `${nickname}: ${Number(user.score || 0)} punti`;

            testo +=
                ` | foto: ${Array.isArray(user.photos) ? user.photos.length : 0}\n`;

        }
    );

    testo +=
        "\n=== RETE P2P ===\n";

    Object.keys(knownPeers).forEach(
        function(nickname) {

            testo +=
                `${nickname} -> ${knownPeers[nickname]}\n`;

        }
    );

    consoleArea.textContent =
        testo;

    box.appendChild(
        consoleArea
    );


    const refresh =
        document.createElement("button");

    refresh.textContent =
        "🔄 AGGIORNA CONSOLE";

    refresh.style.width =
        "100%";

    refresh.style.marginTop =
        "10px";

    refresh.addEventListener(
        "click",
        function() {

            overlay.remove();

            apriAdminConsole();

        }
    );

    box.appendChild(
        refresh
    );

    overlay.appendChild(
        box
    );
}


/* =========================================================
   COLLEGAMENTO BOTTONI ADMIN
========================================================= */

if (adminPhotosButton) {

    adminPhotosButton.addEventListener(
        "click",
        function() {

            apriAdminFoto();

        }
    );

}


if (adminConsoleButton) {

    adminConsoleButton.addEventListener(
        "click",
        function() {

            apriAdminConsole();

        }
    );

}
/* =========================================================
   AVVIO LOGIN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    checkMonthlyReset();

    initializeLoginScreen();

});
