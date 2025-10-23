import { useState, useEffect } from "react";

type MemoryNote = {
  ts: number;
  note: string;
};

type MemoryResponse = {
  ok: boolean;
  notes: MemoryNote[];
  total: number;
  updatedAt: string;
};

export default function MemoryManager() {
  const [memory, setMemory] = useState<MemoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchMemory = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = query ? `/api/oaa/memory?q=${encodeURIComponent(query)}` : "/api/oaa/memory";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setMemory(data);
      } else {
        setError(data.error || "Failed to fetch memory");
      }
    } catch (e) {
      setError("Network error: " + e);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd need to generate HMAC signature
      // For now, we'll use a simple approach
      const res = await fetch("/api/oaa/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hmac-signature": "dev-signature" // In production, generate proper HMAC
        },
        body: JSON.stringify({ note: newNote.trim() })
      });
      
      const data = await res.json();
      if (data.ok) {
        setNewNote("");
        await fetchMemory(searchQuery);
      } else {
        setError(data.error || "Failed to add note");
      }
    } catch (e) {
      setError("Network error: " + e);
    } finally {
      setLoading(false);
    }
  };

  const clearMemory = async () => {
    if (!confirm("Are you sure you want to clear all memory notes?")) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/oaa/memory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-hmac-signature": "dev-signature" // In production, generate proper HMAC
        }
      });
      
      const data = await res.json();
      if (data.ok) {
        await fetchMemory(searchQuery);
      } else {
        setError(data.error || "Failed to clear memory");
      }
    } catch (e) {
      setError("Network error: " + e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{
      background: "#1b2440",
      border: "1px solid #2a3a5a",
      borderRadius: "8px",
      padding: "1.5rem",
      marginTop: "1rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, color: "#9fd1ff" }}>OAA Memory</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => fetchMemory(searchQuery)}
            disabled={loading}
            style={{
              padding: "6px 12px",
              background: "#1ecb6b",
              color: "#0b1020",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "0.9rem"
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={clearMemory}
            disabled={loading}
            style={{
              padding: "6px 12px",
              background: "#ff5a5a",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "0.9rem"
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search memory notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchMemory(searchQuery)}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "#0b1020",
            border: "1px solid #2a3a5a",
            borderRadius: "4px",
            color: "#cfe0ff",
            fontSize: "0.9rem"
          }}
        />
      </div>

      {/* Add new note */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Add a memory note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addNote()}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "#0b1020",
              border: "1px solid #2a3a5a",
              borderRadius: "4px",
              color: "#cfe0ff",
              fontSize: "0.9rem"
            }}
          />
          <button
            onClick={addNote}
            disabled={loading || !newNote.trim()}
            style={{
              padding: "8px 16px",
              background: "#9fd1ff",
              color: "#0b1020",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !newNote.trim() ? "not-allowed" : "pointer",
              opacity: loading || !newNote.trim() ? 0.6 : 1,
              fontSize: "0.9rem"
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: "8px 12px",
          background: "#4d1a1a",
          border: "1px solid #ff5a5a",
          borderRadius: "4px",
          color: "#ff9f9f",
          marginBottom: "1rem",
          fontSize: "0.9rem"
        }}>
          Error: {error}
        </div>
      )}

      {/* Memory notes */}
      {memory ? (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {memory.notes.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "2rem",
              opacity: 0.6,
              fontSize: "0.9rem"
            }}>
              {searchQuery ? "No notes match your search" : "No memory notes yet"}
            </div>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {memory.notes.map((note, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    background: "#0b1020",
                    border: "1px solid #1b2440",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}
                >
                  <div style={{ marginBottom: "4px", color: "#cfe0ff" }}>
                    {note.note}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                    {formatDate(note.ts)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          opacity: 0.6,
          fontSize: "0.9rem"
        }}>
          {loading ? "Loading memory..." : "No data available"}
        </div>
      )}

      {memory && (
        <div style={{
          marginTop: "1rem",
          padding: "8px 12px",
          background: "#0b1020",
          border: "1px solid #1b2440",
          borderRadius: "4px",
          fontSize: "0.8rem",
          opacity: 0.7,
          textAlign: "center"
        }}>
          Showing {memory.notes.length} of {memory.total} notes • 
          Last updated: {formatDate(new Date(memory.updatedAt).getTime())}
        </div>
      )}
    </div>
  );
}