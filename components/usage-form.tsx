"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { UsageAssumptions } from "@/lib/types"

const formSchema = z.object({
  householdUsage: z.coerce.number().positive({
    message: "Household usage must be a positive number.",
  }),
  evUsage: z.coerce.number().nonnegative({
    message: "EV usage must be a non-negative number.",
  }),
  evOffPeakPercentage: z.coerce.number().min(0).max(100, {
    message: "Percentage must be between 0 and 100.",
  }),
})

interface UsageFormProps {
  usageAssumptions: UsageAssumptions
  onUpdate: (values: UsageAssumptions) => void
}

export default function UsageForm({ usageAssumptions, onUpdate }: UsageFormProps) {
  const form = useForm<UsageAssumptions>({
    resolver: zodResolver(formSchema),
    defaultValues: usageAssumptions,
  })

  function handleSubmit(values: UsageAssumptions) {
    onUpdate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="householdUsage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Household Usage (kWh/year)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormDescription>Annual electricity usage excluding EV charging</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evUsage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EV Usage (kWh/year)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormDescription>Annual electricity usage for EV charging</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evOffPeakPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EV Off-Peak Charging (%)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    defaultValue={[field.value]}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">0% (All Peak)</span>
                    <span className="text-sm font-medium">{field.value}%</span>
                    <span className="text-xs text-muted-foreground">100% (All Off-Peak)</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>Percentage of EV charging done during off-peak hours</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Update Assumptions</Button>
        </div>
      </form>
    </Form>
  )
}
