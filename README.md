# JKC Bed Management System

Sistem manajemen kasur untuk Jakarta Kidney Center dengan integrasi database PostgreSQL.

## Fitur

✅ **Manajemen Kasur**
- Lihat status kasur (kosong, terisi, diperbaiki)
- Assign pasien ke kasur
- Release kasur
- Tandai kasur sedang diperbaiki
- Durasi occupancy otomatis

✅ **Dashboard**
- Statistik real-time
- Filter berdasarkan status, lantai, ruangan
- Visualisasi layout ruangan

✅ **Backend API**
- RESTful API dengan Node.js + Express
- Database PostgreSQL dengan Sequelize
- CRUD operations untuk beds dan patients

## Struktur Project

```
tae/
├── backend/              # Backend API (Node.js + Express + Sequelize)
│   ├── config/          # Database configuration
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── migrations/      # Database migrations
│   ├── seeders/         # Database seeders
│   └── server.js        # Entry point
│
├── bed/                 # Frontend (Next.js + React + TypeScript)
│   └── src/
│   ├── components/     # React components
│   ├── context/        # React context (BedContext)
│   ├── lib/            # API client
│   └── types/          # TypeScript types
│
└── README.md           # This file
```

## Quick Start

Lihat file `SETUP.md` untuk panduan setup lengkap.

### Backend
```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

## Dokumentasi

- `SETUP.md` - Panduan setup lengkap
- `INTEGRATION.md` - Panduan integrasi backend-frontend
- `backend/README.md` - Dokumentasi API

## Tech Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

**Backend:**
- Node.js
- Express
- Sequelize ORM
- PostgreSQL

## License

Private project for Jakarta Kidney Center
