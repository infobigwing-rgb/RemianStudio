# Remian Studio

A production video editor with Envato Elements integration and OAuth authentication.

## Features

- **Envato Elements Integration**: Sign in to access your Elements subscription templates
- **Marketplace Access**: Browse and use purchased templates from Envato marketplace
- **Template Search**: Search the entire Envato marketplace
- **Multi-track Timeline**: Professional video editing interface
- **Layer-based Editing**: Text, image, and video layers
- **Real-time Preview**: Canvas rendering with playback controls
- **Export Options**: Multiple format and quality settings

## Authentication

Remian Studio supports two authentication methods:

### 1. Personal API Token (Marketplace Only)
For accessing your purchased marketplace items without OAuth.

### 2. OAuth Sign-in (Elements + Marketplace)
Sign in with your Envato account to access:
- ✅ Envato Elements subscription templates
- ✅ All marketplace purchases
- ✅ Full account integration

## Setup

### Environment Variables

Add the following environment variables to your Vercel project or `.env.local` file:

\`\`\`env
# Required: Personal API Token for marketplace access
ENVATO_API_TOKEN=your_personal_token_here

# Optional: OAuth credentials for Elements access
ENVATO_CLIENT_ID=your_client_id_here
ENVATO_CLIENT_SECRET=your_client_secret_here
ENVATO_REDIRECT_URI=https://your-domain.com/api/envato/auth/callback
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

### Getting Your Envato API Token

1. Go to [Envato API Settings](https://build.envato.com/my-apps/)
2. Create a new app or use an existing one
3. Generate a Personal Token with these scopes:
   - `user:account`
   - `search:items`
   - `purchase:list`
   - `download:items`
4. Copy the token and add it to your environment variables

### Setting Up OAuth (Optional)

To enable Envato Elements access:

1. Go to [Envato API Settings](https://build.envato.com/my-apps/)
2. Create a new OAuth app
3. Set the redirect URI to: `https://your-domain.com/api/envato/auth/callback`
4. Copy the Client ID and Client Secret
5. Add them to your environment variables

## Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Signing In (Optional)

1. Click "Sign in with Envato" in the template panel
2. Authorize the app in your browser
3. You'll be redirected back with access to Elements templates

### Template Workflow

1. **Purchased Templates**: Your marketplace purchases load automatically
2. **Elements Templates**: Sign in to access your Elements subscription (if configured)
3. **Search Templates**: Use the search tab to find new templates
4. **Apply Templates**: Click "Apply" to add a template to your timeline
5. **Edit**: Adjust layer properties, timing, and content
6. **Export**: Export your video in various formats and resolutions

### Editing Features

- **Add Layers**: Click "Add Text" or drag media from the Media Library
- **Timeline**: Drag clips to reposition, adjust duration in properties
- **Properties**: Select a layer to edit position, size, rotation, and opacity
- **Playback**: Use spacebar or play button to preview your video
- **Export**: Choose resolution and format, then export your final video

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in project settings:
   - `ENVATO_API_TOKEN` (required)
   - `ENVATO_CLIENT_ID` (optional, for Elements)
   - `ENVATO_CLIENT_SECRET` (optional, for Elements)
   - `ENVATO_REDIRECT_URI` (optional, for Elements)
   - `NEXT_PUBLIC_APP_URL` (optional, for Elements)
4. Deploy

The environment variables can be added in the Vercel dashboard under:
**Project Settings → Environment Variables**

### Other Platforms

Ensure your platform supports:
- Next.js 15+ with App Router
- Server-side environment variables
- Node.js 18+
- Secure cookie storage

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: shadcn/ui + Tailwind CSS v4
- **State**: Zustand
- **API**: Envato API + OAuth 2.0
- **Auth**: HTTP-only cookies for secure token storage

## Project Structure

\`\`\`
remian-studio/
├── app/
│   ├── page.tsx                 # Main editor page
│   ├── layout.tsx               # Root layout
│   └── api/envato/              # Envato API routes
│       ├── search/route.ts      # Template search
│       ├── purchases/route.ts   # Marketplace purchases
│       ├── elements/route.ts    # Elements subscription templates
│       ├── item/route.ts        # Template details
│       └── auth/                # OAuth authentication
│           ├── signin/route.ts  # Initiate OAuth flow
│           ├── callback/route.ts # OAuth callback handler
│           ├── status/route.ts  # Check auth status
│           └── signout/route.ts # Sign out
├── components/
│   ├── auth/
│   │   └── EnvatoAuth.tsx       # OAuth sign-in component
│   └── editor/
│       ├── Canvas.tsx           # Video preview canvas
│       ├── Timeline.tsx         # Multi-track timeline
│       ├── EnvatoPanel.tsx      # Template browser with auth
│       ├── PropertiesPanel.tsx  # Layer properties
│       ├── MediaLibrary.tsx     # Media upload & management
│       └── ExportDialog.tsx     # Export settings
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── store.ts                 # Zustand state
│   └── envato-client.ts         # Envato API client (server-side)
└── .env.local                   # Environment variables
\`\`\`

## API Routes

All Envato API calls are handled server-side to keep tokens secure:

### Public Routes (API Token)
- `GET /api/envato/search?q=query` - Search Envato marketplace
- `GET /api/envato/purchases` - Get marketplace purchases
- `GET /api/envato/item?id=123` - Get template details

### Authenticated Routes (OAuth)
- `GET /api/envato/elements` - Get Elements subscription templates
- `GET /api/envato/auth/signin` - Initiate OAuth flow
- `GET /api/envato/auth/callback` - OAuth callback handler
- `GET /api/envato/auth/status` - Check authentication status
- `POST /api/envato/auth/signout` - Sign out and clear tokens

## Security

- OAuth tokens stored in HTTP-only cookies
- API token never exposed to client
- Secure cookie settings in production
- CSRF protection via SameSite cookies

## License

MIT

---

**Remian Studio** - Professional video editing with Envato Elements integration
