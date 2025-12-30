import { Search, Mail, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUsers } from "@/lib/api";
import { updateUserRole } from "@/lib/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<{ id: string; role: "user" | "admin" } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paged = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const handleRoleChange = async (userId: string, role: "user" | "admin") => {
    setPendingRole({ id: userId, role });
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-styled pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Orders</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Total Spent</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-12 text-center text-muted-foreground" colSpan={5}>Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="py-12 text-center text-muted-foreground" colSpan={5}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
              paged.map((user) => (
                <tr key={user._id || user.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-olive flex items-center justify-center text-primary-foreground font-semibold">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user._id || user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{user.orderCount || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-primary">
                    ₹{(user.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right text-sm text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : ""}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      value={user.role || "user"}
                      onChange={(e) => handleRoleChange(user._id || user.id, e.target.value as "user" | "admin")}
                      className="input-styled text-sm"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="btn-secondary text-xs"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm role change</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Change user {pendingRole?.id} to role "{pendingRole?.role}"?
          </p>
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!pendingRole) return;
                try {
                  await updateUserRole(pendingRole.id, pendingRole.role);
                  // Refresh users list to ensure sync with backend
                  const data = await fetchUsers();
                  setUsers(Array.isArray(data) ? data : []);
                } catch (err: any) {
                  console.error("Failed to update role:", err);
                } finally {
                  setConfirmOpen(false);
                  setPendingRole(null);
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
