
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  User,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

type UserWithRole = {
  id: string;
  parent_name: string;
  child_name: string | null;
  preferred_language: string;
  is_premium: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  roles?: Array<{ role: string }>;
  created_at: string;
};

const Users = () => {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
    
    if (profilesError) {
      toast.error("Failed to fetch users");
      throw profilesError;
    }

    // Fetch roles separately
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast.error("Failed to fetch user roles");
      throw rolesError;
    }

    // Combine the data
    const usersWithRoles = profilesData.map(profile => ({
      ...profile,
      roles: rolesData
        .filter(r => r.user_id === profile.id)
        .map(r => ({ role: r.role }))
    }));

    return usersWithRoles as UserWithRole[];
  };

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredUsers = users
    .filter(
      (user) =>
        user.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.child_name &&
          user.child_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null) return sortDirection === "asc" ? -1 : 1;
      if (bValue === null) return sortDirection === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      return 0;
    });

  const toggleAdmin = async (user: UserWithRole) => {
    const isAdmin = user.roles?.some(r => r.role === "admin");
    const newRole = isAdmin ? "user" : "admin";
    
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .eq("role", "admin");
          
        if (error) throw error;
        
        // Add user role if they don't have it
        const { error: userRoleError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "user" })
          .onConflict(["user_id", "role"]).ignore();
          
        if (userRoleError) throw userRoleError;
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "admin" });
          
        if (error) throw error;
      }
      
      toast.success(`User ${user.parent_name} role updated to ${newRole}`);
      refetch();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          View and manage user accounts
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Users</CardTitle>
          <CardDescription>
            Total: {users.length} users | Premium: {users.filter(u => u.is_premium).length} users
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => toggleSort("parent_name")} className="cursor-pointer">
                    Parent Name
                    {sortField === "parent_name" && (
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead>Child Name</TableHead>
                  <TableHead onClick={() => toggleSort("is_premium")} className="cursor-pointer">
                    Status
                    {sortField === "is_premium" && (
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead>Preferred Language</TableHead>
                  <TableHead onClick={() => toggleSort("role")} className="cursor-pointer">
                    Role
                    {sortField === "role" && (
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead onClick={() => toggleSort("created_at")} className="cursor-pointer">
                    Registered
                    {sortField === "created_at" && (
                      <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.parent_name}</TableCell>
                      <TableCell>{user.child_name || "-"}</TableCell>
                      <TableCell>
                        {user.is_premium ? (
                          <Badge variant="default" className="bg-moon-DEFAULT hover:bg-moon-dark">
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.preferred_language}</TableCell>
                      <TableCell>
                        {user.roles?.some(r => r.role === "admin") ? (
                          <Badge variant="default" className="bg-red-600 hover:bg-red-700">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label="Open menu"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleAdmin(user)}>
                              {user.roles?.some(r => r.role === "admin") ? (
                                <>
                                  <ShieldOff className="mr-2 h-4 w-4" /> {t('users.removeAdmin')}
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="mr-2 h-4 w-4" /> {t('users.makeAdmin')}
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableCaption>
                {t('users.showing_users', { showing: filteredUsers.length, total: users.length })}
              </TableCaption>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
