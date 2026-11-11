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
      showToast(`已复制${label}到剪贴板`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getTypeIcon = () => {
    switch (entry.entry_type) {
      case 'apikey':
        return <Key className="w-5 h-5 text-amber-300" />;
      case 'login':
        return <Globe className="w-5 h-5 text-indigo-300" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-300" />;
      case 'note':
        return <FileText className="w-5 h-5 text-sky-300" />;
    }
  };

  const getTypeName = () => {
    switch (entry.entry_type) {
      case 'apikey':
        return 'API Key 密钥';
      case 'login':
        return '账号密码';
      case 'server':
        return '服务器 SSH';
      case 'note':
        return '安全备忘';
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 bg-transparent">
      {/* 顶部标题与操作栏 */}
      <div className="flex items-start justify-between pb-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl glass-card flex items-center justify-center shadow-lg">
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-white tracking-wide">{entry.title}</h2>
              <button
                onClick={onToggleFavorite}
                className={`p-1 rounded-lg transition-colors ${
                  entry.favorite ? 'text-amber-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                {getTypeName()}
              </span>
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 顶部按钮 */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onEdit}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl glass-btn text-white/90 text-xs font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>编辑</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除</span>
          </button>
        </div>
      </div>

      {/* 核心字段展示与一键复制区域 */}
      <div className="mt-6 space-y-5 max-w-2xl">
        {/* 1. API Key 特化字段（纯粹专为存密钥设计） */}
        {entry.entry_type === 'apikey' && (
          <>
            <div className="glass-card rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-white/70 tracking-wider uppercase">API 密钥 (Token)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-xs text-white/60 hover:text-white flex items-center space-x-1.5 transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSecret ? '隐藏明文' : '查看明文'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(entry.api_key, 'api_key', ' 密钥 ')}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    {copiedField === 'api_key' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'api_key' ? '已复制！' : '复制密钥'}</span>
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 bg-black/40 rounded-xl font-mono text-sm text-amber-300 break-all select-text border border-white/10 shadow-inner">
                {showSecret
                  ? entry.api_key || <span className="text-white/30">未设置密钥</span>
                  : entry.api_key
                  ? '••••••••••••••••••••••••••••••••••••••••'
                  : <span className="text-white/30">未设置密钥</span>}
              </div>
            </div>
          </>
        )}

        {/* 2. 账号密码特化字段 */}
        {entry.entry_type === 'login' && (
          <>
            {entry.url && (
              <div className="glass-card rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white/60">网址 / 平台服务</span>
                  <a
                    href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center space-x-1"
                  >
                    <span>访问平台</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-sm text-white font-mono select-text">{entry.url}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">账号 / 邮箱</span>
                  <button
                    onClick={() => handleCopy(entry.username, 'username', ' 账号 ')}
                    className="p-1 rounded text-white/50 hover:text-white transition-colors"
                  >
                    {copiedField === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-sm font-medium text-white select-text">
                  {entry.username || <span className="text-white/30">无</span>}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">密码</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-white/50 hover:text-white"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(entry.password, 'password', ' 密码 ')}
                      className="p-1 rounded text-white/50 hover:text-white transition-colors"
                    >
                      {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-mono text-indigo-200 select-text">
                  {showSecret
                    ? entry.password || <span className="text-white/30">无</span>
                    : entry.password
                    ? '••••••••••••'
                    : <span className="text-white/30">无</span>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. 服务器特化字段 */}
        {entry.entry_type === 'server' && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/60">一键 SSH 连接命令</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `ssh -p ${entry.port || 22} ${entry.username || 'root'}@${entry.host}`,
                      'ssh_cmd',
                      ' SSH 连接命令 '
                    )
                  }
                  className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition-all"
                >
                  {copiedField === 'ssh_cmd' ? <Check className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                  <span>复制 SSH 命令</span>
                </button>
              </div>
              <div className="px-4 py-3 bg-black/40 rounded-xl font-mono text-sm text-emerald-300 border border-white/10 select-text">
                ssh -p {entry.port || 22} {entry.username || 'root'}@{entry.host}
              </div>
            </div>

            {entry.password && (
              <div className="glass-card rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">连接密码 / 凭据</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-white/50 hover:text-white"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(entry.password, 'server_pwd', ' 服务器密码 ')}
                      className="p-1 rounded text-white/50 hover:text-white transition-colors"
                    >
                      {copiedField === 'server_pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-sm font-mono text-white select-text">
                  {showSecret ? entry.password : '••••••••••••'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. 详细备注 / 安全笔记 */}
        {entry.notes && (
          <div className="glass-card rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/60">备注备忘</span>
              <button
                onClick={() => handleCopy(entry.notes, 'notes', ' 备注内容 ')}
                className="p-1 rounded text-white/50 hover:text-white transition-colors"
              >
                {copiedField === 'notes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="whitespace-pre-wrap font-mono text-xs text-white/80 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/10 select-text">
              {entry.notes}
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="pt-4 flex items-center justify-between text-[11px] text-white/40 border-t border-white/10">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400/80" />
            <span>本地 AES-256 零知识加密保护</span>
          </div>
          <div>更新于 {new Date(entry.updated_at).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};
