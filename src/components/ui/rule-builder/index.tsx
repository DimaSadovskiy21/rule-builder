import { useCallback, useRef, useState, type ReactNode } from "react";
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

  const [groups, setGroups] = useState<Map<string, TGroup>>(new Map());
  const [filters, setFilters] = useState<Map<string, TFilter>>(new Map());
  const [topLevelGroupIds, setTopLevelGroupIds] = useState<string[]>([]);

  const handleCreateOrEditGroups = useCallback((params: TGroupParams) => {
    const { action, group } = params;

    if (action === ACTION_TYPE.CREATE) {
      setGroups((prev) => {
        const newGroups = new Map(prev);
        newGroups.set(group.groupId, group);

        return newGroups;
      });

      setTopLevelGroupIds((prev) => [...prev, group.groupId]);

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
        if (!prev.has(group.groupId)) return prev;

        const newGroups = new Map(prev);
        newGroups.set(group.groupId, group);
        return newGroups;
      });

      return;
    }

    if (action === ACTION_TYPE.SUB_CREATE) {
      setGroups((prev) => {
        const newGroups = new Map(prev);

        newGroups.set(group.groupId, group);

        const parent = newGroups.get(params.parentId);

        if (!parent) return prev;

        const newChildren: TChild[] = [
          ...(parent.children ?? []),
          { type: CHILD_TYPE.GROUP, id: group.groupId },
        ];

        newGroups.set(params.parentId, {
          ...parent,
          children: newChildren,
        });

        return newGroups;
      });

      return;
    }
  }, []);

  const handleCreateOrEditFilters = useCallback((params: TFilterParams) => {
    const { action, filter } = params;

    if (action === ACTION_TYPE.CREATE) {
      setFilters((prev) => {
        const newFilters = new Map(prev);

        newFilters.set(filter.filterId, filter);

        return newFilters;
      });

      setGroups((prev) => {
        const newGroups = new Map(prev);
        const parent = newGroups.get(params.parentId);

        if (!parent) return prev;

        const newChild: TChild = {
          type: CHILD_TYPE.FILTER,
          id: filter.filterId,
        };

        newGroups.set(params.parentId, {
          ...parent,
          children: [...(parent.children ?? []), newChild],
        });

        return newGroups;
      });

      return;
    }

    if (action === ACTION_TYPE.EDIT) {
      setFilters((prev) => {
        if (!prev.has(filter.filterId)) return prev;

        const newFilters = new Map(prev);

        newFilters.set(filter.filterId, filter);
        return newFilters;
      });

      return;
    }
  }, []);

  const moveGroup = useCallback(
    (fromIndex: number, toIndex: number, parentId?: string) => {
      if (parentId) {
        setGroups((prev) => {
          const newGroups = new Map(prev);

          const parent = newGroups.get(parentId);

          if (!parent || !parent.children) {
            toast.error(
              "Invalid child move: parent not found or has no children"
            );
            return prev;
          }

          const children = [...parent.children];
          const [moved] = children.splice(fromIndex, 1);
          children.splice(toIndex, 0, moved);

          newGroups.set(parentId, {
            ...parent,
            children,
          });

          return newGroups;
        });

        return;
      }

      setTopLevelGroupIds((prevIds) => {
        const updated = [...prevIds];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    },
    []
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
        {!topLevelGroupIds.length ? (
          <div className="flex flex-col items-center gap-6">
            <img src="norules_image.webp" alt="no rules" className="w-[40%]" />
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
            {topLevelGroupIds.map((groupid, index) => {
              const group = groups.get(groupid);
              if (!group) return null;

              const renderChildren =
                (
                  children: TChild[],
                  prefix: string
                ): ((
                  isParentBlocked: boolean,
                  isParentPaused: boolean
                ) => ReactNode[]) =>
                (isParentBlocked, isParentPaused) =>
                  children.map((child, childPosition, array) => {
                    const isLast = childPosition === array.length - 1;
                    const displayIndex = `${prefix}.${childPosition + 1}`;

                    if (child.type === CHILD_TYPE.GROUP) {
                      const childGroup = groups.get(child.id);
                      if (!childGroup) return null;

                      return (
                        <Group
                          key={childGroup.groupId}
                          group={childGroup}
                          index={childPosition}
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
                                  displayIndex
                                )
                              : undefined
                          }
                        />
                      );
                    }

                    if (child.type === CHILD_TYPE.FILTER) {
                      const filter = filters.get(child.id);
                      if (!filter) return null;

                      return (
                        <Filter
                          key={filter.filterId}
                          filter={filter}
                          index={childPosition}
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

              const displayIndex = `${index + 1}`;
              const isLast = index + 1 === topLevelGroupIds.length;

              return (
                <Group
                  key={group.groupId}
                  group={group}
                  index={index}
                  siblingCount={topLevelGroupIds.length}
                  displayIndex={displayIndex}
                  handleCreateOrEditGroups={handleCreateOrEditGroups}
                  handleCreateOrEditFilters={handleCreateOrEditFilters}
                  moveGroup={moveGroup}
                  isLast={isLast}
                  childrenElements={
                    group.children?.length
                      ? renderChildren(group.children, displayIndex)
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleBuilder;
