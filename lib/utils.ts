import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Tariff, UsageAssumptions } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAnnualCost(tariff: Tariff, usageAssumptions: UsageAssumptions): number {
  const { householdUsage, evUsage, evOffPeakPercentage } = usageAssumptions

  // Calculate the cost of household usage
  const householdCost = householdUsage * tariff.unitRate

  // Calculate the cost of EV usage
  let evCost = 0

  if (tariff.evRate !== null && evOffPeakPercentage > 0) {
    // Split EV usage between peak and off-peak
    const evOffPeakUsage = evUsage * (evOffPeakPercentage / 100)
    const evPeakUsage = evUsage - evOffPeakUsage

    // Calculate costs using appropriate rates
    const evOffPeakCost = evOffPeakUsage * tariff.evRate
    const evPeakCost = evPeakUsage * tariff.unitRate

    evCost = evOffPeakCost + evPeakCost
  } else {
    // All EV usage at standard rate
    evCost = evUsage * tariff.unitRate
  }

  // Calculate the annual standing charge
  const annualStandingCharge = tariff.standingCharge * 365

  // Total annual cost in pence
  const totalCostPence = householdCost + evCost + annualStandingCharge

  // Convert to pounds
  return totalCostPence / 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTime(time: string | undefined): string {
  if (!time) return ""

  // Convert 24-hour format to 12-hour format with AM/PM
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 || 12

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
}

export const defaultTariffs: Tariff[] = [
  {
    id: "1",
    name: "So Flex (Current)",
    unitRate: 26.17,
    evRate: null,
    standingCharge: 58.63,
    tariffType: "Variable",
    notes: "Flat rate; no exit fee",
  },
  {
    id: "2",
    name: "Fuse Off-Peak Fixed (12m) v2 – Ideal Case",
    unitRate: 27.58,
    evRate: 12.76,
    standingCharge: 48.13,
    tariffType: "Fixed",
    fixedTerm: "12 months",
    offPeakStart: "01:30",
    offPeakEnd: "08:30",
    notes: "EV charged between 01:30–08:30",
  },
  {
    id: "3",
    name: "Fuse Off-Peak Fixed (12m) v2 – Worst Case",
    unitRate: 27.58,
    evRate: 27.58, // Same as peak rate for worst case
    standingCharge: 48.13,
    tariffType: "Fixed",
    fixedTerm: "12 months",
    offPeakStart: "01:30",
    offPeakEnd: "08:30",
    notes: "EV charged outside off-peak hours",
  },
  {
    id: "4",
    name: "Fuse Single Rate Variable",
    unitRate: 24.61,
    evRate: null,
    standingCharge: 55.94,
    tariffType: "Variable",
    notes: "No peak/off-peak split",
  },
  {
    id: "5",
    name: "So Chestnut One Year",
    unitRate: 21.97,
    evRate: null,
    standingCharge: 61.2,
    tariffType: "Fixed",
    fixedTerm: "12 months",
    notes: "Flat rate",
  },
]

export const defaultUsageAssumptions: UsageAssumptions = {
  householdUsage: 3190.5,
  evUsage: 834,
  evOffPeakPercentage: 100, // Default to 100% off-peak charging
}
