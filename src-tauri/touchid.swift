import LocalAuthentication
import Foundation

let args = CommandLine.arguments

if args.contains("--check") {
    let context = LAContext()
    var error: NSError?
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
        print("AVAILABLE")
        exit(0)
    } else {
        print("UNAVAILABLE: \(error?.localizedDescription ?? "")")
        exit(1)
    }
}

let reason = args.count > 1 && !args[1].starts(with: "--") ? args[1] : "验证 Touch ID 以解锁 PwdNote 保险箱"

let context = LAContext()
context.localizedCancelTitle = "使用密码"

var error: NSError?
if !context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
    print("NOT_SUPPORTED")
    exit(2)
}

let sema = DispatchSemaphore(value: 0)
var authSuccess = false

context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, authError in
    authSuccess = success
    if let err = authError {
        fputs("AUTH_ERROR: \(err.localizedDescription)\n", stderr)
    }
    sema.signal()
}

_ = sema.wait(timeout: .distantFuture)

if authSuccess {
    print("SUCCESS")
    exit(0)
} else {
    exit(1)
}
