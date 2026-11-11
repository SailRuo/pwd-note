#import <Foundation/Foundation.h>
#import <LocalAuthentication/LocalAuthentication.h>

bool macos_touch_id_is_available() {
    LAContext *context = [[LAContext alloc] init];
    NSError *error = nil;
    return [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];
}

bool macos_touch_id_authenticate(const char *reason_cstr) {
    LAContext *context = [[LAContext alloc] init];
    NSError *error = nil;
    if (![context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
        return false;
    }

    NSString *reason = reason_cstr ? [NSString stringWithUTF8String:reason_cstr] : @"验证指纹以解锁 PwdNote";
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
    __block bool authSuccess = false;

    [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
            localizedReason:reason
                      reply:^(BOOL success, NSError * _Nullable authError) {
        (void)authError;
        authSuccess = success;
        dispatch_semaphore_signal(sema);
    }];

    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    return authSuccess;
}
