import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowDownRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ExpenseCategory =
  | "shipping"
  | "advertising"
  | "material"
  | "salary"
  | "rent"
  | "tax"
  | "commission"
  | "packaging"
  | "software"
  | "other";

const categories: ExpenseCategory[] = [
  "shipping",
  "advertising",
  "material",
  "salary",
  "rent",
  "tax",
  "commission",
  "packaging",
  "software",
  "other",
];

const categoryLabels: Record<ExpenseCategory, string> = {
  shipping: "Kargo",
  advertising: "Reklam",
  material: "Malzeme / Hammadde",
  salary: "Maaş / Personel",
  rent: "Kira",
  tax: "Vergi",
  commission: "Komisyon",
  packaging: "Ambalaj",
  software: "Yazılım / Teknoloji",
  other: "Diğer",
};

const categoryColors: Record<ExpenseCategory, string> = {
  shipping: "bg-blue-100 text-blue-700",
  advertising: "bg-purple-100 text-purple-700",
  material: "bg-amber-100 text-amber-700",
  salary: "bg-emerald-100 text-emerald-700",
  rent: "bg-indigo-100 text-indigo-700",
  tax: "bg-red-100 text-red-700",
  commission: "bg-orange-100 text-orange-700",
  packaging: "bg-cyan-100 text-cyan-700",
  software: "bg-violet-100 text-violet-700",
  other: "bg-gray-100 text-gray-700",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(v);
}

type ExpenseRow = {
  id: number;
  category: ExpenseCategory;
  description: string;
  amount: string;
  date: Date;
  isRecurring: boolean | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function ExpenseFormDialog({
  open,
  onClose,
  expense,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  expense: ExpenseRow | null;
  onSubmit: (data: {
    category: ExpenseCategory;
    description: string;
    amount: string;
    date: string;
    isRecurring: boolean;
    notes?: string;
  }) => void;
  isPending: boolean;
}) {
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? "other",
  );
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount ?? "");
  const [date, setDate] = useState(
    expense
      ? new Date(expense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [isRecurring, setIsRecurring] = useState(
    expense?.isRecurring ?? false,
  );
  const [notes, setNotes] = useState(expense?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim()) return;
    onSubmit({
      category,
      description: description.trim(),
      amount,
      date: new Date(date).toISOString(),
      isRecurring,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
            {expense ? "Gider Düzenle" : "Yeni Gider"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs tracking-wider uppercase text-muted-foreground font-light">
              Kategori
            </label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ExpenseCategory)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="text-sm">
                    {categoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs tracking-wider uppercase text-muted-foreground font-light">
              Açıklama
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Gider açıklaması"
              required
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                Tutar (₺)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                Tarih
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="isRecurring" className="text-sm text-muted-foreground">
              Tekrarlayan gider
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs tracking-wider uppercase text-muted-foreground font-light">
              Not (opsiyonel)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ek açıklama..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              İptal
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending
                ? "Kaydediliyor..."
                : expense
                  ? "Güncelle"
                  : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MCExpenses() {
  const utils = trpc.useUtils();
  const {
    data: expenseList,
    isLoading,
    error,
  } = trpc.admin.expenses.list.useQuery(undefined, { retry: false });

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseRow | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    ExpenseCategory | "all"
  >("all");

  const createMutation = trpc.admin.expenses.create.useMutation({
    onSuccess: () => {
      utils.admin.expenses.list.invalidate();
      utils.admin.revenue.stats.invalidate();
      setShowForm(false);
      toast.success("Gider eklendi.");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.expenses.update.useMutation({
    onSuccess: () => {
      utils.admin.expenses.list.invalidate();
      utils.admin.revenue.stats.invalidate();
      setEditItem(null);
      toast.success("Gider güncellendi.");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.expenses.delete.useMutation({
    onSuccess: () => {
      utils.admin.expenses.list.invalidate();
      utils.admin.revenue.stats.invalidate();
      toast.success("Gider silindi.");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (expenseList as ExpenseRow[] | undefined)?.filter(
    (e) => filterCategory === "all" || e.category === filterCategory,
  );

  const totalAmount =
    filtered?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;

  const categorySummary = (expenseList as ExpenseRow[] | undefined)?.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <ExpenseFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        expense={null}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
      <ExpenseFormDialog
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        expense={editItem}
        onSubmit={(data) =>
          editItem && updateMutation.mutate({ id: editItem.id, ...data })
        }
        isPending={updateMutation.isPending}
      />

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
            Finans
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
            Gider Yönetimi
          </h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Yeni Gider
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Veri yüklenemedi.</p>
        </div>
      )}

      {/* Category Summary */}
      {!isLoading && categorySummary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(categorySummary)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat, amount]) => (
              <button
                key={cat}
                onClick={() =>
                  setFilterCategory(
                    filterCategory === cat
                      ? "all"
                      : (cat as ExpenseCategory),
                  )
                }
                className={`bg-card border rounded p-3 text-left transition-colors ${
                  filterCategory === cat
                    ? "border-primary"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <p className="font-['Cormorant_Garamond'] text-lg font-light">
                  {formatCurrency(amount)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {categoryLabels[cat as ExpenseCategory] ?? cat}
                </p>
              </button>
            ))}
        </div>
      )}

      {/* Filter */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select
              value={filterCategory}
              onValueChange={(v) =>
                setFilterCategory(v as ExpenseCategory | "all")
              }
            >
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  Tüm Kategoriler
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {categoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterCategory !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => setFilterCategory("all")}
              >
                Filtreyi Kaldır
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Toplam:{" "}
            <strong className="text-foreground">
              {formatCurrency(totalAmount)}
            </strong>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !filtered?.length ? (
          <div className="p-12 text-center space-y-3">
            <ArrowDownRight className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {filterCategory === "all"
                ? "Henüz gider kaydı bulunmuyor."
                : `"${categoryLabels[filterCategory as ExpenseCategory]}" kategorisinde gider yok.`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              İlk Gideri Ekle
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {[
                    "Kategori",
                    "Açıklama",
                    "Tutar",
                    "Tarih",
                    "Tekrar",
                    "",
                  ].map((h) => (
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
                {filtered.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[expense.category]}`}
                      >
                        {categoryLabels[expense.category]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {expense.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-red-600">
                      {formatCurrency(Number(expense.amount))}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(expense.date).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5">
                      {expense.isRecurring ? (
                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          Tekrarlayan
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Tek seferlik
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditItem(expense)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="Düzenle"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bu gider kaydını silmek istediğinize emin misiniz?",
                              )
                            ) {
                              deleteMutation.mutate({ id: expense.id });
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
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
