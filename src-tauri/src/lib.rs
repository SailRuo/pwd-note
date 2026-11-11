pub mod crypto;
pub mod models;
pub mod touch_id;

use models::{EncryptedVaultFile, VaultData, VaultEntry};
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

fn get_vault_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("无法定位应用数据目录: {}", e))?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| format!("创建数据目录失败: {}", e))?;
    }
    Ok(app_dir.join("vault.enc"))
}

#[tauri::command]
fn is_vault_initialized(app: tauri::AppHandle) -> Result<bool, String> {
    let path = get_vault_file_path(&app)?;
    Ok(path.exists())
}

#[tauri::command]
fn get_vault_path(app: tauri::AppHandle) -> Result<String, String> {
    let path = get_vault_file_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn is_touch_id_available() -> bool {
    touch_id::is_supported()
}

#[tauri::command]
fn has_touch_id_saved() -> bool {
    touch_id::has_saved_password()
}

#[derive(Serialize)]
struct TouchIdUnlockResult {
    master_password: String,
    entries: Vec<VaultEntry>,
}

#[tauri::command]
fn unlock_with_touch_id(app: tauri::AppHandle) -> Result<TouchIdUnlockResult, String> {
    touch_id::authenticate("验证 Touch ID 指纹以解锁 PwdNote 保险箱")?;
    let password = touch_id::get_password_from_keychain()?;
    let entries = unlock_vault(app, &password)?;
    Ok(TouchIdUnlockResult {
        master_password: password,
        entries,
    })
}

#[tauri::command]
fn init_vault(app: tauri::AppHandle, password: &str) -> Result<(), String> {
    if password.trim().is_empty() {
        return Err("主密码不能为空".to_string());
    }
    let path = get_vault_file_path(&app)?;
    let empty_vault = VaultData {
        version: 1,
        entries: Vec::new(),
    };
    let json_bytes = serde_json::to_vec(&empty_vault).map_err(|e| e.to_string())?;
    let encrypted = crypto::encrypt_data(&json_bytes, password)?;
    let out_json = serde_json::to_string_pretty(&encrypted).map_err(|e| e.to_string())?;

    fs::write(&path, out_json).map_err(|e| format!("保存数据库失败: {}", e))?;

    // 在支持的 macOS 机器上，将主密码安全托管至系统 Keychain，开启指纹解锁支持
    if touch_id::is_supported() {
        let _ = touch_id::save_password_to_keychain(password);
    }

    Ok(())
}

#[tauri::command]
fn unlock_vault(app: tauri::AppHandle, password: &str) -> Result<Vec<VaultEntry>, String> {
    let path = get_vault_file_path(&app)?;
    if !path.exists() {
        return Err("保险箱尚未初始化".to_string());
    }
    let file_content = fs::read_to_string(&path).map_err(|e| format!("读取文件失败: {}", e))?;
    let encrypted: EncryptedVaultFile =
        serde_json::from_str(&file_content).map_err(|_| "保险箱数据格式无效")?;

    let decrypted_bytes = crypto::decrypt_data(&encrypted, password)?;
    let vault_data: VaultData =
        serde_json::from_slice(&decrypted_bytes).map_err(|e| format!("数据解析失败: {}", e))?;

    // 解锁成功后，同步更新系统 Keychain
    if touch_id::is_supported() {
        let _ = touch_id::save_password_to_keychain(password);
    }

    Ok(vault_data.entries)
}

#[tauri::command]
fn save_entries(
    app: tauri::AppHandle,
    password: &str,
    entries: Vec<VaultEntry>,
) -> Result<(), String> {
    let path = get_vault_file_path(&app)?;
    let vault_data = VaultData {
        version: 1,
        entries,
    };
    let json_bytes = serde_json::to_vec(&vault_data).map_err(|e| e.to_string())?;
    let encrypted = crypto::encrypt_data(&json_bytes, password)?;
    let out_json = serde_json::to_string_pretty(&encrypted).map_err(|e| e.to_string())?;

    fs::write(&path, out_json).map_err(|e| format!("写入文件失败: {}", e))?;
    Ok(())
}

#[tauri::command]
fn export_vault_backup(
    app: tauri::AppHandle,
    password: &str,
    target_path: &str,
) -> Result<(), String> {
    let entries = unlock_vault(app, password)?;
    let vault_data = VaultData {
        version: 1,
        entries,
    };
    let json_bytes = serde_json::to_vec(&vault_data).map_err(|e| e.to_string())?;
    let encrypted = crypto::encrypt_data(&json_bytes, password)?;
    let out_json = serde_json::to_string_pretty(&encrypted).map_err(|e| e.to_string())?;

    fs::write(target_path, out_json).map_err(|e| format!("导出备份失败: {}", e))?;
    Ok(())
}

#[tauri::command]
fn import_vault_backup(
    app: tauri::AppHandle,
    password: &str,
    import_path: &str,
) -> Result<Vec<VaultEntry>, String> {
    let file_content =
        fs::read_to_string(import_path).map_err(|e| format!("读取导入文件失败: {}", e))?;
    let encrypted: EncryptedVaultFile =
        serde_json::from_str(&file_content).map_err(|_| "备份文件格式无效")?;

    let decrypted_bytes = crypto::decrypt_data(&encrypted, password)?;
    let vault_data: VaultData =
        serde_json::from_slice(&decrypted_bytes).map_err(|_| "密码错误或数据无法解密")?;

    save_entries(app, password, vault_data.entries.clone())?;

    Ok(vault_data.entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            is_vault_initialized,
            get_vault_path,
            init_vault,
            unlock_vault,
            save_entries,
            export_vault_backup,
            import_vault_backup,
            is_touch_id_available,
            has_touch_id_saved,
            unlock_with_touch_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
