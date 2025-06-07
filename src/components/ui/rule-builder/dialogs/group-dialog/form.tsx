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
import { Toggle } from "@/components/ui/toggle";

// schema
import { formSchema, type FormValues } from "./schema";

// types
import { LOGIC_TYPE, type TGroup } from "@/types/group";

type Props = {
  data?: TGroup;
  onSubmit: (values: FormValues) => void;
};

const GroupForm: FC<Props> = (props) => {
  const { data, onSubmit } = props;
  const { title, logic } = data || {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      logic: true,
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      title,
      logic: logic === LOGIC_TYPE.AND,
    });
  }, [data, form.reset]);

  return (
    <FormProvider {...form}>
      <form
        className="flex w-full flex-col gap-6.5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="relative w-full">
                <FormLabel
                  required
                  className="absolute -top-2.5 left-3 bg-white px-2 text-sm font-medium text-gray-700"
                >
                  Title
                </FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormDescription className="sr-only absolute">
                  Input title
                </FormDescription>
                <FormMessage className="absolute top-9" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logic"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Toggle
                    variant="filter"
                    pressed={field.value}
                    onPressedChange={field.onChange}
                    className="w-12"
                  >
                    {field.value ? "AND" : "OR"}
                  </Toggle>
                </FormControl>
                <FormDescription className="sr-only absolute">
                  Button logic
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
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

export default memo(GroupForm);
