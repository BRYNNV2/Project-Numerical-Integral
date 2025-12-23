# 🔢 IntegralNumerik - Numerical & Symbolic Integral Calculator

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MathLive](https://img.shields.io/badge/MathLive-Desmos_Input-blue?style=for-the-badge)

**IntegralNumerik** adalah aplikasi web modern untuk menghitung integral tentu dan tak tentu. Aplikasi ini menawarkan solusi langkah demi langkah (*step-by-step*) yang ideal untuk pelajar dan mahasiswa yang sedang mempelajari Metode Numerik atau Kalkulus.

---

## ✨ Fitur Unggulan

### 1. 📐 Dual Mode Calculation
- **Integral Tentu (Definite)**:
  - Menggunakan metode numerik presisi tinggi.
  - Pilihan metode: **Aturan Trapesium**, **Simpson 1/3**, dan **Simpson 3/8**.
  - Input batas bawah ($a$), batas atas ($b$), dan jumlah pias ($N$).
  - **Analisis Galat (Error)**: Menghitung persentase error dibandingkan nilai eksak (menggunakan engine simbolik di belakang layar).

- **Integral Tak Tentu (Indefinite/Symbolic)**:
  - Solusi analitik/simbolik (dalah bentuk rumus).
  - Dilengkapi fitur **Verifikasi Otomatis** (Hasil diturunkan kembali untuk membuktikan kebenaran).
  - Deteksi pola otomatis untuk metode Substitusi.

### 2. 📝 Input Matematika Intuitif
- Menggunakan **MathLive** untuk pengalaman input rumus seperti menulis di kertas (WYSIWYG LaTeX).
- Keyboard virtual matematika lengkap.

### 3. 🧠 Smart Step-by-Step Solver
- **Langkah Penyelesaian Lengkap**:
  - Untuk Numerik: Menampilkan tabel iterasi, perhitungan $h$, substitusi rumus, dan perhitungan akhir.
  - Untuk Simbolik: Menampilkan konsep dasar, metode (substitusi/polinomial), hasil integrasi, dan pembuktian turunan.

### 4. 📱 Responsive & Modern UI
- Tampilan desain yang bersih, simpel, dan responsif untuk Desktop maupun HP.
- **Single Page Application (SPA)**: Navigasi cepat tanpa reload antara Kalkulator, Teori, dan Tentang.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Math Engine**:
  - [Nerdamer](https://nerdamer.com/): Untuk komputasi simbolik (Integral tak tentu & Turunan).
  - Custom JavaScript Algorithms: Untuk metode numerik (Trapezoidal/Simpson).
- **UI Components**:
  - [MathLive](https://cortexjs.io/mathlive/): Input LaTeX interaktif.
  - [React-KaTeX](https://github.com/talyssonoc/react-katex): Rendering rumus matematika yang indah.
  - [Lucide React](https://lucide.dev/): Ikon modern.

---

## 🚀 Cara Menjalankan

Ikuti langkah ini untuk menjalankan project di komputer lokal Anda:

### Prasyarat
- Pastikan sudah terinstall [Node.js](https://nodejs.org/) (versi 16+ disarankan).

### Instalasi
1. Clone repositori ini:
   ```bash
   git clone https://github.com/BRYNNV2/Project-Numerical-Integral.git
   cd Project-Numerical-Integral
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan server development:
   ```bash
   npm run dev
   ```

4. Buka browser dan akses alamat yang muncul (biasanya `http://localhost:5173`).

---

## 📚 Metode Numerik Supported

| Metode | Deskripsi | Syarat N |
|--------|-----------|----------|
| **Aturan Trapesium** | Pendekatan linear (garis lurus) per pias. | Bebas (Integer > 0) |
| **Simpson 1/3** | Pendekatan kuadratik (parabola). | Wajib Genap |
| **Simpson 3/8** | Pendekatan kubik. | Wajib Kelipatan 3 |

---

## 👥 Tim Pengembang

Project ini dibuat untuk memenuhi Tugas Besar mata kuliah Metode Numerik Semseter 5.

---

Made with ❤️ by [BRYNNV2](https://github.com/BRYNNV2)
