# Remian Studio

A production video editor with seamless Envato Elements integration for single-user deployment.

## Features

- **Automatic Template Access**: Your purchased templates load automatically on startup
- **Template Search**: Browse and search the Envato marketplace
- **Multi-track Timeline**: Professional video editing interface
- **Layer-based Editing**: Text, image, and video layers
- **Real-time Preview**: Canvas rendering with playback controls
- **Export Options**: Multiple format and quality settings

## Single-User Design

Remian Studio is designed for single-user deployment with automatic authentication:

- ✅ No login panels or OAuth flows
- ✅ Immediate template access using pre-configured API token
- ✅ Always-authenticated experience
- ✅ Zero setup required for template browsing
- ✅ Purchased templates auto-load on app start

## Setup

### Environment Variables

Add the following environment variable to your Vercel project or `.env.local` file:

\`\`\`env
ENVATO_API_TOKEN=your_personal_token_here
\`\`\`

**Important**: This token is used server-side only and never exposed to the client.

### Getting Your Envato API Token

1. Go to [Envato API Settings](https://build.envato.com/my-apps/)
2. Create a new app or use an existing one
3. Generate a Personal Token with these scopes:
   - `user:account`
   - `search:items`
   - `purchase:list`
   - `download:items`
4. Copy the token and add it to your environment variables

## Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Template Workflow

1. **Purchased Templates**: Your purchased templates load automatically when the app starts
2. **Search Templates**: Use the search tab to find new templates in the Envato marketplace
3. **Apply Templates**: Click "Apply" to add a template to your timeline
4. **Edit**: Adjust layer properties, timing, and content
5. **Export**: Export your video in various formats and resolutions

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
3. Add the `ENVATO_API_TOKEN` environment variable in project settings
4. Deploy

The environment variable can be added in the Vercel dashboard under:
**Project Settings → Environment Variables**

### Other Platforms

Ensure your platform supports:
- Next.js 15+ with App Router
- Server-side environment variables
- Node.js 18+

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: shadcn/ui + Tailwind CSS v4
- **State**: Zustand
- **API**: Envato Elements API

## Project Structure

\`\`\`
remian-studio/
├── app/
│   ├── page.tsx                 # Main editor page
│   ├── layout.tsx               # Root layout
│   └── api/envato/              # Envato API routes
│       ├── search/route.ts      # Template search
│       ├── purchases/route.ts   # User's purchased templates
│       └── item/route.ts        # Template details
├── components/editor/
│   ├── Canvas.tsx               # Video preview canvas
│   ├── Timeline.tsx             # Multi-track timeline
│   ├── EnvatoPanel.tsx          # Template browser
│   ├── PropertiesPanel.tsx      # Layer properties
│   ├── MediaLibrary.tsx         # Media upload & management
│   └── ExportDialog.tsx         # Export settings
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── store.ts                 # Zustand state
│   └── envato-client.ts         # Envato API client (server-side)
└── .env.local                   # Environment variables
\`\`\`

## API Routes

All Envato API calls are handled server-side to keep your token secure:

- `GET /api/envato/search?q=query` - Search Envato marketplace
- `GET /api/envato/purchases` - Get user's purchased templates
- `GET /api/envato/item?id=123` - Get template details

## License

MIT

---

**Remian Studio** - Seamless video editing with Envato Elements integration
