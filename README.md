# BaseBase Client Starter

A minimal working client for BaseBase projects. Uses ReactJS, Tailwind, and Vite and supports just a user sign in and sign out. Use this as a starting point for BaseBase projects if you want.

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd basebase-client-starter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start the Vite development server, typically at `http://localhost:5173`. The page will automatically reload when you make changes to the source files.

## Available Scripts

- **`npm run dev`** - Start the development server
- **`npm run build`** - Build the project for production
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check for code quality issues

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Project Structure

```
src/
├── components/     # React components
├── assets/         # Static assets
├── App.tsx        # Main App component
├── main.tsx       # Application entry point
└── index.css      # Global styles
```

## Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Code linting
