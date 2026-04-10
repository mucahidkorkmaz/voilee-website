import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function MCUsers() {
  const utils = trpc.useUtils();
  const { data: users, isLoading, error } = trpc.admin.users.list.useQuery(undefined, { retry: false });
  const updateRole = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("Kullanıcı rolü güncellendi.");
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
          Kullanıcı Yönetimi
        </p>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
          Kullanıcılar
        </h1>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Veri yüklenemedi</p>
            <p className="text-xs mt-0.5 text-amber-700">
              {error.message.includes("10002")
                ? "Bu verilere erişmek için admin yetkisi gereklidir."
                : error.message.includes("10001")
                ? "Verileri görüntülemek için giriş yapmanız gereklidir."
                : "Veritabanı bağlantısı kurulamadı. DATABASE_URL ortam değişkenini kontrol edin."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !users?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Henüz kullanıcı bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["İsim", "E-posta", "Giriş Yöntemi", "Rol", "Kayıt Tarihi"].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium">{user.name || "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{user.email || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        {user.loginMethod || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Select
                        value={user.role}
                        onValueChange={value =>
                          updateRole.mutate({ id: user.id, role: value as "user" | "admin" })
                        }
                      >
                        <SelectTrigger className="h-7 w-28 text-xs border-0 p-0 shadow-none focus:ring-0">
                          <SelectValue>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {user.role === "admin" ? "Admin" : "Kullanıcı"}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user" className="text-xs">Kullanıcı</SelectItem>
                          <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
