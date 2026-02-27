"use client";

import { useState, useRef } from "react";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  total: number;
}

interface PreviewRecord {
  name?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  [key: string]: unknown;
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRecord[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError("");

    try {
      const text = await selectedFile.text();
      const fileName = selectedFile.name.toLowerCase();
      let records: PreviewRecord[] = [];

      if (fileName.endsWith(".json")) {
        const parsed = JSON.parse(text);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else if (fileName.endsWith(".csv")) {
        // Simple CSV preview: parse first few lines
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
          for (let i = 1; i < Math.min(lines.length, 6); i++) {
            const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
            const record: PreviewRecord = {};
            headers.forEach((header, idx) => {
              record[header] = values[idx] || "";
            });
            records.push(record);
          }
        }
      } else {
        setError("Unsupported file format. Please upload a CSV or JSON file.");
        return;
      }

      setPreview(records.slice(0, 5));
    } catch {
      setError("Error reading file. Please check the file format.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-gray-500 text-sm mt-1">
          Import listings from CSV or JSON files
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Import Instructions
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            Supported formats: CSV and JSON files
          </li>
          <li>
            For OutScraper CSV format, include columns: name, full_address (or
            city/state separately), phone, site/website
          </li>
          <li>
            Records are matched by name + city + state -- existing records will be
            updated, new ones created
          </li>
          <li>
            Location records are automatically created for new cities
          </li>
          <li>
            Records missing a name, city, or state will be skipped
          </li>
        </ul>
      </div>

      {/* File Upload Area */}
      {!result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-slate-500 bg-slate-50"
                : file
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div>
                <svg
                  className="w-12 h-12 text-green-500 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  Drop your file here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports CSV and JSON files
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && !result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Preview (First {preview.length} records)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {Object.keys(preview[0])
                    .slice(0, 6)
                    .map((key) => (
                      <th
                        key={key}
                        className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(record)
                      .slice(0, 6)
                      .map((val, vIdx) => (
                        <td
                          key={vIdx}
                          className="px-4 py-2 text-gray-700 max-w-[200px] truncate"
                        >
                          {String(val || "")}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? "Importing..." : "Import Data"}
            </button>
            <button
              onClick={resetForm}
              disabled={importing}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Import Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {result.created}
              </p>
              <p className="text-xs text-green-600 mt-1">Created</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {result.updated}
              </p>
              <p className="text-xs text-blue-600 mt-1">Updated</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">
                {result.skipped}
              </p>
              <p className="text-xs text-gray-600 mt-1">Skipped</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {result.total}
              </p>
              <p className="text-xs text-purple-600 mt-1">Total Records</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">
                Errors ({result.errors.length})
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-700 mb-1">
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
