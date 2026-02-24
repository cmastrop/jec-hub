"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Cloud,
  Download,
  Cpu,
  CheckCircle,
  Pause,
  Loader2,
  Link,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MigrationProgress } from "./migration-progress";

type Phase =
  | "loading"
  | "disconnected"
  | "idle"
  | "cataloging"
  | "downloading"
  | "processing"
  | "paused"
  | "completed";

export function DropboxMigration() {
  const [phase, setPhase] = useState<Phase>("loading");
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
    processRemaining: 0,
    dailyLimitReached: false,
  });
  const runningRef = useRef(false);

  // Check Dropbox connection status on mount
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/dropbox/status");
        const data = await res.json();
        setPhase(data.connected ? "idle" : "disconnected");
      } catch {
        setPhase("disconnected");
      }
    }
    checkConnection();
  }, []);

  // Handle OAuth redirect results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dropbox_connected") === "true") {
      setPhase("idle");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("dropbox_error")) {
      setError(`Error de Dropbox: ${params.get("dropbox_error")}`);
      setPhase("disconnected");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const connectDropbox = () => {
    window.location.href = "/api/auth/dropbox";
  };

  const disconnectDropbox = async () => {
    await fetch("/api/dropbox/token", { method: "DELETE" });
    setPhase("disconnected");
  };

  // Catalog Dropbox files — no token needed from client
  const startCatalog = useCallback(async () => {
    setError("");
    setPhase("cataloging");

    try {
      const res = await fetch("/api/migration/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Error del servidor (${res.status}). Intentá de nuevo.`);
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setJobId(data.jobId);
      setStats((s) => ({
        ...s,
        totalFiles: data.totalFiles,
        processableFiles: data.processableFiles,
        downloaded: data.downloaded || 0,
        downloadRemaining: data.downloadRemaining ?? data.totalFiles,
      }));
      runningRef.current = true;
      // Skip download phase if all files already downloaded
      if (data.skipDownload) {
        setPhase("processing");
      } else {
        setPhase("downloading");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  }, []);

  // Download loop — server gets fresh token automatically
  useEffect(() => {
    if (phase !== "downloading" || !runningRef.current) return;

    let cancelled = false;
    let retries = 0;

    async function downloadBatch() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/migration/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchSize: 10 }),
        });
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          // Server timeout — retry automatically
          retries++;
          if (retries < 5) {
            setTimeout(downloadBatch, 2000);
            return;
          }
          throw new Error(`Error del servidor (${res.status}) tras ${retries} reintentos.`);
        }
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);

        retries = 0; // Reset on success

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
  }, [phase]);

  // Process loop (Claude AI extraction)
  useEffect(() => {
    if (phase !== "processing" || !runningRef.current || !jobId) return;

    let cancelled = false;
    let retries = 0;

    async function processBatch() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/migration/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, batchSize: 2 }),
        });
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          retries++;
          if (retries < 5) {
            setTimeout(processBatch, 3000);
            return;
          }
          throw new Error(`Error del servidor (${res.status}) tras ${retries} reintentos.`);
        }
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);
        retries = 0;

        setStats((s) => ({
          ...s,
          processed: s.processed + data.processed,
          processFailed: s.processFailed + data.failed,
          processRemaining: data.remaining ?? 0,
          dailyLimitReached: data.dailyLimitReached,
        }));

        if (data.dailyLimitReached) {
          setPhase("paused");
          runningRef.current = false;
          return;
        }

        // Continue if there are remaining items to process
        if (data.remaining > 0) {
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
      {/* Loading */}
      {phase === "loading" && (
        <div className="flex items-center gap-3 p-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500">Verificando conexion...</span>
        </div>
      )}

      {/* Not connected — show connect button */}
      {phase === "disconnected" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              Conecta tu cuenta de Dropbox para migrar canciones. Solo necesitas
              hacerlo una vez — el acceso no expira.
            </p>
            <Button onClick={connectDropbox} className="w-full">
              <Link className="w-4 h-4 mr-2" />
              Conectar Dropbox
            </Button>
          </div>
        </div>
      )}

      {/* Connected — ready to start */}
      {phase === "idle" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                Dropbox conectado
              </span>
            </div>
            <button
              onClick={disconnectDropbox}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
            >
              <Unlink className="w-3 h-3" />
              Desconectar
            </button>
          </div>
          <Button onClick={startCatalog} className="w-full">
            <Cloud className="w-4 h-4 mr-2" />
            Iniciar Migracion
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
              Procesando con Claude AI...
            </span>
          </div>
          <MigrationProgress
            label="Descarga completada"
            current={stats.downloaded}
            total={stats.totalFiles}
          />
          <MigrationProgress
            label="Extraccion de canciones (AI)"
            current={stats.processed}
            total={stats.processableFiles}
            failed={stats.processFailed}
          />
          {stats.processRemaining > 0 && (
            <p className="text-xs text-gray-500 text-center">
              {stats.processRemaining.toLocaleString()} archivos pendientes
            </p>
          )}
        </div>
      )}

      {/* Paused */}
      {phase === "paused" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Pause className="w-5 h-5" />
            <span className="font-semibold">
              Limite diario alcanzado
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Se procesaron {stats.processed.toLocaleString()} canciones hoy.
            Podes reanudar manana para continuar.
          </p>
          <MigrationProgress
            label="Extraccion de canciones (AI)"
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
            <span className="font-semibold">Migracion completada</span>
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
              <div className="text-gray-500">Canciones extraidas</div>
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
