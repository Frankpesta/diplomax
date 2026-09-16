"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckpointFormData } from "@/types/wizard";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MapPin,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    country?: string;
    country_code?: string;
  };
}

interface Props {
  data: CheckpointFormData[];
  onComplete: (data: CheckpointFormData[]) => void;
  onBack: () => void;
}

export function Step5Route({ data, onComplete, onBack }: Props) {
  const [checkpoints, setCheckpoints] = useState<CheckpointFormData[]>(data);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
        { headers: { "User-Agent": "Diplomaxdelivery/1.0 (diplomaxdelivery.com)" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addCheckpoint(result: NominatimResult) {
    const addr = result.address;
    const cityName =
      addr.city || addr.town || addr.village || addr.municipality || addr.county ||
      result.display_name.split(",")[0];
    const country = addr.country || "";

    setCheckpoints((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        cityName,
        country,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      },
    ]);
    setQuery("");
    setShowResults(false);
    setResults([]);
  }

  function remove(id: string) {
    setCheckpoints((prev) => prev.filter((c) => c.id !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setCheckpoints((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setCheckpoints((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function handleNext() {
    if (checkpoints.length > 0 && checkpoints.length < 2) {
      setError("Add at least 2 checkpoints to define a route, or skip this step.");
      return;
    }
    setError("");
    onComplete(checkpoints);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Route Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Search for cities to build the shipment route. First checkpoint is the
          origin, last is the destination.{" "}
          <span className="font-medium">This step is optional.</span>
        </p>
      </div>

      {/* City search */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <Input
            placeholder="Search for a city (e.g. London, New York, Dubai)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md overflow-hidden">
            {results.map((r, i) => {
              const addr = r.address;
              const city =
                addr.city || addr.town || addr.village || addr.municipality ||
                r.display_name.split(",")[0];
              return (
                <button
                  key={i}
                  type="button"
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-start gap-2"
                  onClick={() => addCheckpoint(r)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{city}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {r.display_name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkpoint list */}
      {checkpoints.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Route ({checkpoints.length} stop{checkpoints.length !== 1 ? "s" : ""})
          </p>
          {checkpoints.map((cp, index) => (
            <div
              key={cp.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                index === 0 && "border-primary/40 bg-primary/5",
                index === checkpoints.length - 1 && "border-green-500/40 bg-green-500/5"
              )}
            >
              <span className="flex-none text-xs font-bold text-muted-foreground w-5 text-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cp.cityName}</p>
                <p className="text-xs text-muted-foreground">{cp.country}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveDown(index)}
                  disabled={index === checkpoints.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => remove(cp.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No checkpoints yet. Search for cities above.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
