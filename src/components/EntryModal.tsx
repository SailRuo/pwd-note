import React, { useState, useEffect } from 'react';
import { VaultEntry, EntryType } from '../types';
import { generatePassword } from '../utils/generator';
import { Key, Globe, FileText, Server, RefreshCw, X, Eye, EyeOff } from 'lucide-react';

interface EntryModalProps {
  initialData?: VaultEntry | null;
  defaultType?: EntryType;
  onSave: (entry: VaultEntry) => void;
  onClose: () => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  initialData,
  defaultType = 'apikey',
  onSave,
  onClose,
}) => {
  const [entryType, setEntryType] = useState<EntryType>(
    initialData?.entry_type || defaultType
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // 账号密码
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [url, setUrl] = useState(initialData?.url || '');

  // API Key 专属
  const [apiKey, setApiKey] = useState(initialData?.api_key || '');

  // 服务器
  const [host, setHost] = useState(initialData?.host || '');
  const [port, setPort] = useState(initialData?.port ? String(initialData.port) : '22');

  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // 监听键盘 ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 快捷生成密码
  const handleGeneratePassword = () => {
    const pwd = generatePassword({
      length: 20,
      useUpper: true,
      useLower: true,
      useNumbers: true,
      useSymbols: true,
      excludeAmbiguous: true,
    });
    if (entryType === 'apikey') {
      setApiKey(pwd);
      setShowApiKey(true);
    } else {
      setPassword(pwd);
      setShowPassword(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const entry: VaultEntry = {
      id: initialData?.id || crypto.randomUUID(),
      title: title.trim(),
      entry_type: entryType,
      tags,
      favorite: initialData?.favorite || false,
      notes: notes.trim() || undefined,
      username: username.trim() || undefined,
      password: password || undefined,
      url: url.trim() || undefined,
      api_key: apiKey.trim() || undefined,
      host: host.trim() || undefined,
      port: port ? parseInt(port, 10) : undefined,
      created_at: initialData?.created_at || Date.now(),
      updated_at: Date.now(),
    };

    onSave(entry);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* 1. Header (固定顶部) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b dark:border-white/10 border-slate-200/80 shrink-0">
          <h3 className="text-base font-bold dark:text-white text-slate-800 tracking-wide">
            {initialData ? '编辑凭据' : '新增凭据'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl dark:text-white/60 text-slate-400 hover:dark:text-white hover:text-slate-700 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 类型切换 Tabs (固定) */}
        <div className="px-6 pt-3.5 pb-2 shrink-0">
          <div className="grid grid-cols-4 gap-1 p-1 dark:bg-black/25 bg-slate-100 rounded-2xl text-xs font-medium border dark:border-white/10 border-slate-200/60">
            <button
              type="button"
              onClick={() => setEntryType('apikey')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
                entryType === 'apikey'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'dark:text-white/60 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Key</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('login')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
                entryType === 'login'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'dark:text-white/60 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>账号密码</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('server')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
                entryType === 'server'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'dark:text-white/60 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>服务器</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('note')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
                entryType === 'note'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'dark:text-white/60 text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>安全备忘</span>
            </button>
          </div>
        </div>

        {/* 3. 表单内容 (可滚动区，紧凑排布) */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
          {/* 标题 */}
          <div>
            <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">
              平台或凭据名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={entryType === 'apikey' ? '例如：OpenAI, DeepSeek, GitHub' : '例如：Google 账号, 微信, 邮箱'}
              className="w-full px-3.5 py-2 glass-input rounded-xl focus:outline-none text-xs transition-colors"
            />
          </div>

          {/* API Key 专属表单 */}
          {entryType === 'apikey' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium dark:text-white/70 text-slate-600">API Key 密钥</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[11px] text-indigo-500 hover:text-indigo-600 flex items-center space-x-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>随机生成</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-... 或其他密钥"
                  className="w-full px-3.5 py-2 pr-10 glass-input rounded-xl dark:text-amber-200 text-amber-700 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 dark:text-white/50 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* 账号密码专属表单 */}
          {entryType === 'login' && (
            <>
              <div>
                <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">网址或平台</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com"
                  className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">账号 / 用户名 / 邮箱</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium dark:text-white/70 text-slate-600">密码</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-indigo-500 hover:text-indigo-600 flex items-center space-x-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>随机强密码</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 pr-10 glass-input rounded-xl font-mono text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 dark:text-white/50 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 服务器专属表单 */}
          {entryType === 'server' && (
            <>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">主机 IP / 域名</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="192.168.1.100 或 server.com"
                    className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">端口</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="22"
                    className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="root / ubuntu"
                  className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">连接密码 / 私钥</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 glass-input rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 标签 */}
          <div>
            <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">
              标签（多个标签用逗号隔开）
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：ai, work, dev"
              className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">
              {entryType === 'note' ? '安全笔记正文' : '备注 (选填)'}
            </label>
            <textarea
              rows={entryType === 'note' ? 4 : 2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录额外备注或备用信息..."
              className="w-full px-3.5 py-2 glass-input rounded-xl text-xs focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* 4. Footer 操作底栏 (永久吸底固定，绝不被遮挡！) */}
        <div className="px-6 py-3 border-t dark:border-white/10 border-slate-200/80 flex items-center justify-end space-x-3 shrink-0 dark:bg-black/10 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium dark:text-white/70 text-slate-600 hover:text-slate-900 glass-btn rounded-xl transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-md transition-all active:scale-95"
          >
            保存凭据
          </button>
        </div>
      </form>
    </div>
  );
};
