# Shoulder Injury Tracker

A Next.js application to track players with shoulder injuries. This application allows you to:

- View all players with shoulder injuries
- Add new players with their photo, name, and date of joining
- Store player data in MongoDB
- Upload and store player photos using Cloudinary

## Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **MongoDB** with Mongoose for data storage
- **Cloudinary** for image hosting
- Responsive design
- Form validation
- Loading and error states

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a \`.env.local\` file in the root directory and add the following:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
\`\`\`

#### Getting MongoDB URI:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string and replace \`<password>\` with your database user password

#### Getting Cloudinary Credentials:

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. From your dashboard, copy the "Cloud Name"
4. Go to Settings > Upload > Upload presets
5. Create a new unsigned upload preset and copy its name

### 3. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
shoulder-injury-tracker/
├── app/
│   ├── api/
│   │   └── players/
│   │       └── route.ts          # API routes for player CRUD
│   ├── add-player/
│   │   └── page.tsx              # Add player form page
│   └── page.tsx                  # Home page (player list)
├── lib/
│   ├── mongodb.ts                # MongoDB connection utility
│   └── global.d.ts               # TypeScript global declarations
├── models/
│   └── Player.ts                 # Mongoose Player model
├── .env.local                    # Environment variables (not in git)
└── next.config.ts                # Next.js configuration
\`\`\`

## Usage

### Adding a Player

1. Click the "Add New Player" button on the home page
2. Fill in the player's name
3. Select the date of joining
4. Upload a player photo (max 10MB)
5. Click "Add Player"

All fields are mandatory. The photo will be automatically uploaded to Cloudinary, and the player data will be saved to MongoDB.

### Viewing Players

The home page displays all players in a responsive grid layout with:
- Player photo
- Player name
- Date of joining

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Cloudinary**: Cloud-based image storage

## API Endpoints

### GET /api/players
Fetch all players

### POST /api/players
Create a new player

Request body:
\`\`\`json
{
  "name": "Player Name",
  "photoUrl": "https://res.cloudinary.com/...",
  "dateOfJoining": "2024-01-15"
}
\`\`\`

## License

MIT
