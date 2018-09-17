#include <napi.h>
#include "win-process-utils.h"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "getActiveAppProcessInfo"), Napi::Function::New(env, GetActiveAppProcessInfo));
    exports.Set(Napi::String::New(env, "startSystemForegroundAppWatch"), Napi::Function::New(env, SystemForegroundAppNotify::start));
    exports.Set(Napi::String::New(env, "stopSystemForegroundAppWatch"), Napi::Function::New(env, SystemForegroundAppNotify::stop));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)