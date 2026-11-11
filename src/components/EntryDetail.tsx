import React, { useState } from 'react';
import { VaultEntry } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { formatEnvExport, formatCurlHeader } from '../utils/generator';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Star,
  ExternalLink,
  Terminal,
  Shield,
  Key,
  Globe,
  Server,
  FileText,
} from 'lucide-react';

interface EntryDetailProps {
  entry: VaultEntry;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  showToast: (msg: string) => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  showToast,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string | undefined, fieldName: string, label: string) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldName);
      showToast(`已复制${label}到剪贴板（30秒后自动清理）`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getTypeIcon = () => {
    switch (entry.entry_type) {
      case 'apikey':
        return <Key className="w-5 h-5 text-amber-400" />;
      case 'login':
        return <Globe className="w-5 h-5 text-indigo-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-400" />;
      case 'note':
        return <FileText className="w-5 h-5 text-sky-400" />;
    }
  };

  const getTypeName = () => {
    switch (entry.entry_type) {
      case 'apikey':
        return 'API Key 凭据';
      case 'login':
        return '账号密码';
      case 'server':
        return '服务器 SSH';
      case 'note':
        return '安全备忘';
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 bg-slate-900/60">
      {/* 顶部标题与操作栏 */}
      <div className="flex items-start justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shadow-inner">
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{entry.title}</h2>
              <button
                onClick={onToggleFavorite}
                className={`p-1 rounded-lg transition-colors ${
                  entry.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                {getTypeName()}
              </span>
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 顶部按钮 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>编辑</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除</span>
          </button>
        </div>
      </div>

      {/* 核心字段展示与一键复制区域 */}
      <div className="mt-6 space-y-5 max-w-2xl">
        {/* 1. API Key 特化字段 */}
        {entry.entry_type === 'apikey' && (
          <>
            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">API Key (核心凭据)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSecret ? '隐藏明文' : '显示明文'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(entry.api_key, 'api_key', ' API Key ')}
                    className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
                  >
                    {copiedField === 'api_key' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'api_key' ? '已复制！' : '复制 Key'}</span>
                  </button>
                </div>
              </div>
              <div className="px-3.5 py-2.5 bg-slate-900 rounded-xl font-mono text-sm text-amber-200 break-all select-text border border-slate-800">
                {showSecret
                  ? entry.api_key || <span className="text-slate-600">未设置</span>
                  : entry.api_key
                  ? '••••••••••••••••••••••••••••••••'
                  : <span className="text-slate-600">未设置</span>}
              </div>
            </div>

            {/* Secret Key (如果有) */}
            {entry.api_secret && (
              <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">API Secret</span>
                  <button
                    onClick={() => handleCopy(entry.api_secret, 'api_secret', ' Secret ')}
                    className="flex items-center space-x-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-all"
                  >
                    {copiedField === 'api_secret' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>复制 Secret</span>
                  </button>
                </div>
                <div className="px-3.5 py-2.5 bg-slate-900 rounded-xl font-mono text-sm text-slate-300 break-all select-text border border-slate-800">
                  {showSecret ? entry.api_secret : '••••••••••••••••••••••••'}
                </div>
              </div>
            )}

            {/* Base URL */}
            {entry.base_url && (
              <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">API Base URL</span>
                  <button
                    onClick={() => handleCopy(entry.base_url, 'base_url', ' Base URL ')}
                    className="flex items-center space-x-1 px-2.5 py-1 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                  >
                    {copiedField === 'base_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>复制 URL</span>
                  </button>
                </div>
                <div className="px-3.5 py-2.5 bg-slate-900 rounded-xl font-mono text-xs text-slate-300 break-all select-text border border-slate-800">
                  {entry.base_url}
                </div>
              </div>
            )}

            {/* 开发者快捷命令模板 (Export & Curl) */}
            {entry.api_key && (
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold mb-3">
                  <Terminal className="w-4 h-4" />
                  <span>开发者极速复制（直接粘贴进终端）</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleCopy(
                        formatEnvExport(entry.title, entry.api_key!),
                        'export',
                        ' 环境变量导出命令 '
                      )
                    }
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 hover:bg-slate-900 border border-indigo-500/30 rounded-xl text-left transition-all group"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200">复制 export 环境变量</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">
                        {formatEnvExport(entry.title, '***')}
                      </div>
                    </div>
                    {copiedField === 'export' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        formatCurlHeader(entry.api_key!, entry.base_url),
                        'curl',
                        ' curl 命令模板 '
                      )
                    }
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 hover:bg-slate-900 border border-indigo-500/30 rounded-xl text-left transition-all group"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200">复制 curl 请求命令</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">
                        curl -H &quot;Authorization: Bearer...&quot;
                      </div>
                    </div>
                    {copiedField === 'curl' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 2. 账号密码特化字段 */}
        {entry.entry_type === 'login' && (
          <>
            {entry.url && (
              <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-400">网址 / 平台服务</span>
                  <a
                    href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>浏览器访问</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-sm text-slate-200 font-mono select-text">{entry.url}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">账号 / 邮箱</span>
                  <button
                    onClick={() => handleCopy(entry.username, 'username', ' 账号 ')}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedField === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-sm font-medium text-slate-200 select-text">
                  {entry.username || <span className="text-slate-600">无</span>}
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">密码</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(entry.password, 'password', ' 密码 ')}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-mono text-indigo-300 select-text">
                  {showSecret
                    ? entry.password || <span className="text-slate-600">无</span>
                    : entry.password
                    ? '••••••••••••'
                    : <span className="text-slate-600">无</span>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. 服务器特化字段 */}
        {entry.entry_type === 'server' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">一键 SSH 连接命令</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `ssh -p ${entry.port || 22} ${entry.username || 'root'}@${entry.host}`,
                      'ssh_cmd',
                      ' SSH 连接命令 '
                    )
                  }
                  className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all"
                >
                  {copiedField === 'ssh_cmd' ? <Check className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                  <span>复制 SSH 命令</span>
                </button>
              </div>
              <div className="px-3.5 py-2.5 bg-slate-900 rounded-xl font-mono text-sm text-emerald-300 border border-slate-800 select-text">
                ssh -p {entry.port || 22} {entry.username || 'root'}@{entry.host}
              </div>
            </div>

            {entry.password && (
              <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">连接密码 / 凭据</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(entry.password, 'server_pwd', ' 服务器密码 ')}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedField === 'server_pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-mono text-slate-200 select-text">
                  {showSecret ? entry.password : '••••••••••••'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. 详细备注 / 安全笔记 */}
        {entry.notes && (
          <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">备注与备忘</span>
              <button
                onClick={() => handleCopy(entry.notes, 'notes', ' 备注内容 ')}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                {copiedField === 'notes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800 select-text">
              {entry.notes}
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
            <span>端到端加密保护</span>
          </div>
          <div>更新于 {new Date(entry.updated_at).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};
