"use client";

import { useCallback, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTokenExpiration } from "@/hooks/useTokenExpiration";
import { TaskHeader } from "@/components/tasks/TaskHeader";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskPagination } from "@/components/tasks/TaskPagination";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SortOrder, TaskStatus } from "@/types/api";

export default function TasksPage() {
  useTokenExpiration({
    warningThresholdSeconds: 300,
    checkIntervalMs: 60000,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.UPDATED_DESC);

  const {
    tasks,
    pagination,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
  } = useTasks({
    page: 1,
    size: 20,
    sort: SortOrder.UPDATED_DESC,
  });

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateFilters({ q: query || null, page: 1 });
    },
    [updateFilters]
  );

  const handleStatusChange = useCallback(
    (status: TaskStatus | null) => {
      setSelectedStatus(status);
      updateFilters({ status, page: 1 });
    },
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (sort: SortOrder) => {
      setSortOrder(sort);
      updateFilters({ sort, page: 1 });
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  const handleCreateTask = async (title: string, description: string) => {
    return await createTask({
      title,
      description: description || null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TaskHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Tasks</h2>
            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-[120px]" />
            ) : (
              <p className="text-gray-600">
                {pagination.total} task{pagination.total !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
          <CreateTaskDialog onCreateTask={handleCreateTask} />
        </div>

        <div className="mb-6">
          <TaskFilters
            searchQuery={searchQuery}
            status={selectedStatus}
            sortOrder={sortOrder}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
          />
        </div>

        <div className="mb-6">
          <TaskTable
            tasks={tasks}
            isLoading={isLoading}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </div>

        {!isLoading && (
          <TaskPagination
            currentPage={pagination.page}
            pageSize={pagination.size}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
