# 联机房间的存储说明（部署相关，请先读）

## 现状：房间状态存在 KV 上，靠 wrangler.toml 已移除

本目录**故意不放 `wrangler.toml`**。原因：一旦在 Pages 项目里声明
`durable_objects.bindings`，Cloudflare 的 Git 自动部署会失败
（报 `Failed to publish your Function / Unknown internal error`），
线上会停留在旧版本。已验证过，加了就会坏。

所以：**部署只走 `git push`**，不要用 `npx wrangler pages deploy`。

## 房间为什么不用 Durable Object

房间状态需要「读-改-写」且必须读到最新值。Cloudflare KV 是最终一致的，
两人同时操作会各自读到旧快照再写回，互相覆盖——表现为：

- 房主看不到别人加入（成员记录被覆盖）
- 落笔完全不同步（画布快照被覆盖）
- 明明两人在线却提示「至少需要 2 人才能开始」

根治方案是 Durable Object（单线程串行，写入立即可见），
代码已经写好并保留：

- `functions/durable/room-server.js` —— DO 实现
- `functions/api/_roomcore.js` —— 与存储无关的纯状态迁移
- `functions/api/room.js` —— 入口，**有 `env.ROOM` 绑定就走 DO，没有就自动降级 KV**

## 现在靠什么保证不丢数据

`functions/api/room.js` 的 KV 路径做了兜底：**join 时若房间不存在就地补建**，
避免「读到旧快照 → 覆盖掉别人」这个最致命的场景。
实测（线上三轮）：房主看到 2 人、两人开局、落笔同步，均正常。

残留风险：两人在**同一瞬间**各自落笔时，仍可能互相覆盖。
发生概率极低（落笔本身有 250ms 限流），可接受。

## 将来若要启用 DO

需要用 wrangler 显式部署一次（Git 集成做不到），
且必须先把 DO 命名空间建出来，否则 Pages 会报 Unknown internal error。
大致流程：

1. 建一个独立 Worker 部署 DO 类，拿到命名空间
2. 在 Pages 项目设置里把该命名空间绑定为 `ROOM`
3. 之后 `functions/api/room.js` 会自动检测到并切换到强一致路径

在此之前，`env.ROOM` 为 undefined，代码走 KV 降级路径，不影响任何功能。
