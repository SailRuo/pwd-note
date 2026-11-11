import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { VaultEntry } from './types';
import { CategoryFilter, Sidebar } from './components/Sidebar';
import { EntryCard } from './components/EntryCard';
import { EntryModal } from './components/EntryModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';
import { Plus, Search, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);

  // 主题：dark / light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('pwd_theme') as 'dark' | 'light') || 'light';
  });

  // 同步切换 HTML root 属性
  useEffect(() => {
    localStorage.setItem('pwd_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 过滤与搜索
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<VaultEntry | null>(null);

  // Toast 消息
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 检查是否已初始化
  useEffect(() => {
    async function checkInit() {
      try {
        const initialized = await invoke<boolean>('is_vault_initialized');
        setIsInitialized(initialized);
      } catch (err) {
        console.error('检查初始化失败:', err);
      }
    }
    checkInit();
  }, []);

  // 初始化保险箱
  const handleInit = async (password: string): Promise<boolean> => {
    try {
      await invoke('init_vault', { password });
      setMasterPassword(password);
      setIsInitialized(true);
      setIsUnlocked(true);
      setEntries([]);
      showToast('保险箱已创建并启用 AES-256 加密');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // 解锁保险箱
  const handleUnlock = async (password: string): Promise<boolean> => {
    try {
      const data = await invoke<VaultEntry[]>('unlock_vault', { password });
      setMasterPassword(password);
      setEntries(data || []);
      setIsUnlocked(true);
      showToast('保险箱已解锁（已启用 Touch ID 指纹秒开）');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Touch ID 指纹解锁
  const handleTouchIdUnlock = async (): Promise<boolean> => {
    try {
      const res = await invoke<{ master_password: string; entries: VaultEntry[] }>(
        'unlock_with_touch_id'
      );
      setMasterPassword(res.master_password);
      setEntries(res.entries || []);
      setIsUnlocked(true);
      showToast('Touch ID 验证通过，已解锁');
      return true;
    } catch (err) {
      console.error('Touch ID 解锁失败:', err);
      return false;
    }
  };

  // 保存数据到后端
  const persistEntries = async (newEntries: VaultEntry[]) => {
    try {
      await invoke('save_entries', {
        password: masterPassword,
        entries: newEntries,
      });
      setEntries(newEntries);
    } catch (err) {
      console.error('保存失败:', err);
      showToast('保存到加密文件失败！');
    }
  };

  // 保存 / 更新条目
  const handleSaveEntry = async (entry: VaultEntry) => {
    let updated: VaultEntry[];
    const exists = entries.some((e) => e.id === entry.id);
    if (exists) {
      updated = entries.map((e) => (e.id === entry.id ? entry : e));
      showToast(`已更新：${entry.title}`);
    } else {
      updated = [entry, ...entries];
      showToast(`已新增：${entry.title}`);
    }
    await persistEntries(updated);
    setModalOpen(false);
    setEditingEntry(null);
  };

  // 删除确认
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    const id = entryToDelete.id;
    const title = entryToDelete.title;
    const updated = entries.filter((e) => e.id !== id);
    await persistEntries(updated);
    setEntryToDelete(null);
    showToast(`凭据「${title}」已删除`);
  };

  // 切换收藏
  const handleToggleFavorite = async (id: string) => {
    const updated = entries.map((e) =>
      e.id === id ? { ...e, favorite: !e.favorite } : e
    );
    await persistEntries(updated);
  };

  // 锁定保险箱
  const handleLock = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setEntries([]);
    showToast('已锁定');
  };

  // 导出备份
  const handleExportBackup = async () => {
    const defaultPath = prompt('请输入导出备份路径（如 /Users/xxx/backup.enc）：');
    if (!defaultPath) return;
    try {
      await invoke('export_vault_backup', {
        password: masterPassword,
        targetPath: defaultPath,
      });
      showToast('备份导出成功！');
    } catch (err) {
      alert('导出失败: ' + err);
    }
  };

  // 导入备份
  const handleImportBackup = async () => {
    const importPath = prompt('请输入备份文件路径：');
    if (!importPath) return;
    try {
      const imported = await invoke<VaultEntry[]>('import_vault_backup', {
        password: masterPassword,
        importPath,
      });
      setEntries(imported);
      showToast('备份恢复成功！');
    } catch (err) {
      alert('导入失败: ' + err);
    }
  };

  // 计算所有的 tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [entries]);

  // 计算计数
  const counts = useMemo(() => {
    return {
      all: entries.length,
      favorite: entries.filter((e) => e.favorite).length,
      apikey: entries.filter((e) => e.entry_type === 'apikey').length,
      login: entries.filter((e) => e.entry_type === 'login').length,
      server: entries.filter((e) => e.entry_type === 'server').length,
      note: entries.filter((e) => e.entry_type === 'note').length,
    };
  }, [entries]);

  // 计算当前默认新增类型与按钮文案
  const defaultNewType = useMemo(() => {
    if (
      currentCategory === 'login' ||
      currentCategory === 'apikey' ||
      currentCategory === 'server' ||
      currentCategory === 'note'
    ) {
      return currentCategory;
    }
    return 'apikey';
  }, [currentCategory]);

  const newButtonLabel = useMemo(() => {
    switch (currentCategory) {
      case 'apikey':
        return '新增 API Key';
      case 'login':
        return '新增账号密码';
      case 'server':
        return '新增服务器';
      case 'note':
        return '新增安全备忘';
      default:
        return '新增凭据';
    }
  }, [currentCategory]);

  // 过滤后的列表
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (currentCategory === 'favorite' && !entry.favorite) return false;
      if (
        currentCategory !== 'all' &&
        currentCategory !== 'favorite' &&
        entry.entry_type !== currentCategory
      )
        return false;

      if (selectedTag && !entry.tags?.includes(selectedTag)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = entry.title.toLowerCase().includes(q);
        const inUsername = entry.username?.toLowerCase().includes(q);
        const inTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
        const inNotes = entry.notes?.toLowerCase().includes(q);
        const inHost = entry.host?.toLowerCase().includes(q);
        return inTitle || inUsername || inTags || inNotes || inHost;
      }

      return true;
    });
  }, [entries, currentCategory, selectedTag, searchQuery]);

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative flex h-screen w-screen overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-[#131522] via-[#0e101a] to-[#0a0b12] text-white'
          : 'bg-gradient-to-br from-[#f8fafc] via-[#eef2f9] to-[#e2e8f0] text-slate-800'
      }`}
    >
      {/* 锁屏与初始化 Modal */}
      {!isUnlocked && (
        <AuthModal
          isInitialized={isInitialized}
          onUnlock={handleUnlock}
          onInit={handleInit}
          onTouchIdUnlock={handleTouchIdUnlock}
        />
      )}

      {/* 1. 左侧紧凑侧边栏 */}
      <div className="relative z-10 flex h-full shrink-0">
        <Sidebar
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          allTags={allTags}
          counts={counts}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLock={handleLock}
          onExport={handleExportBackup}
          onImport={handleImportBackup}
        />
      </div>

      {/* 2. 右侧全宽直观卡片流 */}
      <div
        className={`relative z-10 flex-1 flex flex-col h-full overflow-hidden transition-colors ${
          isDark ? 'bg-black/10' : 'bg-white/30'
        }`}
      >
        {/* 顶部搜索与操作栏 */}
        <div
          className={`p-4 border-b flex items-center justify-between gap-4 ${
            isDark ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="快速搜索密钥、平台、标签..."
              className={`w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs focus:outline-none transition-all ${
                isDark ? 'placeholder-white/40' : 'placeholder-slate-400'
              }`}
            />
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                isDark ? 'text-white/40' : 'text-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span
              className={`text-xs font-mono ${
                isDark ? 'text-white/40' : 'text-slate-500'
              }`}
            >
              共 {filteredEntries.length} 项
            </span>
            <button
              onClick={() => {
                setEditingEntry(null);
                setModalOpen(true);
              }}
              className="flex items-center space-x-1.5 py-2 px-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{newButtonLabel}</span>
            </button>
          </div>
        </div>

        {/* 凭据卡片列表流 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredEntries.length === 0 ? (
            <div
              className={`h-full flex flex-col items-center justify-center p-8 text-center ${
                isDark ? 'text-white/40' : 'text-slate-400'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-xs">当前没有找到相关凭据</p>
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setModalOpen(true);
                }}
                className="mt-3 text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
              >
                + 点击{newButtonLabel}
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry);
                  setModalOpen(true);
                }}
                onDelete={() => setEntryToDelete(entry)}
                onToggleFavorite={() => handleToggleFavorite(entry.id)}
                showToast={showToast}
              />
            ))
          )}
        </div>
      </div>

      {/* 新增/编辑 Modal */}
      {modalOpen && (
        <EntryModal
          initialData={editingEntry}
          defaultType={defaultNewType}
          onSave={handleSaveEntry}
          onClose={() => {
            setModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* 删除二次确认 Modal */}
      {entryToDelete && (
        <ConfirmModal
          title={`删除「${entryToDelete.title}」？`}
          message="此操作将从加密保险箱中永久抹除该凭据，无法找回。"
          onConfirm={handleConfirmDelete}
          onCancel={() => setEntryToDelete(null)}
        />
      )}

      {/* 消息 Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
