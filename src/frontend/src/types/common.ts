export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorMessage: string | null;
  errorCode: string | null;
  validationErrors: Record<string, string[]> | null;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
