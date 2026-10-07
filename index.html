/* =========================================================
   COOKIE
========================================================= */

function getCookie(name) {

    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {

        const parts = cookie.split("=");

        const key = parts.shift();
        const value = parts.join("=");

        if (key === name) {
            return decodeURIComponent(value);
        }
    }

    return null;
}


function setCookie(name, value, days) {

    const date = new Date();

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
   ACCESSO
========================================================= */

/*
    La prima pagina NON controlla la password.

    La prima pagina salva semplicemente quello
    che l'utente ha scritto nel campo password.
*/

const passwordInserita =
    sessionStorage.getItem("passwordInserita");


/*
    Se non è arrivata nessuna password,
    non si può accedere.
*/

if (!passwordInserita) {

    window.location.href = "index.html";

    throw new Error(
        "Password non ricevuta."
    );
}


/* =========================================================
   NICKNAME
========================================================= */

let currentNickname =
    getCookie("nickname");


/*
    Se abbiamo già un nickname salvato,
    lo usiamo direttamente.

    Altrimenti lo chiediamo.
*/

if (!currentNickname) {

    currentNickname =
        prompt("Inserisci il tuo nickname");

}


/* =========================================================
   CONTROLLO ACCOUNT
========================================================= */

if (
    !currentNickname ||
    !ACCOUNTS[currentNickname] ||
    ACCOUNTS[currentNickname] !== passwordInserita
) {

    alert(
        "Nickname o password non corretti."
    );

    sessionStorage.removeItem(
        "passwordInserita"
    );

    window.location.href =
        "index.html";

    throw new Error(
        "Utente non autenticato."
    );
}


/*
    Account corretto.
    Salviamo il nickname.
*/

setCookie(
    "nickname",
    currentNickname,
    365
);


/* =========================================================
   ELEMENTI
========================================================= */

const nicknameDisplay =
    document.getElementById(
        "nicknameDisplay"
    );

const scoreDisplay =
    document.getElementById(
        "scoreDisplay"
    );

const levelDisplay =
    document.getElementById(
        "levelDisplay"
    );

const addButton =
    document.getElementById(
        "addButton"
    );

const cameraInput =
    document.getElementById(
        "cameraInput"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const rankingContainer =
    document.getElementById(
        "rankingContainer"
    );

const rankingMonth =
    document.getElementById(
        "rankingMonth"
    );

const gallery =
    document.getElementById(
        "gallery"
    );

const photoModal =
    document.getElementById(
        "photoModal"
    );

const previewImage =
    document.getElementById(
        "previewImage"
    );

const verificationResult =
    document.getElementById(
        "verificationResult"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   DATABASE LOCALE
========================================================= */

let users =
    JSON.parse(
        localStorage.getItem(
            "usersData"
        ) || "{}"
    );


/*
    Creiamo i dati di tutti gli account.
*/

Object.keys(ACCOUNTS).forEach(
    nickname => {

        if (!users[nickname]) {

            users[nickname] = {
                score: 0,
                month: getCurrentMonth(),
                photos: []
            };

        }

    }
);


saveUsers();


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


            if (
                user.month !== currentMonth
            ) {

                /*
                    Azzera il punteggio.

                    Le fotografie rimangono.
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

    const user =
        users[currentNickname];


    nicknameDisplay.textContent =
        currentNickname;


    scoreDisplay.textContent =
        user.score;


    levelDisplay.textContent =
        getLevel(
            user.score
        );

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


async function handlePhoto(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    statusMessage.textContent =
        "Controllo della fotografia...";


    const imageData =
        await fileToDataURL(file);


    previewImage.src =
        imageData;


    photoModal.classList.remove(
        "hidden"
    );


    const result =
        await verificaFoto(file);


    if (result.trovato) {

        addPoint(imageData);

    }
    else {

        verificationResult.innerHTML = `

            <div class="verification-fail">
                ✕ Oggetto non riconosciuto
            </div>

            <p>
                Nessun punto assegnato.
            </p>

        `;

    }


    statusMessage.textContent = "";

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
                () => resolve(
                    reader.result
                );


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
        ATTENZIONE:

        Qui non c'è ancora una vera AI.

        Questa funzione deve essere collegata
        successivamente al sistema di riconoscimento
        immagini.
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

    const user =
        users[currentNickname];


    const points =
        GAME_CONFIG.obiettivo.punti;


    user.score += points;


    user.photos.push({

        image: imageData,

        points: points,

        date:
            new Date().toISOString(),

        object:
            GAME_CONFIG.obiettivo.nome

    });


    saveUsers();


    updateHome();

    updateRanking();

    updateGallery();


    verificationResult.innerHTML = `

        <div class="verification-success">
            ✓ Oggetto riconosciuto
        </div>

        <p>
            +${points} punto
        </p>

    `;

}


/* =========================================================
   CLASSIFICA
========================================================= */

function updateRanking() {

    const currentMonth =
        getCurrentMonth();


    rankingMonth.textContent =
        "Classifica " +
        formatMonth(
            currentMonth
        );


    const ranking =
        Object.keys(users)
            .map(nickname => ({

                nickname,

                score:
                    users[nickname].score

            }))
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
                ranking.filter(user => {

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

                });


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

    gallery.innerHTML = "";


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


    reversed.forEach(photo => {

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

    });

}


/* =========================================================
   NAVIGAZIONE
========================================================= */

document
    .querySelectorAll(
        ".nav-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageID =
                    button.dataset.page;


                document
                    .querySelectorAll(
                        ".page"
                    )
                    .forEach(page => {

                        page.classList.remove(
                            "active"
                        );

                    });


                document
                    .getElementById(
                        pageID
                    )
                    .classList.add(
                        "active"
                    );


                document
                    .querySelectorAll(
                        ".nav-button"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );

            }
        );

    });


/* =========================================================
   MODALE
========================================================= */

closeModal.addEventListener(
    "click",
    () => {

        photoModal.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   LOGOUT
========================================================= */

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
   MESE FORMATTATO
========================================================= */

function formatMonth(value) {

    const [
        year,
        month
    ] = value.split("-");


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

checkMonthlyReset();

updateHome();

updateRanking();

updateGallery();
