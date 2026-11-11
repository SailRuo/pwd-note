import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { KeyRound, ArrowRight, Fingerprint, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isInitialized: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onInit: (password: string) => Promise<boolean>;
  onTouchIdUnlock: () => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isInitialized,
  onUnlock,
  onInit,
  onTouchIdUnlock,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTouchIdSupported, setIsTouchIdSupported] = useState(false);
  const [hasTouchIdSaved, setHasTouchIdSaved] = useState(false);
  const isAuthenticatingRef = useRef(false);

  // 检查是否可以使用 Touch ID
  useEffect(() => {
    async function checkTouchId() {
      if (!isInitialized) return;
      try {
        const supported = await invoke<boolean>('is_touch_id_available');
        const hasSaved = await invoke<boolean>('has_touch_id_saved');
        setIsTouchIdSupported(supported);
        setHasTouchIdSaved(hasSaved);
      } catch (err) {
        console.error('Touch ID 状态检查异常:', err);
      }
    }
    checkTouchId();
  }, [isInitialized]);

  const triggerTouchId = async () => {
    if (isAuthenticatingRef.current) return;
    isAuthenticatingRef.current = true;
    setError(null);
    setLoading(true);
    try {
      const ok = await onTouchIdUnlock();
      if (!ok) {
        setError('指纹验证取消或失败，可直接输入主密码');
      }
    } catch {
      setError('指纹解锁异常，请输入主密码');
    } finally {
      setLoading(false);
      isAuthenticatingRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      if (isInitialized && isTouchIdSupported && hasTouchIdSaved) {
        triggerTouchId();
        return;
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 dark:text-white text-slate-800 shadow-2xl flex flex-col items-center">
        {/* 图标与标题 */}
        <div className="flex flex-col items-center text-center mb-5">
          <img
            src="/logo.png"
            alt="PwdNote"
            className="w-13 h-13 rounded-2xl shadow-xl border dark:border-white/20 border-slate-300/60 mb-3 object-cover"
          />
          <h2 className="text-lg font-bold dark:text-white text-slate-800 tracking-wide">
            {isInitialized ? '解锁 PwdNote 保险箱' : '创建你的密码保险箱'}
          </h2>
          <p className="text-xs dark:text-white/50 text-slate-500 mt-1 max-w-xs leading-relaxed">
            {isInitialized
              ? '所有密码与 API Key 均采用 AES-256 加密保护'
              : '设置一个主密码，数据由本地零知识加密'}
          </p>
        </div>

        {/* 首次未绑定 Touch ID 的贴心提醒 */}
        {isInitialized && isTouchIdSupported && !hasTouchIdSaved && (
          <div className="w-full mb-3.5 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center space-x-2 text-indigo-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>输入本次密码解锁后将自动开启指纹</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          <div>
            <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">
              主密码 (Master Password)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus={!hasTouchIdSaved}
                className="w-full px-3.5 py-2 pr-10 glass-input rounded-xl focus:outline-none text-sm font-mono"
              />
              <KeyRound className="w-4 h-4 dark:text-white/40 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {!isInitialized && (
            <div>
              <label className="block text-xs font-medium dark:text-white/70 text-slate-600 mb-1">
                确认主密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 glass-input rounded-xl focus:outline-none text-sm font-mono"
              />
            </div>
          )}

          {error && (
            <div className="p-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* 🌟 核心优化：按钮并排在同一行！ */}
          <div className="pt-1 flex items-center space-x-2.5 w-full">
            {isInitialized && isTouchIdSupported && hasTouchIdSaved && (
              <button
                type="button"
                onClick={triggerTouchId}
                disabled={loading}
                className="flex-1 py-2.5 px-3 rounded-xl dark:bg-white/10 bg-slate-200/80 hover:dark:bg-white/15 hover:bg-slate-300/80 border dark:border-white/15 border-slate-300 flex items-center justify-center space-x-1.5 dark:text-white text-slate-700 font-semibold text-xs transition-all active:scale-[0.98]"
              >
                <Fingerprint className="w-4 h-4 text-indigo-500" />
                <span>指纹解锁</span>
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`py-2.5 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-1 text-xs active:scale-[0.98] ${
                isInitialized && isTouchIdSupported && hasTouchIdSaved ? 'flex-1' : 'w-full'
              }`}
            >
              <span>{loading ? '验证中...' : isInitialized ? '密码解锁' : '立即创建'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
