# ⚔️ ChronoQuest — 8-Bit Gamified Pomodoro & Identity-Driven Goals

Aplikasi Pomodoro RPG Gamified pribadi berteknologi tinggi dengan estetika visual Pixel Art retro, sistem gol bertingkat (Harian, Bulanan, Tahunan) berbasis Identitas Diri (*Atomic Habits*), analitik statistik lengkap (*GitHub-style Activity Heatmap*), serta multi-metode fokus (25-5, 50-10, 40-10, 20-4, 90-20, dan Kustom).

---

## 🎮 Fitur Utama

### 1. 🧙 RPG Gamification Engine
- **Karakter Hero Personal**: Leveling bertingkat (Level 1 Novice hingga Level 50+ *Mythic Omniscient Time Lord*).
- **Vigor HP & Mana Focus**: Bar vitals pixel retro yang terisi ulang melalui konsistensi fokus harian.
- **Koin Emas & EXP**: Setiap menit fokus menghasilkan EXP dan Gold (dilengkapi pengali EXP pada sesi Deep Work).
- **Animasi Sprite Pixel & Companion Pets**:
  - Avatar: *Chrono Mage*, *Cyber Netrunner*, *Iron Paladin*, *Shadow Shinobi*.
  - Peliharaan Companion: *Pixel Slime*, *Mecha Cybercat*, *Fireling Wyrm*, *Omni Observer Drone*.
- **Guild Quest Board**: Misi harian otomatis dengan hadiah bonus XP dan Gold.
- **Hall of Badges & Trophies**: Lencana pencapaian (*First Blood*, *Iron Will Streak*, *Deep Sea Explorer*, *Centurion 100*).
- **Chrono Armory & Shop**: Tukarkan Gold hasil kerja keras untuk membeli avatar, peliharaan, dan tema tampilan retro baru.

### 2. 🎯 Identity-Driven Goals (Atomic Habits Framework)
- **Identitas Inti (*Core Identity*)**:
  - Siapa yang ingin kamu bentuk melalui fokusmu? (*Who do you wish to become?*)
  - Contoh bawaan: *Fullstack Architect*, *Deep Thinker & Writer*, *Polymath Learner*.
  - Buat identitas kustom dengan nama, peran, warna, dan kalimat afirmasi/motto filosofis.
- **Target Bertingkat (*Tiered Goals*)**:
  - **Daily Goals (Harian)**: Target sesi dan menit untuk hari ini.
  - **Monthly Goals (Bulanan)**: Target akumulasi jam dan sesi bulan berjalan.
  - **Annually Goals (Tahunan)**: Komitmen visi besar satu tahun penuh.
- **Otomasi Progres**: Sesi fokus yang selesai secara otomatis menambahkan durasi dan progres ke seluruh gol yang bertaut ke identitas terkait!

### 3. ⏱️ Beragam Metode & Ritme Pomodoro
- **25-5 Standard**: Metode klasik orisinal Francesco Cirillo untuk ritme kerja stabil.
- **50-10 Deep Work**: Sesi mendalam berdurasi tinggi dengan bonus **+30% EXP** (ideal untuk programming arsitektur & coding kompleks).
- **40-10 Golden Flow**: Titik seimbang stamina kognitif dengan bonus **+15% EXP**.
- **20-4 Anime Sprint**: Sesi kilat cepat untuk mengatasi prokrastinasi.
- **90-20 Ultradian Rhythm**: Siklus biologis alami tubuh untuk output kreatif puncak dengan bonus **+60% EXP**.
- **Custom Preset Editor**: Atur sendiri durasi fokus, istirahat pendek, istirahat panjang, dan jumlah ronde siklus.

### 4. 📊 Data Statistik & Heatmap
- **Ringkasan Metrik**: Total menit fokus, menit hari ini, *Current Streak*, *Longest Streak*, dan total Gold.
- **Matriks Aktivitas 70-Hari (*Activity Heatmap*)**: Visualisasi piksel gaya kontribusi GitHub dengan 5 level intensitas warna dan tooltip interaktif.
- **Distribusi Alokasi per Identitas**: Grafik persentase alokasi waktu untuk memastikan dedikasi terbagi seimbang.
- **Log Riwayat Petualangan**: Catatan riwayat sesi lengkap dengan tanggal, durasi, perolehan EXP & Gold, serta filter identitas.
- **Cadangan Data Mandiri**: Fitur **Ekspor JSON** dan **Impor JSON** agar seluruh data progres pribadi tidak pernah hilang.

### 5. 🔊 Web Audio Synthesizer & Suasana Fokus
- **Sintesis Suara 8-Bit Murni**: Menggunakan *Web Audio API* prosedural (tanpa file mp3 eksternal, latensi nol).
  - Efek klik tombol retro, melodi mulai sesi, nada jeda, melodi kemenangan sesi, dan fanfare perayaan *Level Up*.
- **Fokus Ambience Generator**:
  - *Hujan Pixel Lo-Fi* (procedural bandpass filtered rain).
  - *Brown Noise Dalam* (gelombang stabil untuk meredam distraksi).
  - *Cosmic Drone 432Hz* (frekuensi gelombang fokus meditatif).

### 6. 📺 Tampilan Pixel Art & Tema Layar
- Efek **CRT Scanlines** & *Vignette* tabung retro TV (dapat diaktifkan/dinonaktifkan kapan saja).
- 5 Tema Palet Warna:
  - *Cyber Dungeon* (Default Neon Cyberpunk)
  - *GameBoy 1989* (Monokrom hijau nostalgia)
  - *Arcade Neon 1984* (Magenta & ungu tajam)
  - *Amber Phosphor CRT* (Terminal amber klasik)
  - *Sakura Dream* (Lavender lembut dan pastel)

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: React 19 + TypeScript (Strict Type Safety + VerbatimModuleSyntax).
- **Bundler & Tooling**: Vite 8 + Bun runtime berkecepatan tinggi.
- **Styling**: Tailwind CSS v4 dengan sistem desain retro piksel kustom, *pixel borders*, *pixel corners polygon*, dan tipografi Google Fonts (*Press Start 2P*, *Silkscreen*, *VT323*, *Space Grotesk*).
- **State Management**: Zustand v5 terisolasi modular dengan persistensi otomatis ke `localStorage`.
- **Audio Engine**: Web Audio API oscillator & procedural noise buffers.
- **Visual FX**: Canvas Confetti untuk perayaan level up & klaim quest.

---

## 🚀 Panduan Menjalankan

### Menjalankan Mode Development:
```bash
bun install
bun run dev
```
Akses aplikasi melalui browser di: `http://localhost:5173`

### Membangun Versi Produksi:
```bash
bun run build
bun run preview
```
Output siap deploy berada di folder `/dist`.
