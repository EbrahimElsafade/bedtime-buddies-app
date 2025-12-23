import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
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
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  User,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Key,
  Crown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

type UserWithRole = {
  id: string;
  parent_name: string;
  child_name: string | null;
  preferred_language: string;
  is_premium: boolean;
  subscription_tier: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  roles?: Array<{ role: string }>;
  created_at: string;
};

const Users = () => {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Create user dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserParentName, setNewUserParentName] = useState("");
  const [newUserChildName, setNewUserChildName] = useState("");
  const [newUserLanguage, setNewUserLanguage] = useState("ar-fos7a");
  const [newUserRole, setNewUserRole] = useState<"user" | "editor" | "admin">("user");
  
  // Edit user dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editParentName, setEditParentName] = useState("");
  const [editChildName, setEditChildName] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editSubscriptionTier, setEditSubscriptionTier] = useState<string>("");
  const [editSubscriptionStart, setEditSubscriptionStart] = useState<string>("");
  const [editSubscriptionEnd, setEditSubscriptionEnd] = useState<string>("");
  
  // Change password dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordUser, setPasswordUser] = useState<UserWithRole | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Delete user dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);

  const fetchUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
    
    if (profilesError) {
      toast.error("Failed to fetch users");
      throw profilesError;
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast.error("Failed to fetch user roles");
      throw rolesError;
    }

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
      const aValue = a[sortField as keyof UserWithRole];
      const bValue = b[sortField as keyof UserWithRole];
      
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

  const changeUserRole = async (user: UserWithRole, newRole: 'user' | 'editor' | 'admin') => {
    try {
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id);
        
      if (deleteError) throw deleteError;
      
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: newRole });
        
      if (insertError) throw insertError;
      
      toast.success(`User ${user.parent_name} role updated to ${newRole}`);
      refetch();
    } catch (error) {
      logger.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const getUserRole = (user: UserWithRole): 'user' | 'editor' | 'admin' => {
    if (user.roles?.some(r => r.role === "admin")) return "admin";
    if (user.roles?.some(r => r.role === "editor")) return "editor";
    return "user";
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserParentName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("admin-users", {
        body: {
          action: "create",
          email: newUserEmail,
          password: newUserPassword,
          parentName: newUserParentName,
          childName: newUserChildName || undefined,
          preferredLanguage: newUserLanguage,
          role: newUserRole,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      resetCreateForm();
      refetch();
    } catch (error) {
      logger.error("Error creating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserParentName("");
    setNewUserChildName("");
    setNewUserLanguage("ar-fos7a");
    setNewUserRole("user");
  };

  const openEditDialog = (user: UserWithRole) => {
    setEditingUser(user);
    setEditParentName(user.parent_name);
    setEditChildName(user.child_name || "");
    setEditLanguage(user.preferred_language);
    setEditIsPremium(user.is_premium);
    setEditSubscriptionTier(user.subscription_tier || "");
    setEditSubscriptionStart(user.subscription_start ? user.subscription_start.split('T')[0] : "");
    setEditSubscriptionEnd(user.subscription_end ? user.subscription_end.split('T')[0] : "");
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (user: UserWithRole) => {
    setPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!editingUser || !editParentName) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsEditing(true);

    try {
      const response = await supabase.functions.invoke("admin-users", {
        body: {
          action: "update",
          userId: editingUser.id,
          parentName: editParentName,
          childName: editChildName || undefined,
          preferredLanguage: editLanguage,
          isPremium: editIsPremium,
          subscriptionTier: editIsPremium ? (editSubscriptionTier || "premium") : null,
          subscriptionStart: editIsPremium && editSubscriptionStart ? editSubscriptionStart : null,
          subscriptionEnd: editIsPremium && editSubscriptionEnd ? editSubscriptionEnd : null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      refetch();
    } catch (error) {
      logger.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordUser) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await supabase.functions.invoke("admin-users", {
        body: {
          action: "changePassword",
          userId: passwordUser.id,
          newPassword: newPassword,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      logger.error("Error changing password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openDeleteDialog = (user: UserWithRole) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);

    try {
      const response = await supabase.functions.invoke("admin-users", {
        body: {
          action: "delete",
          userId: deletingUser.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      refetch();
    } catch (error) {
      logger.error("Error deleting user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">All Users</CardTitle>
              <CardDescription>
                Total: {users.length} users | Premium: {users.filter(u => u.is_premium).length} users
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with the specified details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name *</Label>
                    <Input
                      id="parentName"
                      placeholder="Parent name"
                      value={newUserParentName}
                      onChange={(e) => setNewUserParentName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child Name</Label>
                    <Input
                      id="childName"
                      placeholder="Child name (optional)"
                      value={newUserChildName}
                      onChange={(e) => setNewUserChildName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={newUserLanguage} onValueChange={setNewUserLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar-eg">مصري</SelectItem>
                        <SelectItem value="ar-fos7a">فصحي</SelectItem>
                        <SelectItem value="fr">français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as typeof newUserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                  <TableHead>Subscription Period</TableHead>
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
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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
                      <TableCell>
                        {user.is_premium ? (
                          <div className="text-xs space-y-0.5">
                            <div className="text-muted-foreground">
                              Start: {user.subscription_start 
                                ? new Date(user.subscription_start).toLocaleDateString() 
                                : "-"}
                            </div>
                            <div className="text-muted-foreground">
                              End: {user.subscription_end 
                                ? new Date(user.subscription_end).toLocaleDateString() 
                                : "∞"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>{user.preferred_language}</TableCell>
                      <TableCell>
                        {user.roles?.some(r => r.role === "admin") ? (
                          <Badge variant="default" className="bg-red-600 hover:bg-red-700">
                            Admin
                          </Badge>
                        ) : user.roles?.some(r => r.role === "editor") ? (
                          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                            Editor
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
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                              <Key className="mr-2 h-4 w-4" /> Change Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => changeUserRole(user, 'user')}
                              disabled={getUserRole(user) === 'user'}
                            >
                              <User className="mr-2 h-4 w-4" /> Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => changeUserRole(user, 'editor')}
                              disabled={getUserRole(user) === 'editor'}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" /> Set as Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => changeUserRole(user, 'admin')}
                              disabled={getUserRole(user) === 'admin'}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" /> Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editParentName">Parent Name *</Label>
              <Input
                id="editParentName"
                placeholder="Parent name"
                value={editParentName}
                onChange={(e) => setEditParentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editChildName">Child Name</Label>
              <Input
                id="editChildName"
                placeholder="Child name (optional)"
                value={editChildName}
                onChange={(e) => setEditChildName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLanguage">Preferred Language</Label>
              <Select value={editLanguage} onValueChange={setEditLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar-eg">مصري</SelectItem>
                  <SelectItem value="ar-fos7a">فصحي</SelectItem>
                  <SelectItem value="fr">français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="editPremium" className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Premium Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  Grant premium access to this user
                </p>
              </div>
              <Switch
                id="editPremium"
                checked={editIsPremium}
                onCheckedChange={setEditIsPremium}
              />
            </div>
            {editIsPremium && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editSubscriptionTier">Subscription Tier</Label>
                  <Select value={editSubscriptionTier} onValueChange={setEditSubscriptionTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSubscriptionStart">Start Date</Label>
                    <Input
                      id="editSubscriptionStart"
                      type="date"
                      value={editSubscriptionStart}
                      onChange={(e) => setEditSubscriptionStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSubscriptionEnd">End Date</Label>
                    <Input
                      id="editSubscriptionEnd"
                      type="date"
                      value={editSubscriptionEnd}
                      onChange={(e) => setEditSubscriptionEnd(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{passwordUser?.parent_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.parent_name}</strong>? 
              This action cannot be undone. All user data including their profile, favorites, 
              and progress will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;