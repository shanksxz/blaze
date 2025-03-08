# Blaze Web App

The web application for Blaze social media platform, built with Next.js 14 and modern web technologies.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS + Shadcn UI
- **State Management**: Tanstack Query + tRPC
- **Authentication**: BetterAuth
- **Form Handling**: React Hook Form + Zod

## Project Structure

```
src/
├── app/                    
│   ├── (main)/            
│   ├── api/               
│   ├── auth/              
│   ├── providers/         
│   ├── globals.css        
│   └── layout.tsx         
├── components/            
├── features/              
├── hooks/                 
├── lib/                   
├── server/               
├── trpc/                 
├── validation/           
└── middleware.ts         

```

## Development

1. **Setup Environment**
   ```bash
   # in the root directory
   cp .env.example .env.local
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Key Features

- **Modern Stack**: Built with Next.js 15 App Router for optimal performance
- **Type Safety**: End-to-end type safety with TypeScript and tRPC
- **Component Library**: Utilizes Shadcn UI for consistent design
- **Authentication**: Secure authentication with multiple providers(currently only github is supported)
- **Real-time Updates**: Live updates for social interactions(soon)
- **Responsive Design**: Mobile-first approach with TailwindCSS

## Development Guidelines

- Components should be organized by feature in the `features/` directory
- Reusable UI components go in `components/`
- Business logic should be separated into custom hooks
- Server-side code should be in `server/` directory
- Use Zod for form validation and API input validation

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm format-and-lint` - Run Biome linter and formatter
- `pnpm format-and-lint:fix` - Run Biome linter and formatter and fix linting errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [tRPC Documentation](https://trpc.io)
- [Shadcn UI Documentation](https://ui.shadcn.com)
