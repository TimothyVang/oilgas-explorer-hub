import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  ndaFilter: string;
  onNdaFilterChange: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  showAdvanced?: boolean;
}

export const UserFilters = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  ndaFilter,
  onNdaFilterChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  showAdvanced = true,
}: UserFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Quick date preset handlers
  const setQuickDateRange = (days: number) => {
    if (!onDateRangeChange) return;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onDateRangeChange({ from, to });
  };

  const clearDateRange = () => {
    if (onDateRangeChange) {
      onDateRangeChange(undefined);
    }
  };

  const clearAllFilters = () => {
    onSearchChange("");
    onRoleFilterChange("all");
    onNdaFilterChange("all");
    if (onDateRangeChange) onDateRangeChange(undefined);
    if (onStatusFilterChange) onStatusFilterChange("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    roleFilter !== "all" ||
    ndaFilter !== "all" ||
    dateRange?.from ||
    dateRange?.to ||
    (statusFilter && statusFilter !== "all");

  return (
    <div className="space-y-4 mb-6">
      {/* Primary Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="none">No Role</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ndaFilter} onValueChange={onNdaFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="NDA Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All NDA</SelectItem>
            <SelectItem value="signed">NDA Signed</SelectItem>
            <SelectItem value="pending">NDA Pending</SelectItem>
          </SelectContent>
        </Select>

        {showAdvanced && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "gap-2 min-w-[120px]",
              showAdvancedFilters && "bg-primary/10 border-primary/30"
            )}
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? "Hide Filters" : "More Filters"}
          </Button>
        )}
      </div>

      {/* Advanced Filters Row */}
      {showAdvanced && showAdvancedFilters && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          {/* Date Range Picker */}
          {onDateRangeChange && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-medium">Join Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) =>
                        onDateRangeChange({ from: date, to: dateRange?.to })
                      }
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="flex items-center text-gray-400">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !dateRange?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange?.to}
                      onSelect={(date) =>
                        onDateRangeChange({ from: dateRange?.from, to: date })
                      }
                      disabled={(date) =>
                        date > new Date() || (dateRange?.from ? date < dateRange.from : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {(dateRange?.from || dateRange?.to) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearDateRange}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Quick Date Presets */}
              <div className="flex gap-2 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickDateRange(7)}
                  className="text-xs h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  Last 7 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickDateRange(30)}
                  className="text-xs h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  Last 30 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickDateRange(90)}
                  className="text-xs h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  Last 90 days
                </Button>
              </div>
            </div>
          )}

          {/* Account Status Filter */}
          {onStatusFilterChange && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-medium">Account Status</label>
              <Select value={statusFilter || "all"} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
                  <SelectItem value="new">New (7 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Active filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
              Search: "{searchQuery.slice(0, 15)}{searchQuery.length > 15 ? '...' : ''}"
              <button onClick={() => onSearchChange("")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {roleFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
              Role: {roleFilter}
              <button onClick={() => onRoleFilterChange("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {ndaFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
              NDA: {ndaFilter}
              <button onClick={() => onNdaFilterChange("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(dateRange?.from || dateRange?.to) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
              Date: {dateRange?.from ? format(dateRange.from, "MMM d") : "..."} - {dateRange?.to ? format(dateRange.to, "MMM d") : "..."}
              <button onClick={clearDateRange} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {statusFilter && statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
              Status: {statusFilter}
              <button onClick={() => onStatusFilterChange?.("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-6 px-2 text-gray-400 hover:text-white"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
