生成 Git 提交消息时必须遵守以下规则：

- 只输出提交消息，不要解释
- 使用 Conventional Commits 简化格式：<type>(<scope>): <summary>
- type 只能使用：feat、fix、style、refactor、perf、docs、chore
- scope 使用英文小写，例如：theme、animation、ui、button、layout、config
- summary 使用中文，动词开头，简洁说明本次修改
- 第一行不超过 72 个字符
- 不要在 summary 末尾加句号
- 默认只生成一行提交消息
- 如果改动较多，可以增加正文，正文使用中文 bullet list

示例：

feat(theme): 优化主题切换动画效果

feat(theme): 优化主题切换动画效果

- 调整动画时长和缓动函数
- 增加动画方向控制
