import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  ndaFilter: string;
  onNdaFilterChange: (value: string) => void;
}

export const UserFilters = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  ndaFilter,
  onNdaFilterChange,
}: UserFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
    </div>
  );
};
