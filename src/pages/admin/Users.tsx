import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { DataTableColumnHeader } from "@/components/admin/DataTableColumnHeader";
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

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.child_name &&
          user.child_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

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

    if (newUserPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsCreating(true);

    try {
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

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
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

  const columns: ColumnDef<UserWithRole>[] = useMemo(
    () => [
      {
        accessorKey: "parent_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('users.parentName')} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.parent_name}</span>
        ),
      },
      {
        accessorKey: "child_name",
        header: t('users.childName'),
        cell: ({ row }) => row.original.child_name || "-",
      },
      {
        accessorKey: "is_premium",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('users.status')} />
        ),
        cell: ({ row }) =>
          row.original.is_premium ? (
            <Badge variant="default" className="bg-moon-DEFAULT hover:bg-moon-dark">
              {t('users.premium')}
            </Badge>
          ) : (
            <Badge variant="outline">{t('users.free')}</Badge>
          ),
      },
      {
        accessorKey: "subscription_period",
        header: t('users.subscriptionPeriod'),
        cell: ({ row }) => {
          const user = row.original;
          if (!user.is_premium) {
            return <span className="text-muted-foreground text-xs">-</span>;
          }
          return (
            <div className="text-xs space-y-0.5">
              <div className="text-muted-foreground">
                {t('users.start')}: {user.subscription_start 
                  ? new Date(user.subscription_start).toLocaleDateString() 
                  : "-"}
              </div>
              <div className="text-muted-foreground">
                {t('users.end')}: {user.subscription_end 
                  ? new Date(user.subscription_end).toLocaleDateString() 
                  : "∞"}
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "preferred_language",
        header: t('users.preferredLanguage'),
        cell: ({ row }) => row.original.preferred_language,
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('users.role')} />
        ),
        cell: ({ row }) => {
          const user = row.original;
          if (user.roles?.some(r => r.role === "admin")) {
            return (
              <Badge variant="default" className="bg-red-600 hover:bg-red-700">
                {t('users.roleAdmin')}
              </Badge>
            );
          }
          if (user.roles?.some(r => r.role === "editor")) {
            return (
              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                {t('users.roleEditor')}
              </Badge>
            );
          }
          return <Badge variant="outline">{t('users.roleUser')}</Badge>;
        },
        sortingFn: (rowA, rowB) => {
          const roleOrder = { admin: 0, editor: 1, user: 2 };
          const aRole = getUserRole(rowA.original);
          const bRole = getUserRole(rowB.original);
          return roleOrder[aRole] - roleOrder[bRole];
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('users.registered')} />
        ),
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{t('users.actions')}</span>,
        cell: ({ row }) => {
          const user = row.original;
          return (
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
                  <Pencil className="mr-2 h-4 w-4" /> {t('users.editUser')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                  <Key className="mr-2 h-4 w-4" /> {t('users.changePassword')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => changeUserRole(user, 'user')}
                  disabled={getUserRole(user) === 'user'}
                >
                  <User className="mr-2 h-4 w-4" /> {t('users.setAsUser')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeUserRole(user, 'editor')}
                  disabled={getUserRole(user) === 'editor'}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> {t('users.setAsEditor')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeUserRole(user, 'admin')}
                  disabled={getUserRole(user) === 'admin'}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> {t('users.setAsAdmin')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => openDeleteDialog(user)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> {t('users.deleteUser')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('users.title')}</h1>
        <p className="text-muted-foreground">
          {t('users.description')}
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{t('users.allUsers')}</CardTitle>
              <CardDescription>
                {t('users.totalUsers')}: {users.length} | {t('users.premiumUsers')}: {users.filter(u => u.is_premium).length}
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('users.createUser')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('users.createNewUser')}</DialogTitle>
                  <DialogDescription>
                    {t('users.createNewUserDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('users.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('users.emailPlaceholder')}
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('users.password')} *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentName">{t('users.parentName')} *</Label>
                    <Input
                      id="parentName"
                      placeholder={t('users.parentNamePlaceholder')}
                      value={newUserParentName}
                      onChange={(e) => setNewUserParentName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childName">{t('users.childName')}</Label>
                    <Input
                      id="childName"
                      placeholder={t('users.childNamePlaceholder')}
                      value={newUserChildName}
                      onChange={(e) => setNewUserChildName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t('users.preferredLanguage')}</Label>
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
                    <Label htmlFor="role">{t('users.role')}</Label>
                    <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as typeof newUserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t('users.roleUser')}</SelectItem>
                        <SelectItem value="editor">{t('users.roleEditor')}</SelectItem>
                        <SelectItem value="admin">{t('users.roleAdmin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('forms.cancel')}
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('forms.creating')}
                      </>
                    ) : (
                      t('users.createUser')
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
                placeholder={t('users.searchPlaceholder')}
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
          <DataTable
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading}
            emptyMessage={t('users.noUsersFound')}
            loadingMessage={t('forms.loading')}
          />
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('users.editUser')}</DialogTitle>
            <DialogDescription>
              {t('users.editUserDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editParentName">{t('users.parentName')} *</Label>
              <Input
                id="editParentName"
                placeholder={t('users.parentNamePlaceholder')}
                value={editParentName}
                onChange={(e) => setEditParentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editChildName">{t('users.childName')}</Label>
              <Input
                id="editChildName"
                placeholder={t('users.childNamePlaceholder')}
                value={editChildName}
                onChange={(e) => setEditChildName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLanguage">{t('users.preferredLanguage')}</Label>
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
                  {t('users.premiumStatus')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('users.premiumStatusDesc')}
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
                  <Label htmlFor="editSubscriptionTier">{t('users.subscriptionTier')}</Label>
                  <Select value={editSubscriptionTier} onValueChange={setEditSubscriptionTier}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('users.selectTier')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">{t('users.tierPremium')}</SelectItem>
                      <SelectItem value="family">{t('users.tierFamily')}</SelectItem>
                      <SelectItem value="lifetime">{t('users.tierLifetime')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSubscriptionStart">{t('users.startDate')}</Label>
                    <Input
                      id="editSubscriptionStart"
                      type="date"
                      value={editSubscriptionStart}
                      onChange={(e) => setEditSubscriptionStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSubscriptionEnd">{t('users.endDate')}</Label>
                    <Input
                      id="editSubscriptionEnd"
                      type="date"
                      value={editSubscriptionEnd}
                      onChange={(e) => setEditSubscriptionEnd(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{t('users.leaveEmptyForUnlimited')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('forms.cancel')}
            </Button>
            <Button onClick={handleEditUser} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('forms.saving')}
                </>
              ) : (
                t('forms.saveChanges')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
        setIsPasswordDialogOpen(open);
        if (!open) {
          setPasswordUser(null);
          setNewPassword("");
          setConfirmPassword("");
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t('users.changePassword')}
            </DialogTitle>
            <DialogDescription>
              {t('users.changePasswordFor')} <strong>{passwordUser?.parent_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('users.newPassword')} *</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('users.confirmPassword')} *</Label>
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
              {t('forms.cancel')}
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('forms.saving')}
                </>
              ) : (
                t('users.changePassword')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{t('users.deleteUser')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {t('users.deleteUserConfirm')} <strong>{deletingUser?.parent_name}</strong>?
              {t('users.deleteUserWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('forms.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('forms.deleting')}
                </>
              ) : (
                t('users.deleteUser')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
