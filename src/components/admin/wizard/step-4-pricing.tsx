"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusInput } from "@/components/admin/shipments/status-input";
import { PricingData, SHIPMENT_TYPES } from "@/types/wizard";
import { ArrowLeft, ArrowRight } from "lucide-react";

const schema = z.object({
  shipmentType: z.string().min(1, "Select a shipment type"),
  status: z.string().min(1, "Status is required"),
  dispatchDate: z.string(),
  estimatedDeliveryDate: z.string(),
  weight: z.number().min(0.01, "Total weight required"),
  length: z.number().min(0.01, "Length required"),
  width: z.number().min(0.01, "Width required"),
  height: z.number().min(0.01, "Height required"),
  shippingCost: z.number().min(0),
  tax: z.number().min(0),
  insurance: z.number().min(0),
  totalCost: z.number().min(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  data: PricingData;
  onComplete: (data: PricingData) => void;
  onBack: () => void;
}

function parseNum(val: string) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export function Step4Pricing({ data, onComplete, onBack }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      dispatchDate: data.dispatchDate ?? "",
      estimatedDeliveryDate: data.estimatedDeliveryDate ?? "",
    },
  });

  const [shippingCost, tax, insurance] = useWatch({
    control: form.control,
    name: ["shippingCost", "tax", "insurance"],
  });

  useEffect(() => {
    const total =
      Math.round(
        ((Number(shippingCost) || 0) +
          (Number(tax) || 0) +
          (Number(insurance) || 0)) *
          100
      ) / 100;
    form.setValue("totalCost", total);
  }, [shippingCost, tax, insurance, form]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Pricing & Shipment Details</h2>
        <p className="text-sm text-muted-foreground">
          Set the shipment type, dimensions, and cost breakdown.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="space-y-6">
          {/* Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shipmentType"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Shipment Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val ?? "")}
                  >
                    <SelectTrigger
                      className={fieldState.error ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <StatusInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. Shipment Registered"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dispatchDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dispatch Date{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Est. Delivery Date{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dimensions + Weight */}
          <div>
            <h3 className="text-sm font-medium mb-3">Package Dimensions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  ["weight", "Weight (kg)"],
                  ["length", "Length (cm)"],
                  ["width", "Width (cm)"],
                  ["height", "Height (cm)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(parseNum(e.target.value))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-medium mb-3">Cost Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  ["shippingCost", "Shipping Cost ($)"],
                  ["tax", "Tax ($)"],
                  ["insurance", "Insurance ($)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(parseNum(e.target.value))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="totalCost"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>Total Cost ($)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    readOnly
                    className="bg-muted cursor-not-allowed font-semibold"
                    value={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
