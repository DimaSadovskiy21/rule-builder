import { useRef, useState, type FC } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ui components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// lucide
import { EllipsisVertical, GripVertical } from "lucide-react";

// project imports
import FilterDialog from "../dialogs/filter-dialog";

// types
import { type TFilter, type TFilterParams } from "@/types/filter";

type Props = {
  filter: TFilter;
  index: number;
  childPosition: number;
  parentIndex: number;
  isParentBlocked: boolean;
  displayIndex: string;
  siblingCount: number;
  isLast: boolean;
  handleCreateOrEditFilters: (params: TFilterParams) => void;
  moveGroup: (fromIndex: number, toIndex: number, parentIndex?: number) => void;
};

const Filter: FC<Props> = (props) => {
  const {
    filter,
    parentIndex,
    index,
    childPosition,
    isParentBlocked,
    displayIndex,
    siblingCount,
    isLast,
    handleCreateOrEditFilters,
    moveGroup,
  } = props;
  const { field, value, operator, parentId } = filter;

  const filterRef = useRef<HTMLDivElement>(null);

  const [openActions, setOpenActions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fields = {
    field,
    value,
    operator,
  };

  const handleToggleActions = (open: boolean) => setOpenActions(open);

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    if (!filterRef.current) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("dragged-index", childPosition.toString());
    event.dataTransfer.setData("dragged-parent-id", parentId);

    const clone = filterRef.current.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.top = "-1000px";
    clone.style.left = "-1000px";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.width = `${filterRef.current.offsetWidth}px`;

    const divider = clone.querySelector("[data-divider]");
    if (divider) {
      (divider as HTMLElement).style.display = "none";
    }

    document.body.appendChild(clone);

    const rect = filterRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    event.dataTransfer.setDragImage(clone, offsetX, offsetY);

    setTimeout(() => {
      document.body.removeChild(clone);
    }, 0);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const draggedIndex = event.dataTransfer.getData("dragged-index");
    const draggedParentId = event.dataTransfer.getData("dragged-parent-id");

    if (draggedParentId !== parentId) {
      toast.error("You can only reorder elements within the same parent");

      return;
    }

    moveGroup(Number(draggedIndex), childPosition, parentIndex);
  };

  return (
    <div
      className="flex gap-1"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      ref={filterRef}
    >
      <div className="flex flex-col items-center gap-0.25">
        <Button
          variant="outline"
          type="reset"
          size="sm"
          className="border-none shadow-none bg-transparent text-gray-600 !cursor-grab"
          draggable
          onDragStart={handleDragStart}
          disabled={siblingCount < 2 || isParentBlocked}
        >
          <GripVertical />
        </Button>
        {!isLast && (
          <div
            className="h-full w-[1px] bg-gray-400"
            style={{ height: "calc(100% + 24px)" }}
          />
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-2 w-full mr-1  bg-white border px-2 py-1 border-border rounded-md",
          isDragOver && "ring-2 ring-ring",
          !isParentBlocked && "hover:ring-2 hover:ring-ring"
        )}
      >
        <span
          className={cn(isParentBlocked && "opacity-30")}
        >{`${displayIndex}.`}</span>
        <div className="w-full bg-gray-50 rounded-md">
          <div
            className={cn(
              "flex gap-2 flex-wrap px-2 py-1 rounded-md",
              isParentBlocked && "opacity-30"
            )}
          >
            {Object.entries(fields).map(([key, value]) => (
              <div
                key={key}
                className="flex gap-1 bg-white rounded-sm px-2 py-1"
              >
                <p className="text-muted-foreground uppercase">{`${key}:`}</p>
                <p className="break-all w-full whitespace-normal">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <DropdownMenu open={openActions} onOpenChange={handleToggleActions}>
          <DropdownMenuTrigger asChild disabled={isParentBlocked}>
            <Button
              type="reset"
              variant="outline"
              size="sm"
              className="border-none shadow-none"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col items-center justify-between gap-2">
            <FilterDialog
              parentId={parentId}
              parentIndex={parentIndex}
              data={filter}
              index={index}
              handleCreateOrEditFilters={handleCreateOrEditFilters}
              disabled={isParentBlocked}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Filter;
