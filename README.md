# 拼出中国

地理公开课使用的34省级行政区拼图。React + SVG；地图数据本地打包。

## 使用
拖拽右侧碎片到对应轮廓，松手吸附。也可点选碎片，再点地图目标；键盘通过 Tab 和 Enter 操作。港澳有放大定位区。提示点亮目标5秒。全部34块完成弹出胜利提示；重新开始清空本轮进度。

## 地图来源
- 原始数据：https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
- 来源页面：https://datav.aliyun.com/portal/school/atlas/area_selector
- 获取日期：2026-09-06。
- 34个具名行政区分别生成拼图；附加的100000_JD界线不计入34块。
- 主图采用统一经纬度缩放，纬度17.5度以南的远海要素移入南海附图；附图使用原始岛屿与界线坐标，港澳另设放大操作区。教学互动示意，不标注虚构审图号。

## 开发与检查
`npm run dev` 启动；`npm run build` 构建；`node --experimental-strip-types scripts/check-game.mjs` 检查游戏状态和数据完整性；`npx tsc --noEmit` 检查类型。

地图转换脚本 scripts/prepare-map.mjs 从上级目录 china-source.json 重新生成。原始数据也保存在 public/china-source.json。

WebMCP在浏览器支持时提供读取进度及放置碎片两个工具，复用同一游戏状态。当前未进行支持WebMCP的浏览器环境验证。
