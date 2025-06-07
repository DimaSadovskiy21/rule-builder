import { memo, useEffect, type FC } from "react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ui components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// schema
import { formSchema, type FormValues } from "./schema";

// types
import { OPERATOR_TYPE, type TFilter } from "@/types/filter";

type Props = {
  data?: TFilter;
  onSubmit: (values: FormValues) => void;
};

const FilterForm: FC<Props> = (props) => {
  const { data, onSubmit } = props;
  const { field, value, operator } = data || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      field: "",
      value: "",
      operator: OPERATOR_TYPE.EQUALS,
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      field,
      value,
      operator,
    });
  }, [data, form.reset]);

  return (
    <FormProvider {...form}>
      <form
        className="flex w-full flex-col gap-6.5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem className="relative w-full">
              <FormLabel
                required
                className="absolute -top-2.5 left-3 bg-white px-2 text-sm font-medium text-gray-700"
              >
                Field
              </FormLabel>
              <FormControl>
                <Input placeholder="Field" {...field} />
              </FormControl>
              <FormDescription className="sr-only absolute">
                Input field
              </FormDescription>
              <FormMessage className="absolute top-9" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="relative w-full">
              <FormLabel
                required
                className="absolute -top-2.5 left-3 bg-white px-2 text-sm font-medium text-gray-700"
              >
                Value
              </FormLabel>
              <FormControl>
                <Input placeholder="Value" {...field} />
              </FormControl>
              <FormDescription className="sr-only absolute">
                Input value
              </FormDescription>
              <FormMessage className="absolute top-9" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="operator"
          render={({ field }) => (
            <FormItem className="relative w-full">
              <FormLabel
                required
                className="absolute -top-2.5 left-3 bg-white px-2 text-sm font-medium text-gray-700"
              >
                Operator
              </FormLabel>
              <FormControl>
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="border-auth-gray m-0 w-full">
                    <SelectValue placeholder="None" {...field} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OPERATOR_TYPE).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription className="sr-only absolute">
                Select operator
              </FormDescription>
              <FormMessage className="absolute top-9" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || form.formState.disabled}
        >
          Save
        </Button>
      </form>
    </FormProvider>
  );
};

export default memo(FilterForm);
