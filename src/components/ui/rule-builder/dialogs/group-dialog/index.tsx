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
import GroupForm from "./form";

// schema
import type { FormValues } from "./schema";

// types
import {
  type TGroupParams,
  ACTION_TYPE,
  type TGroup,
  LOGIC_TYPE,
} from "@/types/group";

type Props = {
  parentId?: string;
  parentIndex?: number;
  data?: TGroup;
  index?: number;
  disabled?: boolean;
  handleCreateOrEditGroups: (params: TGroupParams) => void;
  handleParentOpen?: (value: string, isOpen?: boolean) => void;
};

const GroupDialog: FC<Props> = (props) => {
  const {
    parentId,
    parentIndex,
    data,
    index,
    disabled,
    handleCreateOrEditGroups,
    handleParentOpen,
  } = props;
  const { groupId } = data || {};

  const [open, setOpen] = useState(false);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen(true);
  };
  const handleClose = useCallback(() => setOpen(false), []);

  const handleSubmit = useCallback(
    (values: FormValues) => {
      const { logic, title } = values;

      if (!groupId && !parentId) {
        const newGroup: TGroup = {
          groupId: uuidv4(),
          title,
          logic: logic ? LOGIC_TYPE.AND : LOGIC_TYPE.OR,
        };

        handleCreateOrEditGroups({
          action: ACTION_TYPE.CREATE,
          group: newGroup,
        });

        toast.success("Group was created successfully");

        handleClose();

        return;
      }

      if (groupId && data && typeof index === "number") {
        const updatedGroup: TGroup = {
          ...data,
          title,
          logic: logic ? LOGIC_TYPE.AND : LOGIC_TYPE.OR,
        };

        handleCreateOrEditGroups({
          action: ACTION_TYPE.EDIT,
          group: updatedGroup,
          index,
        });

        toast.success("Group was updated successfully");

        handleClose();

        return;
      }

      if (parentId && !groupId && typeof parentIndex === "number") {
        const newSubgroup: TGroup = {
          groupId: uuidv4(),
          title,
          logic: logic ? LOGIC_TYPE.AND : LOGIC_TYPE.OR,
          parentId,
        };

        handleCreateOrEditGroups({
          action: ACTION_TYPE.SUB_CREATE,
          group: newSubgroup,
          parentId,
          parentIndex,
        });

        toast.success("Subgroup was created successfully");

        handleParentOpen?.("", true);

        handleClose();

        return;
      }
    },
    [
      groupId,
      parentId,
      data,
      index,
      parentIndex,
      handleClose,
      handleCreateOrEditGroups,
      handleParentOpen,
    ]
  );

  return (
    <>
      <Button
        variant={data || parentId ? "outline" : "default"}
        size="sm"
        onClick={handleOpen}
        disabled={disabled}
        className={cn("border-none shadow-none", !parentId && "w-full justify-start")}
      >
        {data ? (
          <>
            <SquarePen />
            Edit Group
          </>
        ) : (
          <>
            <Plus />
            {`${parentId ? "Subgroup" : "Group"}`}
          </>
        )}
      </Button>
      <CustomDialog
        open={open}
        title={parentId ? "Subgroup" : "Group"}
        subtitle={`Create new or edit ${parentId ? "subgroup" : "group"}`}
        onClose={handleClose}
      >
        <GroupForm data={data} onSubmit={handleSubmit} />
      </CustomDialog>
    </>
  );
};

export default memo(GroupDialog);
