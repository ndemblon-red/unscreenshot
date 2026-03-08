import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ArrowLeft, ImageIcon } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface QueuedFile {
  id: string;
  file: File;
  preview: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: QueuedFile[] = [];
    Array.from(incoming).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_FILE_SIZE) return;
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    });
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background px-page-x py-page-y max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[15px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-page-title tracking-tight">Upload Screenshots</h1>
        <div className="w-16" /> {/* spacer for centering */}
      </header>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed
          cursor-pointer transition-colors py-16 mb-6
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }
        `}
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-card-title text-foreground">
          Drop screenshots here or click to browse
        </p>
        <p className="text-label text-muted-foreground">
          JPG, PNG, WEBP — max 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <>
          <p className="text-label text-muted-foreground mb-3">
            {files.length} screenshot{files.length !== 1 ? "s" : ""} selected
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
            {files.map((f) => (
              <div key={f.id} className="relative group aspect-square rounded-card overflow-hidden bg-muted">
                <img
                  src={f.preview}
                  alt="Screenshot preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          disabled={files.length === 0}
          onClick={() => {
            // TODO: Wire to AI analysis + navigate to /review
            console.log("Analyse", files.length, "screenshots");
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-4 h-4" />
          Analyse Screenshots
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-[15px] text-muted-foreground hover:text-foreground transition-colors px-3 py-2.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
