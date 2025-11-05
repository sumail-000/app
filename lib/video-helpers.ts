/**
 * Video URL helpers for handling different video sources
 */

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown'
  embedUrl?: string
  directUrl?: string
  id?: string
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extracts Vimeo video ID from Vimeo URLs
 */
function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Determines video type and extracts necessary information
 */
export function parseVideoUrl(url: string): VideoInfo {
  if (!url) {
    return { type: 'unknown' }
  }

  // Check for YouTube
  const youtubeId = extractYouTubeId(url)
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      id: youtubeId,
    }
  }

  // Check for Vimeo
  const vimeoId = extractVimeoId(url)
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      id: vimeoId,
    }
  }

  // Check if it's a direct video URL
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8']
  const urlLower = url.toLowerCase()
  const isDirectVideo = videoExtensions.some(ext => urlLower.includes(ext))

  if (isDirectVideo) {
    return {
      type: 'direct',
      directUrl: url,
    }
  }

  // Try to detect if it might be a video URL by checking content-type headers would be ideal
  // For now, assume it could be a direct video if it doesn't match other patterns
  return {
    type: 'direct',
    directUrl: url,
  }
}

/**
 * Checks if a URL is likely a video URL
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false

  const videoInfo = parseVideoUrl(url)
  return videoInfo.type !== 'unknown'
}

