import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Search, Trash2 } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function MCUsers() {
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const utils = trpc.useUtils();
  const { data: users, isLoading, error, isFetching } = trpc.admin.users.list.useQuery(
    {
      role: "user",
      search: deferredSearch.length > 0 ? deferredSearch : undefined,
    },
    { retry: false },
  );
  const updateRole = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("Kullanıcı rolü güncellendi.");
    },
    onError: e => toast.error(e.message),
  });
  const deleteCustomer = trpc.admin.users.deleteCustomer.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("Müşteri hesabı silindi.");
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Müşteri Yönetimi</p>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Müşteriler</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kayıtlı müşteri hesapları. Yönetici hesapları{" "}
          <button
            type="button"
            onClick={() => setLocation("/management-console/settings")}
            className="text-foreground/90 underline underline-offset-2 hover:text-primary"
          >
            Mağaza Ayarları → Kullanıcılar
          </button>{" "}
          altından yönetilir.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="İsim, e-posta veya telefon ile ara…"
          className="pl-9 h-10 bg-background"
          autoComplete="off"
          spellCheck={false}
        />
        {isFetching && !isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-muted-foreground">
            …
          </span>
        )}
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
            {deferredSearch.length > 0
              ? "Aramanızla eşleşen müşteri yok."
              : "Henüz müşteri bulunmuyor."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["İsim", "E-posta", "Giriş Yöntemi", "Rol", "Kayıt Tarihi", "İşlem"].map(h => (
                    <th
                      key={h}
                      className={`text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap ${
                        h === "İşlem" ? "text-right w-[1%]" : ""
                      }`}
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                              Müşteri
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user" className="text-xs">
                            Müşteri
                          </SelectItem>
                          <SelectItem value="admin" className="text-xs">
                            Yönetici yap
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            aria-label="Hesabı sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hesabı silinsin mi?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.email || user.name || "Bu müşteri"} kalıcı olarak silinir. Sipariş kayıtları
                              anonimleştirilir (sipariş satırları korunur). Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteCustomer.mutate({ id: user.id })}
                              disabled={deleteCustomer.isPending}
                            >
                              {deleteCustomer.isPending ? "Siliniyor…" : "Evet, sil"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
