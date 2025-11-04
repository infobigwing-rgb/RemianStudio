# Remian Studio

**Professional Web-Based Video Editor with Native Format Import**

Remian Studio is a production-grade video editing application that runs entirely in your browser. Import projects from Premiere Pro, After Effects, and Final Cut Pro, then edit with professional features including keyframe animation, color grading, and advanced effects.

![Remian Studio](https://img.shields.io/badge/version-1.0.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-16.0-black) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Key Features

### 🎬 Native Format Import
- **Premiere Pro (.prproj, .xml)** - Import sequences, tracks, clips, effects, and transitions
- **After Effects (.aep, .json)** - Import compositions with keyframes, expressions, and effects
- **Final Cut Pro (.fcpxml)** - Import magnetic timeline projects with compound clips

### 🎨 Professional Editing
- **Multi-track Timeline** - Video, audio, text, and effect tracks
- **Keyframe Animation** - Bezier curve easing for smooth motion
- **Color Grading** - Lumetri-style controls (exposure, contrast, highlights, shadows, saturation)
- **Transitions** - Fade, cross dissolve, slide, zoom, blur, dip to black
- **Blend Modes** - Multiply, screen, overlay, and 10+ more
- **Effects** - Blur, brightness/contrast, hue/saturation, glow, sharpen

### 🚀 Performance
- **WebGL Rendering** - GPU-accelerated effects and color grading
- **Smart Caching** - Optimized media loading and processing
- **Real-time Preview** - Smooth playback up to 1080p

### 🔗 Envato Integration
- Browse and search Envato Elements templates
- One-click template import
- Placeholder replacement system

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with React 19
- **Rendering**: Canvas 2D + WebGL for effects
- **State Management**: Zustand
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Parsing**: fast-xml-parser for XML-based formats

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/remian-studio.git
cd remian-studio
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure environment variables**

Add your Envato API token to the Vercel project environment variables or create a `.env.local` file:
\`\`\`env
ENVATO_API_TOKEN=your_envato_token_here
\`\`\`

> **Note**: Get your Envato API token from [Envato API](https://build.envato.com/api/)

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### Importing Professional Projects

1. Click **"Import Project"** in the toolbar
2. Drag and drop your `.prproj`, `.aep`, or `.fcpxml` file
3. Review the compatibility report
4. Click **"Apply Import"** to load the project

**Supported Features:**
- ✅ Basic transforms (position, scale, rotation, opacity)
- ✅ Keyframe animation with bezier easing
- ✅ Layer hierarchy and timing
- ✅ Common transitions and effects
- ✅ Text layers
- ✅ Video and audio tracks

**Limited Support:**
- ⚠️ Complex effects (converted to web equivalents)
- ⚠️ 3D transforms (flattened to 2D)
- ⚠️ Expressions (converted to keyframes)

**Not Supported:**
- ❌ Third-party plugin binaries
- ❌ Real-time 3D rendering
- ❌ Proprietary codec features

### Editing Workflow

#### 1. Timeline Editing
- **Add Layers**: Click "Add Text" or drag media from the Media Library
- **Move Layers**: Drag clips on the timeline
- **Trim Duration**: Adjust layer start time and duration in Properties panel
- **Playback**: Use spacebar or play button to preview

#### 2. Transform & Animation
- Select a layer to view properties
- Adjust position, scale, rotation, and opacity
- Click **"Animate"** to open the Keyframe Editor
- Add keyframes at different times to create motion

#### 3. Color Grading
- Select a layer and go to the **Effects** tab
- Use the Color Grading panel with:
  - **Basic**: Exposure, contrast, saturation, vibrance
  - **Tone**: Highlights, shadows, whites, blacks
  - **Color**: Temperature and tint

#### 4. Transitions & Effects
- Select a layer and choose a transition type
- Adjust transition duration
- Apply blend modes for creative compositing

#### 5. Export
- Click **"Export"** in the toolbar
- Choose resolution (720p, 1080p, 4K)
- Select format (MP4, WebM)
- Adjust quality settings
- Click **"Start Export"**

### Envato Templates

1. Go to the **Templates** tab in the left sidebar
2. Search for video templates
3. Filter by type (video, motion graphics, etc.)
4. Click on a template to preview
5. Click **"Add to Timeline"** to import

## 🏗️ Project Structure

\`\`\`
remian-studio/
├── app/
│   ├── page.tsx                 # Main editor page
│   ├── layout.tsx               # Root layout
│   └── api/
│       └── envato/              # Envato API routes
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx           # Video canvas with WebGL
│   │   ├── Timeline.tsx         # Multi-track timeline
│   │   ├── PropertiesPanel.tsx  # Layer properties
│   │   ├── KeyframeEditor.tsx   # Animation editor
│   │   ├── ColorGradingPanel.tsx # Color controls
│   │   ├── EnvatoPanel.tsx      # Template browser
│   │   └── ExportDialog.tsx     # Export settings
│   └── import/
│       └── ImportDialog.tsx     # Format import UI
├── lib/
│   ├── parsers/
│   │   ├── premiere-parser.ts   # Premiere Pro XML parser
│   │   ├── after-effects-parser.ts # AE JSON parser
│   │   └── final-cut-parser.ts  # FCP XML parser
│   ├── webgl/
│   │   └── renderer.ts          # WebGL rendering engine
│   ├── effects/
│   │   └── effect-mapper.ts     # Effect conversion
│   ├── format-importer.ts       # Main import orchestrator
│   ├── types.ts                 # TypeScript types
│   └── store.ts                 # Zustand state management
└── public/                      # Static assets
\`\`\`

## 🔧 Format Import Details

### Premiere Pro Import

**Supported Elements:**
- Sequences with multiple video/audio tracks
- Clips with in/out points
- Effects (Lumetri Color, Gaussian Blur, etc.)
- Transitions (Cross Dissolve, Dip to Black, etc.)
- Keyframe data

**Conversion Process:**
1. Parse XML structure using fast-xml-parser
2. Extract sequence metadata (resolution, frame rate)
3. Map tracks and clips to web layers
4. Convert effects to WebGL/Canvas equivalents
5. Generate compatibility report

### After Effects Import

**Supported Elements:**
- Compositions with layers
- Transform properties with keyframes
- Effects and masks
- Text and shape layers
- Nested compositions (flattened)

**Expression Handling:**
- Simple expressions converted to keyframes
- Complex expressions simplified or removed
- Wiggle, loop, and time expressions supported

### Final Cut Pro Import

**Supported Elements:**
- Magnetic timeline events
- Primary storyline and connected clips
- Effects and transitions
- Compound clips (flattened)
- Multicam clips (first angle used)

## 🎨 Effect Mapping

| Native Effect | Web Equivalent | Implementation |
|--------------|----------------|----------------|
| Lumetri Color | Color Grading | CSS filters + WebGL shaders |
| Gaussian Blur | Blur | CSS blur filter |
| Brightness & Contrast | Brightness/Contrast | CSS brightness/contrast |
| Hue/Saturation | Hue/Saturation | CSS hue-rotate + saturate |
| Glow | Glow | Canvas shadow effects |
| Sharpen | Sharpen | Image data convolution |

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable: `ENVATO_API_TOKEN`
4. Deploy

### Docker

\`\`\`bash
docker build -t remian-studio .
docker run -p 3000:3000 -e ENVATO_API_TOKEN=your_token remian-studio
\`\`\`

### Manual Build

\`\`\`bash
npm run build
npm start
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by professional NLE software (Premiere Pro, Final Cut Pro, DaVinci Resolve)
- Built with [Next.js](https://nextjs.org/) and [shadcn/ui](https://ui.shadcn.com/)
- Envato Elements integration for template marketplace

---

**Made with ❤️ by the Remian Studio Team**
