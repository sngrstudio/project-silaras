# SILARAS - Sistem Laporan Dapur Sehat Atasi Stunting (DASHAT)

![SILARAS Logo](https://img.shields.io/badge/SILARAS-Nutrition%20Monitoring-green?style=for-the-badge)
[![Astro](https://img.shields.io/badge/Astro-5.8.1-FF5D01?style=flat&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19.1.0-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-3.14.1-00000F?style=flat&logo=mysql&logoColor=white)](https://mysql.com)

## 📝 About SILARAS

SILARAS is a modern web application designed for monitoring and preventing child stunting in East Kotawaringin Regency, Central Kalimantan. The platform provides an integrated system for health workers, posyandu cadres, and field managers to conduct daily and monthly nutritional assessments systematically.

The system serves **1,200+ areas** in Kotawaringin Timur with hierarchical structure: 17 Districts and hundreds of Villages, providing comprehensive monitoring of children's nutritional status and healthy kitchen practices.

## ✨ Key Features

### 🍽️ Daily Nutritional Assessment

- **5-Component Health Kitchen Checklist**: Main food, protein, vegetables, fruits, recipe compliance
- **📸 Photo Documentation**: Food photo uploads with Cloudinary integration
- **⚡ Automatic Scoring**: Real-time calculation based on component completion
- **📊 Progress Tracking**: Monthly completion rates and consistency monitoring

### 📊 Growth Monitoring

- **📏 Anthropometric Data**: Height and weight measurements
- **🧮 BMI Calculation**: Automatic BMI computation with WHO standards
- **📈 Trend Analysis**: Month-to-month development tracking
- **🎯 Classification System**: Automated nutritional status categorization

### 👥 Multi-Level Access Control

- **🏛️ Level 1 - Regional Admin**: Full system access and user management
- **🗺️ Level 2 - District Coordinator**: District-level data access and monitoring
- **👨‍⚕️ Level 3 - Village Cadre**: Patient data input and assessment within assigned villages
- **👁️ Level 4 - Viewer**: Read-only access to dashboards and reports

### 🗺️ Geographic Management

- **📍 3-Level Hierarchy**: Regency → District → Village
- **🎯 Regional Assignment**: Users restricted to their assigned work areas
- **🔍 Smart Filtering**: Data automatically filtered by regional scope

## 🏗️ Technology Stack

### Core Framework

- **Astro 5.8.1** - Modern static site generator with islands architecture
- **React 19.1.0** - Interactive components with selective hydration
- **TypeScript 5.8.3** - Full type safety across the application

### Backend & Database

- **Drizzle ORM 0.43.1** - Type-safe database operations
- **MySQL2 3.14.1** - High-performance database driver
- **Session-based Authentication** - Secure user sessions with Oslo crypto

### Styling & UI

- **Tailwind CSS 4.1.6** - Utility-first CSS framework
- **DaisyUI 5.0.35** - Pre-built component library
- **Responsive Design** - Mobile-first approach for all devices

### State Management & Storage

- **Nanostores** - Lightweight client-side state management
- **Cloudinary 2.6.1** - Image storage, optimization, and CDN
- **File Upload System** - Secure file handling with hash verification

### Development & Deployment

- **Docker** - Containerized deployment
- **Vite 6.3.5** - Fast build system with HMR
- **Environment Configuration** - Flexible setup for different environments

## 🚀 Architecture

The application follows a strict data flow architecture:

```
User Interactions → React Components → Astro Actions → Query Functions → Drizzle ORM → MySQL
```

- **Components**: Receive data through props, stores, or actions
- **Actions**: Handle business logic and data manipulation
- **Queries**: Focus on database operations only
- **Utilities**: Reusable functions for common tasks

## 🔐 Security Features

- **Role-Based Access Control**: Multi-level permissions with regional restrictions
- **Session Management**: 7-day secure sessions with automatic cleanup
- **Data Isolation**: Users can only access data within their assigned regions
- **Input Validation**: Comprehensive validation using Zod schemas
- **File Security**: Hash-based file verification and secure uploads

## 📊 Data Management

### Assessment System

- **Daily Assessments**: 5-component nutritional checklist
- **Monthly Assessments**: Anthropometric measurements and BMI tracking
