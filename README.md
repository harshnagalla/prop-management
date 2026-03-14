# PropManager

A property portfolio management platform built for families managing multiple properties. Replaces scattered Excel sheets and paper records with a unified dashboard, AI-powered document processing, and comprehensive financial tracking.

Built for a family managing 30+ properties in Ahmedabad, India.

## Features

### Mission Control Dashboard
- Portfolio value with appreciation tracking
- Monthly and annual rental income overview
- Occupancy rate across all properties
- Per-property performance table with rental yield and ROI
- Unpaid bills summary

### Property Registry
- Full CRUD for properties (residential, commercial, industrial, land, mixed)
- Track purchase price, current value, area, monthly rent, and tenant info
- Status tracking: occupied, vacant, under renovation, for sale
- Responsive card grid with rental yield indicators
- City defaults to Ahmedabad with support for any location

### Bill Tracking
- Log bills by category: electricity, water, municipal tax, maintenance, insurance, repair, legal
- Associate bills with specific properties
- Track due dates, paid dates, and payment status
- AI-powered bill scanning — upload a photo and Gemini extracts amount, date, vendor, category
- Auto-matches bills to properties based on address hints in scanned documents

### Rental Income Tracking
- Record rental income per property per month
- Track received vs. pending payments
- Tenant name tracking
- Monthly grouping for easy review
- Auto-fill from property's registered rent and tenant

### Document Vault
- Store property documents: sale deeds, agreements, registration docs, tax receipts, photos
- Filter by property
- Base64 storage in database (no external file storage needed)
- Download documents on demand

### AI-Powered Import
- Upload Excel spreadsheets or scanned documents
- Gemini 2.0 Flash extracts property data automatically
- Three-step review workflow: upload → review extracted data → selectively import
- Handles Indian formats (₹ amounts, addresses in English/Gujarati/Hindi)

### Authentication
- NextAuth v5 with Google OAuth and email/password credentials
- Protected routes with server-side auth guard
- Custom branded sign-in page
- Session-based user isolation (multi-tenant)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database** | Neon (serverless Postgres) |
| **ORM** | Drizzle ORM (neon-http adapter) |
| **Auth** | NextAuth v5 (Google OAuth + Credentials) |
| **AI/OCR** | Google Gemini 2.0 Flash |
| **Styling** | Tailwind CSS 4 |
| **UI** | Radix UI primitives (Dialog, Select, Tabs, Toast) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Deployment** | Vercel (target) |

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Protected app routes
│   │   ├── page.tsx              # Dashboard (Mission Control)
│   │   ├── properties/page.tsx   # Property CRUD
│   │   ├── bills/page.tsx        # Bill tracking + AI scan
│   │   ├── income/page.tsx       # Rental income tracking
│   │   ├── documents/page.tsx    # Document vault
│   │   ├── import/page.tsx       # AI bulk import wizard
│   │   └── layout.tsx            # Auth guard + sidebar layout
│   ├── (auth)/
│   │   └── signin/page.tsx       # Custom sign-in page
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth API route
│   │   ├── properties/           # Properties CRUD API
│   │   ├── bills/                # Bills API
│   │   ├── rental-income/        # Rental income API
│   │   ├── documents/            # Documents API
│   │   ├── dashboard/            # Dashboard analytics API
│   │   └── ai/extract/           # AI document extraction API
│   ├── layout.tsx                # Root layout with providers
│   └── globals.css               # Tailwind + custom theme
├── components/
│   ├── layout/
│   │   └── sidebar.tsx           # Responsive sidebar navigation
│   └── ui/
│       ├── modal.tsx             # Reusable modal (Radix Dialog)
│       ├── stat-card.tsx         # Dashboard stat card
│       └── empty-state.tsx       # Empty state placeholder
├── lib/
│   ├── ai/
│   │   └── gemini.ts             # Gemini AI extraction functions
│   ├── auth/
│   │   └── index.ts              # NextAuth configuration
│   ├── db/
│   │   ├── index.ts              # Neon database connection
│   │   └── schema.ts             # Drizzle schema (4 tables, 4 enums)
│   └── utils/
│       ├── cn.ts                 # Class name utility (clsx + tailwind-merge)
│       └── format.ts             # INR currency, dates, rental yield calc
└── middleware.ts                 # Auth middleware for route protection
```

## Database Schema

Four main tables with PostgreSQL enums:

- **properties** — name, address, city, type, status, purchase price, current value, area, monthly rent, tenant name
- **bills** — property reference, category, amount, due date, paid date, vendor, reference number
- **rental_income** — property reference, amount, month/year, received date, tenant name
- **documents** — property reference, name, type, file URL, file size, MIME type, AI-extracted data

All tables include `user_id` for multi-tenant isolation and cascade deletes from properties.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database (free tier works)
- Google OAuth credentials (optional, for Google sign-in)
- [Google AI API key](https://aistudio.google.com/apikey) (for OCR features)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/harshnagalla/prop-management.git
   cd prop-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your values:

   ```env
   # Required
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   AUTH_SECRET=your-secret-here  # Generate with: npx auth secret

   # Optional (for Google sign-in)
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret

   # Optional (for AI features)
   GOOGLE_AI_API_KEY=your-gemini-api-key

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Push database schema**

   ```bash
   npx drizzle-kit push
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Database Commands

```bash
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## API Reference

All API routes require authentication. Responses are JSON.

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/properties` | List all properties for authenticated user |
| `POST` | `/api/properties` | Create a new property |
| `GET` | `/api/properties/:id` | Get a single property |
| `PUT` | `/api/properties/:id` | Update a property |
| `DELETE` | `/api/properties/:id` | Delete a property (cascades to bills, income, documents) |

### Bills

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bills` | List bills (optional `?propertyId=` filter) |
| `POST` | `/api/bills` | Create a new bill |

### Rental Income

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rental-income` | List income records (optional `?propertyId=` filter) |
| `POST` | `/api/rental-income` | Record rental income |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/documents` | List documents (optional `?propertyId=` filter) |
| `POST` | `/api/documents` | Upload a document |
| `GET` | `/api/documents/:id` | Download a document |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Portfolio analytics (values, yields, occupancy, per-property metrics) |

### AI Extraction

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/extract` | Extract data from uploaded bill image or spreadsheet |

Request body:
```json
{
  "file": "base64-encoded-file",
  "mimeType": "image/jpeg",
  "type": "bill"
}
```

## Localization

- Currency: Indian Rupee (₹) with `en-IN` locale formatting
- Dates: Indian date format
- Bill categories: Configured for Indian utility providers (Torrent Power, UGVCL, AMC)
- AI prompts: Tuned for Indian bill formats and multilingual content (English/Gujarati/Hindi)
- Default city: Ahmedabad, Gujarat

## License

MIT
