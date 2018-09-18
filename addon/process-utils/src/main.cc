#include <napi.h>

#ifdef _WIN32 
#include "win-process-utils.h"
#endif


Napi::Object Init(Napi::Env env, Napi::Object exports)
{
#ifdef _WIN32 
    exports.Set(Napi::String::New(env, "getActiveAppProcessInfo"), Napi::Function::New(env, GetActiveAppProcessInfo));
    exports.Set(Napi::String::New(env, "startSystemForegroundAppWatch"), Napi::Function::New(env, SystemForegroundAppNotify::start));
    exports.Set(Napi::String::New(env, "stopSystemForegroundAppWatch"), Napi::Function::New(env, SystemForegroundAppNotify::stop));
    exports.Set(Napi::String::New(env, "enableVibrancy"), Napi::Function::New(env, enableVibrancy));
#endif

    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)