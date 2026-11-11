import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isInitialized: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onInit: (password: string) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isInitialized,
  onUnlock,
  onInit,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('请输入主密码');
      return;
    }

    if (!isInitialized) {
      if (password.length < 6) {
        setError('主密码长度建议至少 6 位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      setLoading(true);
      const success = await onInit(password);
      setLoading(false);
      if (!success) {
        setError('初始化保险箱失败，请重试');
      }
    } else {
      setLoading(true);
      const success = await onUnlock(password);
      setLoading(false);
      if (!success) {
        setError('密码错误，请重试');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-7 text-slate-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
            {isInitialized ? <Lock className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {isInitialized ? '解锁 PwdNote 保险箱' : '创建你的密码保险箱'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            {isInitialized
              ? '所有密码与 API Key 均采用 AES-256 加密，请输入主密码解锁'
              : '请设置一个强主密码，本地零知识加密，丢失将无法恢复'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              主密码 (Master Password)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {!isInitialized && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                确认主密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>{loading ? '正在验证密钥...' : isInitialized ? '解锁' : '立即创建'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
