```javascript
/* =========================================================
   CONFIGURAZIONE ACCOUNT
========================================================= */

/*
    PER ORA gli account sono qui.

    In futuro questa parte verrà sostituita
    dal database.

    Formato:

    "nickname": "password"
*/

const ACCOUNTS = {

    "Gabriele": "1234",

    "Mario": "5678",

    "Luca": "abcd"

};


/* =========================================================
   CONFIGURAZIONE GIOCO
========================================================= */

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
            minimo: 250
        },

        {
            nome: "LIVELLO 5",
            minimo: 500
        }

    ]

};


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
        days * 24 * 60 * 60 * 1000
    );

    document.cookie =
        `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;

}


function deleteCookie(name) {

    document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;

}


/* =========================================================
   ELEMENTI HTML
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const app =
    document.getElementById("app");

const nicknameInput =
    document.getElementById("nicknameInput");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");


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

const rankingMonth =
    document.getElementById("rankingMonth");

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

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================================
   UTENTE CORRENTE
========================================================= */

let currentNickname =
    getCookie("nickname");


/* =========================================================
   DATABASE LOCALE
========================================================= */

/*
    ATTENZIONE:

    Questo NON è ancora un vero database.

    Per ora utilizziamo localStorage.

    In futuro potremo sostituire queste funzioni
    con Firebase, Supabase, MySQL tramite API,
    ecc. senza dover riscrivere tutta l'app.
*/

let users =
    JSON.parse(
        localStorage.getItem("usersData") || "{}"
    );


/* =========================================================
   CREAZIONE ACCOUNT LOCALI
========================================================= */

function initializeAccounts() {

    Object.keys(ACCOUNTS).forEach(
        nickname => {

            if (!users[nickname]) {

                users[nickname] = {

                    score: 0,

                    month:
                        getCurrentMonth(),

                    photos: []

                };

            }

        }
    );


    saveUsers();

}


/* =========================================================
   SALVATAGGIO
========================================================= */

function saveUsers() {

    localStorage.setItem(
        "usersData",
        JSON.stringify(users)
    );

}


/* =========================================================
   ACCESSO
========================================================= */

function login() {

    const nickname =
        nicknameInput.value.trim();


    /*
        Pulizia errore precedente.
    */

    loginError.textContent = "";


    /*
        Controllo nickname vuoto.
    */

    if (!nickname) {

        loginError.textContent =
            "Inserisci un nickname.";

        nicknameInput.focus();

        return;

    }


    /*
        Controllo che l'account esista.
    */

    if (!ACCOUNTS[nickname]) {

        loginError.textContent =
            "Nickname non trovato.";

        nicknameInput.focus();

        return;

    }


    /*
        Password ricevuta da index.html.
    */

    const passwordInserita =
        sessionStorage.getItem(
            "passwordInserita"
        );


    /*
        Se non esiste la password,
        l'utente deve tornare al login.
    */

    if (!passwordInserita) {

        window.location.href =
            "index.html";

        return;

    }


    /*
        Controllo password.
    */

    if (
        ACCOUNTS[nickname] !==
        passwordInserita
    ) {

        loginError.textContent =
            "Nickname o password non corretti.";

        nicknameInput.focus();

        return;

    }


    /*
        LOGIN CORRETTO
    */

    currentNickname =
        nickname;


    setCookie(
        "nickname",
        currentNickname,
        365
    );


    /*
        Nascondiamo login.
    */

    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }


    /*
        Mostriamo app.
    */

    if (app) {

        app.classList.remove(
            "hidden"
        );

    }


    /*
        Aggiorniamo tutto.
    */

    checkMonthlyReset();

    updateHome();

    updateRanking();

    updateGallery();

}


/* =========================================================
   EVENTO LOGIN
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
        event => {

            if (event.key === "Enter") {

                login();

            }

        }
    );

}


/* =========================================================
   CONTROLLO ACCESSO ALL'AVVIO
========================================================= */

function initializeApplication() {

    initializeAccounts();


    /*
        Controlliamo se arriviamo da index.html
        con una password valida.
    */

    const passwordInserita =
        sessionStorage.getItem(
            "passwordInserita"
        );


    /*
        Se non abbiamo password,
        torniamo al login principale.
    */

    if (!passwordInserita) {

        window.location.href =
            "index.html";

        return;

    }


    /*
        Se esiste un nickname salvato,
        proviamo a effettuare automaticamente
        l'accesso.
    */

    if (currentNickname) {

        if (
            ACCOUNTS[currentNickname] &&
            ACCOUNTS[currentNickname] ===
            passwordInserita
        ) {

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

            checkMonthlyReset();

            updateHome();

            updateRanking();

            updateGallery();

            return;

        }

    }


    /*
        Nessun nickname valido.

        Mostriamo la schermata nickname.
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
   MESE
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


    Object.keys(users).forEach(
        nickname => {

            const user =
                users[nickname];


            if (!user) {
                return;
            }


            if (
                user.month !==
                currentMonth
            ) {

                /*
                    Il punteggio viene azzerato.

                    Le fotografie NON vengono cancellate.
                */

                user.score = 0;

                user.month =
                    currentMonth;

            }

        }
    );


    saveUsers();

}


/* =========================================================
   HOME
========================================================= */

function updateHome() {

    if (
        !currentNickname ||
        !users[currentNickname]
    ) {

        return;

    }


    const user =
        users[currentNickname];


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
   FOTOCAMERA
========================================================= */

if (addButton && cameraInput) {

    addButton.addEventListener(
        "click",
        () => {

            cameraInput.click();

        }
    );


    cameraInput.addEventListener(
        "change",
        handlePhoto
    );

}


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


        if (previewImage) {

            previewImage.src =
                imageData;

        }


        if (photoModal) {

            photoModal.classList.remove(
                "hidden"
            );

        }


        const result =
            await verificaFoto(file);


        if (result.trovato) {

            addPoint(imageData);

        }
        else {

            if (verificationResult) {

                verificationResult.innerHTML = `

                    <div class="verification-fail">
                        ✕ Oggetto non riconosciuto
                    </div>

                    <p>
                        Nessun punto assegnato.
                    </p>

                `;

            }

        }

    }
    catch (error) {

        console.error(
            "Errore durante la verifica:",
            error
        );


        if (verificationResult) {

            verificationResult.innerHTML = `

                <div class="verification-fail">
                    ✕ Errore durante il controllo
                </div>

                <p>
                    Riprova.
                </p>

            `;

        }

    }


    if (statusMessage) {

        statusMessage.textContent = "";

    }


    cameraInput.value = "";

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
                () => {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                reject;


            reader.readAsDataURL(file);

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
        "Oggetto da cercare:",
        GAME_CONFIG.obiettivo
    );


    /*
        PER ORA non c'è ancora l'AI.

        Questa funzione è stata lasciata separata
        proprio per poter collegare in futuro
        il sistema di riconoscimento immagini.

        Esempio futuro:

        const response = await fetch("/api/verifica-foto", {
            method: "POST",
            body: ...
        });

    */


    return {

        trovato: false,

        affidabilita: 0

    };

}


/* =========================================================
   AGGIUNTA PUNTO
========================================================= */

function addPoint(imageData) {

    if (
        !currentNickname ||
        !users[currentNickname]
    ) {

        return;

    }


    const user =
        users[currentNickname];


    const points =
        GAME_CONFIG.obiettivo.punti;


    user.score += points;


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


    saveUsers();


    updateHome();

    updateRanking();

    updateGallery();


    if (verificationResult) {

        verificationResult.innerHTML = `

            <div class="verification-success">
                ✓ Oggetto riconosciuto
            </div>

            <p>
                +${points} punto
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


    const currentMonth =
        getCurrentMonth();


    if (rankingMonth) {

        rankingMonth.textContent =
            "Classifica " +
            formatMonth(
                currentMonth
            );

    }


    const ranking =
        Object.keys(users)
            .map(
                nickname => ({

                    nickname,

                    score:
                        users[nickname].score

                })
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            );


    rankingContainer.innerHTML = "";


    GAME_CONFIG.livelli.forEach(
        (level, index) => {

            const nextLevel =
                GAME_CONFIG.livelli[
                    index + 1
                ];


            const usersInLevel =
                ranking.filter(
                    user => {

                        if (!nextLevel) {

                            return (
                                user.score >=
                                level.minimo
                            );

                        }


                        return (

                            user.score >=
                            level.minimo &&

                            user.score <
                            nextLevel.minimo

                        );

                    }
                );


            if (
                usersInLevel.length === 0
            ) {

                return;

            }


            const section =
                document.createElement(
                    "div"
                );

            section.className =
                "ranking-level";


            const title =
                document.createElement(
                    "h2"
                );

            title.textContent =
                level.nome;


            section.appendChild(
                title
            );


            usersInLevel.forEach(
                (user, position) => {

                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "ranking-item";


                    const number =
                        document.createElement(
                            "span"
                        );

                    number.className =
                        "ranking-position";

                    number.textContent =
                        "#" +
                        (position + 1);


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


                    row.appendChild(number);

                    row.appendChild(name);

                    row.appendChild(score);


                    section.appendChild(
                        row
                    );

                }
            );


            rankingContainer.appendChild(
                section
            );

        }
    );

}


/* =========================================================
   REPERTI
========================================================= */

function updateGallery() {

    if (!gallery) {

        return;

    }


    gallery.innerHTML = "";


    if (
        !currentNickname ||
        !users[currentNickname]
    ) {

        return;

    }


    const photos =
        users[currentNickname].photos;


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


    const reversed =
        [...photos].reverse();


    reversed.forEach(
        photo => {

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

            image.src =
                photo.image;

            image.alt =
                "Reperto";


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "gallery-info";


            info.innerHTML =
                `+${photo.points} punto • ${escapeHTML(photo.object)}`;


            item.appendChild(image);

            item.appendChild(info);


            gallery.appendChild(item);

        }
    );

}


/* =========================================================
   NAVIGAZIONE
========================================================= */

document
    .querySelectorAll(".nav-button")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const pageID =
                        button.dataset.page;


                    document
                        .querySelectorAll(".page")
                        .forEach(
                            page => {

                                page.classList.remove(
                                    "active"
                                );

                            }
                        );


                    const selectedPage =
                        document.getElementById(
                            pageID
                        );


                    if (selectedPage) {

                        selectedPage.classList.add(
                            "active"
                        );

                    }


                    document
                        .querySelectorAll(".nav-button")
                        .forEach(
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

if (closeModal && photoModal) {

    closeModal.addEventListener(
        "click",
        () => {

            photoModal.classList.add(
                "hidden"
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            deleteCookie(
                "nickname"
            );


            sessionStorage.removeItem(
                "passwordInserita"
            );


            window.location.href =
                "index.html";

        }
    );

}


/* =========================================================
   MESE FORMATTATO
========================================================= */

function formatMonth(value) {

    const [
        year,
        month
    ] =
        value.split("-");


    const names = [

        "Gennaio",

        "Febbraio",

        "Marzo",

        "Aprile",

        "Maggio",

        "Giugno",

        "Luglio",

        "Agosto",

        "Settembre",

        "Ottobre",

        "Novembre",

        "Dicembre"

    ];


    return (

        names[
            Number(month) - 1
        ] +

        " " +

        year

    );

}


/* =========================================================
   SICUREZZA TESTO
========================================================= */

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text;


    return element.innerHTML;

}


/* =========================================================
   AVVIO
========================================================= */

initializeApplication();
```
