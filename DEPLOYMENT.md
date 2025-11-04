# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Vercel account (recommended) or any Node.js hosting
- Envato API personal token
- (Optional) Cloud storage credentials (Google Drive, Dropbox, OneDrive)
- (Optional) Social media API credentials for direct publishing

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`bash
# Required
ENVATO_API_TOKEN=your_envato_personal_token

# Optional - Cloud Storage
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
DROPBOX_APP_KEY=your_dropbox_app_key
DROPBOX_APP_SECRET=your_dropbox_app_secret
ONEDRIVE_CLIENT_ID=your_onedrive_client_id
ONEDRIVE_CLIENT_SECRET=your_onedrive_client_secret

# Optional - Social Publishing
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
VIMEO_ACCESS_TOKEN=your_vimeo_token
FACEBOOK_ACCESS_TOKEN=your_facebook_token

# Optional - Webhooks
WEBHOOK_SECRET=your_webhook_secret

# Optional - Analytics
ENABLE_ANALYTICS=true
ANALYTICS_ID=your_analytics_id

# Optional - Collaboration
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com

# Optional - CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
\`\`\`

## Deployment Steps

### 1. Deploy to Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to Project Settings > Environment Variables
\`\`\`

### 2. Deploy to Other Platforms

\`\`\`bash
# Build the project
npm run build

# Start production server
npm start
\`\`\`

## Post-Deployment Configuration

### 1. Envato API Setup

1. Go to https://build.envato.com/create-token/
2. Create a personal token with scopes:
   - View and search Envato sites
   - Download your purchased items
   - View your account username
3. Add token to environment variables

### 2. Cloud Storage Setup (Optional)

**Google Drive:**
1. Create project in Google Cloud Console
2. Enable Google Drive API
3. Create OAuth 2.0 credentials
4. Add credentials to environment variables

**Dropbox:**
1. Create app at https://www.dropbox.com/developers/apps
2. Get App Key and App Secret
3. Add credentials to environment variables

**OneDrive:**
1. Register app in Azure Portal
2. Get Client ID and Client Secret
3. Add credentials to environment variables

### 3. Social Media Setup (Optional)

**YouTube:**
1. Create project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Add credentials to environment variables

**Vimeo:**
1. Create app at https://developer.vimeo.com/apps
2. Generate access token
3. Add token to environment variables

### 4. WebSocket Server (For Real-time Collaboration)

Deploy a separate WebSocket server or use a service like:
- Pusher
- Ably
- Socket.io with Node.js server

Update `NEXT_PUBLIC_WS_URL` with your WebSocket server URL.

## Performance Optimization

### 1. Enable CDN

Configure CDN for static assets:
- Images: `/public/images/*`
- Videos: `/public/videos/*`
- Templates: `/public/templates/*`

### 2. Database Setup (Optional)

For production, replace localStorage with a real database:
- PostgreSQL (recommended)
- MongoDB
- Supabase

### 3. Caching Strategy

Configure Redis or similar for:
- API response caching
- Session management
- Real-time collaboration state

## Monitoring

### 1. Error Tracking

Integrate error tracking service:
\`\`\`bash
npm install @sentry/nextjs
\`\`\`

### 2. Performance Monitoring

Enable Vercel Analytics or integrate:
- Google Analytics
- Mixpanel
- Amplitude

### 3. Logging

Configure logging service:
- Vercel Logs
- LogRocket
- Datadog

## Security Checklist

- [ ] All API keys stored in environment variables
- [ ] CORS configured with allowed origins
- [ ] Rate limiting enabled for API routes
- [ ] File upload validation implemented
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced in production
- [ ] Content Security Policy configured
- [ ] Regular security audits scheduled

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Redis for shared session state
- Implement job queue for video processing

### Vertical Scaling
- Increase server resources for video processing
- Use GPU instances for rendering
- Optimize database queries

### Cost Optimization
- Implement usage-based pricing
- Set storage limits per user/team
- Use spot instances for batch processing
- Implement automatic cleanup of old projects

## Support

For issues or questions:
- GitHub Issues: [your-repo]/issues
- Documentation: [your-docs-url]
- Email: support@yourdomain.com
