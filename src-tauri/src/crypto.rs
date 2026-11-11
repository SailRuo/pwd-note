use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::Argon2;
use base64::prelude::*;
use rand::RngCore;

use crate::models::EncryptedVaultFile;

const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;

/// 使用 Argon2id 从主密码和随机 Salt 派生 256 位密钥
fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    let mut key = [0u8; 32];
    let argon2 = Argon2::default();
    argon2
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("密钥派生失败: {}", e))?;
    Ok(key)
}

/// 使用 AES-256-GCM 加密明文数据
pub fn encrypt_data(data: &[u8], password: &str) -> Result<EncryptedVaultFile, String> {
    let mut rng = rand::thread_rng();

    // 生成随机 Salt 和 Nonce
    let mut salt = [0u8; SALT_LEN];
    rng.fill_bytes(&mut salt);

    let mut nonce_bytes = [0u8; NONCE_LEN];
    rng.fill_bytes(&mut nonce_bytes);

    let key = derive_key(password, &salt)?;
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| format!("密码机初始化失败: {}", e))?;
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("数据加密失败: {}", e))?;

    Ok(EncryptedVaultFile {
        format: "pwd-note-v1".to_string(),
        version: 1,
        salt: BASE64_STANDARD.encode(salt),
        nonce: BASE64_STANDARD.encode(nonce_bytes),
        ciphertext: BASE64_STANDARD.encode(ciphertext),
    })
}

/// 解密数据并验证密码与数据完整性
pub fn decrypt_data(file: &EncryptedVaultFile, password: &str) -> Result<Vec<u8>, String> {
    let salt = BASE64_STANDARD
        .decode(&file.salt)
        .map_err(|_| "损坏的 Salt 数据")?;
    let nonce_bytes = BASE64_STANDARD
        .decode(&file.nonce)
        .map_err(|_| "损坏的 Nonce 数据")?;
    let ciphertext = BASE64_STANDARD
        .decode(&file.ciphertext)
        .map_err(|_| "损坏的密文数据")?;

    if nonce_bytes.len() != NONCE_LEN {
        return Err("Nonce 长度异常".to_string());
    }

    let key = derive_key(password, &salt)?;
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| format!("密码机初始化失败: {}", e))?;
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| "密码错误或数据已被篡改")?;

    Ok(plaintext)
}
