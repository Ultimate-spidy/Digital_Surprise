# Environment Variables Setup

This project has been updated to properly handle environment variables for MongoDB and Cloudinary integrations.

## Changes Made

### 1. Environment Variables (.env)
Created a `.env` file with the following variables:
- `DATABASE_URL`: MongoDB connection string
- `CLOUDINARY_URL`: Cloudinary credentials URL
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Application port

**Note**: The `.env` file is gitignored and should not be committed to version control.

### 2. Database Configuration (server/db.ts)
- Added `dotenv` package to load environment variables
- Added `mongodb` package for MongoDB connectivity
- Implemented `connectDB()` function that:
  - Validates `DATABASE_URL` is set
  - Connects to MongoDB
  - Logs connection status
  - Returns the database instance

### 3. Storage Configuration (server/storage.ts)
- Updated Cloudinary configuration to parse `CLOUDINARY_URL` from environment
- Added `testCloudinaryConnection()` function for connection testing
- Migrated from Drizzle ORM to native MongoDB operations:
  - `createSurprise()`: Uses MongoDB `insertOne()`
  - `getSurpriseBySlug()`: Uses MongoDB `findOne()`

## Deployment to Render

When deploying to Render, ensure the following environment variables are set in the Render dashboard:

```
DATABASE_URL=mongodb+srv://<db_user>:<db_password>@<cluster-host>/<database-name>?retryWrites=true&w=majority
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
NODE_ENV=production
PORT=3000
```

## Security Warning

If real credentials were ever committed to Git history, rotate them immediately in your providers:
- MongoDB Atlas database user password
- Cloudinary API key/secret

Then rewrite Git history to purge leaked values before pushing again.

After updating environment variables in Render, restart the service for changes to take effect.

## Testing Connections

The application will log connection status on startup:
- ✅ Connected to MongoDB successfully - MongoDB connection is working
- ✅ Cloudinary connection successful - Cloudinary connection is working
- ❌ Failed to connect - Connection failed, check credentials and network

## Local Development

1. Ensure `.env` file exists in the root directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` for development mode
4. Run `npm run build` to build for production
