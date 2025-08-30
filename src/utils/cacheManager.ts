export const clearAllCaches = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear indexedDB
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases()
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve) => {
              const deleteRequest = indexedDB.deleteDatabase(db.name!)
              deleteRequest.onsuccess = () => resolve()
              deleteRequest.onerror = () => resolve() // Continue even if deletion fails
            })
          }
        })
      )
    }
    
    // Clear service worker cache if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }
    
    console.log('All caches cleared successfully')
  } catch (error) {
    console.error('Error clearing caches:', error)
  }
}

export const forceReload = (): void => {
  window.location.reload()
}

export const checkAppVersion = (): void => {
  const currentVersion = '2.0.0'
  const storedVersion = localStorage.getItem('app-version')
  
  if (storedVersion !== currentVersion) {
    clearAllCaches().then(() => {
      localStorage.setItem('app-version', currentVersion)
      // Force reload after cache clear
      setTimeout(() => {
        window.location.reload()
      }, 100)
    })
  }
}