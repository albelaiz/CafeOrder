# Deployment Guide for Café Direct on Fly.io

## Prerequisites

1. Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up
3. Log in to Fly CLI: `fly auth login`

## Environment Variables

Before deploying, you'll need to set up your environment variables on Fly.io:

```bash
# Set your database URL (use a production PostgreSQL database)
fly secrets set DATABASE_URL="postgresql://username:password@host:port/database"

# Set a secure session secret
fly secrets set SESSION_SECRET="your-super-secure-session-secret-here"

# Optional: Set other environment variables as needed
fly secrets set NODE_ENV="production"
```

## Deployment Commands

1. **Launch your app** (run this once to create the app):
```bash
fly launch
```

2. **Deploy updates** (run this after making changes):
```bash
fly deploy
```

3. **Check deployment status and logs**:
```bash
# View deployment logs
fly logs

# Check app status
fly status

# Test health check
fly ssh console -C "curl http://localhost:8080/api/health"
```

## Database Setup

If you need a production PostgreSQL database, you can create one on Fly.io:

```bash
# Create a PostgreSQL database
fly postgres create --name cafe-direct-db

# Get the connection string
fly postgres connect -a cafe-direct-db

# Set the database URL secret
fly secrets set DATABASE_URL="postgresql://..."
```

## Checking Deployment

- View logs: `fly logs`
- Check status: `fly status`
- Open your app: `fly open`

## Notes

- The app is configured to run on port 8080 in production
- Health checks are configured at `/api/health`
- Static files are served from `/dist/public`
- Make sure to run database migrations after first deployment if needed