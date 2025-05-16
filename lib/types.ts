export interface Tariff {
  id: string
  name: string
  unitRate: number // pence per kWh
  evRate: number | null // pence per kWh, null if not applicable
  standingCharge: number // pence per day
  tariffType: "Variable" | "Fixed" // Variable or Fixed
  fixedTerm?: string // e.g., "12 months"
  offPeakStart?: string // Time format "HH:MM" - only if evRate exists
  offPeakEnd?: string // Time format "HH:MM" - only if evRate exists
  notes?: string // Additional notes about the tariff
}

export interface TariffWithCost extends Tariff {
  annualCost: number // pounds per year
}

export interface UsageAssumptions {
  householdUsage: number // kWh per year
  evUsage: number // kWh per year
  evOffPeakPercentage: number // Percentage of EV usage during off-peak hours (0-100)
}
