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
      label = 'API Key';
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
      showToast(`已快捷复制 ${entry.title} 的${label}`);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'apikey':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'login':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'server':
        return <Server className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* 搜索与新增 */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索标题、账号、标签..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={onAddNew}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增凭据 / API Key</span>
        </button>
      </div>

      {/* 条目列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {entries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
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
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-800/90 border-slate-700 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
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
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-[150px] mt-0.5">
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
                  className={`p-1.5 rounded-lg transition-all ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-white'
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
