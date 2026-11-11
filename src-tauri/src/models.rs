use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum EntryType {
    Login,
    ApiKey,
    Note,
    Server,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultEntry {
    pub id: String,
    pub title: String,
    pub entry_type: EntryType,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub favorite: bool,
    #[serde(default)]
    pub notes: Option<String>,

    // 通用字段（账号密码）
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
    #[serde(default)]
    pub url: Option<String>,

    // API Key 专属字段
    #[serde(default)]
    pub api_key: Option<String>,
    #[serde(default)]
    pub api_secret: Option<String>,
    #[serde(default)]
    pub base_url: Option<String>,

    // 服务器 / SSH 专属字段
    #[serde(default)]
    pub host: Option<String>,
    #[serde(default)]
    pub port: Option<u16>,

    // 自定义键值对
    #[serde(default)]
    pub custom_fields: HashMap<String, String>,

    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultData {
    pub version: u32,
    pub entries: Vec<VaultEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedVaultFile {
    pub format: String,
    pub version: u32,
    pub salt: String,
    pub nonce: String,
    pub ciphertext: String,
}
