import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  title: string;
  category: string;
  deadline: string;
}

interface TestResult {
  fileName: string;
  status: "pending" | "loading" | "success" | "error";
  result?: AnalysisResult;
  error?: string;
}

const Index = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate file types
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const invalidFiles = fileArray.filter(f => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      alert("Please upload image files only (JPG, PNG, WEBP)");
      return;
    }

    // Initialize results
    const initialResults: TestResult[] = fileArray.map(f => ({
      fileName: f.name,
      status: "pending",
    }));
    setResults(initialResults);
    setIsAnalysing(true);

    // Process each image sequentially
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      setResults(prev =>
        prev.map((r, idx) => (idx === i ? { ...r, status: "loading" } : r))
      );

      try {
        const base64 = await fileToBase64(file);
        const { data, error } = await supabase.functions.invoke("analyse-screenshot", {
          body: { imageBase64: base64, mimeType: file.type },
        });

        if (error) throw new Error(error.message);

        setResults(prev =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "success", result: data } : r
          )
        );
      } catch (err) {
        setResults(prev =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: "error", error: err instanceof Error ? err.message : "Unknown error" }
              : r
          )
        );
      }
    }

    setIsAnalysing(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:mime;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Milestone 1 — AI Test Harness
      </h1>
      <p style={{ fontSize: 15, color: "#6E6E73", marginBottom: 24 }}>
        Select screenshot images to test AI analysis. Results appear below.
      </p>

      <label
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: "#000",
          color: "#fff",
          borderRadius: 8,
          cursor: isAnalysing ? "not-allowed" : "pointer",
          opacity: isAnalysing ? 0.5 : 1,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {isAnalysing ? "Analysing..." : "Select Screenshots"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          disabled={isAnalysing}
          style={{ display: "none" }}
        />
      </label>

      {results.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #E5E5EA",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                {r.fileName}
              </div>

              {r.status === "pending" && (
                <span style={{ color: "#6E6E73", fontSize: 13 }}>Waiting...</span>
              )}

              {r.status === "loading" && (
                <span style={{ color: "#007AFF", fontSize: 13 }}>Analysing...</span>
              )}

              {r.status === "error" && (
                <span style={{ color: "#FF3B30", fontSize: 13 }}>
                  Error: {r.error}
                </span>
              )}

              {r.status === "success" && r.result && (
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <div>
                    <strong>Title:</strong> {r.result.title}
                  </div>
                  <div>
                    <strong>Category:</strong>{" "}
                    <span style={{ 
                      display: "inline-block",
                      padding: "2px 8px", 
                      borderRadius: 20, 
                      fontSize: 12,
                      fontWeight: 600,
                      background: getCategoryColor(r.result.category) + "20",
                      color: getCategoryColor(r.result.category),
                    }}>
                      {r.result.category}
                    </span>
                  </div>
                  <div>
                    <strong>Deadline:</strong> {r.result.deadline}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Events: "#5856D6",
    Shopping: "#FF9500",
    Restaurants: "#34C759",
    "To Do": "#007AFF",
    Reading: "#AF52DE",
    Home: "#FF6B35",
    Travel: "#32ADE6",
    Wishlist: "#FF2D55",
  };
  return colors[category] || "#6E6E73";
}

export default Index;
