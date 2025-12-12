# Panduan Integrasi Backend dengan Frontend

## Setup Backend

1. **Masuk ke folder backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Pastikan PostgreSQL berjalan dan database JKC sudah dibuat:**
```sql
CREATE DATABASE JKC;
```

4. **Setup environment:**
Buat file `.env` di `bed/backend/`:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=JKC
DB_PASSWORD=Diona188
DB_PORT=5432
PORT=3001
NODE_ENV=development
```

5. **Initialize database:**
```bash
npm run init-db
```

6. **Jalankan backend:**
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

## Setup Frontend

1. **Setup environment:**
Buat file `.env.local` di `bed/` (root folder frontend):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. **Jalankan frontend:**
```bash
cd bed
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Fitur yang Terintegrasi

✅ **Load beds dari database** - Semua data kasur diambil dari PostgreSQL
✅ **Assign pasien** - Data pasien disimpan di database
✅ **Release bed** - Update status bed di database
✅ **Set repair** - Tandai kasur sedang diperbaiki dengan catatan
✅ **Set available** - Kembalikan kasur ke status kosong
✅ **Durasi occupancy** - Dihitung dari `assignedAt` di database
✅ **Statistics** - Diambil dari database secara real-time
✅ **Filter beds** - Filter berdasarkan status, lantai, ruangan

## Struktur Data

### Bed Object
```typescript
{
  id: number;
  status: 'available' | 'occupied' | 'repair' | 'maintenance';
  room: string;
  floor: number;
  patient?: Patient;
  assignedAt?: Date;
  repairNote?: string;
}
```

### Patient Object
```typescript
{
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female';
  medicalRecord?: string;
}
```

## Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan PostgreSQL berjalan
- Cek kredensial di `.env`
- Pastikan database `JKC` sudah dibuat

### Frontend tidak bisa connect ke API
- Pastikan backend berjalan di port 3001
- Cek `NEXT_PUBLIC_API_URL` di `.env.local`
- Cek CORS settings di backend

### Data tidak muncul
- Pastikan sudah run `npm run init-db` di backend
- Cek console browser untuk error
- Cek console backend untuk error

