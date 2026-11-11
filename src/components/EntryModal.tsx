import React, { useState } from 'react';
import { VaultEntry, EntryType } from '../types';
import { generatePassword } from '../utils/generator';
import { Key, Globe, FileText, Server, RefreshCw, X, Eye, EyeOff } from 'lucide-react';

interface EntryModalProps {
  initialData?: VaultEntry | null;
  onSave: (entry: VaultEntry) => void;
  onClose: () => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [entryType, setEntryType] = useState<EntryType>(initialData?.entry_type || 'apikey');
  const [title, setTitle] = useState(initialData?.title || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // 账号密码
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [url, setUrl] = useState(initialData?.url || '');

  // API Key 专属
  const [apiKey, setApiKey] = useState(initialData?.api_key || '');
  const [apiSecret, setApiSecret] = useState(initialData?.api_secret || '');
  const [baseUrl, setBaseUrl] = useState(initialData?.base_url || '');

  // 服务器
  const [host, setHost] = useState(initialData?.host || '');
  const [port, setPort] = useState(initialData?.port ? String(initialData.port) : '22');

  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

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
      api_secret: apiSecret.trim() || undefined,
      base_url: baseUrl.trim() || undefined,
      host: host.trim() || undefined,
      port: port ? parseInt(port, 10) : undefined,
      created_at: initialData?.created_at || Date.now(),
      updated_at: Date.now(),
    };

    onSave(entry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">
            {initialData ? '编辑凭据' : '新增凭据'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 类型切换 Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800/60 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setEntryType('apikey')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
                entryType === 'apikey'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Key</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('login')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
                entryType === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>账号密码</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('server')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
                entryType === 'server'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>服务器</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('note')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
                entryType === 'note'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>安全备忘</span>
            </button>
          </div>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              名称 / 平台名称 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={entryType === 'apikey' ? '如：OpenAI, DeepSeek, AWS Prod' : '如：GitHub, Google, 个人邮箱'}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* API Key 专属表单 */}
          {entryType === 'apikey' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">API Key / Token</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>随机生成</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full px-3.5 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Secret Key / 辅密钥 (选填)
                </label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="适用于部分双密钥服务（如 AWS Secret, 百度千帆等）"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Base URL / API Endpoint (选填)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* 账号密码专属表单 */}
          {entryType === 'login' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">网址或应用</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">账号 / 邮箱 / 用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username@domain.com"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">密码</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
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
                    className="w-full px-3.5 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 服务器表单 */}
          {entryType === 'server' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">主机 Host / IP</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="192.168.1.100 或 server.com"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">端口</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="22"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="root / ubuntu"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">密码或连接凭据</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {/* 标签 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              标签（多个标签用逗号隔开）
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：ai, work, dev, personal"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {entryType === 'note' ? '安全笔记内容' : '额外备注 / 备用代码'}
            </label>
            <textarea
              rows={entryType === 'note' ? 6 : 3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="支持记录多行文本、私钥或备用信息..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              保存凭据
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
