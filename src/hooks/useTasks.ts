import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import {
  ApiError,
  CreateTaskRequest,
  PagedTasksResponse,
  SortOrder,
  TaskFilters,
  TaskResponse,
  UpdateTaskRequest,
} from "@/types/api";

export function useTasks(initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    size: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(
    initialFilters || { page: 1, size: 20, sort: SortOrder.UPDATED_DESC }
  );

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PagedTasksResponse = await apiClient.getTasks(filters);
      setTasks(response.items);
      setPagination({
        total: response.total || 0,
        page: response.page || filters.page || 1,
        size: response.size || filters.size || 20,
      });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (task: CreateTaskRequest) => {
      try {
        await apiClient.createTask(task);
        await fetchTasks();
        return { success: true };
      } catch (err) {
        const apiError = err as ApiError;
        return {
          success: false,
          error: apiError.message || "Failed to create task",
        };
      }
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, task: UpdateTaskRequest) => {
      try {
        await apiClient.updateTask(id, task);
        await fetchTasks();
        return { success: true };
      } catch (err) {
        const apiError = err as ApiError;
        return {
          success: false,
          error: apiError.message || "Failed to update task",
        };
      }
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await apiClient.deleteTask(id);
        await fetchTasks();
        return { success: true };
      } catch (err) {
        const apiError = err as ApiError;
        return {
          success: false,
          error: apiError.message || "Failed to delete task",
        };
      }
    },
    [fetchTasks]
  );

  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    tasks,
    pagination,
    isLoading,
    error,
    filters,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    refreshTasks: fetchTasks,
  };
}
