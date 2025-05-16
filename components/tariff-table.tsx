"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import type { TariffWithCost } from "@/lib/types"
import { formatCurrency, formatTime } from "@/lib/utils"

interface TariffTableProps {
  tariffs: TariffWithCost[]
  onEdit: (tariff: TariffWithCost) => void
  onDelete: (id: string) => void
  onSelectForView: (id: string) => void
  selectedTariffId: string
}

export default function TariffTable({
  tariffs,
  onEdit,
  onDelete,
  onSelectForView,
  selectedTariffId,
}: TariffTableProps) {
  // Sort tariffs by annual cost (lowest first)
  const sortedTariffs = [...tariffs].sort((a, b) => a.annualCost - b.annualCost)

  return (
    <div className="overflow-x-auto">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Tariff Name</TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    Unit Rate (p/kWh)
                    <span className="ml-1 text-muted-foreground">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The price you pay per kilowatt-hour (kWh) of electricity used.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    EV Rate (p/kWh)
                    <span className="ml-1 text-muted-foreground">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Special rate for electric vehicle charging, usually during off-peak hours.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    Standing Charge (p/day)
                    <span className="ml-1 text-muted-foreground">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Fixed daily charge for maintaining your electricity supply, regardless of usage.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-end w-full">
                    Annual Cost
                    <span className="ml-1 text-muted-foreground">ⓘ</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Estimated annual cost based on your usage assumptions.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTariffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No tariffs added yet. Add your first tariff using the form.
                </TableCell>
              </TableRow>
            ) : (
              sortedTariffs.map((tariff, index) => (
                <TableRow
                  key={tariff.id}
                  className={`
                    ${index === 0 ? "bg-green-50 dark:bg-green-950/20" : ""}
                    ${tariff.id === selectedTariffId ? "bg-blue-50 dark:bg-blue-950/20" : ""}
                    cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/20
                  `}
                  onClick={() => onSelectForView(tariff.id)}
                >
                  <TableCell className="font-medium min-w-[250px]">
                    <div className="flex flex-col">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="break-words pr-1">{tariff.name}</span>
                        {index === 0 && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800 whitespace-nowrap flex-shrink-0"
                          >
                            Best Value
                          </Badge>
                        )}
                        {tariff.id === selectedTariffId && (
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800 whitespace-nowrap flex-shrink-0"
                          >
                            Selected
                          </Badge>
                        )}
                      </div>
                      {tariff.evRate !== null && tariff.offPeakStart && tariff.offPeakEnd && (
                        <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                          Off-peak: {formatTime(tariff.offPeakStart)} - {formatTime(tariff.offPeakEnd)}
                        </span>
                      )}
                      {tariff.notes && <span className="text-xs text-muted-foreground mt-1">{tariff.notes}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{tariff.unitRate.toFixed(2)}</TableCell>
                  <TableCell>
                    {tariff.evRate !== null ? (
                      <span className="font-mono">{tariff.evRate.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{tariff.standingCharge.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tariff.tariffType === "Fixed" ? "outline" : "secondary"}
                      className="whitespace-nowrap"
                    >
                      {tariff.tariffType}
                      {tariff.fixedTerm && ` (${tariff.fixedTerm})`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium font-mono">
                    {formatCurrency(tariff.annualCost)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(tariff)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(tariff.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  )
}
