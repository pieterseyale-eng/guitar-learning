# Guitar Learning

一组用于吉他指板、音阶和 CAGED 系统记忆训练的小工具与学习资料。

## 项目内容

| 目录 | 说明 | 技术栈 |
| --- | --- | --- |
| `caged-trainer/` | CAGED 指型识别与音级练习，包含 SVG 指板、答题统计和可选指型范围 | React 19、TypeScript、Vite 7 |
| `scale-trainer/` | 12 个大调音阶的音级问答练习 | React 18、TypeScript、Vite 5 |
| `memory——diao/` | 单页吉他调式记忆原型 | HTML |
| `memory fingerboard/` | 指板记忆工具的产品需求文档 | Markdown |
| `fretboard.png` | 指板参考图 | PNG |

## 本地运行

两个 React 应用分别安装和启动：

```bash
cd caged-trainer
npm install
npm run dev
```

或：

```bash
cd scale-trainer
npm install
npm run dev
```

Vite 会在终端显示本地访问地址。

## 构建与检查

```bash
cd caged-trainer
npm run build
npm run lint

cd ../scale-trainer
npm run build
```

## CAGED 调试模式

启动 `caged-trainer` 后，在地址后加入 `?debug=1`，可以显示音级标签和根音位置。
