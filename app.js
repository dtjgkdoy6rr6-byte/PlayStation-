/* =====================================================
   PLAYVAULT ADMIN
   APP.JS — VERSI BERSIH & SIAP TEMPEL
===================================================== */


/* =====================================================
   KONFIGURASI SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://jxoeuxcwsaqmgsxiopqj.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_1FUkGM29tdLwvbnMn6AgIw_eesBsUrw";


/* =====================================================
   BUAT CLIENT SUPABASE
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


console.log(
    "PLAYVAULT: Supabase berhasil dibuat."
);


/* =====================================================
   DATA GAME
===================================================== */

let allGames = [];


/* =====================================================
   ELEMENT HTML
===================================================== */

const gameTable =
    document.getElementById("gameTable");

const totalGames =
    document.getElementById("totalGames");

const popularGames =
    document.getElementById("popularGames");

const legalGames =
    document.getElementById("legalGames");

const searchInput =
    document.getElementById("searchInput");

const gameForm =
    document.getElementById("gameForm");

const addGameBtn =
    document.getElementById("addGameBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const saveBtn =
    document.getElementById("saveBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const message =
    document.getElementById("message");


/* =====================================================
   HELPER: AMBIL ELEMENT
===================================================== */

function getElement(id) {

    return document.getElementById(id);

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   TAMPILKAN PESAN
===================================================== */

function showMessage(text, type = "") {

    if (!message) {
        console.warn(
            "PLAYVAULT: #message tidak ditemukan."
        );
        return;
    }


    message.className = "";

    message.textContent = text;


    if (type === "success") {

        message.classList.add(
            "message-success"
        );

    }


    if (type === "error") {

        message.classList.add(
            "message-error"
        );

    }


    setTimeout(function () {

        if (!message) {
            return;
        }


        message.className = "";

        message.textContent = "";

    }, 5000);

}


/* =====================================================
   CEK SESSION ADMIN
===================================================== */

async function checkAdminSession() {

    console.log(
        "PLAYVAULT: Mengecek session admin..."
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "PLAYVAULT: Session error:",
                error
            );


            showMessage(
                "Gagal mengecek login: " +
                error.message,
                "error"
            );


            return;

        }


        const session =
            data?.session;


        if (!session) {

            console.log(
                "PLAYVAULT: Tidak ada session admin."
            );


            window.location.href =
                "admin-login.html";


            return;

        }


        console.log(
            "PLAYVAULT: Admin sudah login."
        );


        await loadGames();

    }

    catch (error) {

        console.error(
            "PLAYVAULT: Check session exception:",
            error
        );


        showMessage(
            "Terjadi kesalahan saat mengecek login.",
            "error"
        );

    }

}


/* =====================================================
   LOAD GAME DARI SUPABASE
===================================================== */

async function loadGames() {

    console.log(
        "PLAYVAULT: Mengambil data game..."
    );


    if (!gameTable) {

        console.error(
            "PLAYVAULT: #gameTable tidak ditemukan."
        );


        return;

    }


    gameTable.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="loading"
            >
                Memuat data game...
            </td>
        </tr>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("games")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "PLAYVAULT: Gagal mengambil game:",
                error
            );


            gameTable.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="loading"
                    >
                        Gagal mengambil data game.
                        <br><br>
                        ${escapeHtml(
                            error.message
                        )}
                    </td>
                </tr>
            `;


            showMessage(
                "Gagal mengambil game: " +
                error.message,
                "error"
            );


            return;

        }


        allGames =
            Array.isArray(data)
                ? data
                : [];


        updateStatistics();

        renderGames(
            allGames
        );


        console.log(
            "PLAYVAULT: " +
            allGames.length +
            " game berhasil dimuat."
        );

    }

    catch (error) {

        console.error(
            "PLAYVAULT: Load games exception:",
            error
        );


        showMessage(
            "Terjadi kesalahan saat mengambil data game.",
            "error"
        );

    }

}


/* =====================================================
   UPDATE STATISTIK
===================================================== */

function updateStatistics() {

    if (totalGames) {

        totalGames.textContent =
            allGames.length;

    }


    if (popularGames) {

        popularGames.textContent =
            allGames.filter(
                function (game) {

                    return (
                        game.popular === true
                    );

                }
            ).length;

    }


    if (legalGames) {

        legalGames.textContent =
            allGames.filter(
                function (game) {

                    return (
                        game.legal === true
                    );

                }
            ).length;

    }

}


/* =====================================================
   RENDER GAME KE TABLE
===================================================== */

function renderGames(games) {

    if (!gameTable) {
        return;
    }


    if (
        !Array.isArray(games) ||
        games.length === 0
    ) {

        gameTable.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="loading"
                >
                    Tidak ada game ditemukan.
                </td>
            </tr>
        `;


        return;

    }


    gameTable.innerHTML =
        games
            .map(function (game) {

                const image =
                    game.image ||
                    "https://placehold.co/55x65?text=Game";


                const title =
                    game.title ||
                    "Game";


                const status =
                    game.popular === true

                        ? `
                            <span class="badge badge-green">
                                Populer
                            </span>
                          `

                        : `
                            <span class="badge badge-gray">
                                Normal
                            </span>
                          `;


                const legalBadge =
                    game.legal === true

                        ? `
                            <span class="badge badge-green">
                                Legal
                            </span>
                          `

                        : "";


                return `

                    <tr>

                        <td>

                            <img
                                src="${escapeHtml(image)}"
                                class="game-image"
                                alt="${escapeHtml(title)}"
                                onerror="
                                    this.src='https://placehold.co/55x65?text=Game'
                                "
                            >

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(title)}
                            </strong>

                        </td>


                        <td>
                            ${escapeHtml(
                                game.platform || "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                game.genre || "-"
                            )}
                        </td>


                        <td>
                            ${game.year ?? "-"}
                        </td>


                        <td>
                            ${game.rating ?? "-"}
                        </td>


                        <td>

                            ${status}

                            ${legalBadge}

                        </td>


                        <td>

                            <div class="action-buttons">

                                <button
                                    type="button"
                                    class="edit-btn"
                                    onclick="editGame(${Number(game.id)})"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="delete-btn"
                                    onclick="deleteGame(${Number(game.id)})"
                                >
                                    Hapus
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            })
            .join("");

}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    if (!gameForm) {
        return;
    }


    gameForm.reset();


    const gameId =
        getElement("gameId");


    if (gameId) {

        gameId.value = "";

    }


    if (saveBtn) {

        saveBtn.disabled = false;

        saveBtn.textContent =
            "Simpan Game";

    }

}


/* =====================================================
   TAMPILKAN FORM TAMBAH GAME
===================================================== */

function showAddGameForm() {

    if (!gameForm) {

        console.error(
            "PLAYVAULT: #gameForm tidak ditemukan."
        );


        showMessage(
            "Form game tidak ditemukan.",
            "error"
        );


        return;

    }


    resetForm();


    gameForm.style.display =
        "block";


    if (saveBtn) {

        saveBtn.disabled =
            false;

        saveBtn.textContent =
            "Simpan Game";

    }


    const title =
        getElement("title");


    if (title) {

        setTimeout(function () {

            title.focus();

        }, 100);

    }


    gameForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    console.log(
        "PLAYVAULT: Form tambah game dibuka."
    );

}


/* =====================================================
   EVENT TOMBOL TAMBAH GAME
===================================================== */

if (addGameBtn) {

    addGameBtn.addEventListener(
        "click",
        showAddGameForm
    );

}


/* =====================================================
   TOMBOL BATAL
===================================================== */

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function () {

            resetForm();


            if (gameForm) {

                gameForm.style.display =
                    "none";

            }


            console.log(
                "PLAYVAULT: Form dibatalkan."
            );

        }
    );

}


/* =====================================================
   EDIT GAME
===================================================== */

window.editGame =
    function (id) {

        console.log(
            "PLAYVAULT: Edit game ID:",
            id
        );


        const game =
            allGames.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(id)
                    );

                }
            );


        if (!game) {

            showMessage(
                "Data game tidak ditemukan.",
                "error"
            );


            return;

        }


        const gameId =
            getElement("gameId");

        const title =
            getElement("title");

        const platform =
            getElement("platform");

        const genre =
            getElement("genre");

        const year =
            getElement("year");

        const rating =
            getElement("rating");

        const size =
            getElement("size");

        const developer =
            getElement("developer");

        const publisher =
            getElement("publisher");

        const language =
            getElement("language");

        const region =
            getElement("region");

        const image =
            getElement("image");

        const downloadUrl =
            getElement("download_url");

        const description =
            getElement("description");

        const popular =
            getElement("popular");

        const legal =
            getElement("legal");


        if (gameId) {
            gameId.value =
                game.id ?? "";
        }


        if (title) {
            title.value =
                game.title || "";
        }


        if (platform) {
            platform.value =
                game.platform || "";
        }


        if (genre) {
            genre.value =
                game.genre || "";
        }


        if (year) {
            year.value =
                game.year ?? "";
        }


        if (rating) {
            rating.value =
                game.rating ?? "";
        }


        if (size) {
            size.value =
                game.size || "";
        }


        if (developer) {
            developer.value =
                game.developer || "";
        }


        if (publisher) {
            publisher.value =
                game.publisher || "";
        }


        if (language) {
            language.value =
                game.language || "";
        }


        if (region) {
            region.value =
                game.region || "";
        }


        if (image) {
            image.value =
                game.image || "";
        }


        if (downloadUrl) {
            downloadUrl.value =
                game.download_url || "";
        }


        if (description) {
            description.value =
                game.description || "";
        }


        if (popular) {
            popular.checked =
                game.popular === true;
        }


        if (legal) {
            legal.checked =
                game.legal === true;
        }


        if (saveBtn) {

            saveBtn.textContent =
                "Perbarui Game";

        }


        if (gameForm) {

            gameForm.style.display =
                "block";


            gameForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        console.log(
            "PLAYVAULT: Form edit dibuka."
        );

    };


/* =====================================================
   AMBIL DATA FORM
===================================================== */

function getGameFormData() {

    const title =
        getElement("title");


    const year =
        getElement("year");


    const rating =
        getElement("rating");


    if (!title) {

        throw new Error(
            "Input #title tidak ditemukan."
        );

    }


    const titleValue =
        title.value.trim();


    if (!titleValue) {

        throw new Error(
            "Judul game wajib diisi."
        );

    }


    const yearValue =
        year
            ? year.value.trim()
            : "";


    const ratingValue =
        rating
            ? rating.value.trim()
            : "";


    return {

        title:
            titleValue,


        platform:
            getElement("platform")
                ?.value
                .trim() || "",


        genre:
            getElement("genre")
                ?.value
                .trim() || "",


        year:
            yearValue
                ? Number(yearValue)
                : null,


        rating:
            ratingValue
                ? Number(ratingValue)
                : null,


        size:
            getElement("size")
                ?.value
                .trim() || "",


        developer:
            getElement("developer")
                ?.value
                .trim() || "",


        publisher:
            getElement("publisher")
                ?.value
                .trim() || "",


        language:
            getElement("language")
                ?.value
                .trim() || "",


        region:
            getElement("region")
                ?.value
                .trim() || "",


        image:
            getElement("image")
                ?.value
                .trim() || "",


        download_url:
            getElement("download_url")
                ?.value
                .trim() || "",


        description:
            getElement("description")
                ?.value
                .trim() || "",


        popular:
            getElement("popular")
                ?.checked || false,


        legal:
            getElement("legal")
                ?.checked || false

    };

}


/* =====================================================
   SIMPAN / UPDATE GAME
===================================================== */

if (gameForm) {

    gameForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            console.log(
                "PLAYVAULT: Form submit dijalankan."
            );


            const gameId =
                getElement("gameId")
                    ?.value
                    .trim() || "";


            let gameData;


            /* =========================================
    VALIDASI & AMBIL DATA
            ========================================= */

            try {

                gameData =
                    getGameFormData();

            }

            catch (error) {

                console.error(
                    "PLAYVAULT: Form validation error:",
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );


                return;

            }


            console.log(
                "PLAYVAULT: Data game:",
                gameData
            );
          /* =========================================
               DISABLE TOMBOL SIMPAN
            ========================================= */

            if (saveBtn) {

                saveBtn.disabled =
                    true;


                saveBtn.textContent =
                    gameId
                        ? "Memperbarui..."
                        : "Menyimpan...";

            }


            try {

                let result;


                /* =====================================
                   UPDATE GAME
                ===================================== */
              if (gameId) {

                    console.log(
                        "PLAYVAULT: UPDATE game ID:",
                        gameId
                    );


                    result =
                        await supabaseClient
                            .from("games")
                            .update(gameData)
                            .eq(
                                "id",
                                gameId
                            );

                }


                /* =====================================
                   INSERT GAME BARU
                ===================================== */
              else {

                    console.log(
                        "PLAYVAULT: INSERT game baru."
                    );


                    result =
                        await supabaseClient
                            .from("games")
                            .insert([
                                gameData
                            ]);

                }


                /* =====================================
                   CEK ERROR SUPABASE
                ===================================== */
              if (result.error) {

                    console.error(
                        "PLAYVAULT: Supabase save error:",
                        result.error
                    );


                    showMessage(
                        "Gagal menyimpan game: " +
                        result.error.message,
                        "error"
                    );


                    return;

                }


                /* =====================================
                   BERHASIL
                ===================================== */
console.log(
                    "PLAYVAULT: Game berhasil disimpan."
                );


                showMessage(
                    gameId
                        ? "Game berhasil diperbarui!"
                        : "Game berhasil ditambahkan!",
                    "success"
                );


                resetForm();


                if (gameForm) {

                    gameForm.style.display =
                        "none";

                }


                await loadGames();

            }

            catch (error) {

                console.error(
                    "PLAYVAULT: Save exception:",
                    error
                );


                showMessage(
                    "Terjadi kesalahan saat menyimpan game: " +
                    error.message,
                    "error"
                );

            }

            finally {

                if (saveBtn) {

                    saveBtn.disabled =
                        false;


                    saveBtn.textContent =
                        "Simpan Game";

                }

            }

        }
    );

}
/* =====================================================
   HAPUS GAME
===================================================== */

window.deleteGame =
    async function (id) {

        console.log(
            "PLAYVAULT: Hapus game ID:",
            id
        );


        const game =
            allGames.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(id)
                    );

                }
            );


        if (!game) {

            showMessage(
                "Game tidak ditemukan.",
                "error"
            );


            return;

        }


        const gameTitle =
            game.title ||
            "Game";


        const confirmed =
            confirm(
                'Yakin ingin menghapus game "' +
                gameTitle +
                '"?'
            );


        if (!confirmed) {

            return;

        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("games")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (error) {

                console.error(
                    "PLAYVAULT: Delete error:",
                    error
                );


                showMessage(
                    "Gagal menghapus game: " +
                    error.message,
                    "error"
                );


                return;

            }


            showMessage(
                "Game berhasil dihapus.",
                "success"
            );


            await loadGames();

        }

        catch (error) {

            console.error(
                "PLAYVAULT: Delete exception:",
                error
            );


            showMessage(
                "Terjadi kesalahan saat menghapus game: " +
                error.message,
                "error"
            );

        }

    };
/* =====================================================
   SEARCH GAME
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            /* =========================================
               JIKA SEARCH KOSONG
            ========================================= */

            if (!keyword) {

                renderGames(
                    allGames
                );


                return;

            }


            /* =========================================
               FILTER GAME
            ========================================= */
          const filtered =
                allGames.filter(
                    function (game) {

                        const title =
                            String(
                                game.title || ""
                            )
                                .toLowerCase();


                        const platform =
                            String(
                                game.platform || ""
                            )
                                .toLowerCase();


                        const genre =
                            String(
                                game.genre || ""
                            )
                                .toLowerCase();


                        const developer =
                            String(
                                game.developer || ""
                            )
                                .toLowerCase();


                        return (

                            title.includes(
                                keyword
                            )

                            ||

                            platform.includes(
                                keyword
                            )

                            ||

                            genre.includes(
                                keyword
                            )

                            ||

                            developer.includes(
                                keyword
                            )

                        );

                    }
                );


            renderGames(
                filtered
            );

        }
    );

}

/* =====================================================
   LOGOUT ADMIN
===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            const confirmed =
                confirm(
                    "Yakin ingin keluar dari Admin?"
                );


            if (!confirmed) {

                return;

            }


            logoutBtn.disabled =
                true;


            logoutBtn.textContent =
                "Keluar...";


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {

                    console.error(
                        "PLAYVAULT: Logout error:",
                        error
                    );


                    showMessage(
                        "Gagal keluar: " +
                        error.message,
                        "error"
                    );


                    logoutBtn.disabled =
                        false;


                    logoutBtn.textContent =
                        "Keluar";


                    return;

                }


                console.log(
                    "PLAYVAULT: Logout berhasil."
                );


                window.location.href =
                    "admin-login.html";

            }

            catch (error) {

                console.error(
                    "PLAYVAULT: Logout exception:",
                    error
                );


                showMessage(
                    "Terjadi kesalahan saat logout.",
                    "error"
                );


                logoutBtn.disabled =
                    false;


                logoutBtn.textContent =
                    "Keluar";

            }

        }
    );

}
/* =====================================================
   JALANKAN SAAT HALAMAN SELESAI
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "========================================"
        );

        console.log(
            "PLAYVAULT ADMIN JS AKTIF"
        );

        console.log(
            "Versi: CLEAN"
        );

        console.log(
            "========================================"
        );


        checkAdminSession();

    }
);