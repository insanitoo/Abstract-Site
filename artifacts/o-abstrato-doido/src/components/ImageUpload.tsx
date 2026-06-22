import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Imagem" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) throw new Error("Erro no upload");
      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("Falha no upload. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs tracking-widest uppercase text-foreground font-medium">{label}</p>
      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-40 object-cover border border-[hsl(40,10%,85%)]" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
            aria-label="Remover imagem"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Substituir
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`w-full h-32 border-2 border-dashed border-[hsl(40,10%,80%)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-foreground/40 transition-colors ${loading ? "opacity-60 pointer-events-none" : ""}`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">A enviar...</p>
            </div>
          ) : (
            <>
              <ImageIcon size={24} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center px-4">
                Clique ou arraste uma imagem
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-white text-xs">
                <Upload size={12} /> Escolher ficheiro
              </div>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
