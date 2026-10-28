import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FileCode, 
  FilePlus, 
  Upload, 
  Archive, 
  Smartphone, 
  Play, 
  Trash2, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  CornerDownLeft, 
  Save, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: number;
  ext: string;
}

interface AndroidCodeManagerProps {
  onSwitchToTerminal?: () => void;
  onSwitchToRunner?: (code: string, language: 'python' | 'node' | 'bash') => void;
}

export const AndroidCodeManager: React.FC<AndroidCodeManagerProps> = ({
  onSwitchToTerminal,
  onSwitchToRunner,
}) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Active file editor
  const [activeFile, setActiveFile] = useState<{ path: string; content: string; originalContent: string } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Execution result
  const [executionResult, setExecutionResult] = useState<{
    cmd: string;
    output: string;
    success: boolean;
    exitCode: number | null;
  } | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');

  // Android guide collapse
  const [showAndroidTips, setShowAndroidTips] = useState<boolean>(true);

  // File inputs
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (dir = currentPath) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files/list?dir=${encodeURIComponent(dir)}`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.files || []);
        setCurrentPath(data.currentPath || '');
      } else {
        setStatusMessage({ text: data.error || 'Erreur de chargement', success: false });
      }
    } catch (e: any) {
      setStatusMessage({ text: 'Erreur réseau lors de la récupération des fichiers', success: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  // Upload folder (webkitdirectory)
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const itemsToUpload: Array<{ path: string; content: string; isBase64: boolean }> = [];
      const total = fileList.length;

      for (let i = 0; i < total; i++) {
        const file = fileList[i];
        // Relative path inside folder
        const relPath = file.webkitRelativePath || file.name;
        const targetPath = currentPath ? `${currentPath}/${relPath}` : relPath;

        // Check if text or binary
        const isText = isTextFile(file.name);

        if (isText) {
          const text = await file.text();
          itemsToUpload.push({
            path: targetPath,
            content: text,
            isBase64: false,
          });
        } else {
          // Read as base64
          const base64 = await fileToBase64(file);
          itemsToUpload.push({
            path: targetPath,
            content: base64,
            isBase64: true,
          });
        }
      }

      // Batch send to server
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: itemsToUpload }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `✔ ${data.count} fichier(s) et dossiers importés avec succès !`, success: true });
        await fetchFiles();
      } else {
        setStatusMessage({ text: `✖ Erreur: ${data.error}`, success: false });
      }
    } catch (err: any) {
      setStatusMessage({ text: `✖ Échec de l'import: ${err.message}`, success: false });
    } finally {
      setUploading(false);
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  // Upload ZIP
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setUploading(true);
    setStatusMessage(null);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch('/api/files/upload-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          targetFolder: currentPath,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `✔ Archive ZIP extraite avec succès dans votre espace !`, success: true });
        await fetchFiles();
      } else {
        setStatusMessage({ text: `✖ Erreur: ${data.error || data.logs}`, success: false });
      }
    } catch (err: any) {
      setStatusMessage({ text: `✖ Erreur upload ZIP: ${err.message}`, success: false });
    } finally {
      setUploading(false);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // Upload individual multiple files
  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const itemsToUpload: Array<{ path: string; content: string; isBase64: boolean }> = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const targetPath = currentPath ? `${currentPath}/${file.name}` : file.name;
        const isText = isTextFile(file.name);

        if (isText) {
          const text = await file.text();
          itemsToUpload.push({ path: targetPath, content: text, isBase64: false });
        } else {
          const base64 = await fileToBase64(file);
          itemsToUpload.push({ path: targetPath, content: base64, isBase64: true });
        }
      }

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: itemsToUpload }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `✔ ${data.count} fichier(s) importé(s) !`, success: true });
        await fetchFiles();
      } else {
        setStatusMessage({ text: `✖ Erreur: ${data.error}`, success: false });
      }
    } catch (err: any) {
      setStatusMessage({ text: `✖ Échec upload: ${err.message}`, success: false });
    } finally {
      setUploading(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Helper: check if text file
  const isTextFile = (name: string) => {
    const textExts = ['.py', '.js', '.ts', '.mjs', '.cjs', '.json', '.sh', '.bash', '.env', '.txt', '.md', '.html', '.css', '.yaml', '.yml', '.xml', '.sql', '.toml', '.ini', '.cfg'];
    const ext = name.includes('.') ? '.' + name.split('.').pop()!.toLowerCase() : '';
    return textExts.includes(ext) || !ext;
  };

  // Helper: file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Open file for viewing / editing
  const handleOpenFile = async (file: FileItem) => {
    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
    try {
      const res = await fetch('/api/files/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fullPath }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveFile({
          path: fullPath,
          content: data.content,
          originalContent: data.content,
        });
      } else {
        setStatusMessage({ text: `Impossible de lire le fichier: ${data.error}`, success: false });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Erreur lecture: ${e.message}`, success: false });
    }
  };

  // Save edited file
  const handleSaveFile = async () => {
    if (!activeFile) return;
    setSaving(true);
    try {
      const res = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeFile.path,
          content: activeFile.content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: '✔ Fichier enregistré avec succès !', success: true });
        setActiveFile({ ...activeFile, originalContent: activeFile.content });
        fetchFiles();
      } else {
        setStatusMessage({ text: `Erreur sauvegarde: ${data.error}`, success: false });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Erreur sauvegarde: ${e.message}`, success: false });
    } finally {
      setSaving(false);
    }
  };

  // Delete file or folder
  const handleDelete = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemPath = currentPath ? `${currentPath}/${file.name}` : file.name;
    const confirmMsg = file.isDirectory
      ? `Supprimer le dossier "${file.name}" et tout son contenu ?`
      : `Supprimer le fichier "${file.name}" ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: itemPath }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `✔ "${file.name}" supprimé`, success: true });
        fetchFiles();
        if (activeFile && activeFile.path === itemPath) {
          setActiveFile(null);
        }
      } else {
        setStatusMessage({ text: `Erreur suppression: ${data.error}`, success: false });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Erreur: ${e.message}`, success: false });
    }
  };

  // Execute a script file (.py, .js, .sh)
  const handleRunFile = async (file: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
    setExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/files/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fullPath }),
      });
      const data = await res.json();
      setExecutionResult({
        cmd: data.cmd || `run ${file.name}`,
        output: data.output || '(Aucune sortie)',
        success: data.success,
        exitCode: data.exitCode,
      });
    } catch (err: any) {
      setExecutionResult({
        cmd: `run ${file.name}`,
        output: `Erreur d'exécution: ${err.message}`,
        success: false,
        exitCode: 1,
      });
    } finally {
      setExecuting(false);
    }
  };

  // Create new item (file or folder)
  const handleCreateNew = async () => {
    if (!newItemName.trim() || !showCreateModal) return;

    try {
      const res = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName.trim(),
          isFolder: showCreateModal === 'folder',
          parentDir: currentPath,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `✔ ${showCreateModal === 'folder' ? 'Dossier' : 'Fichier'} créé !`, success: true });
        setShowCreateModal(null);
        setNewItemName('');
        fetchFiles();
      } else {
        setStatusMessage({ text: `Erreur: ${data.error}`, success: false });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Erreur: ${e.message}`, success: false });
    }
  };

  // Download whole workspace as ZIP
  const handleDownloadWorkspace = () => {
    window.location.href = '/api/files/download-zip';
  };

  // Helper icons for file types
  const getFileIcon = (file: FileItem) => {
    if (file.isDirectory) {
      return <Folder className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    const ext = file.ext;
    if (ext === '.py') {
      return <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-blue-400 bg-blue-500/10 rounded border border-blue-500/20 shrink-0">py</span>;
    }
    if (ext === '.js' || ext === '.mjs' || ext === '.ts') {
      return <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-amber-300 bg-amber-500/10 rounded border border-amber-500/20 shrink-0">js</span>;
    }
    if (ext === '.sh' || ext === '.bash') {
      return <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20 shrink-0">sh</span>;
    }
    if (ext === '.json' || ext === '.env') {
      return <span className="w-5 h-5 flex items-center justify-center font-bold text-xs text-purple-400 bg-purple-500/10 rounded border border-purple-500/20 shrink-0">{}</span>;
    }
    return <FileText className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  const isExecutable = (file: FileItem) => {
    return !file.isDirectory && ['.py', '.js', '.mjs', '.sh'].includes(file.ext);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 o';
    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="space-y-5">
      {/* Hidden file inputs for Android & Desktop */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        // @ts-ignore
        directory="true"
        multiple
        className="hidden"
        onChange={handleFolderUpload}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={handleZipUpload}
      />
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleMultiFileUpload}
      />

      {/* Hero Banner tailored for Android User */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-900 border border-blue-500/30 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Espace Android & Importateur de Dossiers de Code</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-semibold">
                  Android / PC
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Importez facilement vos dossiers de code entiers, scripts Python/Node/Bash ou archives ZIP directement depuis votre smartphone Android. Tous les fichiers sont conservés dans <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded text-xs font-mono">/tmp/workspace</code> et immédiatement exécutables !
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadWorkspace}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              title="Télécharger tout le projet sur votre téléphone"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exporter en ZIP</span>
            </button>
            <button
              onClick={() => setShowAndroidTips(!showAndroidTips)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showAndroidTips ? 'Masquer astuces' : 'Astuces Android'}</span>
            </button>
          </div>
        </div>

        {/* 3 Upload Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {/* Option 1: ZIP Upload (Best on Android) */}
          <button
            onClick={() => zipInputRef.current?.click()}
            disabled={uploading}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 text-left transition-all group hover:border-blue-400"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-300 group-hover:scale-105 transition-transform shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-blue-300">
                  1. Importer Archive ZIP
                </span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                  Recommandé Android
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Extrait automatiquement tous les dossiers et scripts de votre projet en 1 clic.
              </p>
            </div>
          </button>

          {/* Option 2: Folder Directory Picker */}
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={uploading}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-700 text-left transition-all group hover:border-slate-600"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white group-hover:text-amber-300">
                2. Importer Dossier Complet
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Sélectionnez un répertoire entier via Chrome Android ou votre navigateur.
              </p>
            </div>
          </button>

          {/* Option 3: Multiple Files */}
          <button
            onClick={() => multiFileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-700 text-left transition-all group hover:border-slate-600"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                3. Importer Fichiers (.py, .js, .sh)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Sélectionnez un ou plusieurs fichiers de code dans vos Téléchargements.
              </p>
            </div>
          </button>
        </div>

        {/* Uploading Progress Indicator */}
        {uploading && (
          <div className="mt-4 p-3 rounded-lg bg-blue-950/60 border border-blue-500/40 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
            <div className="text-xs text-blue-200">
              <strong>Importation et traitement en cours...</strong> Veuillez patienter pendant l'écriture et l'extraction des fichiers.
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center justify-between gap-3 ${
              statusMessage.success
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Android Tips Card (Collapsible) */}
      {showAndroidTips && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Comment importer des dossiers depuis Android facilement
              </h3>
            </div>
            <button
              onClick={() => setShowAndroidTips(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-blue-300">📱 Astuce 1 : Zipper sur Android</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ouvrez l'application <strong>« Fichiers »</strong> ou <strong>« Mes Fichiers »</strong> (Samsung/Google/Xiaomi). Maintenez le doigt sur votre dossier de code, appuyez sur les 3 points ou « Plus » puis <strong>« Compresser en .ZIP »</strong>. Importez ensuite ce ZIP avec le bouton 1 ci-dessus.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-emerald-300">📂 Astuce 2 : Où trouver vos fichiers</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Si vous avez reçu des scripts par WhatsApp, Telegram ou téléchargé un projet GitHub, ils se trouvent dans le dossier <strong>Téléchargements (Download)</strong> ou <strong>Documents</strong> de votre mémoire interne.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-semibold text-amber-300">⚡ Astuce 3 : Exécution & Terminal</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Une fois importé, cliquez sur le bouton vert <strong>« ▶ Lancer »</strong> sur n'importe quel fichier <code>.py</code> ou <code>.sh</code> pour l'exécuter immédiatement, ou utilisez le terminal Bash Google Run en tapant <code>cd /tmp/workspace</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Explorer & File Manager */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        {/* Explorer Header & Controls */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumbs Path */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 overflow-x-auto py-1">
            <button
              onClick={() => setCurrentPath('')}
              className={`hover:text-blue-400 flex items-center gap-1 px-1.5 py-0.5 rounded ${
                !currentPath ? 'text-white font-bold bg-slate-800' : 'text-slate-400'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>/tmp/workspace</span>
            </button>

            {breadcrumbs.map((crumb, idx) => {
              const crumbPath = breadcrumbs.slice(0, idx + 1).join('/');
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumbPath}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <button
                    onClick={() => setCurrentPath(crumbPath)}
                    className={`hover:text-blue-400 px-1.5 py-0.5 rounded truncate max-w-[120px] ${
                      isLast ? 'text-white font-bold bg-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {crumb}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowCreateModal('file');
                setNewItemName('');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Nouveau Fichier</span>
            </button>
            <button
              onClick={() => {
                setShowCreateModal('folder');
                setNewItemName('');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Nouveau Dossier</span>
            </button>
            <button
              onClick={() => fetchFiles()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Rafraîchir les fichiers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Files Table / List */}
        <div className="divide-y divide-slate-800/80 max-h-[420px] overflow-y-auto">
          {/* Parent directory link if nested */}
          {currentPath && (
            <div
              onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
              }}
              className="p-3 flex items-center gap-3 hover:bg-slate-800/50 cursor-pointer text-xs text-blue-400 font-medium transition-colors"
            >
              <CornerDownLeft className="w-4 h-4 text-blue-400 rotate-90 shrink-0" />
              <span>.. (Dossier parent)</span>
            </div>
          )}

          {files.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Folder className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">
                Ce dossier est vide
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Utilisez les boutons d'importation ci-dessus pour transférer vos scripts ou créez un fichier pour commencer.
              </p>
            </div>
          ) : (
            files.map((file) => {
              const executable = isExecutable(file);
              return (
                <div
                  key={file.name}
                  onClick={() => {
                    if (file.isDirectory) {
                      setCurrentPath(currentPath ? `${currentPath}/${file.name}` : file.name);
                    } else {
                      handleOpenFile(file);
                    }
                  }}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Left: Icon and Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file)}
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-blue-300 truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {file.isDirectory ? 'Dossier' : formatSize(file.size)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {executable && (
                      <button
                        onClick={(e) => handleRunFile(file, e)}
                        disabled={executing}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-medium border border-emerald-500/30 transition-all"
                        title="Exécuter ce script directement"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">Lancer</span>
                      </button>
                    )}

                    {!file.isDirectory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFile(file);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Éditer le fichier"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(file, e)}
                      className="p-1.5 rounded-md hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Execution Result Box */}
      {executionResult && (
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">
                $ {executionResult.cmd}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                  executionResult.success
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                }`}
              >
                {executionResult.success ? '✔ Succès (code 0)' : `✖ Erreur (code ${executionResult.exitCode ?? 1})`}
              </span>
            </div>
            <button
              onClick={() => setExecutionResult(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-black/60 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-48">
            {executionResult.output}
          </pre>
        </div>
      )}

      {/* In-Browser Code Editor Modal / Drawer */}
      {activeFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0b101b] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Editor Header */}
            <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                  {activeFile.path}
                </span>
                {activeFile.content !== activeFile.originalContent && (
                  <span className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">
                    Modifié
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveFile}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>

                <button
                  onClick={() => setActiveFile(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Textarea Area */}
            <div className="flex-1 p-3 sm:p-4 bg-[#070a11] overflow-hidden flex flex-col">
              <textarea
                value={activeFile.content}
                onChange={(e) => setActiveFile({ ...activeFile, content: e.target.value })}
                spellCheck={false}
                className="w-full flex-1 bg-transparent text-slate-100 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed p-2"
                placeholder="Entrez votre code ici..."
              />
            </div>

            {/* Editor Footer */}
            <div className="p-2.5 sm:px-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="font-mono text-[11px]">
                {activeFile.content.split('\n').length} lignes | {activeFile.content.length} caractères
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Chemin: /tmp/workspace/{activeFile.path}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {showCreateModal === 'folder' ? (
                  <>
                    <FolderPlus className="w-4 h-4 text-amber-400" />
                    <span>Créer un nouveau dossier</span>
                  </>
                ) : (
                  <>
                    <FilePlus className="w-4 h-4 text-emerald-400" />
                    <span>Créer un nouveau fichier</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowCreateModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">
                Nom {showCreateModal === 'folder' ? 'du dossier' : 'du fichier (ex: script.py, bot.js, test.sh)'}
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={showCreateModal === 'folder' ? 'mon_projet' : 'main.py'}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNew();
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
