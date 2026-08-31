/* =====================================================
   PLAYVAULT ADMIN
   APP.JS — VERSI BERSIH
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
   DATA GAME
===================================================== */

let allGames = [];


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
   MESSAGE
===================================================== */

function showMessage(text, type) {

    if (!message) {
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


    setTimeout(
        function () {

            if (message) {

                message.className = "";

                message.textContent = "";

            }

        },
        5000
    );

}


/* =====================================================
   CEK LOGIN ADMIN
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
                "Session error:",
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
            data.session;


        if (!session) {

            console.log(
                "PLAYVAULT: Tidak ada session."
            );


            window.location.href =
                "admin-login.html";


            return;

        }


        console.log(
            "PLAYVAULT: Admin sudah login."
        );


        loadGames();

    }

    catch (error) {

        console.error(
            "Check session error:",
            error
        );

        showMessage(
            "Terjadi kesalahan saat mengecek login.",
            "error"
        );

    }

}


/* =====================================================
   LOAD GAME
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
            data || [];


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
            "Load games error:",
            error
        );


        showMessage(
            "Terjadi kesalahan saat mengambil data game.",
            "error"
        );

    }

}


/* =====================================================
   STATISTIK
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
   RENDER GAME
===================================================== */

function renderGames(games) {

    if (!gameTable) {
        return;
    }


    if (
        !games ||
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
            .map(
                function (game) {

                    const image =
                        game.image ||
                        "https://placehold.co/55x65?text=Game";


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
                                    alt="${escapeHtml(
                                        game.title || "Game"
                                    )}"
                                    onerror="
                                        this.src='https://placehold.co/55x65?text=Game'
                                    "
                                >

                            </td>


                            <td>

                                <strong>
                                    ${escapeHtml(
                                        game.title || "-"
                                    )}
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

                }
            )
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
        document.getElementById(
            "gameId"
        );


    if (gameId) {

        gameId.value = "";

    }


    if (saveBtn) {

        saveBtn.textContent =
            "Simpan Game";

    }

}


/* =====================================================
   TAMPILKAN FORM TAMBAH
===================================================== */

if (addGameBtn) {

    addGameBtn.addEventListener(
        "click",
        function () {

            resetForm();


            gameForm.style.display =
                "block";


            if (saveBtn) {

                saveBtn.textContent =
                    "Simpan Game";

            }
if (gameForm) {

    gameForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // proses simpan ke Supabase

        }
    );

}

            const title =
                document.getElementById(
                    "title"
                );


            if (title) {

                title.focus();

            }


            gameForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/* =====================================================
   BATAL
===================================================== */

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function () {

            resetForm();


            gameForm.style.display =
                "none";

        }
    );

}


/* =====================================================
   EDIT GAME
===================================================== */

window.editGame =
    function (id) {

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


        document.getElementById(
            "gameId"
        ).value =
            game.id;


        document.getElementById(
            "title"
        ).value =
            game.title || "";


        document.getElementById(
            "platform"
        ).value =
            game.platform || "";


        document.getElementById(
            "genre"
        ).value =
            game.genre || "";


        document.getElementById(
            "year"
        ).value =
            game.year ?? "";


        document.getElementById(
            "rating"
        ).value =
            game.rating ?? "";


        document.getElementById(
            "size"
        ).value =
            game.size || "";


        document.getElementById(
            "developer"
        ).value =
            game.developer || "";


        document.getElementById(
            "publisher"
        ).value =
            game.publisher || "";


        document.getElementById(
            "language"
        ).value =
            game.language || "";


        document.getElementById(
            "region"
        ).value =
            game.region || "";


        document.getElementById(
            "image"
        ).value =
            game.image || "";


        document.getElementById(
            "download_url"
        ).value =
            game.download_url || "";


        document.getElementById(
            "description"
        ).value =
            game.description || "";


        document.getElementById(
            "popular"
        ).checked =
            game.popular === true;


        document.getElementById(
            "legal"
        ).checked =
            game.legal === true;


        if (saveBtn) {

            saveBtn.textContent =
                "Perbarui Game";

        }


        gameForm.style.display =
            "block";


        gameForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    };


/* =====================================================
   SIMPAN / UPDATE GAME
===================================================== */

if (gameForm) {

    gameForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const gameId =
                document.getElementById(
                    "gameId"
                ).value;


            const title =
                document.getElementById(
                    "title"
                ).value.trim();


            if (!title) {

                showMessage(
                    "Judul game wajib diisi.",
                    "error"
                );

                return;

            }


            const yearValue =
                document.getElementById(
                    "year"
                ).value;


            const ratingValue =
                document.getElementById(
                    "rating"
                ).value;


            const gameData = {

                title: title,

                platform:
                    document.getElementById(
                        "platform"
                    ).value.trim(),

                genre:
                    document.getElementById(
                        "genre"
                    ).value.trim(),

                year:
                    yearValue
                        ? Number(yearValue)
                        : null,

                rating:
                    ratingValue
                        ? Number(ratingValue)
                        : null,

                size:
                    document.getElementById(
                        "size"
                    ).value.trim(),

                developer:
                    document.getElementById(
                        "developer"
                    ).value.trim(),

                publisher:
                    document.getElementById(
                        "publisher"
                    ).value.trim(),

                language:
                    document.getElementById(
                        "language"
                    ).value.trim(),

                region:
                    document.getElementById(
                        "region"
                    ).value.trim(),

                image:
                    document.getElementById(
                        "image"
                    ).value.trim(),

                download_url:
                    document.getElementById(
                        "download_url"
                    ).value.trim(),

                description:
                    document.getElementById(
                        "description"
                    ).value.trim(),

                popular:
                    document.getElementById(
                        "popular"
                    ).checked,

                legal:
                    document.getElementById(
                        "legal"
                    ).checked

            };


            console.log(
                "PLAYVAULT: Data game:",
                gameData
            );


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


                /* =========================
                   UPDATE
                ========================= */

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


                /* =========================
                   INSERT
                ========================= */

                else {

                    result =
                        await supabaseClient
                            .from("games")
                            .insert([
                                gameData
                            ]);

                }


                if (result.error) {

                    console.error(
                        "Supabase save error:",
                        result.error
                    );


                    showMessage(
 "Gagal menyimpan game: " +
                        result.error.message,
                        "error"
                    );

                    return;

                }


                showMessage(
                    gameId
                        ? "Game berhasil diperbarui!"
                        : "Game berhasil ditambahkan!",
                    "success"
                );


                resetForm();


                gameForm.style.display =
                    "none";


                await loadGames();

            }

            catch (error) {

                console.error(
                    "Save exception:",
                    error
                );


                showMessage(
                    "Terjadi kesalahan saat menyimpan game.",
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


        const confirmed =
            confirm(
                'Yakin ingin menghapus game "' +
                (game.title || "Game") +
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


            showMessage(
                "Game berhasil dihapus.",
                "success"
            );


            await loadGames();

        }

        catch (error) {

            console.error(
                "Delete exception:",
                error
            );


            showMessage(
                "Terjadi kesalahan saat menghapus game.",
                "error"
            );

        }

    };


/* =====================================================
   SEARCH
===================================================== */
if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            if (!keyword) {

                renderGames(
                    allGames
                );

                return;

            }


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
   LOGOUT
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
                        "Logout error:",
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


                window.location.href =
                    "admin-login.html";

            }

            catch (error) {

                console.error(
                    "Logout exception:",
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
            "================================="
        );

        console.log(
            "PLAYVAULT ADMIN JS AKTIF"
        );

        console.log(
            "================================="
        );


        checkAdminSession();

    }
);
