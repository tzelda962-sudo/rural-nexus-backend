export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const DEFAULT_PAGINATION: Required<Pick<PaginationParams, "page" | "limit">> = {
  page: 1,
  limit: 20,
};

export const MAX_PAGE_SIZE = 100;

export function normalizePagination(params: Partial<PaginationParams>): PaginationParams {
  const page = Math.max(1, Math.floor(params.page ?? DEFAULT_PAGINATION.page));
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(params.limit ?? DEFAULT_PAGINATION.limit)),
  );
  return {
    page,
    limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: PaginationParams,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
}
