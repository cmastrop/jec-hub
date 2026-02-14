"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Cloud, Download, Cpu, CheckCircle, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MigrationProgress } from "./migration-progress";

type Phase =
  | "idle"
  | "cataloging"
  | "downloading"
  | "processing"
  | "paused"
  | "completed";

export function DropboxMigration() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [accessToken, setAccessToken] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalFiles: 0,
    processableFiles: 0,
    downloaded: 0,
    downloadFailed: 0,
    downloadRemaining: 0,
    processed: 0,
    processFailed: 0,
    dailyLimitReached: false,
  });
  const runningRef = useRef(false);

  // Catalog Dropbox files
  const startCatalog = useCallback(async () => {
    if (!accessToken.trim()) {
      setError("Pegá tu token de acceso de Dropbox");
      return;
    }
    setError("");
    setPhase("cataloging");

    try {
      const res = await fetch("/api/migration/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setJobId(data.jobId);
      setStats((s) => ({
        ...s,
        totalFiles: data.totalFiles,
        processableFiles: data.processableFiles,
        downloadRemaining: data.totalFiles,
      }));
      setPhase("downloading");
      runningRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  }, [accessToken]);

  // Download loop
  useEffect(() => {
    if (phase !== "downloading" || !runningRef.current) return;

    let cancelled = false;

    async function downloadBatch() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/migration/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, batchSize: 30 }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);

        setStats((s) => ({
          ...s,
          downloaded: s.downloaded + data.downloaded,
          downloadFailed: s.downloadFailed + data.failed,
          downloadRemaining: data.remaining,
        }));

        if (data.remaining > 0) {
          setTimeout(downloadBatch, 300);
        } else {
          setPhase("processing");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        runningRef.current = false;
      }
    }

    downloadBatch();
    return () => {
      cancelled = true;
    };
  }, [phase, accessToken]);

  // Process loop (Gemini extraction)
  useEffect(() => {
    if (phase !== "processing" || !runningRef.current || !jobId) return;

    let cancelled = false;

    async function processBatch() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/migration/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, batchSize: 10 }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);

        setStats((s) => ({
          ...s,
          processed: s.processed + data.processed,
          processFailed: s.processFailed + data.failed,
          dailyLimitReached: data.dailyLimitReached,
        }));

        if (data.dailyLimitReached) {
          setPhase("paused");
          runningRef.current = false;
          return;
        }

        // Check if there are more to process
        if (data.processed > 0 || data.failed > 0) {
          setTimeout(processBatch, 500);
        } else {
          setPhase("completed");
          runningRef.current = false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        runningRef.current = false;
      }
    }

    processBatch();
    return () => {
      cancelled = true;
    };
  }, [phase, jobId]);

  const resumeProcessing = () => {
    runningRef.current = true;
    setStats((s) => ({ ...s, dailyLimitReached: false }));
    setPhase("processing");
  };

  return (
    <div className="space-y-6">
      {/* Token input */}
      {phase === "idle" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token de Acceso de Dropbox
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder="sl.u.AGS_..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Generá un token en tu app de Dropbox Developers
            </p>
          </div>
          <Button onClick={startCatalog} className="w-full">
            <Cloud className="w-4 h-4 mr-2" />
            Iniciar Migración
          </Button>
        </div>
      )}

      {/* Cataloging */}
      {phase === "cataloging" && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-primary font-medium">
            Escaneando archivos de Dropbox...
          </span>
        </div>
      )}

      {/* Downloading */}
      {phase === "downloading" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Download className="w-5 h-5" />
            <span className="font-semibold">Descargando archivos...</span>
          </div>
          <MigrationProgress
            label="Descarga de Dropbox"
            current={stats.downloaded}
            total={stats.totalFiles}
            failed={stats.downloadFailed}
          />
        </div>
      )}

      {/* Processing */}
      {phase === "processing" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">
              Procesando con Gemini AI...
            </span>
          </div>
          <MigrationProgress
            label="Descarga completada"
            current={stats.downloaded}
            total={stats.totalFiles}
          />
          <MigrationProgress
            label="Extracción de canciones (AI)"
            current={stats.processed}
            total={stats.processableFiles}
            failed={stats.processFailed}
          />
        </div>
      )}

      {/* Paused */}
      {phase === "paused" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Pause className="w-5 h-5" />
            <span className="font-semibold">
              Límite diario de Gemini alcanzado
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Se procesaron {stats.processed.toLocaleString()} canciones hoy.
            Podés reanudar mañana para continuar.
          </p>
          <MigrationProgress
            label="Extracción de canciones (AI)"
            current={stats.processed}
            total={stats.processableFiles}
            failed={stats.processFailed}
          />
          <Button onClick={resumeProcessing} className="w-full">
            Reanudar Procesamiento
          </Button>
        </div>
      )}

      {/* Completed */}
      {phase === "completed" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Migración completada</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.downloaded.toLocaleString()}
              </div>
              <div className="text-gray-500">Archivos descargados</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.processed.toLocaleString()}
              </div>
              <div className="text-gray-500">Canciones extraídas</div>
            </div>
          </div>
          <a
            href="/canciones?status=all"
            className="block text-center text-primary hover:underline text-sm font-medium"
          >
            Ver canciones importadas →
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}
