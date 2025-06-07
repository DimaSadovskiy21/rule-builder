export const OPERATOR_TYPE = {
  EQUALS: "equals",
  NOT_EQUALS: "not equals",
  IS_AFTER: "is after",
  IS_BEFORE: "is before",
} as const;

export type TOperatorType = (typeof OPERATOR_TYPE)[keyof typeof OPERATOR_TYPE];

export type TFilter = {
  filterId: string;
  field: string;
  value: string;
  operator: TOperatorType;
  parentId: string;
};

export const ACTION_TYPE = {
  CREATE: "CREATE",
  EDIT: "EDIT",
} as const;

export type TActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

export type TFilterParams =
  | {
      action: "CREATE";
      filter: TFilter;
      parentIndex: number;
    }
  | { action: "EDIT"; filter: TFilter; index: number };
