import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

// ui components
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// project imports
import Group from "./components/group";
import Filter from "./components/filter";
import GroupDialog from "./dialogs/group-dialog";

// types
import {
  ACTION_TYPE,
  CHILD_TYPE,
  type TChild,
  type TGroup,
  type TGroupParams,
} from "@/types/group";
import { type TFilter, type TFilterParams } from "@/types/filter";

const RuleBuilder = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [groups, setGroups] = useState<TGroup[]>([]);
  const [filters, setFilters] = useState<TFilter[]>([]);

  console.log(groups);

  const handleCreateOrEditGroups = useCallback((params: TGroupParams) => {
    const { action, group } = params;

    if (action === ACTION_TYPE.CREATE) {
      setGroups((prev) => [...prev, group]);

      setTimeout(
        () =>
          containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
          }),
        0
      );

      return;
    }

    if (action === ACTION_TYPE.EDIT) {
      setGroups((prev) => {
        const newGroups = [...prev];
        newGroups[params.index] = group;

        return newGroups;
      });

      return;
    }

    if (action === ACTION_TYPE.SUB_CREATE) {
      setGroups((prev) => {
        const newGroups = [...prev];
        const newSubgroupIndex: TChild = {
          type: CHILD_TYPE.GROUP,
          index: newGroups.length,
        };

        newGroups.push(group);

        const parent = newGroups[params.parentIndex];

        if (!parent) {
          return newGroups;
        }

        const childrenIndexes = parent.children ?? [];

        newGroups[params.parentIndex] = {
          ...parent,
          children: [...childrenIndexes, newSubgroupIndex],
        };

        return newGroups;
      });

      return;
    }
  }, []);

  const handleCreateOrEditFilters = useCallback((params: TFilterParams) => {
    const { action, filter } = params;

    if (action === ACTION_TYPE.CREATE) {
      let filterLength = 0;

      setFilters((prev) => {
        filterLength = prev.length;

        return [...prev, filter];
      });

      setGroups((prev) => {
        const newGroups = [...prev];

        const newFilterIndex: TChild = {
          type: CHILD_TYPE.FILTER,
          index: filterLength,
        };

        const parent = newGroups[params.parentIndex];

        if (!parent) {
          return newGroups;
        }

        const childrenIndexes = parent.children ?? [];

        newGroups[params.parentIndex] = {
          ...parent,
          children: [...childrenIndexes, newFilterIndex],
        };

        return newGroups;
      });

      return;
    }

    if (action === ACTION_TYPE.EDIT) {
      setFilters((prev) => {
        const newFilters = [...prev];
        newFilters[params.index] = filter;

        return newFilters;
      });

      return;
    }
  }, []);

  const moveGroup = useCallback(
    (fromIndex: number, toIndex: number, parentIndex?: number) => {
      if (typeof parentIndex === "number") {
        setGroups((prevGroups) => {
          const updatedGroups = [...prevGroups];
          const parentGroup = updatedGroups[parentIndex];

          if (!parentGroup || !parentGroup.children) {
            toast.error(
              "Invalid child move: parent not found or has no children"
            );
            return prevGroups;
          }

          const children = [...parentGroup.children];
          const [movedChild] = children.splice(fromIndex, 1);
          children.splice(toIndex, 0, movedChild);

          updatedGroups[parentIndex] = {
            ...parentGroup,
            children,
          };

          return updatedGroups;
        });

        return;
      }

      setGroups((prevGroups) => {
        const updatedGroups = [...prevGroups];

        const fromGroup = updatedGroups[fromIndex];
        const toGroup = updatedGroups[toIndex];

        if (!fromGroup || !toGroup) {
          toast.error("Invalid move: group not found");
          return prevGroups;
        }

        if ((fromGroup.parentId ?? null) !== (toGroup.parentId ?? null)) {
          toast.error("You can only reorder groups within the same parent");
          return prevGroups;
        }

        const [movedGroup] = updatedGroups.splice(fromIndex, 1);
        updatedGroups.splice(toIndex, 0, movedGroup);

        return updatedGroups;
      });
    },
    []
  );

  const parentGroupsLength = useMemo(
    () =>
      groups.reduce((acc, value) => {
        if (value.parentId) return acc;

        acc += 1;

        return acc;
      }, 0),
    [groups]
  );

  return (
    <Card className="w-full border-none">
      <CardHeader className="grid grid-cols-[1fr_auto] grid-rows-1 items-center  gap-0">
        <CardTitle className="font-bold text-lg">Rule Builder</CardTitle>
        <CardAction>
          <GroupDialog handleCreateOrEditGroups={handleCreateOrEditGroups} />
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-hidden flex items-center w-full h-full justify-center">
        {!groups.length ? (
          <div className="flex flex-col items-center gap-6">
            <img
              src="norules_image.webp"
              alt="no rules"
              className="w-[40%]"
            />
            <div className="flex flex-col gap-1 items-center">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                No rules yet
              </h4>
              <p className="text-sm text-center text-muted-foreground ">
                Click “+ Group” to create your first group
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full h-full flex flex-col gap-4 overflow-y-auto overflow-x-hidden scrollbar-custom p-2"
          >
            {groups.reduce<React.ReactNode[]>((acc, group, index) => {
              if (group.parentId) return acc;

              const renderChildren =
                (
                  children: TChild[],
                  prefix: string,
                  parentIndex: number
                ): ((
                  isParentBlocked: boolean,
                  isParentPaused: boolean
                ) => ReactNode[]) =>
                (isParentBlocked, isParentPaused) =>
                  children.map((child, childPosition, array) => {
                    const isLast = childPosition === array.length - 1;

                    if (child.type === CHILD_TYPE.GROUP) {
                      const childGroup = groups[child.index];
                      const displayIndex = `${prefix}.${childPosition + 1}`;

                      return (
                        <Group
                          key={childGroup.groupId}
                          group={childGroup}
                          index={child.index}
                          parentIndex={parentIndex}
                          childPosition={childPosition}
                          siblingCount={array.length}
                          isParentBlocked={isParentBlocked}
                          isParentPaused={isParentPaused}
                          isLast={isLast}
                          displayIndex={displayIndex}
                          handleCreateOrEditGroups={handleCreateOrEditGroups}
                          handleCreateOrEditFilters={handleCreateOrEditFilters}
                          moveGroup={moveGroup}
                          childrenElements={
                            childGroup.children?.length
                              ? renderChildren(
                                  childGroup.children,
                                  displayIndex,
                                  child.index
                                )
                              : undefined
                          }
                        />
                      );
                    }

                    if (child.type === CHILD_TYPE.FILTER) {
                      const filter = filters[child.index];
                      const displayIndex = `${prefix}.${childPosition + 1}`;

                      return (
                        <Filter
                          key={filter.filterId}
                          filter={filter}
                          index={child.index}
                          parentIndex={parentIndex}
                          childPosition={childPosition}
                          siblingCount={array.length}
                          isLast={isLast}
                          isParentBlocked={isParentBlocked}
                          displayIndex={displayIndex}
                          handleCreateOrEditFilters={handleCreateOrEditFilters}
                          moveGroup={moveGroup}
                        />
                      );
                    }
                  });

              const displayIndex = `${acc.length + 1}`;
              const isLast = acc.length + 1 === parentGroupsLength;

              acc.push(
                <Group
                  key={group.groupId}
                  group={group}
                  index={index}
                  siblingCount={parentGroupsLength}
                  displayIndex={displayIndex}
                  handleCreateOrEditGroups={handleCreateOrEditGroups}
                  handleCreateOrEditFilters={handleCreateOrEditFilters}
                  moveGroup={moveGroup}
                  isLast={isLast}
                  childrenElements={
                    group.children?.length
                      ? renderChildren(group.children, displayIndex, index)
                      : undefined
                  }
                />
              );

              return acc;
            }, [])}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleBuilder;
