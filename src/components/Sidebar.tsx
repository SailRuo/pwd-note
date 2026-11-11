import React from 'react';
import { EntryType } from '../types';
import {
  ShieldCheck,
  Key,
  Globe,
  Server,
  FileText,
  Star,
  Folder,
  Lock,
  Download,
  Upload,
} from 'lucide-react';

export type CategoryFilter = 'all' | 'favorite' | EntryType;

interface SidebarProps {
  currentCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  counts: {
    all: number;
    favorite: number;
    apikey: number;
    login: number;
    server: number;
    note: number;
  };
  onLock: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  allTags,
  counts,
  onLock,
  onExport,
  onImport,
}) => {
  const navItems: { id: CategoryFilter; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: '全部凭据',
      icon: <Folder className="w-4 h-4 text-slate-400" />,
      count: counts.all,
    },
    {
      id: 'favorite',
      label: '星标收藏',
      icon: <Star className="w-4 h-4 text-amber-400" />,
      count: counts.favorite,
    },
    {
      id: 'apikey',
      label: 'API Keys',
      icon: <Key className="w-4 h-4 text-amber-400" />,
      count: counts.apikey,
    },
    {
      id: 'login',
      label: '账号密码',
      icon: <Globe className="w-4 h-4 text-indigo-400" />,
      count: counts.login,
    },
    {
      id: 'server',
      label: '服务器',
      icon: <Server className="w-4 h-4 text-emerald-400" />,
      count: counts.server,
    },
    {
      id: 'note',
      label: '安全备忘',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      count: counts.note,
    },
  ];

  return (
    <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none">
      {/* App Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">PwdNote</h1>
            <p className="text-[10px] text-slate-500">端到端凭据保险箱</p>
          </div>
        </div>

        <button
          onClick={onLock}
          title="立即锁定保险箱"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-2 text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-2">
            凭据库
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = currentCategory === item.id && selectedTag === null;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id);
                    onSelectTag(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <div className="px-2 text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-2 flex items-center justify-between">
              <span>标签分类</span>
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 lowercase"
                >
                  清除
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(active ? null : tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作与备份 */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button
          onClick={onExport}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出加密备份</span>
        </button>
        <button
          onClick={onImport}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 text-xs transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>导入备份数据</span>
        </button>
      </div>
    </div>
  );
};
