export const parseHLSDuration = async (hlsUrl: string): Promise<number> => {
  try {
    const response = await fetch(hlsUrl)
    const playlistContent = await response.text()

    // Find all EXTINF lines
    const extinf = playlistContent.match(/#EXTINF:[\d.]+/g)

    if (!extinf) {
      throw new Error('No EXTINF tags found in HLS playlist')
    }

    // Extract durations and sum them up
    const totalDuration = extinf.reduce((sum, line) => {
      const durationMatch = line.match(/#EXTINF:([\d.]+)/)
      if (durationMatch) {
        return sum + parseFloat(durationMatch[1])
      }
      return sum
    }, 0)

    return Math.round(totalDuration) // Return duration in seconds, rounded
  } catch (error) {
    console.error('Error parsing HLS duration:', error)
    return 0 // Return 0 if we can't parse the duration
  }
}

// Helper function to format duration for display
export const formatHLSDuration = (seconds: number): string => {
  if (seconds === 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Batch function to get durations for multiple videos
export const getVideoDurations = async (
  videos: Array<{ id: string; videoPath: string }>,
): Promise<Record<string, number>> => {
  const durations: Record<string, number> = {}

  // Process videos in parallel but limit concurrent requests
  const batchSize = 3 // Adjust based on your needs

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize)

    const batchPromises = batch.map(async video => {
      try {
        const duration = await parseHLSDuration(video.videoPath)
        return { id: video.id, duration }
      } catch (error) {
        console.error(`Failed to get duration for video ${video.id}:`, error)
        return { id: video.id, duration: 0 }
      }
    })

    const results = await Promise.all(batchPromises)

    results.forEach(({ id, duration }) => {
      durations[id] = duration
    })
  }

  return durations
}
