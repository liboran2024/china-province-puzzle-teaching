# 拼出中国：中国政区互动拼图

## 先打开游戏：本机使用

本机直接双击 `E:\拼图\china-puzzle\启动游戏.bat`。程序通过已安装的 Python 启动本地网页服务并打开浏览器，保留运行窗口即可游戏，关闭窗口停止服务。无需登录 GitHub 或 ChatGPT。

下载压缩包后，请先全部解压，再双击其中的 `启动游戏.bat`，不要直接双击 `index.html`。换到其他电脑时需安装 Python 3 并让 `python` 命令可用。若未自动弹出浏览器，打开启动窗口打印的 `http://127.0.0.1:端口/` 地址。

GitHub仓库是私有的，必须在浏览器登录 `liboran2024` 或获授权账号才能查看。终端已登录不代表浏览器也已登录。GitHub Pages未启用不影响读取仓库；网络问题仍可能影响访问GitHub。

用于地理公开课的网页版小游戏，包含34个省级行政区轮廓、南海诸岛附图、拖拽吸附、港澳放大定位、提示、计时和通关庆祝。

本文件覆盖从获取源码、开发、测试、分支管理、构建到发布和回退的完整流程。初版范围与后续里程碑见 [plan.md](plan.md)。

## 1. 目前交付了什么

| 项目 | 状态与入口 |
| --- | --- |
| GitHub 源码仓库 | [liboran2024/china-province-puzzle-teaching](https://github.com/liboran2024/china-province-puzzle-teaching)，私有仓库 |
| `main` | 项目稳定基线及公共文档 |
| `teaching` | 当前教师教学版，课堂展示、提示、接力拼图 |
| `testing` | 从教学版建立的后续学生测试版开发起点；目前游戏功能相同，未实现独立测验规则 |
| 初版在线演示 | [Sites 演示](https://china-puzzle-classroom.libor1206.chatgpt.site)，原有私有发布，需有访问权限的账号 |
| 独立网页发布包 | `npm run build:web` 生成 `dist-web/`，无需 ChatGPT 登录即可运行 |
| GitHub 自动检查 | 推送或 PR 后运行类型检查、游戏状态检查、静态构建并保存构建产物 |
| GitHub Pages | 已提供手动发布工作流，尚未启用 Pages 或发布新的公开入口 |

上传 GitHub 不会自动替换原 Sites 网页。Git 分支也不会自动成为不同的网页地址。

## 2. 托管在哪里？中国大陆能否打开？

初版由 OpenAI 的 Sites 产品托管，域名是 `chatgpt.site`。本项目原构建配置 `vite.config.ts` 使用 Sites 和 Cloudflare Workers，属于托管平台部署，并不是在老师的电脑上长期运行的服务器。没有固定服务器 IP 或具体机房位置可供本项目确认。

要区分三个问题：

1. **账号权限**：当前 Sites 网页为私有访问。即使网络畅通，未获授权的学生也不能直接进入。
2. **网络可达性**：没有在目标学校和各地运营商网络上实测，不能断言大陆所有用户必然无法打开，也不能承诺稳定可用。课堂不应只依靠这一个入口。
3. **代码托管与网页托管**：GitHub 仓库负责源码、提交、分支；GitHub Pages 才负责静态网页。迁入 GitHub 不等于解决国内访问问题，Pages 的可达性也需要在实际网络验证。

面向课堂的部署方案是：GitHub 管理版本，独立静态发布包交给学校服务器或选定的网页托管服务；教室电脑保留一份本地运行版本作为课堂备用。当前尚未配置学校服务器、域名或第三方托管账号。

独立网页版本直接复用同一游戏组件，不调用 OpenAI API，也不需要 API Key。地图和字体样式均随页面资源加载，游戏过程不请求外部地图接口；页脚的数据来源链接仅在点击后打开。

## 3. 教师怎么使用

1. 进入游戏，观察左侧空白轮廓和右侧碎片。
2. 将碎片拖入相应区域，目标高亮后松手，正确即吸附锁定。
3. 错误位置不计分，碎片仍可再次拖动。
4. 香港、澳门可拖到主图实际位置，也可拖到带引线的放大定位区。
5. 点击“给我一点提示”将点亮选中碎片对应区域5秒；未选碎片时提示一个未完成区域。
6. 完成数达到34，弹出胜利提示与用时；可欣赏完整地图或再玩。

支持鼠标和触屏拖拽，也支持先点选碎片、再点击目标。键盘用 Tab 移动焦点、Enter 或空格操作目标，Esc 取消当前选择。进度只保存在当前页面内，刷新或重新开始会清空，不会上传学生成绩。

## 4. 本地开发：第一次准备

使用 Node.js **22.22.3**（与自动检查一致）、npm 和 Git。私有仓库需要先通过自己的 GitHub 账号登录。不要将账号令牌写入源码或文档。

在终端执行：

```bash
git clone https://github.com/liboran2024/china-province-puzzle-teaching.git
cd china-province-puzzle-teaching
git switch teaching
npm ci
npm run dev:web
```

打开终端打印的 Local 地址。开发服务会在保存代码后更新页面。结束时按 Ctrl+C。`npm ci` 根据 `package-lock.json` 安装确定版本；获取源码和首次安装依赖需要可用网络。

当前电脑的工程位置为 `E:\拼图\china-puzzle`。如果已在该目录工作，直接切换分支并启动，不需要再次克隆覆盖。

### 日常开发

```bash
git switch teaching
git pull --ff-only origin teaching
npm run dev:web
```

编辑完成后检查：

```bash
npm run check
npm run build:web
```

新增或调整依赖时使用 npm，提交 `package.json` 与 `package-lock.json` 的同步变化；只修改页面无需重装依赖。

## 5. 文件怎么找

```text
app/page.tsx                 游戏界面、拖拽、触屏、提示、弹窗
app/globals.css              地图和界面样式、响应式布局、动画
app/layout.tsx               原 Sites 路径的网页标题与布局
lib/game.ts                 完成判定、去重计数、计时格式等逻辑
lib/map-data.json           从原数据生成的34区SVG轮廓和南海附图
public/china-source.json    随仓库保存的原始地图数据
scripts/prepare-map.mjs     将原始地图转为游戏使用的数据
scripts/check-game.mjs      行政区和游戏状态自动检查
web/main.tsx                独立静态网页入口，复用app/page.tsx
index.html                  独立网页HTML入口
vite.web.config.ts          独立静态构建配置（输出dist-web）
vite.config.ts              原Sites/Cloudflare构建配置（输出dist）
.openai/hosting.json        原Sites项目关联信息，不是GitHub发布配置
.github/workflows/check.yml 自动检查与发布包产物
.github/workflows/pages.yml GitHub Pages手动发布流程
plan.md                     开发计划和后续测试版范围
```

`node_modules/`、`dist/`、`dist-web/`、本地环境文件和类型检查缓存不提交。构建产物由 Actions 提供，源码提交用于追溯和重建。

## 6. 地图数据与更新

- 数据来源：[DataV.GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector)。
- 原始接口：[100000_full.json](https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json)。
- 首次获取日期：2026-09-06。第三方数据不因进入本仓库自动变为本项目自有版权。
- 34个具名行政区分别生成碎片；`100000_JD` 是附加界线要素，不算第35块。
- 主图采用统一经纬度缩放。低纬远海要素在南海附图展示；港澳保留真实轮廓并增加放大操作区。
- 本游戏为教学互动示意，不标注虚构审图号。自动检查验证数量、范围和状态，不等于地图专业审校。

需要更新时，将核对后的数据替换到 `public/china-source.json`，再运行：

```bash
npm run map:prepare
npm run check
npm run build:web
```

生成脚本已改为只读取仓库内部文件，新电脑克隆后可以直接重新生成。核对主图、台湾、港澳、南海附图，记录数据日期后再提交；不要手动编辑大段SVG路径替代原始数据。

## 7. 分支：教学版与后续学生测试版

| 分支 | 用途 | 发布约定 |
| --- | --- | --- |
| `main` | 经确认的稳定基线、共享文档 | 不因推送而自动发布网站 |
| `teaching` | 教师公开课教学版 | 本次交付；保留提示与区域名称 |
| `testing` | 后续学生练习/测验版 | 初始代码与教学版相同，测验差异尚待开发 |

在 GitHub 仓库文件列表上方的分支选择器切换分支。点击提交历史可查看某次修改；Compare 页面可比较 `teaching` 与 `testing`。

“测试版”在本项目里指后续学生使用的版本，不自动意味着仅供开发者测试。正式开发前需要确认是否隐藏名称、限制提示、计时计分、记录错放次数、提交成绩等规则。目前没有账号系统、考试防作弊或成绩数据库。

修改教学版：

```bash
git switch teaching
git pull --ff-only origin teaching
# 修改代码后
npm run check
npm run build:web
git add app lib scripts README.md plan.md
git commit -m "改进课堂拼图交互"
git push origin teaching
```

修改学生版时使用 `git switch testing`。后续有公共修复，可通过 PR 或选择对应提交同步到另一分支。两个版本产生不同教学规则后，不要直接用整分支覆盖彼此。

分支只是源码版本，不提供访问控制。教师/学生若需要两个同时在线入口，应将对应构建分别放到 `/teacher/` 与 `/student/`，或使用两个部署项目。不能把教学答案仅靠隐藏按钮保护。

## 8. 构建可独立发布的网页

```bash
npm ci
npm run check
npm run build:web
npm run preview:web
```

`dist-web/` 包含 `index.html`、`assets/`、地图数据和图标；整目录一起发布。`preview:web` 只用于验收预览，不作为公网生产服务器。

静态构建使用相对资源路径，可放在网站根目录或子目录。不能只上传一个 HTML 文件。不要双击 HTML 用 `file://` 打开，浏览器对模块脚本的限制可能导致空白，应使用 HTTP 服务。

### 不依赖外网的课堂本地运行

在联网电脑构建好 `dist-web/`，将整个目录复制到装有 Python 3 的教室电脑：

```bash
python -m http.server 8080 --bind 127.0.0.1 --directory dist-web
```

打开 `http://127.0.0.1:8080/` 即可投屏。已有 Python 和发布包时，不需要 npm 或外网。若要让同一局域网的学生设备访问，可由学校管理员将监听地址设为 `0.0.0.0`、允许对应端口，并使用教师电脑的局域网 IP。网络隔离和防火墙需在现场验证；此临时服务不用于公网。

## 9. 发布路径A：GitHub保存代码和每个分支的发布包

本次默认执行这条路径，不要求公开源码，也不自动把学生导向 GitHub。

1. 推送 `main`、`teaching` 或 `testing`。
2. 在仓库 **Actions → Check and build classroom web** 查看该分支和提交的运行。
3. 工作流依次安装依赖、检查、构建静态网页。
4. 成功后在运行详情的 **Artifacts** 下载对应 `china-puzzle-分支-提交`。
5. 解压得到发布文件，可交给学校服务器管理员；产物默认保留14天，长期归档请另存。

红色失败不等于网站更新成功。先查看失败步骤，修复后重新提交。自动检查不会覆盖已上线的网页。

## 10. 发布路径B：GitHub Pages（可选，尚未启用）

GitHub Pages 只提供静态网页托管，不能直接运行本项目原 `dist/server` 中的 Worker。因此必须发布 `dist-web/`。

1. 先确认 GitHub 账号套餐是否支持当前私有仓库使用 Pages；若不支持，可选学校服务器，或自行决定是否公开仓库。不要为启用 Pages 未经考虑公开代码。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 进入 **Actions → Publish selected branch to GitHub Pages → Run workflow**。
4. 选择 `teaching` 分支并运行；工作流会检查、构建、上传并部署。
5. 若 `github-pages` 环境限制只能从默认分支发布，在仓库 **Settings → Environments → github-pages** 将允许发布分支明确设置为 `teaching`，以后按需加入 `testing`。
6. 等待部署成功，使用该次运行返回的实际 URL。预期项目路径通常是 `https://liboran2024.github.io/china-province-puzzle-teaching/`，目前不能将它当作已开通入口。
7. 在未登录 GitHub 的窗口和学校真实网络检查访问效果；Pages 的访问规则不同于私有源码仓库权限，普通 Pages 发布可能对公众可见。

**一个仓库的 Pages 默认只有一个站点。** 手动用 `testing` 发布会替换此前 `teaching` 发布的内容，不会自动产生第二个学生入口。要同时上线两版，先设计双目录打包或分别部署，当前工作流没有宣称支持双站点。

该工作流仅手动触发，普通推送不会发布，以免未完成的学生版覆盖课堂版。

## 11. 发布路径C：学校或其他静态服务器

将验证过的分支构建为 `dist-web/`，然后：

1. 为本次发布创建带版本号的空目录，例如站点内的 `releases/teaching-2026-09-06/`。
2. 将 `dist-web/` 内全部文件上传至该目录；不上传 `node_modules`、源码或 `.env`。
3. 通过临时路径验证首页、JS/CSS和34区拼图资源可以访问。
4. 让服务器管理员将教师入口指向此版本目录，记录 Git 提交号、入口、发布时间和上一版本目录。
5. 后续学生版重复同一流程，使用独立 `/student/` 入口，不覆盖教师课堂目录。

本项目无需后台数据库或 OpenAI 密钥，普通静态 HTTP/HTTPS 服务即可承载游戏。服务器账号、域名和访问策略尚未提供，本次未部署到第三方或学校服务器。是否可供大陆学生稳定访问，以所选网络、服务和现场验证为准。

## 12. 原Sites发布流程与本次迁移的关系

原版本仍使用 `npm run dev`、`npm run build` 和 `vite.config.ts`；原发布入口不因本次 GitHub 上传自动更新。

Sites 的完整流程是：修改源码 → 检查 → 构建 → 将准确提交推送至 Sites 指定源码仓库 → 保存对应版本 → 部署已保存版本 → 等待发布成功 → 核对返回的生产URL和访问权限。保存版本与上线是不同步骤。

`.openai/hosting.json` 只关联原 Sites 项目，不会授权其他 GitHub 用户发布该站点。日常独立开发使用 `*:web` 命令即可，不需要配置 Sites。不要把 `dist-web/` 与 Worker 的 `dist/` 混为一谈。

## 13. 验收与回退

自动检查覆盖：34区名单、有效SVG与范围、南海附图、错放、无效ID、重复落位、34块通关、计时和重置。类型检查与静态构建也由 CI 执行。

当前尚未完成真实浏览器拖拽回归、课堂触屏实测和学校网络验收；WebMCP工具也未在支持该API的浏览器中验证。不要将构建成功写成全部功能实操验收通过。

上课前实操：

- 从上方和下方碎片区分别拖动；错放后应能再次操作。
- 完成香港、澳门、台湾、海南等区域；确认南海附图可见。
- 反复点击已完成碎片，计数不能增加。
- 验证提示、重新开始、全部34块胜利弹窗。
- 用实际投影分辨率、触屏设备、浏览器缩放测试操作。
- 在学校网络打开正式入口；另用本地HTTP版本演练外网断开时的投屏。

回退代码时先保持工作区干净，通过 `git log --oneline` 选择需要撤销的提交，使用 `git revert <提交号>` 生成可追溯的撤销提交，再检查、构建、推送和重新发布；不要强推删除历史。只需临时查看旧版，可 `git switch --detach <提交号>`，结束后切回原分支。服务器发布回退可切回保留的上一版本目录。

## 14. 常见问题

| 现象 | 检查方式 |
| --- | --- |
| 页面白屏 | 是否通过HTTP打开；是否遗漏assets；部署的是否是dist-web内文件 |
| 教师修改后线上没变化 | 推送源码不等于部署；查看实际发布分支、提交和缓存 |
| Sites要求登录 | 这是原私有站点的权限，不是游戏自身需要登录 |
| GitHub仓库404 | 私有仓库需登录所有者或获授权账号 |
| Pages工作流报权限/404 | 检查套餐、Settings→Pages、环境允许分支；尚未启用时不会自动成功 |
| 两个分支只有一个网址 | 单个Pages站点被最后一次部署替换；需另做双目录或双项目发布 |
| 地图重新生成失败 | 在仓库根目录执行，检查public/china-source.json是否存在且有效 |
| npm安装失败 | 检查Node版本和当前网络能否访问npm源，不是地图拖拽代码问题 |

## 15. 官方参考

- [OpenAI Sites说明](https://learn.chatgpt.com/zh-Hans/docs/sites)
- [GitHub Pages是什么](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Pages自定义发布工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

维护日期：2026-09-06。
