import React from 'react';
import { VaultEntry } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import {
  Search,
  Plus,
  Copy,
  Check,
  Key,
  Globe,
  Server,
  FileText,
  Star,
} from 'lucide-react';

interface EntryListProps {
  entries: VaultEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddNew: () => void;
  showToast: (msg: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  searchQuery,
  onSearchChange,
  onAddNew,
  showToast,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleQuickCopy = async (e: React.MouseEvent, entry: VaultEntry) => {
    e.stopPropagation();
    let textToCopy = '';
    let label = '';

    if (entry.entry_type === 'apikey') {
      textToCopy = entry.api_key || '';
      label = '密钥';
    } else if (entry.entry_type === 'login' || entry.entry_type === 'server') {
      textToCopy = entry.password || '';
      label = '密码';
    } else {
      textToCopy = entry.notes || '';
      label = '备忘';
    }

    if (!textToCopy) return;

    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedId(entry.id);
      showToast(`已复制 ${entry.title} 的${label}`);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'apikey':
        return <Key className="w-4 h-4 text-amber-300" />;
      case 'login':
        return <Globe className="w-4 h-4 text-indigo-300" />;
      case 'server':
        return <Server className="w-4 h-4 text-emerald-300" />;
      default:
        return <FileText className="w-4 h-4 text-sky-300" />;
    }
  };

  return (
    <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col h-full select-none">
      {/* 搜索与新增 */}
      <div className="p-3.5 border-b border-white/10 space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索名称、密钥、标签..."
            className="w-full pl-9 pr-3.5 py-2 glass-input rounded-xl text-xs text-white placeholder-white/40 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={onAddNew}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增凭据 / API Key</span>
        </button>
      </div>

      {/* 条目列表 */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {entries.length === 0 ? (
          <div className="py-14 text-center text-white/40 text-xs">
            没有找到匹配的凭据
          </div>
        ) : (
          entries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const isCopied = copiedId === entry.id;

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className={`group relative flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'glass-active'
                    : 'glass-card glass-card-hover'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    {getEntryIcon(entry.entry_type)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                        {entry.title}
                      </span>
                      {entry.favorite && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-white/50 font-mono truncate max-w-[150px] mt-0.5">
                      {entry.entry_type === 'apikey' && (entry.api_key ? 'sk-••••••••' : '无 key')}
                      {entry.entry_type === 'login' && (entry.username || '••••••')}
                      {entry.entry_type === 'server' && (entry.host || '127.0.0.1')}
                      {entry.entry_type === 'note' && (entry.notes?.slice(0, 20) || '安全备忘')}
                    </div>
                  </div>
                </div>

                {/* 列表快捷一键复制小按钮 */}
                <button
                  onClick={(e) => handleQuickCopy(e, entry)}
                  title="一键快捷复制明文"
                  className={`p-1.5 rounded-xl transition-all ${
                    isCopied
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-white/20 text-white/60 hover:text-white'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
