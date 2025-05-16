import { ManualThemeToggle } from "@/components/manual-theme-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Electricity Tariff Comparison</h1>
        <ManualThemeToggle />
      </div>
    </header>
  )
}
