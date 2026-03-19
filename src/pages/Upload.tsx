import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ArrowLeft, ImageIcon, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSION = 1568; // Anthropic recommended max
const TARGET_BASE64_SIZE = 4 * 1024 * 1024; // 4MB to stay safely under 5MB limit

interface QueuedFile {
  id: string;
  file: File;
  preview: string;
}

/**
 * Compress and resize an image file to stay under Anthropic's 5MB base64 limit.
 * Returns { base64, mimeType } with the processed image.
 */
async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;

        // Scale down if exceeds max dimension
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // Try JPEG at decreasing quality until under target size
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length * 0.75 > TARGET_BASE64_SIZE && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Strip the data URL prefix to get raw base64
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mimeType: "image/jpeg" });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function UploadPage() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: QueuedFile[] = [];
    const errors: string[] = [];

    Array.from(incoming).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" — Please upload image files only (JPG, PNG, WEBP)`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" — File exceeds 10MB limit`);
        return;
      }
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (errors.length > 0) {
      setFileErrors(errors);
    } else {
      setFileErrors([]);
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
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
        <div className="w-16" />
      </header>

      {/* File validation errors */}
      {fileErrors.length > 0 && (
        <div className="mb-4 p-3 rounded-card border border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              {fileErrors.map((err, i) => (
                <p key={i} className="text-[13px] text-destructive">{err}</p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setFileErrors([])}
            className="mt-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

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
          onClick={async () => {
            const prepared = await Promise.all(
              files.map(async (f) => {
                const { base64, mimeType } = await compressImage(f.file);
                return {
                  file: f.file,
                  preview: f.preview,
                  base64,
                  mimeType,
                };
              })
            );
            navigate("/review", { state: { files: prepared } });
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
