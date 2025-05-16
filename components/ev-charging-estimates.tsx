"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tariff, UsageAssumptions } from "@/lib/types"
import { formatCurrency, formatTime } from "@/lib/utils"

interface EVChargingEstimatesProps {
  tariff: Tariff
  usageAssumptions: UsageAssumptions
}

// Vauxhall Mokka-e has a 50 kWh battery
const BATTERY_CAPACITY = 50 // kWh

// Define charging scenarios
const chargingScenarios = [
  { id: "typical", name: "20% → 80% (typical daily charge)", percentage: 0.6 },
  { id: "full", name: "0% → 100% (full charge)", percentage: 1.0 },
  { id: "topup", name: "10% → 50% (short top-up)", percentage: 0.4 },
  { id: "journey", name: "50% → 100% (long journey prep)", percentage: 0.5 },
]

// Define charging powers
const chargingPowers = [
  { power: 7.4, name: "7.4 kW (Home Wallbox)" },
  { power: 3.6, name: "3.6 kW (Slow Charger)" },
  { power: 22, name: "22 kW (Fast Charger)" },
  { power: 50, name: "50 kW (Rapid Charger)" },
  { power: 150, name: "150 kW (Ultra-Rapid Charger)" },
]

export default function EVChargingEstimates({ tariff, usageAssumptions }: EVChargingEstimatesProps) {
  // Use EV rate if available, otherwise use standard unit rate
  const rateForCharging = tariff.evRate !== null ? tariff.evRate : tariff.unitRate

  const calculateChargeCost = (percentage: number) => {
    const kWh = BATTERY_CAPACITY * percentage
    const costInPence = kWh * rateForCharging
    return costInPence / 100 // Convert to pounds
  }

  const calculateChargingTime = (percentage: number, powerKW: number) => {
    const kWh = BATTERY_CAPACITY * percentage
    const hours = kWh / powerKW

    // Format as hours and minutes
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)

    if (wholeHours === 0) {
      return `${minutes} mins`
    } else if (minutes === 0) {
      return `${wholeHours} hr${wholeHours !== 1 ? "s" : ""}`
    } else {
      return `${wholeHours} hr${wholeHours !== 1 ? "s" : ""} ${minutes} mins`
    }
  }

  return (
    <div className="space-y-6">
      {tariff.evRate !== null && tariff.offPeakStart && tariff.offPeakEnd && (
        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Off-Peak Hours</Badge>
            <span>
              {formatTime(tariff.offPeakStart)} - {formatTime(tariff.offPeakEnd)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {usageAssumptions.evOffPeakPercentage}% of EV charging is assumed to be during off-peak hours.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Charging Costs</h3>
            <div className="space-y-4">
              {chargingScenarios.map((scenario) => (
                <div key={scenario.id} className="flex justify-between items-center border-b pb-2">
                  <span>{scenario.name}</span>
                  <span className="font-medium font-mono">
                    {formatCurrency(calculateChargeCost(scenario.percentage))}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Using {tariff.evRate !== null ? "special EV rate" : "standard rate"} of {rateForCharging}p/kWh
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="typical">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Charging Times</h3>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="typical" className="text-xs px-1">
                    20-80%
                  </TabsTrigger>
                  <TabsTrigger value="full" className="text-xs px-1">
                    0-100%
                  </TabsTrigger>
                  <TabsTrigger value="topup" className="text-xs px-1">
                    10-50%
                  </TabsTrigger>
                  <TabsTrigger value="journey" className="text-xs px-1">
                    50-100%
                  </TabsTrigger>
                </TabsList>
              </div>

              {chargingScenarios.map((scenario) => (
                <TabsContent key={scenario.id} value={scenario.id} className="mt-0">
                  <div className="space-y-4">
                    {chargingPowers.map((power) => (
                      <div key={power.name} className="flex justify-between items-center border-b pb-2">
                        <span>{power.name}</span>
                        <span className="font-medium font-mono">
                          {calculateChargingTime(scenario.percentage, power.power)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {scenario.name} ({Math.round(BATTERY_CAPACITY * scenario.percentage)} kWh)
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <div className="text-sm">Model: 2021 Vauxhall Mokka-e</div>
          <div className="text-sm">Battery Capacity: 50 kWh</div>
          <div className="text-sm">Efficiency: ~3.6 miles/kWh</div>
          <div className="text-sm">Range: ~201 miles (WLTP)</div>
        </div>
      </div>
    </div>
  )
}
