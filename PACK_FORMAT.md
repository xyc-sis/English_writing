# 学习包协议 v1

请根据已核对的作文照片和讲解输出一个 UTF-8 JSON 文件，不使用 Markdown 围栏。看不清的文本先确认，禁止猜测。原稿保留错误，纠正在 corrections 单列。区分自写与模板，不凭语言好坏判断来源。每篇默认精选 3–4 个重点，其余按需要补充。每条表达说明用途和适用条件。

最外层：`{"schemaVersion":1,"essays":[...]}`。支持多篇导入。

每篇必须有以下字段：

| 字段 | 含义 |
| --- | --- |
| id | 稳定唯一字符串，如 english1-2010-large；更新时不变 |
| title | 作文名称 |
| type | large 大作文 / small 小作文 |
| form | 图画 / 图表 / 文字情境等；与话题独立 |
| topics | 非空字符串数组，可多选话题 |
| task | 小作文必填：邀请信、建议信、感谢信、道歉信、投诉信、申请信、推荐信、通知等；大作文可省略 |
| prompt | 题目文本 |
| original | 原稿片段数组，每个含 text 和 source |
| model | 范文全文，段落用 JSON 的 \n\n 表示 |
| corrections | 纠错数组，每条有 before、after、reason |
| points | 学习重点数组，每条有 title、explanation、example、scope |
| cards | 背诵卡数组，每条有 id、prompt、answer、usage，可加 scope |
| exercises | 练习数组，每条有 id、kind、prompt、answer、usage，可加 hint、scope |

source 可为 self（自写）、template（模板）、adapted（借鉴改写）、unmarked（尚未确认）。同一段内来源不同可以分成多个片段，不必整段强行归类。

kind 为 exact（拼写/单答案填空）或 open（开放改写）。开放改写不得因为答案与示例不同判错。卡片和练习 id 在各自数组中唯一；实质改变题意时使用新 id，避免继承旧熟练度。usage 用于说明功能，如描述图画、描述数据、解释原因、提出建议、表达邀请等。

建议话题：个人成长、教育学习、人际关系、社会生活、科技网络、文化交流、环境保护、经济消费。允许补充标签，但同一概念尽量用同一名称。

四个内容数组允许为空；不要为了凑数编造错误或学习点。原稿、范文和题目必须有文字。最大文件 10 MB。不包含脚本、HTML 或图片附件，内容按纯文本显示。

首次使用可在网页空书架点击「下载示例格式」获取完整可导入样例。备份包含 kind: backup 和 progress；普通学习包不要设置这两个字段。
