export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface DataTableOptions {
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface TablePaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface TableSortState {
  key: string | null;
  direction: SortDirection;
}
