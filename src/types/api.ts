// API Types based on OpenAPI specification

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum SortOrder {
  CREATED_ASC = "CREATED_ASC",
  CREATED_DESC = "CREATED_DESC",
  UPDATED_ASC = "UPDATED_ASC",
  UPDATED_DESC = "UPDATED_DESC",
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PagedTasksResponse {
  items: TaskResponse[];
  total?: number;
  page?: number;
  size?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
}

export interface UpdateTaskRequest {
  title?: string | null;
  description?: string | null;
  status?: TaskStatus | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  expiresInSeconds?: number;
}

export interface TaskFilters {
  page?: number;
  size?: number;
  q?: string | null;
  status?: TaskStatus | null;
  sort?: SortOrder;
}

export interface ApiError {
  message: string;
  status: number;
}
