# YPlayer - 网易云音乐网页播放器

YPlayer是一个基于网易云音乐API的现代化、轻量级网页音乐播放器，具备登录、个人中心、歌单管理、音乐播放及评论功能，同时确保移动端与桌面端的良好兼容性。

## 技术栈

- **前端框架**: Vue.js
- **UI框架**: Ant Design for Vue
- **状态管理**: Pinia
- **API请求**: Axios
- **音频处理**: Howler.js
- **构建工具**: Vite
- **代码规范**: ESLint, Prettier
- **版本控制**: Git
- **路由管理**: Vue Router

## 功能模块


### 1. 用户认证系统
- 网易云音乐账号登录功能 (支持手机号+验证码登录)
- 登录状态管理与持久化
- 登录态过期自动刷新机制

### 2. 个人中心
- 用户基本信息展示 (头像、昵称、等级等)
- 我的收藏 (歌曲、专辑、歌手)
- 最近播放记录
- 个人设置 (主题切换、播放偏好等)

### 3. 歌单系统
- 我的歌单列表与管理
- 歌单详情页 (包含歌曲列表、创建者信息、简介等)
- 推荐歌单展示
- 歌单搜索功能
- 歌单收藏/取消收藏

### 4. 音乐播放功能
- 核心播放器组件 (播放/暂停、上一首/下一首、进度条、音量控制)
- 播放模式切换 (顺序播放、随机播放、单曲循环)
- 歌词显示与同步滚动
- 音频质量切换
- 后台播放支持
- 播放历史记录

### 5. 评论系统
- 歌曲评论列表与分页加载
- 热门评论突出显示
- 评论点赞功能
- 发表评论功能

### 6. 搜索功能
- 支持歌曲、歌手、专辑、歌单搜索
- 搜索建议功能
- 搜索历史记录

## 项目结构

```
Yplayer/
├── .gitignore
├── .trae/
│   └── rules/
│       └── project_rules.md
├── .vscode/
│   └── extensions.json
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── prompt.md
├── public/
│   └── vite.svg
├── src/
│   ├── App.vue
│   ├── api.js
│   ├── assets/
│   │   └── vue.svg
│   ├── components/
│   │   ├── Navbar.vue
│   │   └── PlayerBar.vue
│   ├── main.js
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   ├── player.js
│   │   └── user.js
│   ├── style.css
│   └── views/
│       ├── Home.vue
│       └── Login.vue
└── vite.config.js
```

## 开发指南

### 环境准备
1. 确保已安装Node.js (v16+) 和 npm
2. 克隆项目到本地
3. 安装依赖
   ```bash
   npm install
   ```

### 开发运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码规范
- 使用ES6+语法
- 组件化开发，拆分合理
- 函数式编程风格
- 清晰的代码注释 (公共组件、工具函数、关键逻辑)
- 避免冗余代码
- 命名规范统一 (驼峰命名法)

## API集成
本项目基于网易云音乐NodeJS API (https://music163-jet.vercel.app) 开发，通过Vite的代理功能避免跨域问题。

## 注意事项
- 遵守网易云音乐API使用规范
- 确保用户数据安全
- 处理网络异常与离线情况
- 考虑低性能设备的体验优化
- 代码可维护性与扩展性

## 项目展示
![PC端](./img/1.png)
![移动端](./img/2.png)
