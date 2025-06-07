export const LOGIC_TYPE = {
  AND: "AND",
  OR: "OR",
} as const;

export type TLogicType = (typeof LOGIC_TYPE)[keyof typeof LOGIC_TYPE];

export const ACTION_TYPE = {
  CREATE: "CREATE",
  EDIT: "EDIT",
  SUB_CREATE: "SUB_CREATE",
} as const;

export type TActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

export const CHILD_TYPE = {
  GROUP: "GROUP",
  FILTER: "FILTER",
} as const;

export type TChildType = (typeof CHILD_TYPE)[keyof typeof CHILD_TYPE];

export type TChild = {
  type: TChildType;
  id: string;
};

export type TGroup = {
  groupId: string;
  title: string;
  logic: TLogicType;
  parentId?: string;
  children?: TChild[];
};

export type TGroupParams =
  | { action: "CREATE" | "EDIT"; group: TGroup }
  | {
      action: "SUB_CREATE";
      group: TGroup;
      parentId: string;
    };
