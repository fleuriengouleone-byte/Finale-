import React, { useState } from 'react';
import { X, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { VlessAccount } from '../types/vless';

interface ExtendModalProps {
  account: VlessAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExtendModal: React.FC<ExtendModalProps> = ({
  account,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const currentExp = new Date(account.expiresAt).getTime();
  const baseTime = currentExp > Date.now() ? currentExp : Date.now();
  const newExpirationDate = new Date(baseTime + days * 86400000);

  const handleExtend = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('vless_token');
      const response = await fetch(`/api/accounts/${account.id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ days }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la prolongation');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible de prolonger le compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Prolonger l'expiration</h3>
          </div>
          <p className="text-xs text-slate-400">
            Client : <strong className="text-slate-200">{account.clientName}</strong>
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Ajouter du temps</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[7, 15, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  days === d
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                +{d} jours
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Ou durée personnalisée :</span>
            <input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono text-xs"
            />
            <span className="text-xs text-slate-400">jours</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Expiration actuelle :</span>
            <span className="font-mono text-slate-300">
              {new Date(account.expiresAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex justify-between text-amber-400 font-bold">
            <span>Nouvelle expiration :</span>
            <span className="font-mono">
              {newExpirationDate.toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleExtend}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Confirmer la prolongation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
