import { ManualThemeToggle } from "@/components/manual-theme-toggle"
import { Zap } from "lucide-react"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Electricity Tariff Comparison
        </h1>
        <ManualThemeToggle />
      </div>
    </header>
  )
}
