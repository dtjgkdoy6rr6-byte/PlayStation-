// ==========================================
// PLAYVAULT ADMIN - APP.JS
// BAGIAN 1
// ==========================================

const SUPABASE_URL =
    "https://jxoeuxcwsaqmgsxiopqj.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_1FUkGM29tdLwvbnMn6AgIw_eesBsUrw";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// ELEMENT HTML
// ==========================================

const gameForm =
    document.getElementById("gameForm");

const gameTable =
    document.getElementById("gameTable");

const message =
    document.getElementById("message");

const addGameBtn =
    document.getElementById("addGameBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const searchInput =
    document.getElementById("searchInput");

const totalGames =
    document.getElementById("totalGames");

const popularGames =
    document.getElementById("popularGames");

const legalGames =
    document.getElementById("legalGames");

const saveBtn =
    document.getElementById("saveBtn");


// ==========================================
// DATA GAME
// ==========================================

let allGames = [];


// ==========================================
// TAMPILKAN PESAN
// ==========================================

function showMessage(text, type) {

    message.className = "";
    message.textContent = text;

    if (type === "success") {
        message.classList.add("message-success");
    }

    if (type === "error") {
        message.classList.add("message-error");
    }

    message.style.display = "block";
}


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    gameForm.reset();

    document.getElementById("gameId").value = "";

    saveBtn.textContent =
        "Simpan Game";
}


// ==========================================
// TOMBOL TAMBAH GAME
// ==========================================

addGameBtn.addEventListener(
    "click",
    function () {

        resetForm();

        gameForm.style.display =
            "block";

        document.getElementById("title").focus();

        window.scrollTo({
            top: 250,
            behavior: "smooth"
        });

    }
);


// ==========================================
// TOMBOL BATAL
// ==========================================

cancelBtn.addEventListener(
    "click",
    function () {

        resetForm();

        gameForm.style.display =
            "none";

    }
);
// ==========================================
// SIMPAN / TAMBAH GAME
// BAGIAN 2
// ==========================================

gameForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        // ======================================
        // AMBIL DATA DARI FORM
        // ======================================

        const gameId =
            document.getElementById("gameId").value;

        const title =
            document.getElementById("title").value.trim();

        const platform =
            document.getElementById("platform").value.trim();

        const genre =
            document.getElementById("genre").value.trim();

        const yearValue =
            document.getElementById("year").value;

        const ratingValue =
            document.getElementById("rating").value;

        const size =
            document.getElementById("size").value.trim();

        const developer =
            document.getElementById("developer").value.trim();

        const publisher =
            document.getElementById("publisher").value.trim();

        const language =
            document.getElementById("language").value.trim();

        const region =
            document.getElementById("region").value.trim();

        const image =
            document.getElementById("image").value.trim();

        const download_url =
            document.getElementById("download_url").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const popular =
            document.getElementById("popular").checked;

        const legal =
            document.getElementById("legal").checked;


        // ======================================
        // CEK JUDUL
        // ======================================

        if (!title) {

            showMessage(
                "Judul game wajib diisi.",
                "error"
            );

            document.getElementById("title").focus();

            return;
        }


        // ======================================
        // DATA YANG AKAN DIKIRIM
        // ======================================

        const gameData = {

            title: title,

            platform: platform,

            genre: genre,

            year: yearValue
                ? Number(yearValue)
                : null,

            rating: ratingValue
                ? Number(ratingValue)
                : null,

            size: size,

            developer: developer,

            publisher: publisher,

            language: language,

            region: region,

            image: image,

            download_url: download_url,

            description: description,

            popular: popular,

            legal: legal

        };


        // ======================================
        // TOMBOL MENJADI LOADING
        // ======================================

        saveBtn.disabled = true;

        saveBtn.textContent =
            gameId
                ? "Memperbarui..."
                : "Menyimpan...";


        try {

            let result;


            // ==================================
            // JIKA ADA ID = EDIT GAME
            // ==================================

            if (gameId) {

                result =
                    await supabaseClient
                        .from("games")
                        .update(gameData)
                        .eq(
                            "id",
                            gameId
                        );

            }

            // ==================================
            // JIKA TIDAK ADA ID = TAMBAH GAME
            // ==================================

            else {

                result =
                    await supabaseClient
                        .from("games")
                        .insert([
                            gameData
                        ]);

            }


            // ==================================
            // CEK ERROR SUPABASE
            // ==================================

            if (result.error) {

                console.error(
                    "Supabase Save Error:",
                    result.error
                );

                showMessage(
                    "Gagal menyimpan game: " +
                    result.error.message,
                    "error"
                );

                return;
            }


            // ==================================
            // BERHASIL
            // ==================================

            showMessage(
                gameId
                    ? "Game berhasil diperbarui."
                    : "Game berhasil ditambahkan.",
                "success"
            );


            // ==================================
            // RESET FORM
            // ==================================

            resetForm();

            gameForm.style.display =
                "none";


            // ==================================
            // MUAT ULANG DATA
            // ==================================

            await loadGames();


        } catch (error) {

            console.error(
                "Unexpected Save Error:",
                error
            );

            showMessage(
                "Terjadi kesalahan saat menyimpan game.",
                "error"
            );


        } finally {

            saveBtn.disabled = false;

            saveBtn.textContent =
                "Simpan Game";

        }

    }
);
// ==========================================
// PLAYVAULT ADMIN
// BAGIAN 3
// LOAD GAME + STATISTIK + TABEL
// ==========================================


// ==========================================
// CEK SESSION ADMIN
// ==========================================

async function checkAdminSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            window.location.href =
                "admin-login.html";

            return;
        }


        if (!data.session) {

            window.location.href =
                "admin-login.html";

            return;
        }


        console.log(
            "PLAYVAULT ADMIN: Login aktif"
        );


        // Ambil data game
        await loadGames();


    } catch (error) {

        console.error(
            "Check session error:",
            error
        );

        window.location.href =
            "admin-login.html";

    }

}


// ==========================================
// AMBIL DATA GAME DARI SUPABASE
// ==========================================

async function loadGames() {

    gameTable.innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                Memuat game...
            </td>
        </tr>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("games")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "Gagal mengambil games:",
                error
            );


            gameTable.innerHTML = `
                <tr>
                    <td colspan="8" class="loading">
                        Gagal mengambil data game.
                    </td>
                </tr>
            `;


            showMessage(
                "Gagal mengambil data game: " +
                error.message,
                "error"
            );


            return;
        }


        allGames = data || [];


        console.log(
            "Jumlah game:",
            allGames.length
        );


        updateStatistics();

        renderGames(allGames);


    } catch (error) {

        console.error(
            "Load games error:",
            error
        );


        gameTable.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    Terjadi kesalahan.
                </td>
            </tr>
        `;


        showMessage(
            "Terjadi kesalahan saat mengambil data game.",
            "error"
        );

    }

}


// ==========================================
// UPDATE STATISTIK
// ==========================================

function updateStatistics() {

    totalGames.textContent =
        allGames.length;


    popularGames.textContent =
        allGames.filter(
            function (game) {

                return game.popular === true;

            }
        ).length;


    legalGames.textContent =
        allGames.filter(
            function (game) {

                return game.legal === true;

            }
        ).length;

}


// ==========================================
// RENDER TABEL GAME
// ==========================================

function renderGames(games) {

    if (!games.length) {

        gameTable.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    Belum ada game.
                </td>
            </tr>
        `;

        return;
    }


    gameTable.innerHTML =
        games.map(
            function (game) {

                const image =
                    game.image ||
                    "https://via.placeholder.com/55x65?text=Game";


                const popularBadge =
                    game.popular === true
                        ? `<span class="badge badge-green">Populer</span>`
                        : `<span class="badge badge-gray">Normal</span>`;


                return `
                    <tr>

                        <td>
                            <img
                                src="${escapeHtml(image)}"
                                class="game-image"
                                alt="Cover game"
                                onerror="this.src='https://via.placeholder.com/55x65?text=Game'"
                            >
                        </td>


                        <td>
                            <strong>
                                ${escapeHtml(game.title || "-")}
                            </strong>
                        </td>


                        <td>
                            ${escapeHtml(game.platform || "-")}
                        </td>


                        <td>
                            ${escapeHtml(game.genre || "-")}
                        </td>


                        <td>
                            ${game.year || "-"}
                        </td>


                        <td>
                            ${game.rating ?? "-"}
                        </td>


                        <td>
                            ${popularBadge}
                        </td>


                        <td>

                            <div class="action-buttons">

                                <button
                                    class="edit-btn"
                                    onclick="editGame(${game.id})"
                                >
                                    Edit
                                </button>


                                <button
                                    class="delete-btn"
                                    onclick="deleteGame(${game.id})"
                                >
                                    Hapus
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
// ==========================================
// PLAYVAULT ADMIN
// BAGIAN 4
// EDIT + HAPUS + SEARCH
// ==========================================


// ==========================================
// EDIT GAME
// ==========================================

window.editGame = function (id) {

    const game = allGames.find(
        function (item) {
            return Number(item.id) === Number(id);
        }
    );


    if (!game) {

        showMessage(
            "Data game tidak ditemukan.",
            "error"
        );

        return;
    }


    // ======================================
    // MASUKKAN DATA KE FORM
    // ======================================

    document.getElementById("gameId").value =
        game.id;

    document.getElementById("title").value =
        game.title || "";

    document.getElementById("platform").value =
        game.platform || "";

    document.getElementById("genre").value =
        game.genre || "";

    document.getElementById("year").value =
        game.year ?? "";

    document.getElementById("rating").value =
        game.rating ?? "";

    document.getElementById("size").value =
        game.size || "";

    document.getElementById("developer").value =
        game.developer || "";

    document.getElementById("publisher").value =
        game.publisher || "";

    document.getElementById("language").value =
        game.language || "";

    document.getElementById("region").value =
        game.region || "";

    document.getElementById("image").value =
        game.image || "";

    document.getElementById("download_url").value =
        game.download_url || "";

    document.getElementById("description").value =
        game.description || "";

    document.getElementById("popular").checked =
        game.popular === true;

    document.getElementById("legal").checked =
        game.legal === true;


    // ======================================
    // UBAH TOMBOL
    // ======================================

    saveBtn.textContent =
        "Perbarui Game";


    // ======================================
    // TAMPILKAN FORM
    // ======================================

    gameForm.style.display =
        "block";


    document.getElementById("title").focus();


    window.scrollTo({
        top: 250,
        behavior: "smooth"
    });

};


// ==========================================
// HAPUS GAME
// ==========================================

window.deleteGame = async function (id) {

    const game = allGames.find(
        function (item) {
            return Number(item.id) === Number(id);
        }
    );


    if (!game) {

        showMessage(
            "Data game tidak ditemukan.",
            "error"
        );

        return;
    }


    // ======================================
    // KONFIRMASI
    // ======================================

    const confirmed = confirm(
        'Yakin ingin menghapus game "' +
        game.title +
        '"?'
    );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("games")
            .delete()
            .eq("id", id);


        if (error) {

            console.error(
                "Delete error:",
                error
            );


            showMessage(
                "Gagal menghapus game: " +
                error.message,
                "error"
            );

            return;
        }


        // ==================================
        // BERHASIL
        // ==================================

        showMessage(
            "Game berhasil dihapus.",
            "success"
        );


        await loadGames();


    } catch (error) {

        console.error(
            "Delete unexpected error:",
            error
        );


        showMessage(
            "Terjadi kesalahan saat menghapus game.",
            "error"
        );

    }

};


// ==========================================
// SEARCH GAME
// ==========================================

searchInput.addEventListener(
    "input",
    function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        // ==================================
        // JIKA PENCARIAN KOSONG
        // ==================================

        if (!keyword) {

            renderGames(allGames);

            return;
        }


        // ==================================
        // FILTER GAME
        // ==================================

        const filtered =
            allGames.filter(
                function (game) {

                    const title =
                        String(
                            game.title || ""
                        ).toLowerCase();


                    const platform =
                        String(
                            game.platform || ""
                        ).toLowerCase();
                    ).toLowerCase();


                    return (
                        title.includes(keyword) ||
                        platform.includes(keyword) ||
                        genre.includes(keyword)
                    );

                }
            );


        // ==================================
        // TAMPILKAN HASIL
        // ==================================
            renderGames(filtered);

    }
);
// ==========================================
// PLAYVAULT ADMIN
// BAGIAN 5
// LOGOUT + MULAI SISTEM
// ==========================================


// ==========================================
// LOGOUT ADMIN
// ==========================================

logoutBtn.addEventListener(
    "click",
    async function () {

        const confirmed = confirm(
            "Yakin ingin keluar dari Admin?"
        );

        if (!confirmed) {
            return;
        }


        logoutBtn.disabled = true;

        logoutBtn.textContent =
            "Keluar...";


        try {

            const {
                error
            } = await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );


                showMessage(
                    "Gagal keluar: " +
                    error.message,
                    "error"
                );


                logoutBtn.disabled = false;

                logoutBtn.textContent =
                    "Keluar";

                return;
            }
            // Kembali ke halaman login

            window.location.href =
                "admin-login.html";


        } catch (error) {

            console.error(
                "Logout unexpected error:",
                error
            );


            showMessage(
                "Terjadi kesalahan saat logout.",
                "error"
            );


            logoutBtn.disabled = false;

            logoutBtn.textContent =
                "Keluar";

        }

    }
);


// ==========================================
// MULAI DASHBOARD
// ==========================================

console.log(
    "PLAYVAULT ADMIN JS AKTIF"
);


// Cek apakah admin sudah login

checkAdminSession();


                    const genre =
                        String(
                            game.genre || ""
               
