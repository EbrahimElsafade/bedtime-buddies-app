import { useState, useEffect } from 'react'

export const useIsIOS = () => {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS devices
    // Check for iOS devices using user agent
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window)

    // Additional check for iPad with newer iOS versions
    const isIPadOS = navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)

    setIsIOS(iOS || isIPadOS)
  }, [])

  return isIOS
}