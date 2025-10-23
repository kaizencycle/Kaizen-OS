# Frontend Applications

This directory contains frontend applications for the Civic Protocol Core ecosystem.

## Citizen Shield App

A React-based frontend application for the Citizen Shield system, providing a user interface for citizen enrollment, verification, and group management.

### Features

- **Citizen Enrollment**: Interface for new citizens to join the shield system
- **Group Status**: Real-time monitoring of group membership and status
- **Verification Workflows**: Step-by-step verification processes
- **Seal Cards**: Visual representation of civic seals and achievements
- **Onboarding**: Guided onboarding experience for new users

### Technology Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **CSS Modules** - Scoped styling
- **Fetch API** - HTTP client for API communication

### Getting Started

```bash
cd frontend/citizen-shield-app
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### Project Structure

```
citizen-shield-app/
├── src/
│   ├── components/        # Reusable React components
│   │   └── SealCard.tsx   # Seal card component
│   ├── pages/            # Application pages
│   │   ├── Enroll.tsx    # Citizen enrollment page
│   │   ├── GroupStatus.tsx # Group status monitoring
│   │   ├── Onboard.tsx   # User onboarding
│   │   └── Verify.tsx    # Verification workflows
│   ├── api/              # API client
│   │   └── client.ts     # HTTP client configuration
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── styles.css        # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md            # Project documentation
```

### API Integration

The frontend integrates with the Lab6 Citizen Shield API for:

- Citizen enrollment and verification
- Group status and membership management
- Seal generation and verification
- Real-time updates and notifications

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **AWS S3**: Upload the `dist` folder to an S3 bucket

### Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new components
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

### Troubleshooting

Common issues and solutions:

- **TypeScript errors**: Run `npm run type-check` to identify issues
- **Build failures**: Check for missing dependencies or syntax errors
- **API connection issues**: Verify the API endpoint configuration
- **Styling issues**: Check CSS module imports and class names
