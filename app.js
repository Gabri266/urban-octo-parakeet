// ======================================
// ACCOUNT
// ======================================

const accounts = {

    "Gabriele": "1234",

    "Marco": "5678",

    "Luca": "abcd"

};


// ======================================
// RECUPERO PASSWORD DAL LOGIN
// ======================================

const passwordInserita =
    sessionStorage.getItem("passwordInserita");


// Se non arriva nessuna password,
// torna al login
if (passwordInserita === null) {

    window.location.href = "index.html";

}


// ======================================
// CONTROLLO ACCOUNT
// ======================================

function controllaAccount() {

    const nickname =
        document.getElementById("nickname").value.trim();


    // Controlla che il nickname esista
    // E che la password corrisponda
    if (
        accounts[nickname] &&
        accounts[nickname] === passwordInserita
    ) {

        // Salviamo il nickname
        sessionStorage.setItem(
            "nickname",
            nickname
        );


        // Mostra la pagina principale
        document.getElementById(
            "loginNickname"
        ).style.display = "none";


        document.getElementById(
            "paginaPrincipale"
        ).style.display = "block";


        document.getElementById(
            "nomeUtente"
        ).textContent = nickname;


    } else {

        document.getElementById(
            "errore"
        ).textContent =
            "Nickname o password non corretti.";

    }

}


// ======================================
// PUNTI
// ======================================

let punti = 0;


function aggiungi() {

    punti++;

    document.getElementById(
        "punti"
    ).textContent = punti;

}
