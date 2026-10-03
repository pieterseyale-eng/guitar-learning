# CAGED Scale Trainer (Web)

## Goal
做一个网页小工具，用来练习 CAGED 音阶指型的记忆：
1) 认形状：看到指板上高亮的形状，回答这是 C/A/G/E/D 哪个形状。
2) 认度数：给定一个形状，在形状内高亮一个音，回答它在该形状中是 1-7 级。

## Users
- 会弹吉他，正在背 CAGED 音阶指型的人
- 想用“视觉识别 + 快速反馈”提高指型记忆速度

## Scope (MVP)
### A. Fretboard 渲染
- 用 SVG 渲染指板（6弦，默认16品）
- 显示左侧弦名（E B G D A E），底部品位数字（1..16）
- 支持在指板上渲染圆点（shape点：淡色；target点：高亮）

### B. Mode 1: Shape Quiz
- 随机选择一个 shapeId (C/A/G/E/D) 与一个 root 位置（先固定在安全范围）
- 显示该形状的全部点位（淡色）
- 提供按钮：C A G E D
- 用户选择后立即反馈正确/错误，并进入下一题
- 统计：总题数、正确题数、连对数

### C. Mode 2: Degree Quiz
- 随机选择一个 shapeId 与 root 位置
- 在该形状点位里随机选一个 target 点（高亮）
- 提供按钮：1 2 3 4 5 6 7（键盘也可输入）
- 用户选择后立即反馈正确/错误，并进入下一题
- 统计：总题数、正确题数、连对数
- 可选：记录每个 (shapeId, degree) 的错误次数，为后续自适应出题做准备

## Out of Scope (Later)
- 自动识别音高/听你弹
- 支持多种音阶模式（小调、五声音阶等）
- 自定义指板调弦/24品/左手模式

## Data Model
### Shapes
- 用一个 ShapeLibrary 定义 5 个形状
- 每个形状是一个相对坐标点集 notes[]：
  - sOff: 相对根音弦偏移（0同弦，+1往高音弦，-1往低音弦）
  - fOff: 相对根音品偏移
  - degree: 1..7

### Placement
- 给定 rootString（建议固定6或5）与 rootFret（建议3..10）
- 将相对坐标平移为绝对坐标 (stringIndex, fret)
- stringIndex: 0..5（0=高音E，5=低音E）
- fret: 1..16

## Acceptance Criteria
- `npm run dev` 可启动
- 页面可切换两种模式
- 两种模式都能连续出题、答题、反馈
- 指板显示清晰、圆点位置正确

## Tech
- Vite + React + TypeScript
- SVG for fretboard rendering
- No backend; state stored in memory (later can add localStorage)