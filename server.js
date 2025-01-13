const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));
// Lokasi file data
const DATA_FILE = path.join(__dirname, 'registrations.json');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk menerima data pendaftaran
app.post('/register', (req, res) => {
    const { name, phone, email, program } = req.body;

    // Validasi data
    if (!name || !phone || !email || !program) {
        return res.status(400).json({ message: 'Data tidak lengkap!' });
    }

    // Baca data dari file dengan validasi
    let registrations = [];
    try {
        registrations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (!Array.isArray(registrations)) {
            registrations = [];
        }
    } catch (error) {
        registrations = []; // Jika file tidak ditemukan atau error parsing
    }

    // Cek apakah nomor WhatsApp sudah terdaftar
    const isAlreadyRegistered = registrations.some(
        (registrant) => registrant.phone === phone
    );
    if (isAlreadyRegistered) {
        return res.status(409).json({ message: 'Nomor WhatsApp sudah terdaftar!' });
    }

    // Tambahkan data baru
    const newRegistration = { name, phone, email, program };
    registrations.push(newRegistration);

    // Simpan data ke file
    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));

    console.log('Data pendaftaran diterima:', newRegistration);
    res.status(200).json({ message: 'Pendaftaran berhasil diterima!' });
});

// Endpoint untuk mendapatkan daftar pendaftar
app.get('/registrants', (req, res) => {
    let registrations = [];
    try {
        registrations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        registrations = [];
    }
    res.status(200).json(registrations);
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
