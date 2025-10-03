# Yaolin Bets 🏮

A fantasy lion dance team builder where users assemble teams and compete on a leaderboard.

## Features

- **Team Building**: Select 5 athletes for different roles (head, tail, drum, gong, cymbal)
- **Smart Scoring**: Each athlete has role-specific skill scores
- **Leaderboard**: Public ranking with deterministic tiebreaking
- **Simple Auth**: Username/password authentication for small teams
- **Real-time Updates**: Server-side score computation ensures accuracy

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Custom JWT-based auth with bcrypt
- **Validation**: Zod schemas for type safety
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Supabase account and project
3. Environment variables configured

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd yaolin-bets
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run the database setup scripts:
     ```sql
     -- Copy and run database/schema.sql in Supabase SQL editor
     -- Copy and run database/seed.sql to populate athletes
     ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_random_jwt_secret
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── teams/         # Team management
│   │   ├── athletes/      # Athlete data
│   │   └── leaderboard/   # Leaderboard API
│   ├── team/              # Team builder page
│   ├── leaderboard/       # Public leaderboard
│   └── register/          # User registration
├── components/            # React components
│   ├── auth/              # Login/Register forms
│   ├── team/              # Team builder components
│   └── leaderboard/       # Leaderboard components
└── lib/                   # Utilities
    ├── auth.ts           # Authentication logic
    ├── session.ts        # Session management
    ├── supabase.ts       # Database client
    ├── types.ts          # TypeScript types
    └── validation.ts     # Zod schemas
```

## Database Schema

### Users
- `id`: UUID primary key
- `username`: Unique username
- `password_hash`: Bcrypt hashed password

### Athletes
- `id`: UUID primary key
- `name`: Athlete name
- `avatar_url`: Profile image URL
- `score_*`: Role-specific scores (40-100)

### Teams
- `id`: UUID primary key
- `user_id`: Foreign key to users
- `*_id`: Foreign keys to athletes for each role
- `total_score`: Computed sum of role scores
- `updated_at`: For deterministic tiebreaking

## How to Play

1. **Register**: Create an account with username/password
2. **Build Team**: Select one athlete for each of 5 roles
3. **Optimize**: Each athlete has different strengths per role
4. **Compete**: Your total score determines leaderboard ranking
5. **Update**: Change your team anytime to improve your score

## Scoring System

- Each athlete has scores for all 5 roles (40-100 points)
- Team score = sum of each athlete's score for their assigned role
- Ties broken by most recent team update (earlier = higher rank)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Deploy to your preferred hosting platform

## Development

### Commands

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Database Management

To reset or modify the database:

1. Run `database/schema.sql` in Supabase SQL editor
2. Run `database/seed.sql` to populate athletes
3. Adjust RLS policies as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational/fun purposes. Feel free to use and modify as needed.
