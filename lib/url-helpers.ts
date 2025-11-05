/**
 * Extracts the actual image URL from Google Images URLs
 * Google Images URLs have the format: https://www.google.com/imgres?imgurl=ACTUAL_URL&...
 */
export function extractImageUrl(url: string): string {
  if (!url) return url

  // Check if it's a Google Images URL
  if (url.includes('google.com/imgres') || url.includes('google.com/search')) {
    try {
      const urlObj = new URL(url)
      
      // Try imgurl parameter first
      let imgurl = urlObj.searchParams.get('imgurl')
      if (imgurl) {
        // Decode the URL
        try {
          imgurl = decodeURIComponent(imgurl)
          // Try decoding again if it still looks encoded
          if (imgurl.includes('%')) {
            imgurl = decodeURIComponent(imgurl)
          }
          
          // Clean up the URL - sometimes it contains extra parts or multiple URLs
          // Look for URLs that end with image extensions (these are usually the actual image URLs)
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
          const urlMatches = imgurl.match(/https?:\/\/[^\s&"']+/g) || []
          
          // Find the URL that ends with an image extension (most likely the actual image)
          for (const urlMatch of urlMatches.reverse()) {
            if (imageExtensions.some(ext => urlMatch.toLowerCase().includes(ext))) {
              return urlMatch
            }
          }
          
          // If no URL with image extension found, return the last URL found
          if (urlMatches.length > 0) {
            return urlMatches[urlMatches.length - 1]
          }
          
          // Fallback: try to extract any URL pattern
          const urlMatch = imgurl.match(/https?:\/\/[^\s&"']+/)
          if (urlMatch) {
            return urlMatch[0]
          }
          
          return imgurl
        } catch {
          // If decoding fails, try to extract URL pattern directly
          const urlMatch = imgurl.match(/https?:\/\/[^\s&]+/)
          if (urlMatch) {
            return urlMatch[0]
          }
          return imgurl
        }
      }
      
      // Try regex extraction as fallback - be more aggressive
      // Match imgurl= and capture everything until we find a proper URL pattern
      const regex = /[?&]imgurl=([^&]+)/i
      const match = url.match(regex)
      if (match && match[1]) {
        try {
          let extracted = decodeURIComponent(match[1])
          if (extracted.includes('%')) {
            extracted = decodeURIComponent(extracted)
          }
          
          // Extract URLs from the extracted string - prefer ones with image extensions
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
          const urlMatches = extracted.match(/https?:\/\/[^\s&"']+/g) || []
          
          // Find the URL that ends with an image extension
          for (const urlMatch of urlMatches.reverse()) {
            if (imageExtensions.some(ext => urlMatch.toLowerCase().includes(ext))) {
              return urlMatch
            }
          }
          
          // If no URL with image extension found, return the last URL found
          if (urlMatches.length > 0) {
            return urlMatches[urlMatches.length - 1]
          }
          
          // Fallback
          const urlMatch = extracted.match(/https?:\/\/[^\s&"']+/)
          if (urlMatch) {
            return urlMatch[0]
          }
          
          return extracted
        } catch {
          // Try to extract URL pattern directly from match
          const urlMatch = match[1].match(/https?:\/\/[^\s&]+/)
          if (urlMatch) {
            try {
              return decodeURIComponent(urlMatch[0])
            } catch {
              return urlMatch[0]
            }
          }
          return match[1]
        }
      }
    } catch (error) {
      console.error('Failed to parse Google Images URL:', error)
      // Try regex as fallback even if URL parsing fails
      const regex = /[?&]imgurl=([^&]+)/i
      const match = url.match(regex)
      if (match && match[1]) {
        try {
          let extracted = decodeURIComponent(match[1])
          if (extracted.includes('%')) {
            extracted = decodeURIComponent(extracted)
          }
          
          // Extract URLs - prefer ones with image extensions
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
          const urlMatches = extracted.match(/https?:\/\/[^\s&"']+/g) || []
          
          // Find the URL that ends with an image extension
          for (const urlMatch of urlMatches.reverse()) {
            if (imageExtensions.some(ext => urlMatch.toLowerCase().includes(ext))) {
              return urlMatch
            }
          }
          
          // If no URL with image extension found, return the last URL found
          if (urlMatches.length > 0) {
            return urlMatches[urlMatches.length - 1]
          }
          
          // Fallback
          const urlMatch = extracted.match(/https?:\/\/[^\s&"']+/)
          if (urlMatch) {
            return urlMatch[0]
          }
          
          return extracted
        } catch {
          // Try direct URL pattern extraction
          const urlMatch = match[1].match(/https?:\/\/[^\s&]+/)
          if (urlMatch) {
            return urlMatch[0]
          }
          return match[1]
        }
      }
    }
  }

  // Return original URL if not a Google Images URL or extraction failed
  return url
}

/**
 * Validates if a URL is a valid image URL
 * More lenient - allows URLs without extensions and Google Images URLs
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false

  try {
    // ALWAYS extract first if it's a Google Images URL - don't validate Google URLs directly
    if (url.includes('google.com/imgres') || url.includes('google.com/search')) {
      const extractedUrl = extractImageUrl(url)
      
      // If extraction failed (returned original), try aggressive extraction
      if (extractedUrl === url || extractedUrl.includes('google.com')) {
        // Try manual regex extraction as fallback
        const regex = /[?&]imgurl=([^&]+)/i
        const match = url.match(regex)
        if (match && match[1]) {
          try {
            let decoded = decodeURIComponent(match[1])
            // Try double decode
            if (decoded.includes('%')) {
              decoded = decodeURIComponent(decoded)
            }
            
            // Extract actual image URL from decoded string
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
            const urlMatches = decoded.match(/https?:\/\/[^\s&"']+/g) || []
            
            // Find URL with image extension
            for (const urlMatch of urlMatches.reverse()) {
              if (imageExtensions.some(ext => urlMatch.toLowerCase().includes(ext))) {
                // Found a valid image URL - validate it
                const parsed = new URL(urlMatch)
                if (['http:', 'https:'].includes(parsed.protocol)) {
                  return true
                }
              }
            }
            
            // If no URL with extension, validate any URL found
            if (urlMatches.length > 0) {
              const parsed = new URL(urlMatches[urlMatches.length - 1])
              if (['http:', 'https:'].includes(parsed.protocol)) {
                return true
              }
            }
          } catch {
            // Extraction failed
          }
        }
        // If we can't extract, we can't validate a Google Images URL
        return false
      }
      // Use extracted URL for validation
      url = extractedUrl
    }
    
    const parsed = new URL(url)
    // Check if it's http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    // Check for common image extensions in pathname or query params
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
    const pathname = parsed.pathname.toLowerCase()
    const searchParams = parsed.search.toLowerCase()
    const fullUrl = url.toLowerCase()
    
    const hasImageExtension = imageExtensions.some(ext => 
      pathname.endsWith(ext) || 
      searchParams.includes(ext.replace('.', '')) ||
      fullUrl.includes(ext.replace('.', ''))
    )
    
    // If URL has an extension in pathname, it should be an image extension
    // But many CDNs use query params or no extension, so be lenient
    const hasExtension = pathname.includes('.')
    if (hasExtension && !hasImageExtension) {
      // Check if it's a known image hosting domain
      const imageHosts = [
        'imgur.com', 'i.imgur.com', 'cloudinary.com', 'res.cloudinary.com', 
        'images.unsplash.com', 'unsplash.com', 'pexels.com', 'pixabay.com', 
        'imgflip.com', 'imgbb.com', 'postimg.cc', 'ibb.co', 'vivago.ai',
        'storage.vivago.ai', 'cdn.', 'images.', 'static.', 'media.'
      ]
      const isImageHost = imageHosts.some(host => parsed.hostname.includes(host))
      
      if (!isImageHost) {
        // If it has an extension and it's not an image extension, reject
        return false
      }
    }

    // Be very lenient - allow URLs without extensions (many CDNs don't use them)
    // Also allow URLs that look like they're from image hosting services
    return true
  } catch {
    // If URL parsing fails, it's invalid
    return false
  }
}

/**
 * Validates if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    // Check if it's http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    // Check for video extensions or video hosting sites
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8', '.mpd']
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv']
    
    const pathname = parsed.pathname.toLowerCase()
    const hostname = parsed.hostname.toLowerCase()
    
    const hasVideoExtension = videoExtensions.some(ext => pathname.includes(ext))
    const isVideoHost = videoHosts.some(host => hostname.includes(host))
    
    return hasVideoExtension || isVideoHost || true // Be lenient for video URLs
  } catch {
    return false
  }
}

