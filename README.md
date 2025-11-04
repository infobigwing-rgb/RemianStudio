# Remian Studio

A production-ready web-based video editor with Envato template integration.

## Features

### Core Editing
- **Timeline Editor**: Multi-track timeline with play/pause/stop controls and scrubbing
- **Canvas Preview**: Real-time video preview with layer rendering
- **Layer Management**: Add, delete, reorder, and toggle visibility of layers
- **Properties Panel**: Edit layer transforms (position, scale, rotation, opacity)
- **Transitions**: Fade and slide transitions with customizable duration

### Template Integration
- **Envato Marketplace**: Search and browse video templates
- **Purchased Templates**: Auto-load your purchased templates on startup
- **One-Click Import**: Add templates directly to your timeline
- **Template Preview**: View templates before importing

### Media Management
- **File Upload**: Drag-drop support for images, videos, and audio
- **Media Library**: Organize and preview uploaded files
- **Quick Add**: Click any media file to add it to the timeline

### Export
- **Multiple Resolutions**: 720p, 1080p, 4K
- **Frame Rates**: 30 FPS, 60 FPS
- **Quality Settings**: Low, Medium, High
- **Formats**: MP4, WebM

## Setup

### Environment Variables

Add your Envato API token to your Vercel project:

\`\`\`env
ENVATO_API_TOKEN=your_token_here
\`\`\`

**How to get your token:**
1. Go to [Envato API](https://build.envato.com/create-token/)
2. Create a personal token with these permissions:
   - View and search Envato sites
   - View your Envato account username
   - View your items' sales history
   - Download your purchased items
3. Copy the token and add it to your Vercel project environment variables

### Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the `ENVATO_API_TOKEN` environment variable
4. Deploy

## Usage

### Getting Started
1. Open Remian Studio
2. Your purchased templates will load automatically
3. Browse templates in the Templates tab
4. Upload your media files in the Media tab
5. Manage layers in the Layers tab

### Editing Workflow
1. **Import Template**: Click "Import" on any purchased template
2. **Add Media**: Upload images/videos and click to add to timeline
3. **Edit Properties**: Select a layer and adjust position, scale, rotation, opacity
4. **Add Transitions**: Select a layer and choose a transition type
5. **Preview**: Use timeline controls to play and scrub through your video
6. **Export**: Click Export and choose your settings

### Keyboard Shortcuts
- **Space**: Play/Pause
- **Delete**: Remove selected layer
- **Arrow Keys**: Adjust selected layer position

## Technical Details

### Architecture
- **Frontend**: Next.js 15 with React 19
- **State Management**: Zustand
- **UI Components**: shadcn/ui with Tailwind CSS
- **Canvas Rendering**: HTML5 Canvas 2D API
- **API Integration**: Server-side Envato API proxy

### API Routes
- `/api/envato/search` - Search Envato marketplace
- `/api/envato/purchases` - Get purchased templates
- `/api/envato/item` - Get template details

### Performance
- Automatic retry logic for failed API requests
- Media caching for smooth playback
- Optimized canvas rendering
- Responsive design for all screen sizes

## Support

For issues or questions:
1. Check the error messages in the UI
2. Verify your ENVATO_API_TOKEN is correctly set
3. Ensure you have purchased templates in your Envato account
4. Open an issue on GitHub

## License

MIT
