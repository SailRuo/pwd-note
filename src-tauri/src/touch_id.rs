use std::ffi::CString;
use std::process::Command;

#[cfg(target_os = "macos")]
unsafe extern "C" {
    fn macos_touch_id_is_available() -> bool;
    fn macos_touch_id_authenticate(reason: *const std::os::raw::c_char) -> bool;
}

const KEYCHAIN_SERVICE: &str = "com.pwdnote.app";
const KEYCHAIN_ACCOUNT: &str = "master_key";

/// 检查系统是否支持 Touch ID
pub fn is_supported() -> bool {
    #[cfg(target_os = "macos")]
    {
        unsafe { macos_touch_id_is_available() }
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

/// 唤起 macOS 系统级 Touch ID 识别弹窗
pub fn authenticate(reason: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let c_reason = CString::new(reason).map_err(|e| e.to_string())?;
        let success = unsafe { macos_touch_id_authenticate(c_reason.as_ptr()) };
        if success {
            Ok(())
        } else {
            Err("Touch ID 验证取消或失败".to_string())
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("当前系统不支持 Touch ID".to_string())
    }
}

/// 将主密码存入 macOS 系统钥匙串 (Keychain)
pub fn save_password_to_keychain(password: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let status = Command::new("security")
            .args([
                "add-generic-password",
                "-s",
                KEYCHAIN_SERVICE,
                "-a",
                KEYCHAIN_ACCOUNT,
                "-w",
                password,
                "-U",
            ])
            .status()
            .map_err(|e| format!("调用 Keychain 失败: {}", e))?;

        if status.success() {
            Ok(())
        } else {
            Err("写入 Keychain 失败".to_string())
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("不支持的操作".to_string())
    }
}

/// 从 macOS 系统钥匙串读取主密码
pub fn get_password_from_keychain() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("security")
            .args([
                "find-generic-password",
                "-s",
                KEYCHAIN_SERVICE,
                "-a",
                KEYCHAIN_ACCOUNT,
                "-w",
            ])
            .output()
            .map_err(|e| format!("查询 Keychain 失败: {}", e))?;

        if output.status.success() {
            let pwd = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if pwd.is_empty() {
                Err("未在钥匙串中找到密码".to_string())
            } else {
                Ok(pwd)
            }
        } else {
            Err("未在钥匙串中找到密码".to_string())
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("不支持的操作".to_string())
    }
}

/// 检查钥匙串中是否已有保存的主密码
pub fn has_saved_password() -> bool {
    get_password_from_keychain().is_ok()
}
