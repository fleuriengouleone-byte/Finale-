import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Download, Check, ShieldAlert } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  linkText: string;
  protocol: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  linkText,
  protocol,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && linkText) {
      QRCode.toDataURL(linkText, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('Erreur génération QR code', err));
    }
  }, [isOpen, linkText]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${protocol.toLowerCase()}-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {protocol.toUpperCase()} QR CODE
          </span>
          <h3 className="text-lg font-bold text-white pt-1">{title}</h3>
          <p className="text-xs text-slate-400">
            Scannez directement depuis votre application mobile (v2rayNG, Sing-box, NekoBox)
          </p>
        </div>

        {/* QR Canvas Container */}
        <div className="p-3 bg-white rounded-xl shadow-inner inline-block mx-auto border-2 border-slate-700">
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code" className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-500">
              Génération du QR Code...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-900/30 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Lien Copié !' : 'Copier le lien'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
            title="Télécharger l'image PNG"
          >
            <Download className="w-4 h-4" />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
