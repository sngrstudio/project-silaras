# SILARAS - Sistem Laporan Dapur Sehat Atasi Stunting (DASHAT)

![SILARAS Logo](https://img.shields.io/badge/SILARAS-Nutrition%20Monitoring-green?style=for-the-badge)
[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=flat&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white)](https://mysql.com)
[![AWS S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=flat&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)

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

- **🔐 Multi-Level Access Control**: 4 tingkat akses dengan pembatasan regional
- **🗺️ Geographic Hierarchy**: Manajemen data berdasarkan wilayah (Kabupaten → Kecamatan → Desa)
- **🔄 Real-time Scoring**: Perhitungan skor dan klasifikasi otomatis menggunakan computed columns
- **☁️ Cloud Storage**: Integrasi AWS S3 untuk penyimpanan foto makanan
- **📱 Responsive Design**: Interface yang optimal untuk desktop dan mobile
- **🛡️ Type Safety**: Full TypeScript implementation untuk reliabilitas tinggi

## ✨ Fitur Utama

### 🍽️ Pelaporan Dapur Sehat Harian

- **Checklist Komprehensif** untuk 5 komponen dapur sehat:
  - 🍚 Makanan pokok (nasi, roti, kentang, dll)
  - 🥩 Lauk pauk (protein hewani/nabati)
  - 🥬 Sayuran segar
  - 🍎 Buah-buahan
  - 📋 Mengikuti resep yang diberikan
- **📸 Upload Foto Makanan** dengan integrasi AWS S3 dan presigned URLs
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

- **🛡️ Lucia Auth Integration**: Session-based authentication yang aman
- **🔑 Role-Based Access Control**: Pembatasan akses berdasarkan level dan regional
- **🛡️ Middleware Protection**: Route protection dengan authentication check
- **🔒 Data Isolation**: User hanya bisa akses data sesuai assignment regional

## 🛠️ Arsitektur Teknologi

### 🎨 Frontend Technology Stack

- **⚡ Astro 5.8.1**: Modern static site generator dengan island architecture untuk performance optimal
- **⚛️ React 19.1**: Latest React dengan Server Components dan improved hydration
- **📘 TypeScript 5.8.3**: Full type safety untuk development experience dan code reliability
- **🎨 Tailwind CSS 4.1.6**: Latest utility-first CSS framework dengan modern features
- **🧩 DaisyUI 5.0.35**: Pre-built component library berbasis Tailwind untuk konsistensi design
- **📊 TanStack Table 8.21**: Powerful table library untuk data visualization
- **🗺️ React Leaflet 5.0**: Interactive maps untuk geographic data
- **📱 Responsive Design**: Mobile-first approach dengan optimasi untuk semua device

### 🗄️ Backend & Database

- **🔄 Drizzle ORM 0.43.1**: Type-safe database operations dengan auto-migration dan schema generation
- **🔧 Drizzle Kit 0.31.1**: CLI tools untuk migrations, studio, dan schema management
- **🐬 MySQL2 3.14.1**: High-performance MySQL driver dengan connection pooling
- **🚀 Astro Actions**: Server-side API endpoints dengan type safety end-to-end
- **🔐 Oslo Crypto/Encoding**: Modern cryptographic primitives untuk authentication
- **⚡ Database Features**:
  - Computed columns untuk BMI, age calculation, dan scoring
  - Generated UUID primary keys
  - Cascade deletes untuk referential integrity
  - Database views untuk complex reporting

### ☁️ State Management & Storage

- **🏪 Nanostores 1.0**: Lightweight state management dengan persistence
- **📦 AWS S3**: Secure cloud storage untuk foto makanan dengan presigned URLs
- **🔗 Presigned URLs**: Secure direct upload tanpa expose credentials
- **💾 Persistent Storage**: Client-side state persistence dengan @nanostores/persistent

### 🔧 Development Tools & Workflow

- **📦 Bun Runtime**: Fast JavaScript runtime dan package manager
- **🔄 Concurrently 9.1.2**: Run multiple development processes simultaneously
- **🗄️ Drizzle Studio**: Visual database management tool dengan network hosting
- **📋 Database Migrations**: Version-controlled schema changes
- **🌱 Seeding System**: Automated initial data population dengan TypeScript
- **📝 Prettier 3.5.3**: Code formatting dengan Astro dan Tailwind plugins
- **🎨 Unplugin Icons 22.1**: Icon integration dengan Iconify ecosystem

### 🏗️ Build & Development Infrastructure

- **🐳 Docker Compose**: Development environment dengan service orchestration
- **⚙️ Express 5.1.0**: Production server dengan Morgan logging
- **🔍 Astro Check 0.9.4**: Type checking dan validation
- **📊 React Scan 0.3.3**: Performance monitoring dan debugging
- **🎯 Node Adapter 9.2.2**: Server-side rendering dengan optimal performance

### 📊 Performance & Optimization

- **🏝️ Islands Architecture**: Selective hydration untuk optimal performance
- **📦 Vite Integration**: Fast build system dengan HMR
- **🖼️ SVG Processing**: Automatic SVG optimization dengan @svgr/core
- **💾 Caching Strategy**: Static generation dengan dynamic islands
- **📊 Bundle Analysis**: Size monitoring dan optimization

## 📁 Struktur Database & Schema

### 🏗️ Core Tables

#### 👶 **Patient Management**

```sql
-- Tabel utama untuk data anak/pasien
patient
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

#### 📊 **Patient Assessment Records**

```sql
-- Record asesmen harian per pasien
patient_daily_assesment
├── id (UUID, PK)
├── patient_id (FK → patient)
├── daily_assesment_id (FK → daily_assesment)
├── photo_url (AWS S3 URL)
├── completion_status
├── score (inherited dari template)
└── classification (computed) -- Terbiasa/Butuh Pendampingan/dll

-- Record asesmen bulanan per pasien
patient_monthly_assesment
├── id (UUID, PK)
├── patient_id (FK → patient)
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

- **CASCADE DELETE**: Hapus patient → hapus semua assessments
- **FOREIGN KEY**: Referential integrity enforcement
- **UNIQUE CONSTRAINTS**: Prevent duplicate assessments per periode
- **INDEX OPTIMIZATION**: Query performance untuk regional filtering

#### 📊 **Database Views**

```sql
-- View untuk reporting dashboard
patient_summary_view
├── patient_info
├── latest_daily_assessment
├── latest_monthly_assessment
├── monthly_completion_rate
├── classification_history
└── regional_aggregation

-- View untuk regional statistics
regional_stats_view
├── total_patients_per_region
├── average_scores_per_region
├── classification_distribution
└── completion_rates_by_area
```

### 🌱 **Seeding System**

Data awal yang di-populate otomatis:

- **1,200+ wilayah** Kotawaringin Timur (kabupaten → kecamatan → desa)
- **User admin** default dengan access level lengkap
- **Template asesmen** standar untuk daily dan monthly
- **Sample patients** untuk testing dan demo
- **Regional assignments** untuk user testing

### 🔄 **Migration System**

- **Version controlled** schema changes
- **Rollback support** untuk safe deployment
- **Automatic generation** dari Drizzle schema
- **Environment-specific** migrations (dev/staging/prod)

## 🚀 Installation & Setup

### 📋 Prerequisites

- **🏃 Bun Runtime** (recommended) atau Node.js ≥ 18
- **🐬 MySQL 8.0+** untuk database
- **☁️ AWS S3 Bucket** untuk file storage
- **🐳 Docker** (optional, untuk containerized deployment)

### ⚙️ Environment Setup

#### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd project-silaras
```

#### 2️⃣ Install Dependencies

```bash
# Menggunakan Bun (recommended - sesuai project configuration)
bun install

# Dependencies akan diinstall berdasarkan bun.lock
```

#### 3️⃣ Environment Configuration

```bash
# Copy template environment
cp .env.example .env

# Edit konfigurasi sesuai environment Anda
nano .env
```

#### 4️⃣ Database Setup

```bash
# Generate migration files dari schema
bun run db:generate

# Jalankan migrations ke database
bun run db:migrate

# Populate data awal (wilayah, user admin, templates)
bun run db:seed
```

#### 5️⃣ Start Development

```bash
# Development server dengan hot reload
bun dev

# Server akan berjalan di http://localhost:4321
```

### 🔧 Environment Variables

#### 📊 **Database Configuration**

```env
# MySQL Database Connection
DATABASE_URL=mysql://username:password@localhost:3306/silaras_db

# Database Pool Settings (optional)
DB_POOL_MIN=5
DB_POOL_MAX=20
```

#### ☁️ **AWS S3 Configuration**

```env
# AWS S3 untuk photo storage
S3_ACCESS_KEY_ID=your_access_key_here
S3_SECRET_ACCESS_KEY=your_secret_access_key_here
S3_REGION=ap-southeast-3
S3_BUCKET=silaras-food-images

# S3 Advanced Settings (optional)
S3_ENDPOINT=https://s3.ap-southeast-3.amazonaws.com
S3_PRESIGNED_URL_EXPIRES=3600
```

#### 🔐 **Authentication & Security**

```env
# Session Secret untuk secure authentication
SESSION_SECRET=your-super-secret-key-here-minimum-32-chars

# Environment Mode
NODE_ENV=development
```

#### 🌍 **Regional Configuration**

```env
# Default kabupaten untuk seeding
DEFAULT_KABUPATEN_NAME="Kotawaringin Timur"
DEFAULT_KABUPATEN_CODE="6202"

# Regional data source (optional)
REGION_DATA_SOURCE=local_seed
```

### 📦 Available Commands

| Command           | Description                                                | Use Case                    |
| ----------------- | ---------------------------------------------------------- | --------------------------- |
| `bun dev`         | Start concurrent development processes (Astro dev)         | Daily development           |
| `bun build`       | Production build dengan type checking dan style validation | Pre-deployment              |
| `bun preview`     | Preview production build locally                           | Testing build               |
| `bun db:generate` | Generate migrations dari schema changes                    | After schema modifications  |
| `bun db:migrate`  | Apply pending migrations ke database                       | Deploy schema changes       |
| `bun db:push`     | Push schema changes directly (dev only)                    | Quick development iteration |
| `bun db:seed`     | Populate initial data (regions, users, templates)          | Initial setup atau reset    |
| `bun db:studio`   | Launch Drizzle Studio di 0.0.0.0 untuk network access      | Database administration     |
| `bun check:astro` | Astro type checking dan validation                         | Code validation             |
| `bun check:style` | Prettier style checking                                    | Code formatting validation  |
| `bun format`      | Format code dengan Prettier                                | Code beautification         |
| `bun astro`       | Direct access ke Astro CLI                                 | Advanced Astro operations   |

### 🔧 Development Commands Breakdown

#### **Daily Development**

```bash
# Start development server dengan hot reload
bun dev
# Runs: concurrently bun:dev:* (Astro dev server)

# Format code sebelum commit
bun format
# Applies Prettier formatting untuk semua file
```

#### **Database Operations**

```bash
# Generate migrations setelah schema changes
bun db:generate

# Apply migrations ke database
bun db:migrate

# Quick development schema push (bypasses migrations)
bun db:push

# Open visual database management
bun db:studio
# Available di http://0.0.0.0:4983 untuk network access
```

#### **Quality Assurance**

```bash
# Comprehensive build dengan checking
bun build
# Runs: concurrently bun:check:* && astro build

# Individual checks
bun check:astro     # Type checking
bun check:style     # Style validation
```

#### **Production Operations**

```bash
# Preview production build
bun preview

# Seed production database
bun db:seed
```

### 🏥 Initial Data Setup

Setelah menjalankan `bun run db:seed`, sistem akan memiliki:

#### 👤 **Default Admin User**

```
Username: admin
Password: admin123
Access Level: 1 (Admin Dinas)
Regional Access: Full Kabupaten
```

#### 🗺️ **Regional Data**

- 1 Kabupaten: Kotawaringin Timur
- 17 Kecamatan (sesuai data administratif)
- 1,200+ Desa/Kelurahan
- Regional hierarchy dengan materialized path

#### 📋 **Assessment Templates**

- Default daily assessment template (5 komponen gizi)
- Default monthly assessment template (antropometri)
- Sample assessment data untuk testing

### 🐳 Docker Development

#### Development dengan Docker Compose

```bash
# Start services (MySQL + App)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Custom Docker Build

```bash
# Build image
docker build -t silaras:latest .

# Run container dengan environment
docker run -d \
  --name silaras-app \
  -p 4321:4321 \
  --env-file .env \
  silaras:latest
```

### 🔍 Development Tips

#### Database Management

```bash
# Open Drizzle Studio untuk visual database management
bun db:studio

# Reset database jika diperlukan (HATI-HATI!)
bun db:reset

# Backup database
mysqldump -u username -p silaras_db > backup.sql

# Restore database
mysql -u username -p silaras_db < backup.sql
```

#### Development Workflow

1. **Code Changes**: Edit files dengan auto-reload
2. **Schema Changes**: Run `bun db:generate` lalu `bun db:migrate`
3. **Quality Checks**: `bun check:astro && bun check:style` untuk validasi
4. **Database Inspection**: `bun db:studio` untuk lihat data (available di network)
5. **Code Formatting**: `bun format` untuk beautify code
6. **Testing**: Preview dengan `bun preview` sebelum deploy

### ⚠️ Troubleshooting

#### Common Issues

- **Database Connection Error**: Periksa DATABASE_URL dan MySQL service
- **S3 Upload Failed**: Validasi AWS credentials dan bucket permissions
- **Migration Conflicts**: Resolve dengan `bun db:reset` (development only)
- **Port Already in Use**: Change port dengan `--port 3000` flag
- **Memory Issues**: Increase Node.js memory dengan `NODE_OPTIONS="--max-old-space-size=4096"`

## 🔌 API Documentation & Actions

SILARAS menggunakan **Astro Actions** untuk type-safe server-side operations. Semua actions memiliki built-in validation dan error handling.

### 🏥 **Patient Management Actions**

#### `createPatient`

Membuat data pasien baru dengan validasi regional assignment.

```typescript
// Input Schema
{
  name: string
  birthDate: Date
  gender: 'L' | 'P'
  address: string
  parentName: string
  parentPhone: string
  kecamatanId: string
  desaId: string
}

// Usage
const result = await actions.createPatient({
  name: 'Ahmad Fauzi',
  birthDate: new Date('2020-05-15'),
  gender: 'L',
  address: 'Jl. Merdeka No. 123',
  parentName: 'Siti Aminah',
  parentPhone: '081234567890',
  kecamatanId: 'kec-001',
  desaId: 'desa-001'
})
```

#### `updatePatient`

Update data pasien dengan authorization check berdasarkan regional assignment user.

#### `deletePatient`

Soft delete pasien dengan cascade ke semua assessment records.

#### `getPatientsByRegion`

Mengambil daftar pasien berdasarkan regional scope user yang login.

### 📊 **Assessment Actions**

#### `createDailyAssessment`

Input asesmen harian dengan scoring otomatis.

```typescript
// Input Schema
{
  patientId: string;
  date: Date;
  makananPokok: boolean;
  laukPauk: boolean;
  sayuran: boolean;
  buahBuahan: boolean;
  sesuaiResep: boolean;
  photoFile?: File; // Upload ke S3
}

// Response
{
  id: string;
  score: number; // 0-5 berdasarkan komponen true
  photoUrl?: string; // AWS S3 URL jika ada upload
  classification: "On Progress" | "Terbiasa" | "Butuh Pendampingan" | "Butuh Pendampingan dan Penguatan";
}
```

#### `createMonthlyAssessment`

Input data antropometri dengan perhitungan BMI otomatis.

```typescript
// Input Schema
{
  patientId: string;
  date: Date;
  height: number; // cm
  weight: number; // kg
}

// Response (computed di database)
{
  id: string;
  bmi: number; // Calculated: weight / (height/100)²
  bmiCategory: "Underweight" | "Normal" | "Overweight" | "Obese";
  previousBmiDelta?: number; // Selisih dengan bulan sebelumnya
  growthTrend: "Improving" | "Stable" | "Declining";
}
```

#### `getAssessmentHistory`

Mengambil riwayat asesmen dengan aggregation data dan trend analysis.

### 🖼️ **File Upload Actions**

#### `uploadFoodPhoto`

Upload foto makanan ke AWS S3 dengan presigned URL.

```typescript
// Process
1. Generate presigned URL untuk direct upload
2. Client upload file ke S3
3. Return public URL untuk database storage
4. Validate file type (jpg, jpeg, png)
5. Resize dan optimize image
```

### 👥 **User Management Actions**

#### `createUser`

Buat user baru dengan regional assignment dan access level validation.

```typescript
// Input Schema
{
  username: string;
  password: string;
  fullName: string;
  accessLevel: 1 | 2 | 3 | 4;
  kecamatanAssignment?: string; // Required untuk level 2,3
  desaAssignment?: string; // Required untuk level 3
}

// Authorization: Hanya Admin Dinas (level 1) yang bisa create user
```

#### `updateUserRegionalAssignment`

Update assignment regional user dengan validasi hierarchy.

#### `getUsersByRegion`

List users berdasarkan regional scope dan access level.

### 🗺️ **Regional Actions**

#### `getRegionalHierarchy`

Mengambil struktur hierarkis wilayah (kabupaten → kecamatan → desa).

```typescript
// Response Structure
{
  kabupaten: {
    id: string;
    name: "Kotawaringin Timur";
    kecamatan: [
      {
        id: string;
        name: string;
        desa: [
          { id: string; name: string; }
        ]
      }
    ]
  }
}
```

#### `getRegionalStats`

Dashboard statistics berdasarkan regional scope user.

```typescript
// Response berdasarkan access level
{
  totalPatients: number;
  activeAssessments: number;
  completionRates: {
    daily: number; // Percentage
    monthly: number;
  };
  classificationDistribution: {
    terbiasa: number;
    butuhPendampingan: number;
    butuhPenguatan: number;
    onProgress: number;
  };
  trendData: MonthlyTrend[];
}
```

### 🔐 **Authentication Actions**

#### `login`

Login dengan session creation menggunakan Lucia Auth.

```typescript
// Input
{
  username: string
  password: string
}

// Response
{
  user: {
    id: string
    username: string
    fullName: string
    accessLevel: number
    regionalAssignment: object
  }
  session: string
}
```

#### `logout`

Invalidate session dan cleanup.

### ⚡ **Action Features**

#### 🛡️ **Built-in Authorization**

Setiap action melakukan pengecekan:

- User authentication status
- Access level permission
- Regional assignment scope
- Data ownership validation

#### 🔍 **Input Validation**

- Zod schema validation untuk semua input
- Custom validators untuk business logic
- File type dan size validation untuk uploads
- SQL injection prevention

#### 📊 **Error Handling**

```typescript
// Standardized error response
{
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "AUTHORIZATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR";
    message: string;
    details?: object;
  }
}
```

#### 🎯 **Type Safety**

- End-to-end type safety dari client ke database
- Automatic type inference untuk response
- TypeScript integration dengan Astro Actions
- Compile-time error catching

## 🚀 Deployment Guide

### 🐳 **Production Deployment dengan Docker**

#### Dockerfile Production

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Environment Production

```env
# Production Database
DATABASE_URL=mysql://prod_user:secure_password@db.example.com:3306/silaras_prod

# AWS S3 Production
S3_BUCKET=silaras-prod-images
S3_REGION=ap-southeast-3

# Security
SESSION_SECRET=super-secure-production-key-32-chars-minimum
NODE_ENV=production
```

### ☁️ **Cloud Deployment Options**

#### **Option 1: AWS ECS dengan RDS**

```bash
# Build dan push ke ECR
aws ecr get-login-password --region ap-southeast-3 | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-southeast-3.amazonaws.com

docker build -t silaras-prod .
docker tag silaras-prod:latest <account>.dkr.ecr.ap-southeast-3.amazonaws.com/silaras:latest
docker push <account>.dkr.ecr.ap-southeast-3.amazonaws.com/silaras:latest

# Deploy menggunakan ECS Task Definition
```

#### **Option 2: Digital Ocean App Platform**

```yaml
# app.yaml
name: silaras-app
services:
  - name: web
    source_dir: /
    github:
      repo: your-org/silaras
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 2
    instance_size_slug: basic-xxs
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.CONNECTION_URL}
```

#### **Option 3: VPS Manual Setup**

```bash
# Setup di Ubuntu Server
sudo apt update && sudo apt install -y docker.io nginx mysql-server

# Clone dan build
git clone <repo-url> /var/www/silaras
cd /var/www/silaras
docker build -t silaras .

# Setup reverse proxy nginx
sudo nano /etc/nginx/sites-available/silaras
sudo ln -s /etc/nginx/sites-available/silaras /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# Run container
docker run -d --name silaras-app -p 3000:4321 --env-file .env silaras
```

### 🔒 **SSL & Domain Setup**

```bash
# Install Certbot untuk Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d silaras.example.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🛠️ Development Workflow

### 📋 **Development Setup Checklist**

- [ ] Clone repository dan install dependencies
- [ ] Setup MySQL database dan user
- [ ] Configure AWS S3 bucket dengan CORS
- [ ] Copy dan edit environment variables
- [ ] Run database migrations dan seeding
- [ ] Verify development server berjalan
- [ ] Test upload foto dan basic functionality

### 🔄 **Git Workflow**

```bash
# Feature development
git checkout -b feature/patient-assessment-improvement
git add .
git commit -m "feat: add BMI trend calculation to monthly assessment"
git push origin feature/patient-assessment-improvement

# Create Pull Request untuk code review
# Merge setelah approval dan CI passed
```

### 🧪 **Testing Strategy**

```bash
# Type checking dengan Astro
bun check:astro

# Style checking dengan Prettier
bun check:style

# Format code untuk consistency
bun format

# Build untuk production testing
bun build

# Database integrity testing via studio
bun db:studio
```

### 📊 **Code Quality Tools**

```bash
# Prettier untuk code formatting
bun format

# Astro type checking
bun check:astro

# Style validation
bun check:style

# Combined quality check (as used in build)
bun run build
```

## 📁 Project Structure

```
project-silaras/
├── 📁 public/                 # Static assets
│   ├── 🖼️ images/
│   └── 📄 favicon.ico
├── 📁 src/
│   ├── 📁 actions/            # Server-side API actions
│   │   ├── 🏥 patient.ts      # Patient management actions
│   │   ├── 📊 assessment.ts   # Assessment CRUD operations
│   │   ├── 👥 user.ts         # User management actions
│   │   ├── 🗺️ region.ts       # Regional data actions
│   │   └── 🖼️ upload.ts       # File upload dengan S3
│   ├── 📁 components/         # React components
│   │   ├── 📋 forms/          # Form components dengan validation
│   │   ├── 📊 dashboard/      # Dashboard dan charts
│   │   ├── 📱 ui/             # Reusable UI components
│   │   └── 🗺️ regional/       # Regional management components
│   ├── 📁 pages/              # Astro pages (routes)
│   │   ├── 🏠 index.astro     # Dashboard utama
│   │   ├── 👶 patients/       # Patient management pages
│   │   ├── 📊 assessments/    # Assessment pages
│   │   ├── 👥 users/          # User management
│   │   └── 🔐 auth/           # Authentication pages
│   ├── 📁 layouts/            # Page layouts
│   │   ├── 🎨 BaseLayout.astro
│   │   └── 📱 AuthLayout.astro
│   ├── 📁 db/                 # Database layer
│   │   ├── 📊 schemas/        # Drizzle schema definitions
│   │   │   ├── 👶 patient.ts
│   │   │   ├── 📋 assessment.ts
│   │   │   ├── 👥 user.ts
│   │   │   └── 🗺️ region.ts
│   │   ├── 🌱 seed/           # Database seeding
│   │   │   ├── 🗺️ regions.ts  # 1,200+ wilayah data
│   │   │   ├── 👥 users.ts    # Default admin user
│   │   │   └── 📋 templates.ts # Assessment templates
│   │   ├── 🔄 migrations/     # Auto-generated migrations
│   │   └── 📊 index.ts        # Database connection
│   ├── 📁 lib/                # Utility libraries
│   │   ├── ☁️ s3.ts           # AWS S3 integration
│   │   ├── 🔐 auth.ts         # Lucia auth configuration
│   │   ├── 📊 scoring.ts      # Assessment scoring logic
│   │   └── 🎯 validation.ts   # Zod schemas
│   ├── 📁 utils/              # Helper functions
│   │   ├── 🛡️ access-control.ts # Permission checking
│   │   ├── 🗓️ date.ts         # Date utilities
│   │   └── 📊 statistics.ts   # Data aggregation helpers
│   ├── 📁 middleware/         # Request middleware
│   │   └── 🔐 index.ts        # Auth middleware
│   └── 📁 styles/             # Global styles
├── 📁 .vscode/                # VS Code configuration
├── 📄 package.json            # Dependencies dan scripts
├── 📄 astro.config.mjs        # Astro configuration
├── 📄 drizzle.config.mjs      # Database configuration
├── 📄 tailwind.config.mjs     # Tailwind CSS config
├── 📄 tsconfig.json           # TypeScript configuration
├── 🐳 Dockerfile              # Container configuration
├── 🐳 docker-compose.yml      # Development containers
├── 🌱 .env.example            # Environment template
└── 📖 README.md               # Documentation
```

### 🎯 **Key Directories Explained**

#### `src/actions/` - Server-Side Logic

Berisi semua server-side operations dengan type safety dan validation. Setiap action melakukan:

- Input validation dengan Zod
- Authorization check berdasarkan user access level
- Regional scope filtering
- Database operations dengan Drizzle ORM
- Error handling dan response formatting

#### `src/components/` - UI Components

React components yang diorganisir berdasarkan functionality:

- **forms/**: Form components dengan validation dan submission handling
- **dashboard/**: Charts, statistics cards, dan dashboard widgets
- **ui/**: Reusable components seperti buttons, modals, tables
- **regional/**: Components untuk regional selection dan management

#### `src/db/` - Database Layer

- **schemas/**: Type-safe database schema definitions
- **seed/**: Initial data population scripts
- **migrations/**: Version-controlled schema changes

#### `src/lib/` - Core Libraries

External integrations dan core functionality:

- S3 untuk file upload
- Authentication setup
- Business logic untuk scoring dan classification

## 🤝 Contributing Guidelines

### 📝 **Code Standards**

- **TypeScript**: Semua file harus menggunakan TypeScript dengan strict mode
- **ESLint**: Follow configuration yang sudah ada untuk code consistency
- **Prettier**: Auto-format code sebelum commit
- **Naming**: gunakan camelCase untuk functions, PascalCase untuk components

### 🔄 **Pull Request Process**

1. **Fork** repository dan create feature branch
2. **Develop** dengan following coding standards
3. **Test** semua functionality dan add unit tests jika perlu
4. **Update** documentation jika ada perubahan API atau features
5. **Submit** PR dengan deskripsi lengkap perubahan
6. **Code Review** dan address feedback
7. **Merge** setelah approval dan CI passed

### 🐛 **Bug Reports**

Gunakan template berikut untuk bug reports:

```markdown
## Bug Description

Brief description of the issue

## Steps to Reproduce

1. Go to...
2. Click on...
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- Browser: Chrome 120
- OS: Windows 11
- User Access Level: 3 (Kader DASHAT)
- Regional Assignment: Kecamatan X, Desa Y
```

### ✨ **Feature Requests**

```markdown
## Feature Description

Clear description of the proposed feature

## Use Case

Who would use this feature and why

## Implementation Ideas

Technical approach (optional)

## Priority

High/Medium/Low
```

## 📄 License & Credits

### 📜 **License**

Aplikasi ini dikembangkan untuk keperluan kesehatan masyarakat dengan dukungan teknologi modern untuk pencegahan stunting di Indonesia.

**Open Source Components:**

- Astro (MIT License)
- React (MIT License)
- Drizzle ORM (Apache 2.0)
- Tailwind CSS (MIT License)
- DaisyUI (MIT License)

### 🏥 **Healthcare Impact**

SILARAS berkontribusi pada:

- **🎯 SDG 2**: Zero Hunger - Melalui monitoring gizi anak
- **🏥 SDG 3**: Good Health and Well-being - Pencegahan stunting
- **📊 Data-Driven Health**: Evidence-based nutrition intervention
- **🤝 Community Empowerment**: Pemberdayaan kader kesehatan

### 👨‍💻 **Development Team**

Dikembangkan dengan ❤️ untuk kesehatan anak Indonesia.

### 🙏 **Acknowledgments**

- **Dinas Kesehatan Kotawaringin Timur** - Domain expertise dan requirements
- **Posyandu & Kader DASHAT** - Field testing dan feedback
- **Open Source Community** - Tools dan libraries yang digunakan

---

## 📞 Support & Contact

### 🆘 **Getting Help**

- **Documentation**: Baca README ini lengkap
- **Issues**: Create GitHub issue untuk bugs atau feature requests
- **Email**: [health-tech@example.com](mailto:health-tech@example.com)

### 📊 **System Monitoring**

- **Health Check**: `/api/health` endpoint untuk status monitoring
- **Database Status**: Drizzle Studio untuk database inspection
- **Performance**: Built-in Astro dev tools

---

**SILARAS** - _Membangun Generasi Sehat melalui Dapur Sehat, Mencegah Stunting dengan Teknologi_

![Nutrition Monitoring](https://img.shields.io/badge/Nutrition-Monitoring-green?style=for-the-badge)
![Stunting Prevention](https://img.shields.io/badge/Stunting-Prevention-blue?style=for-the-badge)
![Community Health](https://img.shields.io/badge/Community-Health-orange?style=for-the-badge)
