# 光域（Light Field）

<div align="center">

[![Platform](https://img.shields.io/badge/%E5%B9%B3%E5%8F%B0-ESP32--C3-blue.svg?style=for-the-badge)]()
[![Framework](https://img.shields.io/badge/%E6%A1%86%E6%9E%B6-Arduino-yellowgreen.svg?style=for-the-badge)]()
[![Driver](https://img.shields.io/badge/%E9%A9%B1%E5%8A%A8%E5%BA%93-FastLED-brightgreen.svg?style=for-the-badge)]()
[![Language](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-C%2B%2B-blue.svg?style=for-the-badge)]()
[![GitHub last commit](https://img.shields.io/github/last-commit/TuxLin123233/light-realm.svg?style=for-the-badge)]()
[![GitHub repo size](https://img.shields.io/github/repo-size/TuxLin123233/light-realm.svg?style=for-the-badge)]()

</div>

一个基于 **ESP32-C3** 与 **16×16 WS2812 矩阵灯板** 的嵌入式灯光控制系统（**光域的嵌入式端**；云端画板见本目录下的 `web/` 子项目）。

目前已完成基础硬件搭建和 FastLED 驱动测试，能够通过代码控制矩阵显示指定颜色和图案，并已实现根据环境光照自动调节灯板亮度的功能。未来将逐步实现云端远程控制、前端画板交互等功能，打造一套完整的智能灯光控制方案。

> **WiFi 密钥不入库**：先把 `wifi_secret.example.h` 复制为 `wifi_secret.h` 并填入你的 WiFi 名/密码（该文件已被 `.gitignore` 忽略），再编译上传。

## 硬件清单

| 组件 | 数量 | 说明 |
| --- | --- | --- |
| ESP32-C3 SuperMini 开发板 | 1 | 主控 |
| 16×16 WS2812 矩阵灯板 | 1 | 256 颗灯珠显示面板 |
| 400 孔面包板 | 1 | 电路搭建 |
| Micro USB 电源模块 | 1 | 5V 输入供电 |
| 1000µF 电解电容 | 1 | 灯板电源滤波 |
| 100µF 电解电容 | 1 | 开发板电源滤波 |
| 470Ω 电阻 | 1 | 信号线保护 |
| 1N4007 二极管 | 1 | 灯板防反接保护 |
| 光敏电阻模块 | 1 | 环境光照检测（带 AO/DO 输出） |
| 杜邦线 | 若干 | 电路连接 |
| 5V 3A 电源适配器 | 1 | 外部供电 |

## 接线说明

- **电源**：使用 5V 3A 电源适配器供电，接线分两路：
  - 经 Micro USB 电源模块为开发板供电，并并接 100µF 电解电容滤波；
  - 一路直接为灯板供电，并接 1000µF 电解电容滤波，同时串联 1N4007 二极管防止接反损坏灯板。
- **信号**：ESP32-C3 的 **GPIO8** 作为灯板数据输入引脚，信号线上串联 470Ω 电阻做保护。
- **光敏模块**：
  - `VCC` → 开发板 **3.3V**
  - `GND` → 面包板 **GND 轨**
  - `AO` → ESP32-C3 的 **GPIO3**（ADC 采样）

![电路接线图](电路图.png)
![展示图](展示图.jpg)

## 软件环境

- **系统**：Linux
- **IDE**：VS Code + Arduino 扩展
- **依赖库**：FastLED
- **开发板支持包**：MakerGO ESP32 C3 SuperMini（`esp32:esp32:makergo_c3_supermini`）
- **ADC**：通过 ESP32-C3 内置 ADC 读取光敏模块 AO 端的光照值，用于亮度调节

## 已完成功能

- [x] 硬件电路搭建与供电系统调试
- [x] FastLED 库驱动 WS2812 矩阵
- [x] 基础灯光测试（点亮指定数量灯珠、颜色控制）
- [x] 光敏自动调光（根据环境光照强度自动调节灯板亮度）

若使用 VS Code + Arduino 扩展，选择 `光域.ino` 作为工程文件，开发板选择 `MakerGO ESP32 C3 SuperMini`，编译上传即可。

## 未来规划

- [x] 云端画板网页 + 数据接口（已完成，见 `web/` 子项目，Cloudflare Pages + KV）
- [ ] 让 ESP32-C3 获取云端画板数据，在灯板上实时显示像素画
- [ ] 使用 ESP8266 / ESP32-C3 获取云端数据，通过 ESP-NOW 转发给灯板
- [ ] 实现远程实时控制矩阵显示

## 项目结构

```
光域/
├── README.md       # 项目说明（嵌入式端 + Web 总览）
├── 光域.ino         # 嵌入式主程序（FastLED 驱动）
├── 电路图.png        # 硬件接线图
├── 展示图.jpg        # 效果展示图
├── demo/            # 演示程序
├── .vscode/         # VS Code 配置
└── web/             # 云端画板 Web 端（Cloudflare Pages + KV，见 web/README.md）
```

## 版本控制

- 本仓库为**光域总仓库**（嵌入式 + Web）：GitHub `TuxLin123233/light-field`（原嵌入式仓库 `light-realm` 已合并）
- 嵌入式历史保留在 `realm` remote