"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOrder, TaskStatus } from "@/types/api";
import { Search } from "lucide-react";

interface TaskFiltersProps {
  searchQuery: string;
  status: TaskStatus | null;
  sortOrder: SortOrder;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: TaskStatus | null) => void;
  onSortChange: (sort: SortOrder) => void;
}

export function TaskFilters({
  searchQuery,
  status,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        value={status || "all"}
        onValueChange={(value) =>
          onStatusChange(value === "all" ? null : (value as TaskStatus))
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortOrder} onValueChange={(value) => onSortChange(value as SortOrder)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SortOrder.UPDATED_DESC}>Recently Updated</SelectItem>
          <SelectItem value={SortOrder.UPDATED_ASC}>Oldest Updated</SelectItem>
          <SelectItem value={SortOrder.CREATED_DESC}>Recently Created</SelectItem>
          <SelectItem value={SortOrder.CREATED_ASC}>Oldest Created</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
