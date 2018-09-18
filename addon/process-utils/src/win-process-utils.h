#pragma once
#include <napi.h>
#include <stdio.h>
#include <iostream>
#include <thread>
#include "utils/win-utils.h"
#include "utils/n-utils.h"
#include "utils/node_async_call.h"

struct FileDetails
{
    std::wstring path;
    std::string version;
    std::wstring description;
    std::wstring productName;
    std::wstring companyName;
};

struct AppProcessDetails
{
    HWND window;
    std::wstring title;
    FileDetails fileDetails;
};

struct LANGANDCODEPAGE
{
    WORD wLanguage;
    WORD wCodePage;
};

void GetVersionString(LPCVOID lpVI,
                      LPWSTR tszStr,
                      LANGANDCODEPAGE lpTranslate,
                      std::wstring *pstr)
{
    DWORD dwBufSize = 0;
    WCHAR tszVerStrName[64] = {0};
    LPVOID lpt = nullptr;

    wsprintf(tszVerStrName, L"\\StringFileInfo\\%04x%04x\\%s",
             lpTranslate.wLanguage,
             lpTranslate.wCodePage, tszStr);
    if (VerQueryValueW(lpVI, tszVerStrName, &lpt, (UINT *)&dwBufSize))
    {
        pstr->assign((const wchar_t *)lpt);
    }
}

FileDetails GetFileDetails(const std::wstring &path)
{
    FileDetails details;
    details.path = path;

    DWORD verHandle = 0;
    UINT size = 0;
    LPBYTE lpBuffer = NULL;
    LANGANDCODEPAGE *lpTranslate;
    UINT cbTranslate;
    char versionStr[128] = {0};

    DWORD verSize = GetFileVersionInfoSizeW(path.c_str(), &verHandle);

    if (verSize != NULL)
    {
        LPSTR verData = new char[verSize];

        if (GetFileVersionInfoW(path.c_str(), verHandle, verSize, verData))
        {
            if (VerQueryValueW(verData, L"\\", (VOID FAR * FAR *)&lpBuffer, &size))
            {
                if (size)
                {
                    VS_FIXEDFILEINFO *verInfo = (VS_FIXEDFILEINFO *)lpBuffer;
                    if (verInfo->dwSignature == 0xfeef04bd)
                    {
                        sprintf(versionStr, "%d.%d.%d.%d",
                                (verInfo->dwFileVersionMS >> 16) & 0xffff,
                                (verInfo->dwFileVersionMS >> 0) & 0xffff,
                                (verInfo->dwFileVersionLS >> 16) & 0xffff,
                                (verInfo->dwFileVersionLS >> 0) & 0xffff);

                        details.version = versionStr;
                    }
                }
            }

            VerQueryValueW(verData,
                           L"\\VarFileInfo\\Translation",
                           (LPVOID *)&lpTranslate,
                           &cbTranslate);
            GetVersionString(verData,
                             L"FileDescription",
                             lpTranslate[0],
                             &details.description);
            GetVersionString(verData,
                             L"ProductName",
                             lpTranslate[0],
                             &details.productName);
            GetVersionString(verData,
                             L"CompanyName",
                             lpTranslate[0],
                             &details.companyName);
        }
        delete[] verData;
    }

    return details;
}

AppProcessDetails GetAppProcessDetails(HWND window)
{
    AppProcessDetails details;
    HANDLE hProcess = nullptr;
    DWORD procId = 0;
    DWORD pathSize = 1024;
    WCHAR filePath[1024] = {0};

    WCHAR title[256] = {0};
    GetWindowTextW(window, title, 256);
    GetWindowThreadProcessId(window, &procId);
    hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, procId);
    if (hProcess)
    {
        QueryFullProcessImageNameW(hProcess, 0, filePath, &pathSize);
        CloseHandle(hProcess);
    }

    details.title = title;
    details.window = window;
    details.fileDetails = GetFileDetails(filePath);

    return details;
}

Napi::Object toV8Object(Napi::Env &env, const AppProcessDetails &details)
{
    Napi::Object object = Napi::Object::New(env);

    object.Set("title", Windows::toUtf8(details.title));
    object.Set("filePath", Windows::toUtf8(details.fileDetails.path));
    object.Set("version", details.fileDetails.version);
    object.Set("description", Windows::toUtf8(details.fileDetails.description));
    object.Set("productName", Windows::toUtf8(details.fileDetails.productName));
    object.Set("companyName", Windows::toUtf8(details.fileDetails.companyName));

    return object;
}

Napi::Value GetActiveAppProcessInfo(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    HWND hwnd = GetForegroundWindow();

    AppProcessDetails details = GetAppProcessDetails(hwnd);

    return toV8Object(env, details);
}

class SystemForegroundAppNotify
{
    std::shared_ptr<std::thread> worker_;
    std::shared_ptr<NodeEventCallback> callback_;
    Napi::ObjectReference wrapper_;

  public:
    static SystemForegroundAppNotify &instance();

    static Napi::Value start(const Napi::CallbackInfo &info);
    static Napi::Value stop(const Napi::CallbackInfo &info);

    SystemForegroundAppNotify();
    ~SystemForegroundAppNotify();

    bool _start();
    void _stop();

    static VOID CALLBACK _WinEventProc(
        HWINEVENTHOOK hWinEventHook,
        DWORD event,
        HWND hwnd,
        LONG idObject,
        LONG idChild,
        DWORD idEventThread,
        DWORD dwmsEventTime);
};

SystemForegroundAppNotify &SystemForegroundAppNotify::instance()
{
    static SystemForegroundAppNotify ins;
    return ins;
}

inline SystemForegroundAppNotify::SystemForegroundAppNotify()
{
}

inline SystemForegroundAppNotify::~SystemForegroundAppNotify()
{
    _stop();
}

Napi::Value SystemForegroundAppNotify::start(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    Napi::Function callback = info[0].As<Napi::Function>();
    instance().callback_ = std::make_shared<NodeEventCallback>(env, Napi::Persistent(callback), Napi::Persistent(info.This().ToObject()));

    bool succeed = instance()._start();

    return Napi::Value::From(env, succeed);
}

Napi::Value SystemForegroundAppNotify::stop(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    instance()._stop();
    instance().callback_.reset();
    return env.Undefined();
}

inline bool SystemForegroundAppNotify::_start()
{
    HANDLE ready = CreateEventW(nullptr, true, false, nullptr);

    bool hooked = true;
    DWORD err = 0;

    worker_ = std::make_shared<std::thread>([this, ready, &hooked, &err]() {
        HWINEVENTHOOK hook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, NULL, _WinEventProc, 0, 0, WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS);
        if (!hook)
        {
            hooked = false;
            err = GetLastError();
        }

        SetEvent(ready);

        MSG msg;
        while (GetMessage(&msg, NULL, 0, 0))
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        UnhookWinEvent(hook);
    });

    WaitForSingleObject(ready, INFINITE);
    CloseHandle(ready);

    if (!hooked)
    {
        CHAR buf[256] = {0};
        FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
                       NULL, GetLastError(), MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
                       buf, (sizeof(buf) / sizeof(wchar_t)), NULL);

        std::cerr << buf << std::endl;

        _stop();
    }

    return hooked;
}

inline void SystemForegroundAppNotify::_stop()
{
    if (worker_)
    {
        PostThreadMessage(GetThreadId(worker_->native_handle()), WM_QUIT, NULL, NULL);
        worker_->join();
        worker_.reset();
    }
}

VOID CALLBACK SystemForegroundAppNotify::_WinEventProc(HWINEVENTHOOK hWinEventHook, DWORD event, HWND hwnd, LONG idObject, LONG idChild, DWORD idEventThread, DWORD dwmsEventTime)
{
    if (event == EVENT_SYSTEM_FOREGROUND &&
        idObject == OBJID_WINDOW &&
        idChild == CHILDID_SELF)
    {

        node_async_call::async_call([details = GetAppProcessDetails(hwnd)]() {
            auto &cb = instance().callback_;
            if (cb)
            {
                Napi::HandleScope scope(cb->env);
                cb->callback.MakeCallback(cb->receiver.Value(), {toV8Object(cb->env, details)});
            }
        });
    }
}

/////////////////////////////////////
#include <dwmapi.h>
#pragma comment(lib, "dwmapi.lib")

struct ACCENTPOLICY
{
    int nAccentState;
    int nFlags;
    int nColor;
    int nAnimationId;
};
struct WINCOMPATTRDATA
{
    int nAttribute;
    PVOID pData;
    ULONG ulDataSize;
};

enum AccentTypes
{
    ACCENT_DISABLE = 0,
    ACCENT_ENABLE_GRADIENT = 1,
    ACCENT_ENABLE_TRANSPARENTGRADIENT = 2,
    ACCENT_ENABLE_BLURBEHIND = 3
};


inline BOOL GetNtVersionNumbers(DWORD&dwMajorVer, DWORD& dwMinorVer, DWORD& dwBuildNumber)
{
    BOOL bRet = FALSE;
    HMODULE hModNtdll = NULL;
    if (hModNtdll = ::LoadLibraryW(L"ntdll.dll"))
    {
        typedef void (WINAPI *pfRTLGETNTVERSIONNUMBERS)(DWORD*, DWORD*, DWORD*);
        pfRTLGETNTVERSIONNUMBERS pfRtlGetNtVersionNumbers;
        pfRtlGetNtVersionNumbers = (pfRTLGETNTVERSIONNUMBERS)::GetProcAddress(hModNtdll, "RtlGetNtVersionNumbers");
        if (pfRtlGetNtVersionNumbers)
        {
            pfRtlGetNtVersionNumbers(&dwMajorVer, &dwMinorVer, &dwBuildNumber);
            dwBuildNumber &= 0x0ffff;
            bRet = TRUE;
        }

        ::FreeLibrary(hModNtdll);
        hModNtdll = NULL;
    }

    return bRet;
}

bool IsWin10()
{
    DWORD dwMajor;
    DWORD dwMinor;
    DWORD dwBuild;
    GetNtVersionNumbers(dwMajor, dwMinor, dwBuild);
    return dwMajor == 10;
}


inline bool SetBlurBehind(HWND hwnd, bool state)
{
    bool result = false;

    if (IsWin10())
    {
        const HINSTANCE hModule = LoadLibrary(TEXT("user32.dll"));
        if (hModule)
        {
            typedef BOOL(WINAPI * pSetWindowCompositionAttribute)(HWND,
                                                                  WINCOMPATTRDATA *);
            const pSetWindowCompositionAttribute
                SetWindowCompositionAttribute =
                    (pSetWindowCompositionAttribute)GetProcAddress(
                        hModule,
                        "SetWindowCompositionAttribute");

            if (SetWindowCompositionAttribute)
            {
                ACCENTPOLICY policy =
                    {state ? ACCENT_ENABLE_BLURBEHIND
                           : ACCENT_DISABLE,
                     0, 0, 0};
                WINCOMPATTRDATA data = {19, &policy, sizeof(ACCENTPOLICY)};
                result = SetWindowCompositionAttribute(hwnd, &data);
            }
            FreeLibrary(hModule);
        }
    }
    else
    {
        HRESULT hr = S_OK;

        // Create and populate the Blur Behind structure
        DWM_BLURBEHIND bb = {0};

        // Enable Blur Behind and apply to the entire client area
        bb.dwFlags = DWM_BB_ENABLE;
        bb.fEnable = true;
        bb.hRgnBlur = NULL;

        // Apply Blur Behind
        hr = DwmEnableBlurBehindWindow(hwnd, &bb);
        if (SUCCEEDED(hr))
        {
            result = true;
        }
    }
    return result;
}

inline Napi::Value enableVibrancy(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    std::uint32_t hwnd = info[0].ToNumber();
    bool enable = info[1].ToBoolean();

    SetBlurBehind((HWND)hwnd, enable);

    return env.Undefined();
}
