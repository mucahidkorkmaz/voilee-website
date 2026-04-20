import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export function ImageUpload({ value, onChange, label = "Görsel", className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece görsel dosyaları yüklenebilir.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Dosya boyutu 15 MB sınırını aşıyor.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Yükleme başarısız.");
      }
      const data = await res.json();
      onChange(data.url);
      toast.success("Görsel yüklendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = () => onChange("");

  return (
    <div className={className}>
      {label && (
        <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal mb-1.5">
          {label}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {value ? (
        <div className="relative group rounded border border-border/50 overflow-hidden bg-muted aspect-video w-full max-w-xs">
          <img
            src={value}
            alt="Görsel"
            className="h-full w-full object-contain"
            onError={e => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-white/20 hover:bg-white/30 rounded transition-colors disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Değiştir
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-white bg-white/20 hover:bg-destructive/80 rounded transition-colors"
              title="Görseli kaldır"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={[
            "flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed cursor-pointer transition-colors py-6 px-4",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-border hover:bg-muted/40",
            uploading ? "pointer-events-none opacity-60" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
          )}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {uploading ? "Yükleniyor…" : "Tıkla veya sürükle-bırak"}
            </p>
            {!uploading && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                JPEG, PNG, WebP, GIF, SVG · maks. 15 MB
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
