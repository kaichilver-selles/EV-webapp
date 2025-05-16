"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tariff, UsageAssumptions } from "@/lib/types"
import { formatCurrency, formatTime } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"

interface EVChargingEstimatesProps {
  tariff: Tariff
  usageAssumptions: UsageAssumptions
  onUpdateOffPeakPercentage?: (percentage: number) => void
}

// Vauxhall Mokka-e has a 50 kWh battery
const BATTERY_CAPACITY = 50 // kWh

// Define charging scenarios
const chargingScenarios = [
  { id: "typical", name: "20% → 80% (typical daily charge)", percentage: 0.6 },
  { id: "full", name: "0% → 100% (full charge)", percentage: 1.0 },
  { id: "topup", name: "10% → 50% (short top-up)", percentage: 0.4 },
  { id: "journey", name: "50% → 100% (long journey prep)", percentage: 0.5 },
  // New charging cost examples
  { id: "emergency", name: "5% → 25% (emergency top-up)", percentage: 0.2 },
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
  show: (animationDuration: number) => ({
    width: "100%",
    transition: { 
      duration: animationDuration,
      ease: "easeInOut"
    }
  })
}

// Animation variants for price numbers - removed scaling effect
const priceVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { 
      duration: 0.3
    }
  }
}

// Add this component above the EVChargingEstimates component
interface AnimatedPriceProps {
  value: number;
  animate: boolean;
}

const AnimatedPrice = ({ value, animate }: AnimatedPriceProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (animate) {
      // Reset to zero before animating
      setDisplayValue(0);
      
      // Animate from 0 to the target value
      const steps = 20;
      const increment = value / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          clearInterval(interval);
          setDisplayValue(value);
        } else {
          setDisplayValue(current);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [value, animate]);
  
  return (
    <motion.span 
      className="font-bold font-mono"
      variants={priceVariants}
      initial="hidden"
      animate={animate ? "show" : "hidden"}
    >
      {formatCurrency(displayValue)}
    </motion.span>
  );
};

export default function EVChargingEstimates({ 
  tariff, 
  usageAssumptions,
  onUpdateOffPeakPercentage
}: EVChargingEstimatesProps) {
  // Animation trigger for price changes
  const [animatePrices, setAnimatePrices] = useState(false);
  // Local copy of the off-peak percentage for immediate UI updates
  const [localOffPeakPercentage, setLocalOffPeakPercentage] = useState(usageAssumptions.evOffPeakPercentage);
  
  // Update local state when props change
  useEffect(() => {
    setLocalOffPeakPercentage(usageAssumptions.evOffPeakPercentage);
  }, [usageAssumptions.evOffPeakPercentage]);
  
  // Use EV rate if available, otherwise use standard unit rate
  const rateForCharging = tariff.evRate !== null ? tariff.evRate : tariff.unitRate

  // Re-trigger price animations when tariff changes
  useEffect(() => {
    setAnimatePrices(false);
    // Small delay to ensure re-render
    const timer = setTimeout(() => {
      setAnimatePrices(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [tariff.id, rateForCharging, localOffPeakPercentage]);

  const calculateChargeCost = (percentage: number) => {
    const kWh = BATTERY_CAPACITY * percentage
    
    // If the tariff has an EV rate and we have an off-peak percentage
    if (tariff.evRate !== null && tariff.evRate !== tariff.unitRate) {
      // Split charging based on off-peak percentage
      const offPeakKWh = kWh * (localOffPeakPercentage / 100)
      const peakKWh = kWh - offPeakKWh
      
      // Calculate costs using appropriate rates
      const offPeakCost = offPeakKWh * tariff.evRate
      const peakCost = peakKWh * tariff.unitRate
      
      const totalCostInPence = offPeakCost + peakCost
      return totalCostInPence / 100 // Convert to pounds
    } else {
      // Standard calculation for tariffs without special EV rates
      const costInPence = kWh * rateForCharging
      return costInPence / 100 // Convert to pounds
    }
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

  // Scale charging times for more visible differences in the animation
  const scaleChargingTimeForAnimation = (hours: number, powerKW: number) => {
    // Map specific charging powers to animation durations
    // This ensures a clear visual difference between different charging speeds
    switch (powerKW) {
      case 3.6: // Slow charger
        return 4.8; // Longest animation time
      case 7.4: // Home wallbox
        return 3.2; // Noticeably faster than slow charger
      case 22: // Fast charger
        return 2.0; // Significantly faster than home charging
      case 50: // Rapid charger
        return 1.6; // Quick but still visible
      case 150: // Ultra-rapid charger
        return 1.2; // Fastest animation
      default:
        // Fallback for any other power values
        return Math.min(5, Math.max(1.2, 5 - Math.log10(powerKW) * 2));
    }
  }

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    const newPercentage = values[0];
    setLocalOffPeakPercentage(newPercentage);
    
    // Update parent component if callback provided
    if (onUpdateOffPeakPercentage) {
      onUpdateOffPeakPercentage(newPercentage);
    }
  };

  return (
    <div className="space-y-6">
      {tariff.evRate !== null && tariff.offPeakStart && tariff.offPeakEnd && (
        <motion.div 
          className="bg-muted p-4 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">Off-Peak Hours</Badge>
            <span>
              {formatTime(tariff.offPeakStart)} - {formatTime(tariff.offPeakEnd)}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">EV Off-Peak Charging</span>
              <span className="text-sm font-medium">{localOffPeakPercentage}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[localOffPeakPercentage]}
              onValueChange={handleSliderChange}
              className="my-2"
            />
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">0% (All Peak)</span>
              <span className="text-xs text-muted-foreground">100% (All Off-Peak)</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card className="h-full min-h-[450px] flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col">
              <h3 className="text-lg font-medium mb-4">Charging Costs</h3>
              <motion.div 
                className="space-y-4 flex-grow"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Common Scenarios</h4>
                  {chargingScenarios.slice(0, 4).map((scenario) => (
                    <motion.div 
                      key={scenario.id} 
                      className="flex justify-between items-center border-b pb-2 mb-2"
                      variants={itemVariants}
                    >
                      <span>{scenario.name}</span>
                      <AnimatedPrice 
                        value={calculateChargeCost(scenario.percentage)}
                        animate={animatePrices}
                      />
                    </motion.div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Additional Scenarios</h4>
                  {chargingScenarios.slice(4).map((scenario) => (
                    <motion.div 
                      key={scenario.id} 
                      className="flex justify-between items-center border-b pb-2 mb-2"
                      variants={itemVariants}
                    >
                      <span>{scenario.name}</span>
                      <AnimatedPrice 
                        value={calculateChargeCost(scenario.percentage)}
                        animate={animatePrices}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <div className="mt-4 text-sm text-muted-foreground">
                {tariff.evRate !== null && tariff.evRate !== tariff.unitRate ? (
                  <>
                    Using blended rate: {localOffPeakPercentage}% at {tariff.evRate}p/kWh (off-peak) and {100 - localOffPeakPercentage}% at {tariff.unitRate}p/kWh (peak)
                  </>
                ) : (
                  <>
                    Using {tariff.evRate !== null ? "special EV rate" : "standard rate"} of {rateForCharging}p/kWh
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="h-full min-h-[450px] flex flex-col">
            <CardContent className="pt-6 flex-grow flex flex-col">
              <Tabs defaultValue="typical">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Charging Times</h3>
                  <TabsList className="grid grid-cols-5 max-w-3xl">
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
                    <TabsTrigger value="emergency" className="text-xs px-1">
                      5-25%
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
                                custom={scaleChargingTimeForAnimation(chargingTime, power.power)}
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
