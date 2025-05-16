"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Tariff } from "@/lib/types"

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Tariff name must be at least 2 characters.",
  }),
  unitRate: z.coerce.number().min(0, {
    message: "Unit rate must be a positive number.",
  }),
  hasEvRate: z.boolean().default(false),
  evRate: z.coerce
    .number()
    .min(0, {
      message: "EV rate must be a positive number.",
    })
    .optional()
    .nullable(),
  standingCharge: z.coerce.number().min(0, {
    message: "Standing charge must be a positive number.",
  }),
  tariffType: z.enum(["Variable", "Fixed"]),
  fixedTerm: z.string().optional(),
  offPeakStart: z.string().optional(),
  offPeakEnd: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TariffFormProps {
  onSubmit: (tariff: Tariff) => void
  initialValues?: Tariff
  onCancel?: () => void
}

export default function TariffForm({ onSubmit, initialValues, onCancel }: TariffFormProps) {
  const [hasEvRate, setHasEvRate] = useState(!!initialValues?.evRate)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialValues?.id || undefined,
      name: initialValues?.name || "",
      unitRate: initialValues?.unitRate || 0,
      hasEvRate: !!initialValues?.evRate,
      evRate: initialValues?.evRate || 0,
      standingCharge: initialValues?.standingCharge || 0,
      tariffType: initialValues?.tariffType || "Variable",
      fixedTerm: initialValues?.fixedTerm || "",
      offPeakStart: initialValues?.offPeakStart || "00:00",
      offPeakEnd: initialValues?.offPeakEnd || "00:00",
      notes: initialValues?.notes || "",
    },
  })

  // Add this useEffect to update form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      form.reset({
        id: initialValues.id,
        name: initialValues.name,
        unitRate: initialValues.unitRate,
        hasEvRate: !!initialValues.evRate,
        evRate: initialValues.evRate || 0,
        standingCharge: initialValues.standingCharge,
        tariffType: initialValues.tariffType,
        fixedTerm: initialValues.fixedTerm || "",
        offPeakStart: initialValues.offPeakStart || "00:00",
        offPeakEnd: initialValues.offPeakEnd || "00:00",
        notes: initialValues.notes || "",
      })
      setHasEvRate(!!initialValues.evRate)
    }
  }, [initialValues, form])

  const tariffType = form.watch("tariffType")

  function handleSubmit(values: FormValues) {
    onSubmit({
      id: values.id || Date.now().toString(),
      name: values.name,
      unitRate: values.unitRate,
      evRate: values.hasEvRate ? values.evRate || 0 : null,
      standingCharge: values.standingCharge,
      tariffType: values.tariffType,
      fixedTerm: values.tariffType === "Fixed" ? values.fixedTerm : undefined,
      offPeakStart: values.hasEvRate ? values.offPeakStart : undefined,
      offPeakEnd: values.hasEvRate ? values.offPeakEnd : undefined,
      notes: values.notes,
    })

    if (!initialValues) {
      form.reset({
        name: "",
        unitRate: 0,
        hasEvRate: false,
        evRate: 0,
        standingCharge: 0,
        tariffType: "Variable",
        fixedTerm: "",
        offPeakStart: "00:00",
        offPeakEnd: "00:00",
        notes: "",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tariff Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Economy 7" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tariffType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tariff Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Variable" />
                    </FormControl>
                    <FormLabel className="font-normal">Variable</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Fixed" />
                    </FormControl>
                    <FormLabel className="font-normal">Fixed</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {tariffType === "Fixed" && (
          <FormField
            control={form.control}
            name="fixedTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fixed Term</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fixed term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="12 months">12 months</SelectItem>
                    <SelectItem value="24 months">24 months</SelectItem>
                    <SelectItem value="36 months">36 months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="unitRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Rate (p/kWh)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>The standard rate you pay per kWh</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasEvRate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    setHasEvRate(!!checked)
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Has special EV rate</FormLabel>
                <FormDescription>Check this if your tariff offers a special rate for EV charging</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {hasEvRate && (
          <>
            <FormField
              control={form.control}
              name="evRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EV Rate (p/kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value || 0} />
                  </FormControl>
                  <FormDescription>The special rate for EV charging (usually off-peak)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="offPeakStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Off-Peak Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offPeakEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Off-Peak End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="standingCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standing Charge (p/day)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>The fixed daily charge regardless of usage</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information about this tariff" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{initialValues ? "Update Tariff" : "Add Tariff"}</Button>
        </div>
      </form>
    </Form>
  )
}
