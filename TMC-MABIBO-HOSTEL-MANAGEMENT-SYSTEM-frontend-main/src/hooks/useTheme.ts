import { useEffect, useState } from "react"

export type ThemeMode = "light" | "dark"

function readDarkMode(): boolean {
  if (typeof window === "undefined") return false
  const saved = window.localStorage.getItem("dark_mode")
  if (saved !== null) return saved === "true"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyDarkMode(darkMode: boolean) {
  document.documentElement.classList.toggle("dark", darkMode)
}

/**
 * The application's single theme source of truth. It owns persistence of the
 * existing `dark_mode` localStorage key and the `dark` class on <html>, so
 * every consumer (TopBar, Settings, the toaster) stays in sync without keeping
 * a second copy of the state.
 */
export function useTheme(): { theme: ThemeMode; toggleTheme: () => void } {
  const [darkMode, setDarkMode] = useState(readDarkMode)

  // Apply the resolved theme to the document on mount and on every change so
  // the preference survives navigation and reloads.
  useEffect(() => {
    applyDarkMode(darkMode)
    window.localStorage.setItem("dark_mode", String(darkMode))
  }, [darkMode])

  // Follow the `dark` class if any other code changes it, so multiple mounted
  // consumers never drift apart.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setDarkMode((current) => (current === isDark ? current : isDark))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const onStorage = (event: StorageEvent) => {
      if (event.key === "dark_mode") setDarkMode(event.newValue === "true")
    }
    window.addEventListener("storage", onStorage)

    return () => {
      observer.disconnect()
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const toggleTheme = () => setDarkMode((current) => !current)

  return { theme: darkMode ? "dark" : "light", toggleTheme }
}
