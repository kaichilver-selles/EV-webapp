"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ManualThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check if dark mode is already enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  function toggleTheme() {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full w-9 h-9"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
