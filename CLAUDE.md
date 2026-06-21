# CLAUDE.md — 红军长征数字展览 · 开发铁律

## 1. 禁止孤立单页

**所有历史场景必须共存于同一个主应用框架（exhibition.html）内。**

- 严禁为任何单个场景（湘江战役、遵义会议、飞夺泸定桥等）创建独立的 `.html` 文件。
- 新场景只能通过以下方式加入：
  - 向 `rawScenes` 数组追加新的数据对象；
  - 在 `renderPage()` 函数中添加对应的类型分支（如 `theaterData`）；
  - 在 CSS `<style>` 块中添加场景专属样式类。
- `exhibition.html` 是唯一的 HTML 入口文件，其他 `.html` 仅作为临时原型参考。

## 2. 严格的 CSS 样式隔离

**修改任何场景的视觉效果时，所有自定义 CSS 必须嵌套在该场景的唯一根类名内。**

- 示例 —— 修改湘江战役的样式：
  ```css
  /* 正确 */
  .xiangjiang-theater .story-panel { ... }
  .xiangjiang-theater .passage-btn { ... }

  /* 错误 —— 会污染全局 */
  body { background: #140505; }
  h2 { color: red; }
  ```
- 跨场景共享样式统一使用 `:root` 下的 CSS 变量（`--red-accent`, `--gold`, `--paper` 等）。
- 响应式 `@media` 查询同样必须嵌套在场景根类名下，禁止全局覆盖 `body` / `html` / `*`。

## 3. 全局状态机管理转场

**页面过渡按钮必须通过修改全局状态实现场景切换，禁止 `alert()` 或本地页面跳转。**

- 当前状态由 `currentIdx`（页面索引）和 `goToPage(idx)` 函数控制。
- 场景专属按钮（如血幕谢幕按钮）的正确流程：
  1. 触发视觉转场（血幕 `opacity: 1`）
  2. `setTimeout` 等待转场完成（700ms）
  3. 调用 `goToPage(nextIdx)` 切换至下一页面
  4. 恢复转场覆盖层（血幕 `opacity: 0`）
- 禁止在场景按钮中直接操作 `window.location` 或 `alert()`。

## 项目结构

```
红军文化展览/
├── exhibition.html    ← 唯一入口，含所有 CSS + JS + rawScenes 数据
├── index.html         ← 旧版，不再维护
├── images/            ← 所有图片资源
│   ├── 湘江战役剪影.png
│   ├── 血战湘江.jpg
│   ├── 血战湘江ai图片.png
│   ├── 湘江战役陈树湘.jpg
│   └── 易荡平的蓑衣.png
└── 革命文物/          ← 更多文物图片素材（未全部导入）
```
