"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TariffTable from "@/components/tariff-table"
import TariffForm from "@/components/tariff-form"
import EVChargingEstimates from "@/components/ev-charging-estimates"
import UsageForm from "@/components/usage-form"
import { Header } from "@/components/header"
import type { Tariff, UsageAssumptions } from "@/lib/types"
import { calculateAnnualCost, defaultTariffs, defaultUsageAssumptions } from "@/lib/utils"
import { useServerStorage } from "@/hooks/use-server-storage"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function Home() {
  // Use server storage for persistent data
  const [tariffs, setTariffs, tariffsLoading, tariffsError] = useServerStorage<Tariff[]>(
    "tariffs", 
    defaultTariffs
  )
  
  const [usageAssumptions, setUsageAssumptions, usageLoading, usageError] = useServerStorage<UsageAssumptions>(
    "usage-assumptions", 
    defaultUsageAssumptions
  )
  
  const [preferences, setPreferences, prefsLoading, prefsError] = useServerStorage<{
    selectedTariffForView: string;
    activeTab: string;
  }>(
    "preferences", 
    {
      selectedTariffForView: tariffs.length > 0 ? tariffs[0].id : "",
      activeTab: "ev-charging"
    }
  )
  
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null)
  
  // Loading state
  const isLoading = tariffsLoading || usageLoading || prefsLoading
  
  // Error state
  const hasError = tariffsError || usageError || prefsError
  
  // Update selected tariff if it doesn't exist
  useEffect(() => {
    if (
      tariffs.length > 0 && 
      !isLoading && 
      !tariffs.some((t) => t.id === preferences.selectedTariffForView)
    ) {
      setPreferences({
        ...preferences,
        selectedTariffForView: tariffs[0].id
      })
    }
  }, [tariffs, preferences, setPreferences, isLoading])

  const handleAddTariff = (tariff: Omit<Tariff, "id">) => {
    const newTariff = {
      ...tariff,
      id: Date.now().toString(),
    }
    setTariffs([...tariffs, newTariff])
  }

  const handleEditTariff = (updatedTariff: Tariff) => {
    setTariffs(tariffs.map((t) => (t.id === updatedTariff.id ? updatedTariff : t)))
    setSelectedTariff(null)
  }

  const handleDeleteTariff = (id: string) => {
    setTariffs(tariffs.filter((t) => t.id !== id))
    if (selectedTariff?.id === id) {
      setSelectedTariff(null)
    }
    if (preferences.selectedTariffForView === id && tariffs.length > 1) {
      // Find a new tariff to select
      const newSelectedId = tariffs.find((t) => t.id !== id)?.id || ""
      setPreferences({
        ...preferences,
        selectedTariffForView: newSelectedId
      })
    }
  }

  // Update the handleSelectTariff function to properly set the selected tariff
  const handleSelectTariff = (tariff: Tariff) => {
    // Create a deep copy of the tariff to avoid reference issues
    const tariffCopy = JSON.parse(JSON.stringify(tariff))
    setSelectedTariff(tariffCopy)
  }

  const handleSelectTariffForView = (id: string) => {
    setPreferences({
      ...preferences,
      selectedTariffForView: id,
      activeTab: "ev-charging"
    })
  }

  const handleUpdateUsageAssumptions = (newAssumptions: UsageAssumptions) => {
    setUsageAssumptions(newAssumptions)
  }

  const handleTabChange = (value: string) => {
    setPreferences({
      ...preferences,
      activeTab: value
    })
  }

  // Calculate annual costs for all tariffs
  const tariffsWithCosts = tariffs.map((tariff) => ({
    ...tariff,
    annualCost: calculateAnnualCost(tariff, usageAssumptions),
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your tariff data...</p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the application data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tariff Comparison</CardTitle>
              <CardDescription>
                Compare electricity tariffs based on your usage. Click on a row to view EV charging estimates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TariffTable
                tariffs={tariffsWithCosts}
                onEdit={handleSelectTariff}
                onDelete={handleDeleteTariff}
                onSelectForView={handleSelectTariffForView}
                selectedTariffId={preferences.selectedTariffForView}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{selectedTariff ? "Edit Tariff" : "Add New Tariff"}</CardTitle>
              <CardDescription>
                {selectedTariff
                  ? "Update the details of your selected tariff"
                  : "Enter the details of a new electricity tariff"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TariffForm
                onSubmit={selectedTariff ? handleEditTariff : handleAddTariff}
                initialValues={selectedTariff || undefined}
                onCancel={selectedTariff ? () => setSelectedTariff(null) : undefined}
              />
            </CardContent>
          </Card>
        </div>

        <Tabs value={preferences.activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:max-w-md">
            <TabsTrigger value="ev-charging">EV Charging Estimates</TabsTrigger>
            <TabsTrigger value="usage-assumptions">Usage Assumptions</TabsTrigger>
          </TabsList>
          <TabsContent value="ev-charging">
            <Card>
              <CardHeader>
                <CardTitle>EV Charging Estimates</CardTitle>
                <CardDescription>
                  Charging costs for 2021 Vauxhall Mokka-e (50 kWh battery)
                  {tariffs.find((t) => t.id === preferences.selectedTariffForView) && (
                    <span className="font-medium block mt-1">
                      Tariff: {tariffs.find((t) => t.id === preferences.selectedTariffForView)?.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EVChargingEstimates
                  tariff={tariffs.find((t) => t.id === preferences.selectedTariffForView) || tariffs[0]}
                  usageAssumptions={usageAssumptions}
                  onUpdateOffPeakPercentage={(percentage) => {
                    setUsageAssumptions({
                      ...usageAssumptions,
                      evOffPeakPercentage: percentage
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="usage-assumptions">
            <Card>
              <CardHeader>
                <CardTitle>Usage Assumptions</CardTitle>
                <CardDescription>Update the assumptions used for calculating annual costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Household Usage:</div>
                    <div>{usageAssumptions.householdUsage.toFixed(1)} kWh/year</div>
                    <div className="font-medium">EV Usage:</div>
                    <div>{usageAssumptions.evUsage.toFixed(1)} kWh/year</div>
                    <div className="font-medium">Total Usage:</div>
                    <div>{(usageAssumptions.householdUsage + usageAssumptions.evUsage).toFixed(1)} kWh/year</div>
                    <div className="font-medium">EV Off-Peak Charging:</div>
                    <div>{usageAssumptions.evOffPeakPercentage}%</div>
                  </div>

                  <UsageForm usageAssumptions={usageAssumptions} onUpdate={handleUpdateUsageAssumptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">Electricity Tariff Comparison Tool © {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}
