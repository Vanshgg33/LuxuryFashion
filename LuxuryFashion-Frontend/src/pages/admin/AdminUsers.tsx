import { Search, Mail, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { demoUsers } from "@/data/adminData";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = demoUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-olive flex items-center justify-center text-primary-foreground font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.id}</p>
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
                      <span className="font-medium text-foreground">{user.orderCount}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-primary">
                    ₹{user.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right text-sm text-muted-foreground">
                    {user.joinedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
