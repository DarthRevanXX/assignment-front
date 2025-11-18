import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTasks } from "./useTasks";
import { apiClient } from "@/lib/api";
import type { PagedTasksResponse, TaskResponse } from "@/types/api";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const mockTaskResponse: TaskResponse = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Test Task",
  description: "Test Description",
  status: "PENDING",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

const mockPagedResponse: PagedTasksResponse = {
  items: [mockTaskResponse],
  total: 1,
  page: 1,
  size: 20,
};

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Load", () => {
    it("should fetch tasks on mount", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);

      const { result } = renderHook(() => useTasks());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe("Test Task");
      expect(result.current.pagination.total).toBe(1);
      expect(apiClient.getTasks).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        sort: "UPDATED_DESC",
      });
    });

    it("should handle fetch error", async () => {
      const error = { message: "Network error", status: 500 };
      vi.mocked(apiClient.getTasks).mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.tasks).toHaveLength(0);
    });

    it("should handle error without message", async () => {
      vi.mocked(apiClient.getTasks).mockRejectedValue({ status: 500 });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch tasks");
    });
  });

  describe("Filter Management", () => {
    it("should update search filter", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ q: "test search" });
      });

      expect(result.current.filters.q).toBe("test search");

      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({
            q: "test search",
          })
        );
      });
    });

    it("should update status filter", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ status: "IN_PROGRESS" });
      });

      expect(result.current.filters.status).toBe("IN_PROGRESS");

      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "IN_PROGRESS",
          })
        );
      });
    });

    it("should update sort order", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ sort: "CREATED_ASC" });
      });

      expect(result.current.filters.sort).toBe("CREATED_ASC");

      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: "CREATED_ASC",
          })
        );
      });
    });

    it("should update multiple filters at once", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set multiple filters
      act(() => {
        result.current.updateFilters({
          q: "test",
          status: "PENDING",
          sort: "CREATED_DESC",
        });
      });

      expect(result.current.filters.q).toBe("test");
      expect(result.current.filters.status).toBe("PENDING");
      expect(result.current.filters.sort).toBe("CREATED_DESC");

      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({
            q: "test",
            status: "PENDING",
            sort: "CREATED_DESC",
          })
        );
      });
    });
  });

  describe("Pagination", () => {
    it("should handle page change", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue({
        ...mockPagedResponse,
        page: 2,
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ page: 2 });
      });

      await waitFor(() => {
        expect(result.current.filters.page).toBe(2);
      });

      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });
  });

  describe("Task Operations", () => {
    beforeEach(() => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);
    });

    it("should create a task successfully", async () => {
      vi.mocked(apiClient.createTask).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const createResult = await result.current.createTask({
        title: "New Task",
        description: "New Description",
      });

      expect(createResult.success).toBe(true);
      expect(apiClient.createTask).toHaveBeenCalledWith({
        title: "New Task",
        description: "New Description",
      });

      // Should refetch tasks
      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle create task error", async () => {
      vi.mocked(apiClient.createTask).mockRejectedValue({
        message: "Validation error",
        status: 400,
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const createResult = await result.current.createTask({
        title: "New Task",
      });

      expect(createResult.success).toBe(false);
      expect(createResult.error).toBe("Validation error");
    });

    it("should update a task successfully", async () => {
      vi.mocked(apiClient.updateTask).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updateResult = await result.current.updateTask(
        "123e4567-e89b-12d3-a456-426614174000",
        {
          title: "Updated Task",
          status: "IN_PROGRESS",
        }
      );

      expect(updateResult.success).toBe(true);
      expect(apiClient.updateTask).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000",
        {
          title: "Updated Task",
          status: "IN_PROGRESS",
        }
      );

      // Should refetch tasks
      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle update task error", async () => {
      vi.mocked(apiClient.updateTask).mockRejectedValue({
        message: "Task not found",
        status: 404,
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updateResult = await result.current.updateTask(
        "invalid-id",
        { title: "Updated" }
      );

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe("Task not found");
    });

    it("should delete a task successfully", async () => {
      vi.mocked(apiClient.deleteTask).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const deleteResult = await result.current.deleteTask(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      expect(deleteResult.success).toBe(true);
      expect(apiClient.deleteTask).toHaveBeenCalledWith(
        "123e4567-e89b-12d3-a456-426614174000"
      );

      // Should refetch tasks
      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle delete task error", async () => {
      vi.mocked(apiClient.deleteTask).mockRejectedValue({
        message: "Cannot delete task",
        status: 403,
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const deleteResult = await result.current.deleteTask("some-id");

      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toBe("Cannot delete task");
    });
  });

  describe("Refetch", () => {
    it("should manually refetch tasks", async () => {
      vi.mocked(apiClient.getTasks).mockResolvedValue(mockPagedResponse);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(apiClient.getTasks).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refreshTasks();
      });

      await waitFor(() => {
        expect(apiClient.getTasks).toHaveBeenCalledTimes(2);
      });
    });
  });
});
