# Blaze 🔥

A modern, full-stack social media platform built with cutting-edge technologies. Blaze offers real-time interactions, robust user engagement features, and a scalable architecture.

## Features 🚀

### Core Functionality
- **User Management**
  - Secure authentication with multiple providers(currently only github is supported)
  - Custom user profiles with bio and avatar(soon)
  - Username and email verification system(soon)
  
- **Social Interactions**
  - Create, edit, and delete posts
  - Like and comment on posts
  - Repost functionality
  - Follow/unfollow users
  - Real-time notifications
  
- **Content Management**
  - Post with text content (up to 256 characters)
  - Hashtag support and tracking
  - Bookmark favorite posts
  - Comment threading

- **Engagement Tracking**(soon)
  - Post engagement metrics (likes, comments, reposts)
  - User following/follower system
  - Notification system for social interactions

## Tech Stack 💻

### Frontend
- **Next.js** - React framework for production
- **Shadcn UI** - Modern UI component library
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM with maximum type safety
- **PostgreSQL** - Primary database
- **BetterAuth** - Authentication solution

### Development Tools
- **TypeScript** - Static type checking
- **Turborepo** - High-performance build system
- **Biome** - Fast formatter and linter
- **pnpm** - Fast, disk space efficient package manager

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm format-and-lint` - Run Biome linter and formatter
- `pnpm format-and-lint:fix` - Run Biome linter and formatter and fix linting errors
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open database studio
- `pnpm db:generate` - Generate database models
- `./start-database.sh` - Start PostgreSQL in Docker container

## Project Structure 📁

```
blaze/
├── apps/
│   └── web/          
├── packages/
│   ├── database/     
│   └── typescript-config/ 
```

## Getting Started 🏁

1. **Prerequisites**
   - Node.js 20+
   - pnpm
   - PostgreSQL
   - Docker (for local database)

2. **Installation**
   ```bash
   # clone the repository
   git clone https://github.com/shanksxz/blaze.git
   cd blaze

   # install dependencies
   pnpm install
   ```

3. **Database Setup**
   ```bash
   # start the PostgreSQL database in Docker
   ./start-database.sh
   ```

4. **Environment Setup**
   - copy `.env.example` to `.env`
   - configure your environment variables:
     - database connection
     - authentication providers
     - api keys

5. **Development**
   ```bash
   pnpm dev
   ```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📝

This project is licensed under the MIT License - see the LICENSE file for details.
