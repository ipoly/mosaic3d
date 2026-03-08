# Mosaic3D

一个使用 p5.js 创建的 3D 马赛克动画可视化项目。粒子（球体）在不同图像配置之间平滑过渡。

## 在线演示

[https://ipoly.github.io/mosaic3d/](https://ipoly.github.io/mosaic3d/)

## 功能特点

- 40,000 个粒子组成的 3D 马赛克效果
- 图像切换时的球体爆炸/聚合动画
- 鼠标拖拽旋转视角（带惯性）
- 支持触屏设备
- 响应式布局

## 操作方式

- **左键点击**: 切换到下一张图片
- **右键点击**: 切换到上一张图片
- **鼠标拖拽**: 旋转视角
- **点击缩略图**: 直接跳转到对应图片

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 技术栈

- [p5.js](https://p5js.org/) - 创意编程库
- [Vite](https://vitejs.dev/) - 构建工具
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

## 项目结构

```
src/
├── main.ts      # 入口：初始化 p5 实例、事件处理
├── Ball.ts      # Ball 类：3D 球体，位置/颜色插值
├── Mosaic.ts    # Mosaic 类：管理 4 万个球体，动画状态机
└── View.ts      # View 类：鼠标拖拽旋转视角（带惯性）
```

## 许可证

ISC
