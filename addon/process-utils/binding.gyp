{
    "targets": [
        {
            "target_name": "process_utils",
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")",
                "src"
            ],
            "sources": [
                "src/main.cc",
                "src/win-process-utils.h",
                "src/utils/n-utils.h",
                "src/utils/win-utils.h",
                "src/utils/node_async_call.h",
                "src/utils/node_async_call.cc"
            ],
            "defines": [
                "NAPI_DISABLE_CPP_EXCEPTIONS",
                "UNICODE"
            ],
            "cflags!": [
                "-fno-exceptions"
            ],
            "cflags_cc!": [
                "-fno-exceptions"
            ],
            "conditions": [
                [
                    "OS=='win'",
                    {
                        "defines": [
                            "_UNICODE",
                            "_WIN32_WINNT=0x0601"
                        ],
                        "link_settings": {
                            "libraries": [
                                "-lMincore.lib"
                            ]
                        },
                        "configurations": {
                            "Release": {
                                "msvs_settings": {
                                    "VCCLCompilerTool": {
                                        "ExceptionHandling": 1
                                    }
                                }
                            },
                            "Debug": {
                                "msvs_settings": {
                                    "VCCLCompilerTool": {
                                        "ExceptionHandling": 1
                                    }
                                }
                            }
                        }
                    }
                ]
            ]
        }
    ]
}
