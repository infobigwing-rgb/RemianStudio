import type { PlatformPreset } from "../types/export"

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "youtube-1080p",
    name: "YouTube 1080p",
    platform: "youtube",
    resolution: "1080p",
    aspectRatio: "16:9",
    fps: 30,
    recommendedBitrate: 8_000_000,
    format: "mp4",
  },
  {
    id: "youtube-4k",
    name: "YouTube 4K",
    platform: "youtube",
    resolution: "4k",
    aspectRatio: "16:9",
    fps: 60,
    recommendedBitrate: 35_000_000,
    format: "mp4",
  },
  {
    id: "instagram-feed",
    name: "Instagram Feed",
    platform: "instagram",
    resolution: "1080p",
    aspectRatio: "1:1",
    fps: 30,
    maxDuration: 60,
    recommendedBitrate: 5_000_000,
    format: "mp4",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    platform: "instagram",
    resolution: "1080p",
    aspectRatio: "9:16",
    fps: 30,
    maxDuration: 15,
    recommendedBitrate: 5_000_000,
    format: "mp4",
  },
  {
    id: "instagram-reel",
    name: "Instagram Reel",
    platform: "instagram",
    resolution: "1080p",
    aspectRatio: "9:16",
    fps: 30,
    maxDuration: 90,
    recommendedBitrate: 5_000_000,
    format: "mp4",
  },
  {
    id: "tiktok",
    name: "TikTok",
    platform: "tiktok",
    resolution: "1080p",
    aspectRatio: "9:16",
    fps: 30,
    maxDuration: 180,
    recommendedBitrate: 5_000_000,
    format: "mp4",
  },
  {
    id: "facebook-feed",
    name: "Facebook Feed",
    platform: "facebook",
    resolution: "1080p",
    aspectRatio: "16:9",
    fps: 30,
    recommendedBitrate: 8_000_000,
    format: "mp4",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    platform: "twitter",
    resolution: "1080p",
    aspectRatio: "16:9",
    fps: 30,
    maxDuration: 140,
    recommendedBitrate: 5_000_000,
    format: "mp4",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    platform: "linkedin",
    resolution: "1080p",
    aspectRatio: "16:9",
    fps: 30,
    maxDuration: 600,
    recommendedBitrate: 5_000_000,
    format: "mp4",
  },
]

export function getPresetsByPlatform(platform: PlatformPreset["platform"]): PlatformPreset[] {
  return PLATFORM_PRESETS.filter((p) => p.platform === platform)
}

export function getPresetById(id: string): PlatformPreset | undefined {
  return PLATFORM_PRESETS.find((p) => p.id === id)
}
