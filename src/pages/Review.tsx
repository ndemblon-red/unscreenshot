import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { getCategoryClasses } from "@/lib/categories";

import { DEADLINE_OPTIONS, deadlineLabelToDate, isDateString } from "@/lib/deadlines";
const ASSIGNABLE_CATEGORIES = CATEGORIES.filter((c) => c !== "Everything");

interface ReviewItem {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
  title: string;
  category: string;
  deadline: string;
  analysed: boolean;
  error: boolean;
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [customDate, setCustomDate] = useState("");

  // Load files passed from Upload page
  useEffect(() => {
    const state = location.state as { files?: { file: File; preview: string; base64: string; mimeType: string }[] } | null;
    if (!state?.files || state.files.length === 0) {
      navigate("/upload");
      return;
    }
    setItems(
      state.files.map((f) => ({
        ...f,
        title: "",
        category: "To Do",
        deadline: "Next Week",
        analysed: false,
        error: false,
      }))
    );
  }, [location.state, navigate]);

  // Analyse screenshots sequentially
  useEffect(() => {
    if (items.length === 0) return;
    const unanalysed = items.findIndex((i) => !i.analysed && !i.error);
    if (unanalysed === -1) return;

    const analyse = async (index: number) => {
      try {
        const item = items[index];
        const { data, error } = await supabase.functions.invoke("analyse-screenshot", {
          body: { imageBase64: item.base64, mimeType: item.mimeType },
        });
        if (error) throw error;
        setItems((prev) =>
          prev.map((it, i) => {
            if (i !== index) return it;
            // Convert AI label ("Next Week") to a real date
            const dl = DEADLINE_OPTIONS.includes(data.deadline as any)
              ? deadlineLabelToDate(data.deadline as any)
              : isDateString(data.deadline) ? data.deadline : deadlineLabelToDate("Next Week");
            return { ...it, title: data.title, category: data.category, deadline: dl, analysed: true };
          })
        );
      } catch (err) {
        console.error("Analysis failed for item", index, err);
        setItems((prev) =>
          prev.map((it, i) => (i === index ? { ...it, error: true, analysed: true } : it))
        );
      }
    };

    analyse(unanalysed);
  }, [items]);

  const current = items[currentIndex];
  const analysedCount = items.filter((i) => i.analysed).length;

  const updateField = (field: keyof ReviewItem, value: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === currentIndex ? { ...it, [field]: value } : it))
    );
  };

  const handleSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      // Upload image to storage
      const ext = current.file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(path, current.file, { contentType: current.mimeType });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path);

      // Save reminder to database
      const { error: dbError } = await supabase.from("reminders").insert({
        title: current.title || "Review this item",
        category: current.category,
        deadline: current.deadline,
        image_url: urlData.publicUrl,
        status: "next",
      });
      if (dbError) throw dbError;

      goNext();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    goNext();
  };

  const goNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1);
      setCustomDate("");
    } else {
      navigate("/");
    }
  };

  const handleRetry = () => {
    setItems((prev) =>
      prev.map((it, i) => (i === currentIndex ? { ...it, error: false, analysed: false } : it))
    );
  };

  if (items.length === 0) return null;

  // customDate controls whether the date picker is shown

  return (
    <div className="min-h-screen bg-background px-page-x py-page-y max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[15px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        <h1 className="text-page-title tracking-tight">Review Screenshots</h1>
        <div className="w-16" />
      </header>

      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-label text-muted-foreground">
          {currentIndex + 1} of {items.length}
        </p>
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < currentIndex
                  ? "bg-primary"
                  : i === currentIndex
                  ? "bg-primary/60"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {current && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Screenshot preview */}
          <div className="rounded-card overflow-hidden border border-border bg-muted aspect-[3/4] flex items-center justify-center">
            <img
              src={current.preview}
              alt="Screenshot"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {!current.analysed ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                <p className="text-label text-muted-foreground">
                  Analysing {currentIndex + 1} of {items.length}...
                </p>
              </div>
            ) : current.error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p className="text-card-title text-foreground">Couldn't analyse this screenshot</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-btn text-[15px] font-medium border border-border hover:bg-muted transition-colors"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => {
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === currentIndex
                            ? { ...it, error: false, title: "", category: "To Do", deadline: "Next Week" }
                            : it
                        )
                      );
                    }}
                    className="px-4 py-2 rounded-btn text-[15px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Add details manually
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Title */}
                <div>
                  <label className="text-label text-muted-foreground mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={current.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Buy tickets for Massive Attack"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-label text-muted-foreground mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {ASSIGNABLE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateField("category", cat)}
                        className={`px-3 py-1.5 rounded-pill text-[12px] font-semibold uppercase tracking-wider transition-all ${
                          current.category === cat
                            ? getCategoryClasses(cat)
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-label text-muted-foreground mb-1.5 block">Deadline</label>
                  <div className="flex flex-wrap gap-2">
                    {DEADLINE_OPTIONS.map((opt) => {
                      const optDate = deadlineLabelToDate(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            updateField("deadline", optDate);
                            setCustomDate("");
                          }}
                          className={`px-3 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
                            current.deadline === optDate
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        setCustomDate(current.deadline || new Date().toISOString().split("T")[0]);
                      }}
                      className={`px-3 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
                        customDate
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {customDate && (
                    <input
                      type="date"
                      value={current.deadline}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        updateField("deadline", e.target.value);
                      }}
                      className="mt-2 px-3 py-2 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Save Reminder
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2.5 text-[15px]"
                  >
                    <X className="w-4 h-4" />
                    Discard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Prev/Next navigation */}
      {items.length > 1 && current?.analysed && !current?.error && (
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[15px] disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={currentIndex === items.length - 1}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[15px] disabled:opacity-30"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
