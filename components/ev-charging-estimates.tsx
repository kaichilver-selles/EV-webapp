"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tariff, UsageAssumptions } from "@/lib/types"
import { formatCurrency, formatTime } from "@/lib/utils"
import { motion } from "framer-motion"

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      duration: 0.6
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
}

const barVariants = {
  hidden: { width: 0 },
  show: (duration: number) => ({
    width: "100%",
    transition: { 
      duration: Math.min(5, duration / 3),
      ease: "easeInOut"
    }
  })
}

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

  // Calculate raw charging time in hours for animation duration
  const getChargingTimeInHours = (percentage: number, powerKW: number) => {
    const kWh = BATTERY_CAPACITY * percentage
    return kWh / powerKW
  }

  return (
    <div className="space-y-6">
      {tariff.evRate !== null && tariff.offPeakStart && tariff.offPeakEnd && (
        <motion.div 
          className="bg-muted p-3 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">Off-Peak Hours</Badge>
            <span>
              {formatTime(tariff.offPeakStart)} - {formatTime(tariff.offPeakEnd)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {usageAssumptions.evOffPeakPercentage}% of EV charging is assumed to be during off-peak hours.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Charging Costs</h3>
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {chargingScenarios.map((scenario) => (
                  <motion.div 
                    key={scenario.id} 
                    className="flex justify-between items-center border-b pb-2"
                    variants={itemVariants}
                  >
                    <span>{scenario.name}</span>
                    <span className="font-medium font-mono">
                      {formatCurrency(calculateChargeCost(scenario.percentage))}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-4 text-sm text-muted-foreground">
                Using {tariff.evRate !== null ? "special EV rate" : "standard rate"} of {rateForCharging}p/kWh
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
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
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {chargingPowers.map((power) => {
                        const chargingTime = getChargingTimeInHours(scenario.percentage, power.power);
                        return (
                          <motion.div 
                            key={power.name} 
                            className="border-b pb-2"
                            variants={itemVariants}
                          >
                            <div className="flex justify-between items-center">
                              <span>{power.name}</span>
                              <span className="font-medium font-mono">
                                {calculateChargingTime(scenario.percentage, power.power)}
                              </span>
                            </div>
                            <div className="mt-1 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                custom={chargingTime}
                                variants={barVariants}
                                initial="hidden"
                                animate="show"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {scenario.name} ({Math.round(BATTERY_CAPACITY * scenario.percentage)} kWh)
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.5 }}
      >
        <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <div className="text-sm">Model: 2021 Vauxhall Mokka-e</div>
          <div className="text-sm">Battery Capacity: 50 kWh</div>
          <div className="text-sm">Efficiency: ~3.6 miles/kWh</div>
          <div className="text-sm">Range: ~201 miles (WLTP)</div>
        </div>
      </motion.div>
    </div>
  )
}
