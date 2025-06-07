import { useCallback, useRef, useState, type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ui components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// lucide
import {
  EllipsisVertical,
  GripVertical,
  LockKeyhole,
  LockKeyholeOpen,
  StickyNote,
} from "lucide-react";

// project imports
import GroupDialog from "../dialogs/group-dialog";
import FilterDialog from "../dialogs/filter-dialog";

// types
import {
  ACTION_TYPE,
  LOGIC_TYPE,
  type TGroup,
  type TGroupParams,
} from "@/types/group";
import { type TFilterParams } from "@/types/filter";

type Props = {
  group: TGroup;
  index: number;
  displayIndex: string;
  siblingCount: number;
  childrenElements?: (isBlocked: boolean, isPaused: boolean) => ReactNode[];
  isLast: boolean;
  isParentBlocked?: boolean;
  isParentPaused?: boolean;
  handleCreateOrEditGroups: (params: TGroupParams) => void;
  handleCreateOrEditFilters: (params: TFilterParams) => void;
  moveGroup: (fromIndex: number, toIndex: number, parentId?: string) => void;
};

const ACCORDION_NAME = "name";
const PARENT_NAME = "root";

const Group: FC<Props> = (props) => {
  const {
    group,
    index,
    displayIndex,
    siblingCount,
    childrenElements,
    isParentBlocked,
    isParentPaused,
    isLast,
    handleCreateOrEditGroups,
    handleCreateOrEditFilters,
    moveGroup,
  } = props;
  const { groupId, logic, title, children, parentId } = group;

  const groupRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<string>("");
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [openActions, setOpenActions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const onValueChange = useCallback((value: string, isOpen?: boolean) => {
    if (isOpen) {
      setOpen(ACCORDION_NAME);
      return;
    }

    setOpen((prevValue) => (prevValue === value ? "" : value));
  }, []);

  const handleEditLogic = (pressed: boolean) => {
    const updattedGroup: TGroup = {
      ...group,
      logic: pressed ? LOGIC_TYPE.AND : LOGIC_TYPE.OR,
    };

    handleCreateOrEditGroups({
      action: ACTION_TYPE.EDIT,
      group: updattedGroup,
    });
  };

  const handleToggleBlocked = (pressed: boolean) => setIsBlocked(pressed);
  const handleTogglePaused = (pressed: boolean) => setIsPaused(pressed);
  const handleToggleActions = (open: boolean) => setOpenActions(open);

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    if (!groupRef.current) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("dragged-index", index.toString());
    event.dataTransfer.setData("dragged-parent-id", parentId || PARENT_NAME);

    const clone = groupRef.current.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.top = "-1000px";
    clone.style.left = "-1000px";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.width = `${groupRef.current.offsetWidth}px`;

    const divider = clone.querySelector("[data-divider]");
    if (divider) {
      (divider as HTMLElement).style.display = "none";
    }

    document.body.appendChild(clone);

    const rect = groupRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    event.dataTransfer.setDragImage(clone, offsetX, offsetY);

    setTimeout(() => {
      document.body.removeChild(clone);
    }, 0);

    setOpen("");
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

    if (draggedParentId !== (parentId || PARENT_NAME)) {
      toast.error("You can only reorder elements within the same parent");

      return;
    }

    moveGroup(Number(draggedIndex), index, parentId);
  };

  const finalIsBlocked = isBlocked || !!isParentBlocked;
  const finalIsPaused = isPaused || !!isParentPaused;

  return (
    <div
      className="flex gap-1"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      ref={groupRef}
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
        {!isLast && <div data-divider className="h-full w-[1px] bg-gray-400" />}
      </div>
      <Accordion
        type="single"
        collapsible
        value={open}
        onValueChange={onValueChange}
        disabled={!children?.length}
        className="w-full"
      >
        <AccordionItem
          value={ACCORDION_NAME}
          className={cn(
            "rounded-md pr-2 pl-3 py-2 transition-all duration-300",
            logic === LOGIC_TYPE.AND
              ? "border border-blue-500 bg-blue-50"
              : "border border-green-500 bg-green-50",
            parentId && "mr-1",
            finalIsPaused && "bg-secondary italic border border-border",
            finalIsBlocked && "bg-gray-100",
            isDragOver && "ring-2 ring-ring",
            !finalIsBlocked && "hover:ring-2 hover:ring-ring"
          )}
        >
          <div className="flex gap-1 w-full ">
            <span
              className={cn(finalIsBlocked && "opacity-30")}
            >{`${displayIndex}.`}</span>
            <p
              className={cn(
                "break-all w-full whitespace-normal",
                finalIsBlocked && "opacity-30"
              )}
            >
              {title}
            </p>
            <div className="w-fit flex gap-2">
              <Toggle
                variant="filter"
                size="sm"
                pressed={logic === LOGIC_TYPE.AND}
                onPressedChange={handleEditLogic}
                className="w-12"
                disabled={finalIsBlocked}
              >
                {logic}
              </Toggle>
              <DropdownMenu
                open={openActions}
                onOpenChange={handleToggleActions}
              >
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
                  <GroupDialog
                    data={group}
                    index={index}
                    handleCreateOrEditGroups={handleCreateOrEditGroups}
                    disabled={finalIsBlocked}
                  />
                  <Toggle
                    variant="outline"
                    size="sm"
                    pressed={isBlocked}
                    className="w-full justify-start px-2.5 border-none shadow-none"
                    onPressedChange={handleToggleBlocked}
                    disabled={isParentBlocked}
                  >
                    {isBlocked ? (
                      <>
                        <LockKeyholeOpen />
                        Unblock
                      </>
                    ) : (
                      <>
                        <LockKeyhole />
                        Block
                      </>
                    )}
                  </Toggle>
                  <Toggle
                    variant="outline"
                    size="sm"
                    pressed={isPaused}
                    className="w-full justify-start px-2.5 border-none shadow-none"
                    onPressedChange={handleTogglePaused}
                    disabled={finalIsBlocked || isParentPaused}
                  >
                    <StickyNote />
                    Draft
                  </Toggle>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <AccordionTrigger className="p-0" />
          </div>
          <AccordionContent className="py-4  flex flex-col gap-4">
            {typeof childrenElements === "function"
              ? childrenElements(finalIsBlocked, finalIsPaused)
              : null}
          </AccordionContent>
          <div className="flex gap-2 flex-wrap mt-4">
            <GroupDialog
              parentId={group.groupId}
              handleCreateOrEditGroups={handleCreateOrEditGroups}
              handleParentOpen={onValueChange}
              disabled={finalIsBlocked}
            />
            <FilterDialog
              parentId={groupId}
              disabled={finalIsBlocked}
              handleCreateOrEditFilters={handleCreateOrEditFilters}
              handleParentOpen={onValueChange}
            />
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Group;
