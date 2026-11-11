import React from 'react';
import { EntryType } from '../types';
import {
  Key,
  Globe,
  Server,
  FileText,
  Star,
  Folder,
  Lock,
  Download,
  Upload,
  Sun,
  Moon,
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
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
  onLock,
  onExport,
  onImport,
}) => {
  const isDark = theme === 'dark';

  const navItems: { id: CategoryFilter; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: '全部凭据',
      icon: <Folder className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-500'}`} />,
      count: counts.all,
    },
    {
      id: 'favorite',
      label: '星标收藏',
      icon: <Star className="w-4 h-4 text-amber-500" />,
      count: counts.favorite,
    },
    {
      id: 'apikey',
      label: 'API Keys',
      icon: <Key className="w-4 h-4 text-amber-500" />,
      count: counts.apikey,
    },
    {
      id: 'login',
      label: '账号密码',
      icon: <Globe className="w-4 h-4 text-indigo-500" />,
      count: counts.login,
    },
    {
      id: 'server',
      label: '服务器',
      icon: <Server className="w-4 h-4 text-emerald-500" />,
      count: counts.server,
    },
    {
      id: 'note',
      label: '安全备忘',
      icon: <FileText className="w-4 h-4 text-sky-500" />,
      count: counts.note,
    },
  ];

  return (
    <div
      className={`w-56 border-r flex flex-col h-full select-none transition-colors duration-200 ${
        isDark
          ? 'bg-black/30 backdrop-blur-2xl border-white/10 text-white'
          : 'bg-white/70 backdrop-blur-2xl border-slate-200/80 text-slate-800'
      }`}
    >
      {/* App Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <img
            src="/logo.png"
            alt="PwdNote"
            className="w-8 h-8 rounded-xl shadow-md border border-white/20 object-cover"
          />
          <div>
            <h1 className="text-sm font-bold tracking-wider">PwdNote</h1>
            <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              极简凭据保险箱
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* 主题切换开关 */}
          <button
            onClick={onToggleTheme}
            title={isDark ? '切换为浅色主题' : '切换为深色主题'}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* 锁屏 */}
          <button
            onClick={onLock}
            title="立即锁定"
            className={`p-1.5 rounded-xl transition-colors ${
              isDark
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        <div>
          <div
            className={`px-3 text-[10px] font-semibold tracking-wider uppercase mb-2 ${
              isDark ? 'text-white/40' : 'text-slate-400'
            }`}
          >
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'glass-active font-semibold shadow-sm ' + (isDark ? 'text-white' : 'text-indigo-600')
                      : isDark
                      ? 'text-white/70 hover:bg-white/10 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active
                        ? isDark
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-600/10 text-indigo-600'
                        : isDark
                        ? 'text-white/40'
                        : 'text-slate-400'
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
            <div
              className={`px-3 text-[10px] font-semibold tracking-wider uppercase mb-2 flex items-center justify-between ${
                isDark ? 'text-white/40' : 'text-slate-400'
              }`}
            >
              <span>标签分类</span>
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-[10px] text-indigo-400 hover:underline lowercase"
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
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-sm'
                        : isDark
                        ? 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        : 'bg-slate-200/50 text-slate-600 border-slate-300/60 hover:bg-slate-200 hover:text-slate-900'
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
      <div
        className={`p-3 border-t space-y-1 ${
          isDark ? 'border-white/10' : 'border-slate-200/80'
        }`}
      >
        <button
          onClick={onExport}
          className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs transition-colors ${
            isDark
              ? 'text-white/50 hover:text-white hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出加密备份</span>
        </button>
        <button
          onClick={onImport}
          className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs transition-colors ${
            isDark
              ? 'text-white/50 hover:text-white hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>导入备份数据</span>
        </button>
      </div>
    </div>
  );
};
