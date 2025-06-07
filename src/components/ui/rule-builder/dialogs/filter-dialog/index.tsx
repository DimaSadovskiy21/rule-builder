import { memo, useCallback, useState, type FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ui components
import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/ui/custom-dialog";

// lucide
import { Plus, SquarePen } from "lucide-react";

// project imports
import FilterForm from "./form";

// schema
import { type FormValues } from "./schema";

// types
import { type TFilter, type TFilterParams, ACTION_TYPE } from "@/types/filter";

type Props = {
  parentId: string;
  parentIndex: number;
  index?: number;
  data?: TFilter;
  disabled?: boolean;
  handleCreateOrEditFilters: (params: TFilterParams) => void;
  handleParentOpen?: (value: string, isOpen?: boolean) => void;
};

const FilterDialog: FC<Props> = (props) => {
  const {
    parentId,
    data,
    disabled,
    parentIndex,
    index,
    handleCreateOrEditFilters,
    handleParentOpen,
  } = props;
  const { filterId } = data || {};

  const [open, setOpen] = useState(false);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen(true);
  };
  const handleClose = useCallback(() => setOpen(false), []);

  const handleSubmit = useCallback(
    (values: FormValues) => {
      const { field, value, operator } = values;

      if (!filterId) {
        const newFilter: TFilter = {
          filterId: uuidv4(),
          field,
          value,
          operator,
          parentId,
        };

        handleCreateOrEditFilters({
          action: ACTION_TYPE.CREATE,
          filter: newFilter,
          parentIndex,
        });

        toast.success("Filter was created successfully");

        handleParentOpen?.("", true);

        handleClose();

        return;
      }

      if (filterId && data && typeof index === "number") {
        const updatedFilter: TFilter = {
          ...data,
          field,
          value,
          operator,
        };

        handleCreateOrEditFilters({
          action: ACTION_TYPE.EDIT,
          filter: updatedFilter,
          index,
        });

        toast.success("Filter was updated successfully");

        handleClose();

        return;
      }
    },
    [
      data,
      filterId,
      handleClose,
      handleCreateOrEditFilters,
      handleParentOpen,
      index,
      parentId,
      parentIndex,
    ]
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={cn(
          "border-none shadow-none",
          data && "w-full justify-start"
        )}
        disabled={disabled}
      >
        {data ? (
          <>
            <SquarePen />
            Edit Filter
          </>
        ) : (
          <>
            <Plus />
            Filter
          </>
        )}
      </Button>
      <CustomDialog
        open={open}
        title="Filter"
        subtitle="Create new or edit filter"
        onClose={handleClose}
      >
        <FilterForm data={data} onSubmit={handleSubmit} />
      </CustomDialog>
    </>
  );
};

export default memo(FilterDialog);
