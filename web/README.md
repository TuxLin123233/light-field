# 光域画板 · Web 端（云端画板 + 灯板数据接口）

光域项目的**云端（Web）部分**：挂在 **Cloudflare Pages** 上的像素画板（16×16 / 32×32 / 64×64，默认 16×16），负责创作、存档与展示；同时为灯板（ESP32-C3 嵌入式端）提供像素数据接口，让画板上的作品能实时投到 16×16 灯板。

线上地址：<https://light-field.pages.dev>

## 技术栈

- 前端：原生 HTML / CSS / JS（单文件页面，无框架）
- 后端：Cloudflare Pages Functions
- 存储：Cloudflare KV（`LIGHTFIELD_KV`）

## 页面

| 路由 | 说明 |
| --- | --- |
| `/paint` | 画板主页（编辑 + 上传 + 最新 10 条） |
| `/gallery` | 全部作品卡片流（懒加载，可预览 + 点赞 + 分享） |
| `/room` | 联机房间（创建 / 加入，3 人协同作画） |
| `/admin` | 管理后台（`x-admin-key` 校验） |
| `/terms` | 服务条款 |

## 特性

- **可切换画布尺寸**：16×16（默认）/ 32×32 / 64×64，草稿与「载入编辑」会自动跟随作品尺寸
- **作品名 / 作者名分开填**：单人标「作品名 + 一位作者」；联机发布自动标「房间作品名 + 全部画家名」；历史作品作者显示「匿名」
- **本地草稿自动保存**（刷新 / 返回不丢失）
- **作品库**：画板展示最新 10 条，`/gallery` 卡片流滚动懒加载（每页 24 张）
- **点赞 + 佳作展示**：画廊每张作品可点赞（本地防重复），Top 5 支持**总榜 / 今日 / 本周**切换
- **深色模式**：画板 / 画廊 / 房间三页可切换，记住偏好并跟随系统
- **联机房间**：最多 3 人协同作画（轮询同步），共享作品名，最后一个成员退出立即删除，未正常退出由 KV 30 分钟 TTL 清理
- **一键回载**：浏览器本地记住本人上传的作品，画板历史区可「载入编辑」继续画
- **键盘快捷键**：`B` 画笔 / `E` 橡皮 / `F` 填充 / `C` 颜色 / `Z` 撤销
- **自定义颜色**：画板与房间都支持输入 `#RRGGBB` 取色，房间另有系统调色板；工具栏用 emoji
- **分享单张**：`/gallery?t=<时间戳>` 直达并高亮
- **上传限流**：每 IP 5 分钟最多 1 次（429）
- **LED 灯板支持**：`GET /api/get?single=1` 每次只回一张随机作品（灯板轮询用）
- **历史容量**：最多 1000 条，超出自动删最旧
- **防抄袭**：仅可预览不可载入；内容完全相同拒绝重复（409）
- **管理后台**：密钥校验，支持删除单条 / 清空

## API

所有接口在 `functions/api/`，均为 Pages Functions。

| 接口 | 说明 |
| --- | --- |
| `POST /api/set` | 上传作品。body：`{ "pixels": [[r,g,b]×size²], "size": 16|32|64, "workName": "作品名(可空)", "author": "作者名(可空，多人顿号分隔)" }`；默认 size 16；重复 409；历史超 1000 删最旧；每 IP 5 分钟限 1 次（429） |
| `GET /api/get` | 最新作品 + 历史。`?after=` 无新作随机回退旧图；`?limit=&offset=` 分页；`?single=1` 随机一张（灯板）；`?locate=` 分享定位 |
| `POST /api/like` | 点赞 `{ time }` |
| `GET /api/like` | 按赞数 Top N。`range=today|week|all` + `tz=分钟`（东八区 480） |
| `POST /api/room` | 房间统一入口。`action=create/join/leave/draw/title`，6 位码，最多 3 人 |
| `GET /api/room?code=` | 拉取房间画布、版本号与成员 |
| `POST /api/admin/*` | 管理：`delete` / `clear` / `verify`，header 需 `x-admin-key` |

## 灯板接入（嵌入式端）

轮询即可，每次返回单张随机 **16×16** 作品（不含历史，响应体小；32/64 作品不会喂给灯板）：

```
GET /api/get?single=1
→ { "pixels": [[r,g,b]×256], "name": "...", "time": 1234..., "random": true }
```

嵌入式固件（ESP32-C3 + WS2812 灯板）见上级目录 `光域.ino`。

## 本地开发

```sh
npx wrangler pages dev public
```

本地 KV 绑定见 `wrangler.toml` 注释，把 `id` 换成你的 namespace ID。

## 部署配置（Cloudflare Pages 控制台）

- **Functions → Bindings**：添加 KV 绑定 `LIGHTFIELD_KV` → `lightfield`
- **环境变量**：`ADMIN_KEY`
- **构建**：Build command `true`、Root directory `web`、构建输出目录 `public`（自动发布 `web/public` 并编译 `web/functions` 为 Pages Functions）