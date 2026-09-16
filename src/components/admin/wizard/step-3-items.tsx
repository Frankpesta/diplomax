"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ItemFormData } from "@/types/wizard";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";

const itemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Describe what's in this item"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  declaredValue: z.number().min(0, "Value must be 0 or more"),
});

const schema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  data: ItemFormData[];
  onComplete: (data: ItemFormData[]) => void;
  onBack: () => void;
}

function newItem(): ItemFormData {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    weight: 0,
    declaredValue: 0,
  };
}

function parseNum(val: string) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export function Step3Items({ data, onComplete, onBack }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { items: data.length ? data : [newItem()] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Shipment Items</h2>
        <p className="text-sm text-muted-foreground">
          List every item included in this shipment.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => onComplete(v.items))}
          className="space-y-6"
        >
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What&apos;s in this item?</FormLabel>
                      <Textarea
                        placeholder="e.g. 2 laptops, 3 phone chargers, and a power bank"
                        rows={2}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          type="number"
                          min={1}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Math.max(1, parseNum(e.target.value)))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.weight`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name={`items.${index}.declaredValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Declared Value (USD)</FormLabel>
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
                </div>
              </div>
            ))}

            {form.formState.errors.items?.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.items.root.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => append(newItem())}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Item
          </Button>

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
