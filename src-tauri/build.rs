fn main() {
    #[cfg(target_os = "macos")]
    {
        cc::Build::new()
            .file("src/touch_id_macos.m")
            .compile("touch_id_macos");
        println!("cargo:rustc-link-lib=framework=LocalAuthentication");
        println!("cargo:rustc-link-lib=framework=Foundation");
    }
    tauri_build::build();
}
