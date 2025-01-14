document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Mencegah pengiriman form default

    // Konfigurasi bot Telegram
    const token = "7560154207:AAHzLPgHMwrIQ93QbfZCctIW15wtbxR6Ha0"; // Ganti dengan token bot Telegram Anda
    const chat_id = "1300525923"; // Ganti dengan ID chat atau grup
    const sendMessageURL = `https://api.telegram.org/bot${token}/sendMessage`;
    const sendFileURL = `https://api.telegram.org/bot${token}/sendDocument`;

    // Ambil data dari form
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const paymentProof = document.getElementById("payment-proof").files[0]; // Ambil file bukti pembayaran

    // Validasi data input
    if (!/^\d+$/.test(phone)) {
        alert("Nomor WhatsApp harus berupa angka saja!");
        return;
    }

    // Gabungkan data ke string untuk pengecekan unik
    const uniqueKey = `${name}-${phone}-${email}`;

    // Ambil daftar pendaftar dari Local Storage
    let registrants = JSON.parse(localStorage.getItem("registrants")) || [];
    const isAlreadyRegistered = registrants.some((registrant) => registrant === uniqueKey);

    if (isAlreadyRegistered) {
        alert("Anda sudah terdaftar! Tunggu Admin mengundang Anda ke grup.");
        return; // Hentikan proses jika data sudah terdaftar
    }

    // Tambahkan data baru ke daftar
    registrants.push(uniqueKey);
    localStorage.setItem("registrants", JSON.stringify(registrants));

    // Hitung jumlah pendaftar
    const totalRegistrants = registrants.length;

    // Kirim pesan teks ke bot Telegram
    const message = `
Pendaftaran Baru:
Urutan ke: ${totalRegistrants}
Nama: ${name}
No WhatsApp: ${phone}
Email: ${email}
    `;
    try {
        await fetch(sendMessageURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chat_id,
                text: message,
            }),
        });
    } catch (error) {
        console.error("Gagal mengirim data ke Telegram:", error);
        alert("Gagal mengirim pesan ke Telegram. Silakan coba lagi.");
        return;
    }

    // Kirim file bukti pembayaran ke bot (jika ada file yang diunggah)
    if (paymentProof) {
        const formData = new FormData();
        formData.append("chat_id", chat_id);
        formData.append("document", paymentProof); // Gunakan "photo" jika file adalah gambar

        try {
            await fetch(sendFileURL, {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.error("Gagal mengirim file ke Telegram:", error);
            alert("Gagal mengirim bukti pembayaran ke Telegram. Silakan coba lagi.");
            return;
        }
    }

    // Kirim data ke server backend
    try {
        await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                email: email,
            }),
        });
        console.log("Data berhasil disimpan di server backend.");
    } catch (error) {
        console.error("Gagal menyimpan data di server backend:", error);
        alert("Gagal menyimpan data ke server. Silakan coba lagi.");
        return;
    }

    alert("Pendaftaran berhasil! Data dan bukti pembayaran telah dikirim.");
    // Reset form setelah pendaftaran berhasil
    document.getElementById("registrationForm").reset();
});

// Fungsi untuk navigasi antar tab
function showTab(tabId) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach((tab) => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");

    const tabButtons = document.querySelectorAll(".tab");
    tabButtons.forEach((button) => {
        button.classList.remove("active");
    });

    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add("active");
}

// Data tim pengajar
let currentTeacherIndex = 0;
const teachers = [
    {
        name: "SMDK EIKEL K PERANGIN-ANGIN",
        photo: "images/ekel1.jpg",
        prodi: "Teknik Mesin",
        umur: "20 Tahun",
        asal: "Sumatera Utara",
        semester: "5",
        nowa: "081265167017",
    },
    {
        name: "SMDK MICHAEL FALDO",
        photo: "images/faldo1.jpg",
        prodi: "Teknik Elektro",
        umur: "20 Tahun",
        asal: "Tangerang",
        semester: "5",
        nowa: "081211367521",
    },
    {
        name: "SMDK IMMANUEL SIMANJUNTAK",
        photo: "images/iman1.jpg",
        prodi: "Teknik Mesin",
        umur: "21 Tahun",
        asal: "Sumatera Utara",
        semester: "5",
        nowa: "081909150803",
    },
];

// Fungsi untuk memperbarui detail pengajar
function updateTeacher() {
    const teacher = teachers[currentTeacherIndex];

    // Pastikan elemen dengan ID yang benar ada di HTML
    document.getElementById("teacher-name").textContent = teacher.name;
    document.getElementById("teacher-photo").src = teacher.photo;
    document.getElementById("teacher-photo").alt = `Foto ${teacher.name}`;
    document.getElementById("teacher-prodi").textContent = teacher.prodi;
    document.getElementById("teacher-umur").textContent = teacher.umur;
    document.getElementById("teacher-wa").textContent = teacher.nowa;
    document.getElementById("teacher-asal").textContent = teacher.asal;
    document.getElementById("teacher-semester").textContent = teacher.semester;
}

// Fungsi untuk tombol Next
function nextTeacher() {
    currentTeacherIndex = (currentTeacherIndex + 1) % teachers.length;
    updateTeacher();
}

// Fungsi untuk tombol Previous
function prevTeacher() {
    currentTeacherIndex = (currentTeacherIndex - 1 + teachers.length) % teachers.length;
    updateTeacher();
}

// Event listener untuk tombol
document.getElementById("prev-teacher").addEventListener("click", prevTeacher);
document.getElementById("next-teacher").addEventListener("click", nextTeacher);

// Update pengajar pertama kali ketika halaman dimuat
window.addEventListener("load", updateTeacher);
