import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { VaultEntry } from './types';
import { CategoryFilter, Sidebar } from './components/Sidebar';
import { EntryList } from './components/EntryList';
import { EntryDetail } from './components/EntryDetail';
import { EntryModal } from './components/EntryModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Plus, Key } from 'lucide-react';

export default function App() {
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // 过滤与搜索
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);

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
      showToast('保险箱创建成功！已开启 AES-256 加密保护');
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
      if (data && data.length > 0) {
        setSelectedEntryId(data[0].id);
      }
      showToast('保险箱已解锁');
      return true;
    } catch (err) {
      console.error(err);
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
      showToast(`已更新凭据：${entry.title}`);
    } else {
      updated = [entry, ...entries];
      showToast(`已新增凭据：${entry.title}`);
    }
    await persistEntries(updated);
    setSelectedEntryId(entry.id);
    setModalOpen(false);
    setEditingEntry(null);
  };

  // 删除条目
  const handleDeleteEntry = async (id: string) => {
    if (!confirm('确定要永久删除此凭据吗？')) return;
    const updated = entries.filter((e) => e.id !== id);
    await persistEntries(updated);
    if (selectedEntryId === id) {
      setSelectedEntryId(updated.length > 0 ? updated[0].id : null);
    }
    showToast('凭据已删除');
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
    setSelectedEntryId(null);
    showToast('保险箱已锁定');
  };

  // 导出备份
  const handleExportBackup = async () => {
    const defaultPath = prompt('请输入导出备份文件的绝对路径（如 /Users/xxx/backup.enc）：');
    if (!defaultPath) return;
    try {
      await invoke('export_vault_backup', {
        password: masterPassword,
        targetPath: defaultPath,
      });
      showToast('备份文件导出成功！');
    } catch (err) {
      alert('导出失败: ' + err);
    }
  };

  // 导入备份
  const handleImportBackup = async () => {
    const importPath = prompt('请输入要导入的备份文件路径：');
    if (!importPath) return;
    try {
      const imported = await invoke<VaultEntry[]>('import_vault_backup', {
        password: masterPassword,
        importPath,
      });
      setEntries(imported);
      if (imported.length > 0) setSelectedEntryId(imported[0].id);
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

  // 过滤后的列表
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 分类过滤
      if (currentCategory === 'favorite' && !entry.favorite) return false;
      if (
        currentCategory !== 'all' &&
        currentCategory !== 'favorite' &&
        entry.entry_type !== currentCategory
      )
        return false;

      // 标签过滤
      if (selectedTag && !entry.tags?.includes(selectedTag)) return false;

      // 关键字搜索
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

  // 当前选中的条目对象
  const selectedEntry = useMemo(() => {
    return entries.find((e) => e.id === selectedEntryId) || null;
  }, [entries, selectedEntryId]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* 锁屏与初始化 Modal */}
      {!isUnlocked && (
        <AuthModal
          isInitialized={isInitialized}
          onUnlock={handleUnlock}
          onInit={handleInit}
        />
      )}

      {/* 侧边栏 */}
      <Sidebar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        allTags={allTags}
        counts={counts}
        onLock={handleLock}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
      />

      {/* 列表栏 */}
      <EntryList
        entries={filteredEntries}
        selectedEntryId={selectedEntryId}
        onSelectEntry={setSelectedEntryId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={() => {
          setEditingEntry(null);
          setModalOpen(true);
        }}
        showToast={showToast}
      />

      {/* 详情展示与复制主面板 */}
      {selectedEntry ? (
        <EntryDetail
          entry={selectedEntry}
          onEdit={() => {
            setEditingEntry(selectedEntry);
            setModalOpen(true);
          }}
          onDelete={() => handleDeleteEntry(selectedEntry.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedEntry.id)}
          showToast={showToast}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Key className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-white">没有选中的凭据</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
            点击左侧列表查看凭据详情，或点击下方按钮添加你的第一个 API Key 或账号密码。
          </p>
          <button
            onClick={() => {
              setEditingEntry(null);
              setModalOpen(true);
            }}
            className="mt-5 flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新增凭据</span>
          </button>
        </div>
      )}

      {/* 新增/编辑 Modal */}
      {modalOpen && (
        <EntryModal
          initialData={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => {
            setModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* 快捷消息提示 Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
