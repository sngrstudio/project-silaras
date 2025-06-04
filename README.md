# SILARAS - Sistem Laporan Dapur Sehat Atasi Stunting (DASHAT)

![SILARAS Logo](https://img.shields.io/badge/SILARAS-Nutrition%20Monitoring-green?style=for-the-badge)
[![Astro](https://img.shields.io/badge/Astro-5.8.1-FF5D01?style=flat&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19.1.0-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-3.14.1-00000F?style=flat&logo=mysql&logoColor=white)](https://mysql.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-2.6.1-3448C5?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

## 📝 Tentang SILARAS

SILARAS (Sistem Laporan Dapur Sehat Atasi Stunting / DASHAT) adalah aplikasi web berbasis teknologi modern yang dirancang khusus untuk membantu pemantauan dan pencegahan stunting pada anak-anak di Kabupaten Kotawaringin Timur, Kalimantan Tengah. Aplikasi ini menyediakan platform terintegrasi untuk tenaga kesehatan, kader posyandu, dan pengelola lapangan dalam melakukan asesmen gizi harian dan bulanan secara sistematis.

Sistem ini melayani **1.200+ wilayah** di Kotawaringin Timur dengan struktur hierarkis: 17 Kecamatan dan ratusan Desa, memberikan monitoring komprehensif status gizi anak dan praktik dapur sehat keluarga.

### 🎯 Tujuan Utama

- **📋 Pelaporan Dapur Sehat**: Mencatat dan menilai praktik dapur sehat keluarga dalam menyiapkan makanan bergizi untuk anak
- **🍽️ Monitoring Gizi Harian**: Pemantauan asupan makanan anak setiap hari berdasarkan 5 komponen utama (makanan pokok, lauk pauk, sayuran, buah-buahan, dan kesesuaian resep)
- **📊 Asesmen Bulanan**: Monitoring berat badan, tinggi badan, dan perhitungan BMI secara berkala
- **🎯 Sistem Penilaian Cerdas**: Klasifikasi otomatis status gizi dengan kategori "Terbiasa", "Butuh Pendampingan", atau "Butuh Pendampingan dan Penguatan"
- **📸 Dokumentasi Visual**: Upload foto makanan untuk verifikasi dan dokumentasi praktik dapur sehat
- **📈 Laporan Komprehensif**: Dashboard dengan statistik lengkap dan indikator perkembangan keluarga dalam menerapkan dapur sehat

### 🌟 Keunggulan Sistem

- **🔐 Session-Based Authentication**: Sistem autentikasi aman menggunakan Oslo crypto dengan session management
- **🗺️ Geographic Hierarchy**: Manajemen data berdasarkan wilayah (Kabupaten → Kecamatan → Desa)
- **🔄 Real-time Scoring**: Perhitungan skor dan klasifikasi otomatis menggunakan computed columns
- **☁️ Cloudinary Integration**: Penyimpanan foto makanan dengan optimasi otomatis dan CDN global
- **📱 Responsive Design**: Interface yang optimal untuk desktop dan mobile
- **🛡️ Type Safety**: Full TypeScript implementation untuk reliabilitas tinggi
- **🐳 Docker Ready**: Containerized deployment dengan multi-stage builds
- **⚡ Performance Optimized**: Astro Islands architecture dengan selective hydration

## ✨ Fitur Utama

### 🍽️ Pelaporan Dapur Sehat Harian

- **Checklist Komprehensif** untuk 5 komponen dapur sehat:
  - 🍚 Makanan pokok (nasi, roti, kentang, dll)
  - 🥩 Lauk pauk (protein hewani/nabati)
  - 🥬 Sayuran segar
  - 🍎 Buah-buahan
  - 📋 Mengikuti resep yang diberikan
- **📸 Upload Foto Makanan** dengan integrasi Cloudinary dan optimasi otomatis
- **⚡ Scoring Otomatis** berdasarkan kelengkapan komponen
- **📊 Completion Rate Tracking** per bulan untuk menilai konsistensi keluarga
- **🎯 Smart Classification** berdasarkan skor dan consistency rate

### 📊 Monitoring Pertumbuhan Antropometri

- **📏 Input Data Antropometri** (tinggi badan, berat badan)
- **🧮 Perhitungan BMI Otomatis** menggunakan database computed columns
- **🏷️ Klasifikasi Status Gizi** berdasarkan standar WHO
- **📈 Tracking Perubahan** dari bulan ke bulan dengan delta indicators
- **🎨 Visual Indicators** dengan color-coding untuk interpretasi mudah
- **📅 Historical Data** untuk melihat tren perkembangan

### 🎯 Sistem Klasifikasi Cerdas

Sistem scoring canggih dengan 4 kategori berdasarkan algoritma yang mempertimbangkan skor dan completion rate:

- **🔄 On Progress**: Completion rate < 75% (memerlukan lebih banyak data)
- **✅ Terbiasa**: Skor ≥ 120 dengan adjustment completion rate
- **⚠️ Butuh Pendampingan**: Skor 90-119 (perlu monitoring lebih intensif)
- **🚨 Butuh Pendampingan dan Penguatan**: Skor < 90 (intervensi prioritas)

### 👥 Manajemen Multi-Level dengan Pembatasan Regional

#### 🏛️ **Access Level 1 - Admin Dinas**

- Kontrol penuh seluruh sistem
- Manajemen user dan regional assignment
- Dashboard statistik kabupaten
- Export dan laporan komprehensif

#### 🗺️ **Access Level 2 - PLKB Kecamatan**

- Akses data dalam cakupan kecamatan
- Manajemen kader di wilayah kerja
- Dashboard statistik kecamatan
- Monitoring performance kader

#### 👨‍⚕️ **Access Level 3 - Kader DASHAT**

- Input dan edit data pasien di desa assignment
- Asesmen harian dan bulanan
- Upload foto makanan
- Dashboard pasien dalam wilayah kerja

#### 👁️ **Access Level 4 - Viewer**

- Read-only access
- View dashboard dan laporan
- Tanpa permission edit data

### 🗺️ Manajemen Geografis Hierarkis

- **📍 Struktur 3-Level**: Kabupaten → Kecamatan → Desa
- **🎯 Regional Assignment**: User dibatasi akses sesuai wilayah kerja
- **🔍 Smart Filtering**: Data otomatis difilter berdasarkan scope regional
- **📊 Aggregated Reports**: Statistik per tingkat administratif
- **🌍 Coverage**: 17 Kecamatan dengan 1.200+ Desa di Kotawaringin Timur

### 📋 Template Management System

- **📝 Daily Assessment Templates**: Template asesmen harian yang dapat dikustomisasi
- **📊 Monthly Assessment Templates**: Template pengukuran antropometri
- **🔄 Version Control**: Tracking perubahan template dan implementasi
- **⚙️ Flexible Configuration**: Mudah adaptasi untuk kebutuhan berbeda

### 🔐 Authentication & Security

- **🛡️ Oslo Crypto Integration**: Modern cryptographic primitives untuk session-based authentication
- **🔑 Role-Based Access Control**: Pembatasan akses berdasarkan level dan regional assignment
- **🛡️ Middleware Protection**: Route protection dengan authentication check
- **🔒 Data Isolation**: User hanya bisa akses data sesuai assignment regional
- **⏰ Session Management**: Secure 7-day session expiration dengan automatic cleanup

## 🏗️ Current Technology Stack (Production Ready)

### Core Framework & Runtime

- **Astro 5.8.1** - Modern static site generator dengan islands architecture
- **React 19.1.0** - Latest React dengan Server Components support
- **TypeScript 5.8.3** - Full type safety untuk development dan production
- **Node.js 22.16.0** - LTS runtime dengan optimal performance

### Frontend & Styling

- **Tailwind CSS 4.1.6** - Latest utility-first CSS framework
- **DaisyUI 5.0.35** - Pre-built component library
- **@iconify/json 2.2.337** - Comprehensive icon ecosystem
- **React Leaflet 5.0.0** - Interactive maps untuk geographic features

### Backend & Database

- **Drizzle ORM 0.43.1** - Type-safe database operations
- **MySQL2 3.14.1** - High-performance MySQL driver
- **Argon2 0.43.0** - Secure password hashing
- **Express 5.1.0** - Production server dengan middleware support

### Cloud & Storage

- **Cloudinary 2.6.1** - Image storage, optimization, dan CDN
- **@cloudinary/url-gen 1.21.0** - URL generation untuk responsive images

### State Management

- **Nanostores 1.0.1** - Lightweight state management
- **@nanostores/react 1.0.0** - React integration
- **@nanostores/persistent 1.0.0** - Client-side persistence

### Development Tools

- **Vite 6.3.5** - Fast build system dengan HMR
- **tsx 4.19.4** - TypeScript execution engine
- **Prettier 3.5.3** - Code formatting dengan plugins
- **Concurrently 9.1.2** - Multi-process development

### Database & Deployment

- **MariaDB 10.11.10** - Production database (Docker)
- **Docker** - Containerized deployment
- **Docker Compose** - Multi-service orchestration

## 📁 Struktur Database & Schema

### 🏗️ Core Tables

#### 👶 **Target Management**

```sql
-- Tabel utama untuk data anak/sasaran
target
├── id (UUID, PK)
├── name
├── birth_date
├── age (computed column) -- Otomatis hitung umur
├── gender
├── address
├── parent_name
├── parent_phone
├── regional assignment (kecamatan_id, desa_id)
└── created_at/updated_at
```

#### 📋 **Assessment Templates**

```sql
-- Template asesmen harian (5 komponen gizi)
daily_assesment
├── id (UUID, PK)
├── date
├── makanan_pokok (boolean)
├── lauk_pauk (boolean)
├── sayuran (boolean)
├── buah_buahan (boolean)
├── sesuai_resep (boolean)
└── score (computed) -- Auto sum komponen

-- Template asesmen bulanan (antropometri)
monthly_assesment
├── id (UUID, PK)
├── date
├── height (decimal)
├── weight (decimal)
├── bmi (computed column) -- weight/(height/100)²
└── bmi_category (computed) -- WHO classification
```

#### 📊 **Target Assessment Records**

```sql
-- Record asesmen harian per sasaran
target_daily_assesment
├── id (UUID, PK)
├── target_id (FK → target)
├── daily_assesment_id (FK → daily_assesment)
├── photo_url (AWS S3 URL)
├── completion_status
├── score (inherited dari template)
└── classification (computed) -- Terbiasa/Butuh Pendampingan/dll

-- Record asesmen bulanan per sasaran
target_monthly_assesment
├── id (UUID, PK)
├── target_id (FK → target)
├── monthly_assesment_id (FK → monthly_assesment)
├── previous_bmi_delta (computed)
├── growth_trend
└── anthropometric_status
```

### 🗺️ **Geographic Hierarchy**

```sql
-- Struktur wilayah 3-tingkat
region
├── id (UUID, PK)
├── name
├── level (enum: kabupaten|kecamatan|desa)
├── parent_id (self-referencing FK)
├── code (unique regional code)
└── path (materialized path untuk quick lookup)

-- 1,200+ regions untuk Kotawaringin Timur:
-- 1 Kabupaten → 17 Kecamatan → 1,183 Desa
```

### 👥 **User Management & Access Control**

```sql
user
├── id (UUID, PK)
├── username (unique)
├── password_hash
├── full_name
├── access_level (1=Admin Dinas, 2=PLKB, 3=Kader, 4=Viewer)
├── regional_assignment (JSON: {kecamatan_id?, desa_id?})
├── is_active
└── session management (Lucia Auth)
```

### 🔧 **Advanced Database Features**

#### ⚡ **Computed Columns**

- **BMI Calculation**: `weight / POWER(height/100, 2)`
- **Age Calculation**: `TIMESTAMPDIFF(YEAR, birth_date, CURDATE())`
- **Score Summation**: `makanan_pokok + lauk_pauk + sayuran + buah_buahan + sesuai_resep`
- **Classification Logic**: Complex CASE statements untuk kategori gizi

#### 🔗 **Relationships & Constraints**

- **CASCADE DELETE**: Hapus target → hapus semua assessments
- **FOREIGN KEY**: Referential integrity enforcement
- **UNIQUE CONSTRAINTS**: Prevent duplicate assessments per periode
- **INDEX OPTIMIZATION**: Query performance untuk regional filtering

#### 📊 **Database Views**

```sql
-- View untuk reporting dashboard
target_summary_view
├── target_info
├── latest_daily_assessment
├── latest_monthly_assessment
├── monthly_completion_rate
├── classification_history
└── regional_aggregation

-- View untuk regional statistics
regional_stats_view
├── total_targets_per_region
├── average_scores_per_region
├── classification_distribution
└── completion_rates_by_area
```

### 🌱 **Seeding System**

Data awal yang di-populate otomatis:

- **1,200+ wilayah** Kotawaringin Timur (kabupaten → kecamatan → desa)
- **User admin** default dengan access level lengkap
- **Template asesmen** standar untuk daily dan monthly
- **Sample targets** untuk testing dan demo
- **Regional assignments** untuk user testing

### 🔄 **Migration System**

- **Version controlled** schema changes
- **Rollback support** untuk safe deployment
- **Automatic generation** dari Drizzle schema
- **Environment-specific** migrations (dev/staging/prod)

## 🚀 Quick Start & Deployment

### 📋 Prerequisites

- **Node.js 22.16+** (recommended version for optimal performance)
- **MySQL/MariaDB 10.11+** untuk database
- **☁️ Cloudinary Account** untuk image storage dan optimization
- **🐳 Docker & Docker Compose** (untuk containerized deployment)

### ⚙️ Environment Setup

#### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd project-dashat
```

#### 2️⃣ Install Dependencies

```bash
# Using npm (with pinned versions for reproducible builds)
npm ci

# Verify installation
npm run check:astro
```

#### 3️⃣ Environment Configuration

Copy dan configure environment variables:

```bash
cp .env.example .env
```

Update `.env` dengan konfigurasi Anda:

```bash
# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/silaras_db

# Cloudinary Storage Configuration
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_FOLDER=silaras-uploads

# Debug Settings
DB_DEBUG=false
```

#### 4️⃣ Database Setup

```bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (regions, admin user, templates)
npm run db:seed

# Optional: Open Drizzle Studio for database management
npm run db:studio
```

#### 5️⃣ Development Server

```bash
# Start development environment
npm run dev

# Or run individual services
npm run dev:astro  # Astro dev server only
```

Access the application:

- **Main App**: http://localhost:4321
- **Database Studio**: http://localhost:4322 (if running db:studio)

### 🐳 Docker Deployment

#### Development dengan Docker Compose

```bash
# Start all services (app + database + phpMyAdmin)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

Services yang tersedia:

- **Main App**: http://localhost:4321
- **phpMyAdmin**: http://localhost:4322
- **Database**: MariaDB on port 3306

#### Production Docker Build

```bash
# Build production image
docker build -t silaras-app .

# Run production container
docker run -d \
  --name silaras-production \
  -p 4321:4321 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  -e CLOUDINARY_URL="cloudinary://key:secret@cloud" \
  silaras-app
```

### 📦 Dependency Management

#### Pinned Dependencies Strategy

Proyek ini menggunakan **pinned dependencies** (tanpa caret `^`) untuk:

- **🔒 Reproducible Builds**: Semua environment menggunakan versi yang sama persis
- **🛡️ Stability**: Mencegah breaking changes dari automatic updates
- **🎯 Predictable Behavior**: Eliminasi version variance yang bisa menyebabkan bugs

```json
{
  "dependencies": {
    "astro": "5.8.1", // Exact version, no ^5.8.1
    "react": "19.1.0", // Latest React with exact pinning
    "drizzle-orm": "0.43.1", // Exact ORM version
    "cloudinary": "2.6.1" // Exact cloud storage version
  }
}
```

#### Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update specific package (manual)
npm install package-name@latest --save-exact

# Update all dependencies (dengan hati-hati)
npx npm-check-updates -u
npm install
```

#### Optimized Dependencies

- **✅ Unused Dependencies Removed**: AWS SDK packages dihapus setelah migrasi ke Cloudinary
- **✅ Dev vs Prod Separation**: Build tools di devDependencies, runtime di dependencies
- **✅ Version Conflicts Resolved**: tsx updated dari 4.7.1 ke 4.19.4 untuk kompatibilitas Vite
- **✅ Type Safety**: @types packages terpinned untuk consistency

## ⚠️ Troubleshooting & Common Issues

### 🐛 Development Issues

#### Dependency Conflicts

```bash
# Error: tsx version conflict with Vite
# Solution: Update tsx to compatible version
npm install tsx@4.19.4 --save-exact

# Error: npm ci fails
# Solution: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues

```bash
# Error: ECONNREFUSED ::1:3306
# Solution: Check database service dan connection string
docker-compose up db -d
mysql -h 127.0.0.1 -P 3306 -u test -p test

# Error: Migration failed
# Solution: Reset database (development only)
npm run db:reset
npm run db:migrate
npm run db:seed
```

#### Cloudinary Upload Issues

```bash
# Error: Failed to upload to Cloudinary
# Solution: Verify environment variables
echo $CLOUDINARY_URL
echo $PUBLIC_CLOUDINARY_CLOUD_NAME

# Check Cloudinary account quota dan permissions
```

### 🚀 Build & Deployment Issues

#### Docker Build Failures

```bash
# Error: npm ci fails during Docker build
# Solution: Ensure clean package-lock.json
npm ci --cache .npm --prefer-offline

# Error: Image not found in production
# Solution: Check PUBLIC_CLOUDINARY_CLOUD_NAME in production
```

#### Performance Issues

```bash
# Issue: Slow island hydration
# Solution: Optimize component imports
import { lazy } from 'react'
const HeavyComponent = lazy(() => import('./HeavyComponent'))

# Issue: Large bundle size
# Solution: Check bundle analysis
npm run build -- --stats
```

### 📊 Database Performance

#### Slow Queries

```sql
-- Enable query logging untuk debugging
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'table';

-- Check slow queries
SELECT * FROM mysql.slow_log;

-- Optimize computed columns dengan indexes
ALTER TABLE target ADD INDEX idx_age (age);
```

### 🔧 Development Tips

#### Hot Reload Issues

```bash
# Clear Astro cache
rm -rf .astro
npm run dev

# Clear browser cache
# Hard refresh: Ctrl+Shift+R
```

#### Type Checking Errors

```bash
# Run type checking
npm run check:astro

# Clear TypeScript cache
rm -rf node_modules/.cache
npm install
```

### 📞 Support & Documentation

- **GitHub Issues**: Create issue untuk bugs atau feature requests
- **Development Docs**: Check `/docs` folder untuk detailed documentation
- **Database Schema**: Use `npm run db:studio` untuk visual schema exploration
- **API Reference**: Check `/src/actions` untuk available server actions

---

## 📝 License & Contributing

**SILARAS** dikembangkan untuk membantu upaya pencegahan stunting di Kabupaten Kotawaringin Timur, Kalimantan Tengah.

### 🤝 Contributing Guidelines

1. Fork repository ini
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### 📋 Development Standards

- **TypeScript**: Semua code harus type-safe
- **Prettier**: Code formatting otomatis
- **Database**: Gunakan Drizzle ORM untuk query building
- **Authentication**: Session-based dengan Oslo crypto
- **Testing**: Unit tests untuk critical functions

---

**🌟 Built with ❤️ untuk kesehatan anak Indonesia**
