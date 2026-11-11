import React, { useState } from 'react';
import { VaultEntry } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Star,
  Key,
  Globe,
  Server,
  FileText,
} from 'lucide-react';

interface EntryCardProps {
  entry: VaultEntry;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  showToast: (msg: string) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  showToast,
}) => {
  const [showPlain, setShowPlain] = useState(false);
  const [copied, setCopied] = useState(false);

  const getMainSecret = () => {
    if (entry.entry_type === 'apikey') return entry.api_key || '';
    if (entry.entry_type === 'login' || entry.entry_type === 'server') return entry.password || '';
    return entry.notes || '';
  };

  const secretText = getMainSecret();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!secretText) return;
    const ok = await copyToClipboard(secretText);
    if (ok) {
      setCopied(true);
      showToast(`已复制 ${entry.title} 的凭据`);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const getIcon = () => {
    switch (entry.entry_type) {
      case 'apikey':
        return <Key className="w-4 h-4 text-amber-500" />;
      case 'login':
        return <Globe className="w-4 h-4 text-indigo-500" />;
      case 'server':
        return <Server className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="group glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between gap-4 transition-all">
      {/* 1. 左侧：图标 + 标题 + 账号/标签 */}
      <div className="flex items-center space-x-3 min-w-[160px] max-w-[210px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
          {getIcon()}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-semibold truncate dark:text-white text-slate-800">
              {entry.title}
            </span>
            <button
              onClick={onToggleFavorite}
              className={`p-0.5 rounded transition-colors ${
                entry.favorite
                  ? 'text-amber-400'
                  : 'dark:text-white/20 text-slate-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            {entry.username && (
              <span className="text-[11px] dark:text-white/50 text-slate-400 truncate max-w-[120px]">
                {entry.username}
              </span>
            )}
            {entry.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.2 rounded dark:bg-indigo-500/20 bg-indigo-50 dark:text-indigo-300 text-indigo-600 font-mono border dark:border-transparent border-indigo-200/50"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 中间：密钥显示框（带眼睛切换） */}
      <div className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border dark:bg-black/40 bg-slate-100/80 dark:border-white/10 border-slate-200/80 min-w-0">
        <div className="font-mono text-xs truncate select-text dark:text-amber-200 text-amber-700">
          {showPlain ? (
            secretText || <span className="dark:text-white/30 text-slate-400 font-sans">空</span>
          ) : (
            <span className="dark:text-white/60 text-slate-500 tracking-wider">
              {secretText ? '••••••••••••••••••••••••' : '未设置'}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowPlain(!showPlain)}
          title={showPlain ? '隐藏' : '显示明文'}
          className="ml-2 dark:text-white/40 text-slate-400 hover:dark:text-white hover:text-slate-700 transition-colors shrink-0"
        >
          {showPlain ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3. 右侧：直接一键复制 + 操作按钮 */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={handleCopy}
          disabled={!secretText}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 ${
            copied
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '已复制！' : '复制'}</span>
        </button>

        <button
          onClick={onEdit}
          title="编辑"
          className="p-1.5 rounded-lg dark:text-white/40 text-slate-400 hover:dark:text-white hover:text-slate-800 hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          title="删除"
          className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
