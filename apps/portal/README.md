# Kaizen OS Portal

The frontend portal for the Kaizen OS ecosystem - a model-agnostic sovereignty layer for AI & humans.

## Features

- **Landing Page**: Introduction to Kaizen OS with clear value proposition
- **Dashboard**: Personal GI score, companions, and recent activity
- **Onboarding Flow**: 4-step wizard for creating .gic domains
- **Companions**: Showcase of AI companions (AUREA, ATLAS, SOLARA, ZENITH)
- **Charter**: Readable version of the Custos Charter
- **Documentation**: Comprehensive guides and API references

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Authentication**: JWT-based
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | Backend API base URL | `https://api.kaizen.os` |
| `NEXT_PUBLIC_PORTAL_ORIGIN` | Portal origin URL | `https://kaizen.os` |
| `NEXT_PUBLIC_ENABLE_SOLARA` | Enable Solara features | `true` |
| `NEXT_PUBLIC_ENABLE_ZENITH` | Enable Zenith features | `true` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain | `kaizen.os` |

## API Integration

The portal expects these backend endpoints:

- `GET /v1/status` - Health check
- `GET /v1/companions` - List companions
- `GET /v1/gi/me` - User GI score (requires JWT)
- `POST /v1/onboard/apply` - Model onboarding
- `POST /v1/reflections` - Create reflection (requires JWT)
- `GET /v1/reflections/me` - List reflections (requires JWT)
- `POST /v1/domains/preview` - Preview domain config (requires JWT)
- `POST /v1/domains/seal` - Seal domain to ledger (requires JWT)

## Testing

Test API endpoints with the provided script:

```bash
# Test with default API
./test-api.sh

# Test with custom API
./test-api.sh https://api-staging.kaizen.os

# Test with authentication
KAIZEN_JWT=your_jwt_token ./test-api.sh
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Development

### Project Structure

```
apps/portal/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── onboarding/        # Onboarding flow
│   ├── companions/        # Companions showcase
│   ├── charter/          # Charter page
│   └── docs/             # Documentation
├── components/            # Reusable React components
├── lib/                  # Utilities and API client
├── public/               # Static assets
└── test-api.sh          # API testing script
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is part of the Kaizen OS ecosystem. See the main repository for license information.