export type EntryType = 'login' | 'apikey' | 'note' | 'server';

export interface VaultEntry {
  id: string;
  title: string;
  entry_type: EntryType;
  tags: string[];
  favorite: boolean;
  notes?: string;

  // 账号密码
  username?: string;
  password?: string;
  url?: string;

  // API Key 专属
  api_key?: string;
  api_secret?: string;
  base_url?: string;

  // 服务器 / SSH
  host?: string;
  port?: number;

  // 自定义扩展
  custom_fields?: Record<string, string>;

  created_at: number;
  updated_at: number;
}
