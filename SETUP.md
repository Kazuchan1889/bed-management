# Setup JKC Bed Management System

## Quick Start

### 1. Setup Backend

```bash
# Masuk ke folder backend (di root workspace, bukan di dalam bed/)
cd backend

# Install dependencies
npm install

# Buat file .env (copy dari .env.example atau buat manual)
# Isi dengan:
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=JKC
# DB_PASSWORD=Diona188
# DB_PORT=5432
# PORT=3001
# NODE_ENV=development

# Initialize database (membuat tabel dan seed data)
npm run init-db

# Jalankan backend
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 2. Setup Frontend

```bash
# Di root folder bed/
# Buat file .env.local
# Isi dengan:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Install dependencies (jika belum)
npm install

# Jalankan frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Verifikasi

1. **Cek backend:** Buka `http://localhost:3001/api/health` - harus return `{"status":"OK",...}`
2. **Cek database:** Buka `http://localhost:3001/api/beds` - harus return array of beds
3. **Cek frontend:** Buka `http://localhost:3000` - harus tampil dashboard

## Troubleshooting

- **Backend error:** Pastikan PostgreSQL running dan database JKC sudah dibuat
- **Frontend tidak load data:** Pastikan backend running dan CORS enabled
- **Database kosong:** Run `npm run init-db` lagi di backend

