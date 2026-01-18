import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { DataTableColumnHeader } from "@/components/admin/DataTableColumnHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Search, User, RefreshCw, ShieldCheck, UserPlus, Pencil, Trash2, Loader2, AlertTriangle, Key, Crown } from "lucide-react";

type UserWithRole = {
  id: string;
  parent_name: string;
  child_name: string | null;
  preferred_language: string;
  is_premium: boolean;
  subscription_tier: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  roles: Array<{ role: string }>;
  created_at: string;
};

type UserRole = "user" | "editor" | "admin";

const Users = () => {
  const { t } = useTranslation("admin");
  const [searchTerm, setSearchTerm] = useState("");

  // Create user state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    parentName: "",
    childName: "",
    language: "ar-fos7a",
    role: "user" as UserRole,
  });

  // Edit user state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [editForm, setEditForm] = useState({
    parentName: "",
    childName: "",
    language: "",
    isPremium: false,
    subscriptionStart: "",
  });

  // Password state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordUser, setPasswordUser] = useState<UserWithRole | null>(null);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);

  // Fetch users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      return profilesRes.data.map((profile) => ({
        ...profile,
        roles: rolesRes.data.filter((r) => r.user_id === profile.id).map((r) => ({ role: r.role })),
      })) as UserWithRole[];
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.child_name && u.child_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const getUserRole = (user: UserWithRole): UserRole => {
    if (user.roles.some((r) => r.role === "admin")) return "admin";
    if (user.roles.some((r) => r.role === "editor")) return "editor";
    return "user";
  };

  // API call helper
  const callApi = async (body: object) => {
    const res = await supabase.functions.invoke("admin-users", { body });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  // CREATE
  const handleCreate = async () => {
    if (!createForm.email || !createForm.password || !createForm.parentName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (createForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setCreateLoading(true);
    try {
      await callApi({
        action: "create",
        email: createForm.email,
        password: createForm.password,
        parentName: createForm.parentName,
        childName: createForm.childName || undefined,
        preferredLanguage: createForm.language,
        role: createForm.role,
      });
      toast.success("User created successfully");
      setCreateOpen(false);
      setCreateForm({ email: "", password: "", parentName: "", childName: "", language: "ar-fos7a", role: "user" });
      refetch();
    } catch (error) {
      logger.error("Create user error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  // EDIT
  const openEdit = (user: UserWithRole) => {
    setEditUser(user);
    setEditForm({
      parentName: user.parent_name,
      childName: user.child_name || "",
      language: user.preferred_language,
      isPremium: user.is_premium,
      subscriptionStart: user.subscription_start?.split("T")[0] || "",
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editUser || !editForm.parentName) {
      toast.error("Parent name is required");
      return;
    }

    let subscriptionEnd: string | null = null;
    if (editForm.isPremium && editForm.subscriptionStart) {
      const start = new Date(editForm.subscriptionStart);
      start.setFullYear(start.getFullYear() + 1);
      subscriptionEnd = start.toISOString().split("T")[0];
    }

    setEditLoading(true);
    try {
      await callApi({
        action: "update",
        userId: editUser.id,
        parentName: editForm.parentName,
        childName: editForm.childName || null,
        preferredLanguage: editForm.language,
        isPremium: editForm.isPremium,
        subscriptionTier: editForm.isPremium ? "yearly" : null,
        subscriptionStart: editForm.isPremium && editForm.subscriptionStart ? editForm.subscriptionStart : null,
        subscriptionEnd,
      });
      toast.success("User updated successfully");
      setEditOpen(false);
      refetch();
    } catch (error) {
      logger.error("Edit user error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  // CHANGE PASSWORD
  const openPassword = (user: UserWithRole) => {
    setPasswordUser(user);
    setPasswordForm({ password: "", confirm: "" });
    setPasswordOpen(true);
  };

  const handlePassword = async () => {
    if (!passwordUser) return;
    if (passwordForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      await callApi({
        action: "changePassword",
        userId: passwordUser.id,
        newPassword: passwordForm.password,
      });
      toast.success("Password changed successfully");
      setPasswordOpen(false);
    } catch (error) {
      logger.error("Change password error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // DELETE
  const openDelete = (user: UserWithRole) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;

    setDeleteLoading(true);
    try {
      await callApi({ action: "delete", userId: deleteUser.id });
      toast.success("User deleted successfully");
      setDeleteOpen(false);
      refetch();
    } catch (error) {
      logger.error("Delete user error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  // CHANGE ROLE
  const changeRole = async (user: UserWithRole, newRole: UserRole) => {
    try {
      await supabase.from("user_roles").delete().eq("user_id", user.id);
      if (newRole !== "user") {
        await supabase.from("user_roles").insert({ user_id: user.id, role: newRole });
      }
      toast.success(`Role updated to ${newRole}`);
      refetch();
    } catch (error) {
      logger.error("Change role error:", error);
      toast.error("Failed to change role");
    }
  };

  // Table columns
  const columns: ColumnDef<UserWithRole>[] = useMemo(
    () => [
      {
        accessorKey: "parent_name",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.parentName")} />,
        cell: ({ row }) => <span className="font-medium">{row.original.parent_name}</span>,
      },
      {
        accessorKey: "child_name",
        header: t("users.childName"),
        cell: ({ row }) => row.original.child_name || "-",
      },
      {
        accessorKey: "is_premium",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.status")} />,
        cell: ({ row }) =>
          row.original.is_premium ? (
            <Badge className="bg-moon-DEFAULT hover:bg-moon-dark">{t("users.premium")}</Badge>
          ) : (
            <Badge variant="outline">{t("users.free")}</Badge>
          ),
      },
      {
        accessorKey: "subscription_period",
        header: t("users.subscriptionPeriod"),
        cell: ({ row }) => {
          const u = row.original;
          if (!u.is_premium) return <span className="text-muted-foreground text-xs">-</span>;
          return (
            <div className="text-xs space-y-0.5 text-muted-foreground">
              <div>{t("users.start")}: {u.subscription_start ? new Date(u.subscription_start).toLocaleDateString() : "-"}</div>
              <div>{t("users.end")}: {u.subscription_end ? new Date(u.subscription_end).toLocaleDateString() : "∞"}</div>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "preferred_language",
        header: t("users.preferredLanguage"),
      },
      {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.role")} />,
        cell: ({ row }) => {
          const role = getUserRole(row.original);
          if (role === "admin") return <Badge className="bg-red-600 hover:bg-red-700">{t("users.roleAdmin")}</Badge>;
          if (role === "editor") return <Badge className="bg-blue-600 hover:bg-blue-700">{t("users.roleEditor")}</Badge>;
          return <Badge variant="outline">{t("users.roleUser")}</Badge>;
        },
        sortingFn: (a, b) => {
          const order = { admin: 0, editor: 1, user: 2 };
          return order[getUserRole(a.original)] - order[getUserRole(b.original)];
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.registered")} />,
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{t("users.actions")}</span>,
        cell: ({ row }) => {
          const user = row.original;
          const currentRole = getUserRole(user);
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" /> {t("users.editUser")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPassword(user)}>
                  <Key className="mr-2 h-4 w-4" /> {t("users.changePassword")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => changeRole(user, "user")} disabled={currentRole === "user"}>
                  <User className="mr-2 h-4 w-4" /> {t("users.setAsUser")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeRole(user, "editor")} disabled={currentRole === "editor"}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> {t("users.setAsEditor")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeRole(user, "admin")} disabled={currentRole === "admin"}>
                  <ShieldCheck className="mr-2 h-4 w-4" /> {t("users.setAsAdmin")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openDelete(user)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> {t("users.deleteUser")}
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
        <h1 className="text-3xl font-bold">{t("users.title")}</h1>
        <p className="text-muted-foreground">{t("users.description")}</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{t("users.allUsers")}</CardTitle>
              <CardDescription>
                {t("users.totalUsers")}: {users.length} | {t("users.premiumUsers")}: {users.filter((u) => u.is_premium).length}
              </CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("users.createUser")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("users.createNewUser")}</DialogTitle>
                  <DialogDescription>{t("users.createNewUserDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("users.email")} *</Label>
                    <Input
                      type="email"
                      placeholder={t("users.emailPlaceholder")}
                      value={createForm.email}
                      onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("users.password")} *</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={createForm.password}
                      onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("users.parentName")} *</Label>
                    <Input
                      placeholder={t("users.parentNamePlaceholder")}
                      value={createForm.parentName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, parentName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("users.childName")}</Label>
                    <Input
                      placeholder={t("users.childNamePlaceholder")}
                      value={createForm.childName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, childName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("users.preferredLanguage")}</Label>
                    <Select value={createForm.language} onValueChange={(v) => setCreateForm((f) => ({ ...f, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar-eg">مصري</SelectItem>
                        <SelectItem value="ar-fos7a">فصحي</SelectItem>
                        <SelectItem value="fr">français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("users.role")}</Label>
                    <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v as UserRole }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t("users.roleUser")}</SelectItem>
                        <SelectItem value="editor">{t("users.roleEditor")}</SelectItem>
                        <SelectItem value="admin">{t("users.roleAdmin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("forms.cancel")}</Button>
                  <Button onClick={handleCreate} disabled={createLoading}>
                    {createLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("forms.creating")}</> : t("users.createUser")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("users.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredUsers} isLoading={isLoading} emptyMessage={t("users.noUsersFound")} loadingMessage={t("forms.loading")} />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("users.editUser")}</DialogTitle>
            <DialogDescription>{t("users.editUserDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("users.parentName")} *</Label>
              <Input value={editForm.parentName} onChange={(e) => setEditForm((f) => ({ ...f, parentName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("users.childName")}</Label>
              <Input value={editForm.childName} onChange={(e) => setEditForm((f) => ({ ...f, childName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("users.preferredLanguage")}</Label>
              <Select value={editForm.language} onValueChange={(v) => setEditForm((f) => ({ ...f, language: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  {t("users.premiumStatus")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("users.premiumStatusDesc")}</p>
              </div>
              <Switch checked={editForm.isPremium} onCheckedChange={(v) => setEditForm((f) => ({ ...f, isPremium: v }))} />
            </div>
            {editForm.isPremium && (
              <div className="space-y-2">
                <Label>{t("users.startDate")}</Label>
                <Input type="date" value={editForm.subscriptionStart} onChange={(e) => setEditForm((f) => ({ ...f, subscriptionStart: e.target.value }))} />
                <p className="text-xs text-muted-foreground">{t("users.yearlySubscriptionNote")}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("forms.cancel")}</Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("forms.saving")}</> : t("forms.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={(open) => { setPasswordOpen(open); if (!open) setPasswordUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t("users.changePassword")}
            </DialogTitle>
            <DialogDescription>
              {t("users.changePasswordFor")} <strong>{passwordUser?.parent_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("users.newPassword")} *</Label>
              <Input type="password" placeholder="••••••••" value={passwordForm.password} onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("users.confirmPassword")} *</Label>
              <Input type="password" placeholder="••••••••" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>{t("forms.cancel")}</Button>
            <Button onClick={handlePassword} disabled={passwordLoading}>
              {passwordLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("forms.saving")}</> : t("users.changePassword")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{t("users.deleteUser")}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {t("users.deleteUserConfirm")} <strong>{deleteUser?.parent_name}</strong>?
              {t("users.deleteUserWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("forms.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteLoading}>
              {deleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("forms.deleting")}</> : t("users.deleteUser")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
