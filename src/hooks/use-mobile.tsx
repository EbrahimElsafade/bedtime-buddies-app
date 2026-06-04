import * as React from "react"

const MOBILE_BREAKPOINT = 768

/** Below this width: poster + dialog popup (matches Tailwind `lg`). Inline embed at 1024px+. */
export const DRIVE_POPUP_BREAKPOINT = 1024

/** True when viewport is under 1024px — use Drive video popup instead of inline iframe. */
export function usePreferDrivePopup(breakpoint = DRIVE_POPUP_BREAKPOINT) {
  const [preferPopup, setPreferPopup] = React.useState(true)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setPreferPopup(mql.matches)
    mql.addEventListener('change', onChange)
    setPreferPopup(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return preferPopup
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
