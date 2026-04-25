

---

# WeCollege 校园生活圈小程序技术文档

## 目录

1. [项目概述](#1-项目概述)
2. [技术选型](#2-技术选型)
3. [系统架构](#3-系统架构)
4. [功能模块设计](#4-功能模块设计)
5. [数据库设计](#5-数据库设计)
6. [接口设计](#6-接口设计)
7. [核心代码实现](#7-核心代码实现)
8. [部署与运维](#8-部署与运维)

---

## 1. 项目概述

### 1.1 项目简介

**WeCollege 校园生活圈小程序**是一个面向高校学生的综合性校园生活服务平台，基于微信小程序云开发技术构建，为大学生提供便捷的校园信息服务。

### 1.2 项目名称

- **项目名称**：WeCollege 校园生活圈
- **小程序名称**：CaGo川农生活圈
- **项目目录**：WeCollege-master

### 1.3 主要功能

| 模块 | 功能说明 |
|------|----------|
| 首页 | 展示平台概览、分类入口、推荐内容 |
| 校内通知 | 查看校园公告、通知信息 |
| 新手指南 | 平台使用教程、常见问题解答 |
| 情绪社区 | 匿名情感倾诉、心情记录 |
| 闲置买卖 | 发布闲置物品、浏览商品信息 |
| 校园生活 | 校园兼职、校园活动信息 |
| 失物招领 | 发布失物信息、寻找失物 |
| 评论互动 | 对各类内容进行评论、回复 |
| 收藏管理 | 收藏感兴趣的内容 |
| 私信聊天 | 用户之间一对一聊天 |
| 个人中心 | 用户信息管理、设置 |
| 管理后台 | 内容审核、用户管理、数据统计 |

### 1.4 目标用户

- 高校在校学生
- 校园管理者
- 后台运营人员

---

## 2. 技术选型

### 2.1 前端技术

| 技术 | 说明 | 用途 |
|------|------|------|
| 微信小程序框架 | 原生框架 | 小程序页面开发 |
| WXML | 微信标记语言 | 页面结构设计 |
| WXSS | 微信样式表 | 页面样式美化 |
| JavaScript | 原生JS | 页面逻辑处理 |
| 云开发 | 微信云开发 | 静态资源存储 |

### 2.2 后端技术

| 技术 | 说明 | 用途 |
|------|------|------|
| Node.js | JavaScript运行时 | 云函数运行环境 |
| CCMiniCloud Framework | 自主研发框架 | 后端MVC架构 |
| 微信云开发 | 云函数/云数据库/云存储 | 服务端基础设施 |

### 2.3 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    微信小程序前端                            │
│   WXML + WXSS + JavaScript                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    微信云开发平台                            │
├─────────────────────────────────────────────────────────────┤
│  云函数 (Cloud Functions)                                   │
│  - Node.js 运行环境                                         │
│  - CCMiniCloud Framework MVC框架                           │
├─────────────────────────────────────────────────────────────┤
│  云数据库 (Cloud Database)                                  │
│  - JSON文档数据库                                           │
│  - NoSQL非关系型                                           │
├─────────────────────────────────────────────────────────────┤
│  云存储 (Cloud Storage)                                     │
│  - 图片、音视频存储                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 系统架构

### 3.1 整体架构

本项目采用**前后端分离架构**，前端基于微信小程序，后端基于微信云开发，采用**MVC架构模式**。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端展示层 (微信小程序)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  页面层 (Pages)                                                        │
│  ├── default/index      - 首页                                          │
│  ├── news/index         - 校内通知                                      │
│  ├── guide/index       - 新手指南                                      │
│  ├── board/index       - 情绪社区                                      │
│  ├── emotion/index     - 情绪互助                                      │
│  ├── leave/index       - 闲置买卖                                      │
│  ├── job/index         - 校园生活                                      │
│  ├── lost/index        - 失物招领                                      │
│  ├── my/index          - 个人中心                                      │
│  ├── chat/list         - 聊天列表                                      │
│  ├── chat/detail       - 聊天详情                                      │
│  └── admin/*           - 管理后台                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  组件层 (Components)                                                  │
│  ├── form/form_set     - 表单配置组件                                  │
│  └── form/form_show    - 表单展示组件                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  工具层 (Helper)                                                       │
│  ├── cloud_helper.js   - 云函数调用封装                                │
│  ├── page_helper.js   - 页面工具                                      │
│  ├── helper.js        - 通用工具                                      │
│  └── cache_helper.js   - 缓存工具                                      │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           服务端层 (云函数)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  控制器层 (Controller)                                                 │
│  ├── 路由分发 (route.js)                                               │
│  ├── 业务控制器                                                        │
│  └── 基础控制器 (base_controller.js)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  服务层 (Service)                                                      │
│  ├── 业务服务层                                                        │
│  └── 基础服务 (base_service.js)                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  模型层 (Model)                                                        │
│  ├── 数据模型 (news_model.js等)                                        │
│  └── 基础模型 (base_model.js, model.js)                                │
├─────────────────────────────────────────────────────────────────────────┤
│  框架核心 (Framework Core)                                            │
│  ├── application.js    - 应用入口                                      │
│  ├── app_util.js       - 工具方法                                      │
│  ├── app_error.js      - 异常处理                                      │
│  └── app_code.js       - 错误码定义                                    │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           数据层 (云数据库)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  集合 (Collection)                                                     │
│  ├── user           - 用户信息                                        │
│  ├── news           - 校内通知                                        │
│  ├── guide          - 新手指南                                        │
│  ├── board/emotion  - 情绪社区                                        │
│  ├── job            - 校园生活                                        │
│  ├── lost           - 失物招领                                        │
│  ├── leave          - 闲置买卖                                        │
│  ├── comment        - 评论                                            │
│  ├── fav            - 收藏                                            │
│  ├── chat           - 聊天消息                                        │
│  └── chat_session   - 聊天会话                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 MVC架构详解

#### 3.2.1 控制器层 (Controller)

**职责**：
- 接收用户请求
- 参数校验与验证
- 调用服务层处理业务逻辑
- 返回处理结果

**核心文件**：[base_controller.js](filase_controller.js)

#### 3.2.2 服务层 (Service)

**职责**：
- 处理具体业务逻辑
- 数据加工与转换
- 调用模型层进行数据操作

**核心文件**：[base_service.js](file://rvice\base_service.js)

#### 3.2.3 模型层 (Model)

**职责**：
- 封装数据库操作
- 提供标准CRUD方法
- 数据结构定义

**核心文件**：[model.js](file:///c:\Users\q
### 3.3 请求处理流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         请求处理流程                                   │
└─────────────────────────────────────────────────────────────────────────┘

1. 前端发起请求
   wx.cloud.callCloud({ route: 'news/list', params: {...} })

2. 路由配置查找 (route.js)
   'news/list' → 'news_controller@getNewsList'

3. 控制器处理 (news_controller.js)
   - 参数校验 (validateData)
   - 调用服务层

4. 服务层处理 (news_service.js)
   - 业务逻辑处理
   - 调用模型层

5. 模型层操作 (news_model.js)
   - 数据库CRUD操作
   - 数据格式化

6. 数据库操作 (云数据库news集合)

7. 结果返回 (原路返回)
```

---

## 4. 功能模块设计

### 4.1 模块总览

| 序号 | 模块名称 | 模块标识 | 功能描述 |
|------|----------|----------|----------|
| 1 | 用户认证 | passport | 登录、注册、个人信息管理 |
| 2 | 首页 | default | 平台首页、分类入口 |
| 3 | 校内通知 | news | 校园公告浏览 |
| 4 | 新手指南 | guide | 平台使用教程 |
| 5 | 情绪社区 | board/emotion | 情感倾诉、心情记录 |
| 6 | 闲置买卖 | leave | 二手物品交易 |
| 7 | 校园生活 | job | 兼职、校园活动信息 |
| 8 | 失物招领 | lost | 失物招领信息发布 |
| 9 | 评论 | comment | 内容评论互动 |
| 10 | 收藏 | fav | 内容收藏管理 |
| 11 | 聊天 | chat | 用户私信聊天 |
| 12 | 管理后台 | admin | 系统管理功能 |

### 4.2 核心业务模块

#### 4.2.1 用户认证模块 (passport)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 登录 | passport/login | 用户登录 |
| 注册 | passport/register | 用户注册 |
| 获取手机号 | passport/phone | 微信授权手机号 |
| 个人信息 | passport/my_detail | 获取个人资料 |
| 修改资料 | passport/edit_base | 编辑个人资料 |

#### 4.2.2 校内通知模块 (news)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 通知列表 | news/list | 获取通知列表 |
| 通知详情 | news/view | 查看通知详情（增加浏览数） |

#### 4.2.3 情绪社区模块 (board/emotion)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 帖子列表 | board/list | 获取帖子列表 |
| 发布帖子 | board/insert | 发布新帖子 |
| 编辑帖子 | board/edit | 编辑帖子 |
| 删除帖子 | board/del | 删除帖子 |
| 帖子详情 | board/detail | 查看帖子详情 |
| 浏览帖子 | board/view | 浏览帖子（增加浏览数） |
| 点赞帖子 | board/like | 点赞/取消点赞 |

#### 4.2.4 闲置买卖模块 (leave)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 商品列表 | leave/list | 获取商品列表 |
| 发布商品 | leave/insert | 发布闲置商品 |
| 编辑商品 | leave/edit | 编辑商品信息 |
| 删除商品 | leave/del | 删除商品 |
| 商品详情 | leave/detail | 查看商品详情 |
| 浏览商品 | leave/view | 浏览商品（增加浏览数） |
| 点赞商品 | leave/like | 点赞/取消点赞 |

#### 4.2.5 校园生活模块 (job)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 信息列表 | job/list | 获取信息列表 |
| 发布信息 | job/insert | 发布新信息 |
| 编辑信息 | job/edit | 编辑信息 |
| 删除信息 | job/del | 删除信息 |
| 信息详情 | job/detail | 查看信息详情 |
| 浏览信息 | job/view | 浏览信息（增加浏览数） |
| 点赞信息 | job/like | 点赞/取消点赞 |

#### 4.2.6 失物招领模块 (lost)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 列表 | lost/list | 获取失物列表 |
| 发布 | lost/insert | 发布失物信息 |
| 编辑 | lost/edit | 编辑信息 |
| 删除 | lost/del | 删除信息 |
| 详情 | lost/detail | 查看详情 |
| 浏览 | lost/view | 浏览（增加浏览数） |
| 点赞 | lost/like | 点赞/取消点赞 |

#### 4.2.7 评论模块 (comment)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 评论列表 | comment/list | 获取评论列表 |
| 发表评论 | comment/insert | 发表评论 |
| 编辑评论 | comment/update_forms | 编辑评论 |
| 删除评论 | comment/del | 删除评论 |
| 点赞评论 | comment/like | 点赞评论 |

#### 4.2.8 聊天模块 (chat)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 获取/创建会话 | chat/get_session | 获取或创建聊天会话 |
| 发送消息 | chat/send | 发送消息 |
| 会话列表 | chat/session_list | 获取会话列表 |
| 消息列表 | chat/message_list | 获取消息列表 |
| 未读数 | chat/unread_count | 获取未读消息数 |

#### 4.2.9 收藏模块 (fav)

| 功能 | 接口路由 | 说明 |
|------|----------|------|
| 收藏/取消 | fav/update | 收藏或取消收藏 |
| 删除收藏 | fav/del | 删除收藏记录 |
| 是否收藏 | fav/is_fav | 检查是否已收藏 |
| 我的收藏 | fav/my_list | 获取我的收藏列表 |

---

## 5. 数据库设计

### 5.1 数据库概述

本项目使用**微信云数据库**，为JSON文档数据库（NoSQL），每个集合存储一类业务数据。

### 5.2 数据集合设计

#### 5.2.1 用户集合 (user)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| USER_ID | string | 是 | 用户ID |
| USER_MINI_OPENID | string | 是 | 小程序OpenID |
| USER_STATUS | int | 是 | 状态 (0=待审核,1=正常,8=审核未过,9=禁用) |
| USER_NAME | string | 否 | 用户昵称 |
| USER_MOBILE | string | 否 | 联系电话 |
| USER_PIC | string | 否 | 头像 |
| USER_FORMS | array | 是 | 表单数据 |
| USER_OBJ | object | 是 | 扩展对象 |
| USER_LOGIN_CNT | int | 是 | 登录次数 |
| USER_LOGIN_TIME | int | 否 | 最近登录时间 |
| USER_ADD_TIME | int | 是 | 注册时间 |
| USER_ADD_IP | string | 否 | 注册IP |
| USER_EDIT_TIME | int | 是 | 编辑时间 |
| USER_EDIT_IP | string | 否 | 编辑IP |

#### 5.2.2 校内通知集合 (news)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| NEWS_ID | string | 是 | 通知ID |
| NEWS_TITLE | string | 否 | 标题 |
| NEWS_DESC | string | 否 | 描述 |
| NEWS_STATUS | int | 是 | 状态 0/1 |
| NEWS_CATE_ID | string | 是 | 分类编号 |
| NEWS_CATE_NAME | string | 是 | 分类名称 |
| NEWS_ORDER | int | 是 | 排序 |
| NEWS_VOUCH | int | 是 | 置顶标记 |
| NEWS_CONTENT | array | 是 | 内容 |
| NEWS_QR | string | 否 | 二维码 |
| NEWS_VIEW_CNT | int | 是 | 浏览次数 |
| NEWS_PIC | array | 否 | 封面图 |
| NEWS_FORMS | array | 是 | 表单数据 |
| NEWS_OBJ | object | 是 | 扩展对象 |
| NEWS_ADD_TIME | int | 是 | 添加时间 |
| NEWS_EDIT_TIME | int | 是 | 编辑时间 |

#### 5.2.3 新手指南集合 (guide)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| GUIDE_ID | string | 是 | 文章ID |
| GUIDE_TITLE | string | 否 | 标题 |
| GUIDE_DESC | string | 否 | 描述 |
| GUIDE_STATUS | int | 是 | 状态 0/1 |
| GUIDE_CATE_ID | string | 是 | 分类编号 |
| GUIDE_CATE_NAME | string | 是 | 分类名称 |
| GUIDE_ORDER | int | 是 | 排序 |
| GUIDE_VOUCH | int | 是 | 置顶标记 |
| GUIDE_CONTENT | array | 是 | 内容 |
| GUIDE_VIEW_CNT | int | 是 | 浏览次数 |
| GUIDE_PIC | array | 否 | 封面图 |
| GUIDE_FORMS | array | 是 | 表单数据 |
| GUIDE_OBJ | object | 是 | 扩展对象 |
| GUIDE_ADD_TIME | int | 是 | 添加时间 |
| GUIDE_EDIT_TIME | int | 是 | 编辑时间 |

#### 5.2.4 情绪社区集合 (board/emotion)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| BOARD_ID | string | 是 | 帖子ID |
| BOARD_TITLE | string | 否 | 标题 |
| BOARD_STATUS | int | 是 | 状态 0/1 |
| BOARD_CATE_ID | string | 是 | 分类编号 |
| BOARD_CATE_NAME | string | 是 | 分类名称 |
| BOARD_ORDER | int | 是 | 排序 |
| BOARD_CONTENT | array | 是 | 内容 |
| BOARD_VIEW_CNT | int | 是 | 浏览次数 |
| BOARD_LIKE_CNT | int | 是 | 点赞数 |
| BOARD_PIC | array | 否 | 图片 |
| BOARD_FORMS | array | 是 | 表单数据 |
| BOARD_OBJ | object | 是 | 扩展对象 |
| BOARD_ADD_TIME | int | 是 | 添加时间 |
| BOARD_EDIT_TIME | int | 是 | 编辑时间 |
| BOARD_ADD_IP | string | 否 | 发布IP |
| BOARD_EDIT_IP | string | 否 | 编辑IP |

#### 5.2.5 闲置买卖集合 (leave)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| LEAVE_ID | string | 是 | 商品ID |
| LEAVE_TITLE | string | 否 | 标题 |
| LEAVE_STATUS | int | 是 | 状态 0/1 |
| LEAVE_CATE_ID | string | 是 | 分类编号 |
| LEAVE_CATE_NAME | string | 是 | 分类名称 |
| LEAVE_PRICE | number | 否 | 价格 |
| LEAVE_ORDER | int | 是 | 排序 |
| LEAVE_CONTENT | array | 是 | 内容 |
| LEAVE_VIEW_CNT | int | 是 | 浏览次数 |
| LEAVE_LIKE_CNT | int | 是 | 点赞数 |
| LEAVE_PIC | array | 否 | 图片 |
| LEAVE_FORMS | array | 是 | 表单数据 |
| LEAVE_OBJ | object | 是 | 扩展对象 |
| LEAVE_ADD_TIME | int | 是 | 添加时间 |
| LEAVE_EDIT_TIME | int | 是 | 编辑时间 |

#### 5.2.6 校园生活集合 (job)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| JOB_ID | string | 是 | 信息ID |
| JOB_TITLE | string | 否 | 标题 |
| JOB_STATUS | int | 是 | 状态 0/1 |
| JOB_CATE_ID | string | 是 | 分类编号 |
| JOB_CATE_NAME | string | 是 | 分类名称 |
| JOB_ORDER | int | 是 | 排序 |
| JOB_CONTENT | array | 是 | 内容 |
| JOB_VIEW_CNT | int | 是 | 浏览次数 |
| JOB_LIKE_CNT | int | 是 | 点赞数 |
| JOB_PIC | array | 否 | 图片 |
| JOB_FORMS | array | 是 | 表单数据 |
| JOB_OBJ | object | 是 | 扩展对象 |
| JOB_ADD_TIME | int | 是 | 添加时间 |
| JOB_EDIT_TIME | int | 是 | 编辑时间 |

#### 5.2.7 失物招领集合 (lost)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| LOST_ID | string | 是 | 信息ID |
| LOST_TITLE | string | 否 | 标题 |
| LOST_STATUS | int | 是 | 状态 0/1 |
| LOST_TYPE | int | 是 | 类型 (1=寻物,2=招领) |
| LOST_CATE_ID | string | 是 | 分类编号 |
| LOST_CATE_NAME | string | 是 | 分类名称 |
| LOST_ORDER | int | 是 | 排序 |
| LOST_CONTENT | array | 是 | 内容 |
| LOST_VIEW_CNT | int | 是 | 浏览次数 |
| LOST_LIKE_CNT | int | 是 | 点赞数 |
| LOST_PIC | array | 否 | 图片 |
| LOST_FORMS | array | 是 | 表单数据 |
| LOST_OBJ | object | 是 | 扩展对象 |
| LOST_ADD_TIME | int | 是 | 添加时间 |
| LOST_EDIT_TIME | int | 是 | 编辑时间 |

#### 5.2.8 评论集合 (comment)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| COMMENT_ID | string | 是 | 评论ID |
| COMMENT_OBJ_ID | string | 是 | 被评论对象ID |
| COMMENT_TYPE | string | 是 | 被评论对象类型 |
| COMMENT_CONTENT | array | 是 | 评论内容 |
| COMMENT_STATUS | int | 是 | 状态 0/1 |
| COMMENT_LIKE_CNT | int | 是 | 点赞数 |
| COMMENT_FORMS | array | 是 | 表单数据 |
| COMMENT_OBJ | object | 是 | 扩展对象 |
| COMMENT_ADD_TIME | int | 是 | 添加时间 |
| COMMENT_ADD_IP | string | 否 | 发布IP |

#### 5.2.9 收藏集合 (fav)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| FAV_ID | string | 是 | 收藏ID |
| FAV_TYPE | string | 是 | 收藏类型 |
| FAV_OBJ_ID | string | 是 | 被收藏对象ID |
| FAV_USER_ID | string | 是 | 用户ID |
| FAV_ADD_TIME | int | 是 | 收藏时间 |

#### 5.2.10 聊天会话集合 (chat_session)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| SESSION_ID | string | 是 | 会话ID |
| SESSION_FROM | string | 是 | 发送方ID |
| SESSION_TO | string | 是 | 接收方ID |
| SESSION_LAST_MSG | string | 是 | 最后消息 |
| SESSION_LAST_TIME | int | 是 | 最后消息时间 |
| SESSION_UNREAD_CNT | int | 是 | 未读消息数 |
| SESSION_ADD_TIME | int | 是 | 创建时间 |

#### 5.2.11 聊天消息集合 (chat)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _pid | string | 是 | 项目标识 |
| CHAT_ID | string | 是 | 消息ID |
| CHAT_SESSION_ID | string | 是 | 会话ID |
| CHAT_FROM | string | 是 | 发送方ID |
| CHAT_TO | string | 是 | 接收方ID |
| CHAT_CONTENT | string | 是 | 消息内容 |
| CHAT_TYPE | string | 是 | 消息类型 |
| CHAT_STATUS | int | 是 | 状态 |
| CHAT_ADD_TIME | int | 是 | 发送时间 |
| CHAT_ADD_IP | string | 否 | 发送IP |

---

## 6. 接口设计

### 6.1 接口规范

#### 6.1.1 请求格式

```javascript
wx.cloud.callCloud({
    name: 'mcloud',
    data: {
        route: 'news/list',      // 路由地址
        token: 'xxx',           // 用户Token
        PID: 'campus',          // 项目ID
        params: {               // 业务参数
            cateId: 'xxx',
            search: 'xxx',
            page: 1,
            size: 10
        }
    }
});
```

#### 6.1.2 响应格式

```javascript
// 成功响应
{
    code: 200,
    msg: 'success',
    data: { ... }  // 业务数据
}

// 错误响应
{
    code: 1600,    // 错误码
    msg: '错误信息描述'
}
```

### 6.2 核心接口列表

#### 6.2.1 用户认证接口

| 接口 | 路由 | 方法 | 说明 |
|------|------|------|------|
| 登录 | passport/login | POST | 用户登录 |
| 注册 | passport/register | POST | 用户注册 |
| 获取手机号 | passport/phone | POST | 微信授权手机号 |
| 我的详情 | passport/my_detail | GET | 获取个人资料 |
| 修改资料 | passport/edit_base | POST | 编辑个人资料 |

#### 6.2.2 内容接口

| 接口 | 路由 | 方法 | 说明 |
|------|------|------|------|
| 通知列表 | news/list | GET | 获取通知列表 |
| 通知详情 | news/view | GET | 浏览通知 |
| 指南列表 | guide/list | GET | 获取指南列表 |
| 指南详情 | guide/view | GET | 浏览指南 |
| 帖子列表 | board/list | GET | 获取帖子列表 |
| 发布帖子 | board/insert | POST | 发布帖子 |
| 帖子详情 | board/detail | GET | 获取帖子详情 |
| 商品列表 | leave/list | GET | 获取商品列表 |
| 发布商品 | leave/insert | POST | 发布商品 |
| 商品详情 | leave/detail | GET | 获取商品详情 |
| 兼职列表 | job/list | GET | 获取兼职列表 |
| 失物列表 | lost/list | GET | 获取失物列表 |

#### 6.2.3 互动接口

| 接口 | 路由 | 方法 | 说明 |
|------|------|------|------|
| 点赞 | xxx/like | POST | 点赞 |
| 评论列表 | comment/list | GET | 获取评论 |
| 发表评论 | comment/insert | POST | 发表 |
| 收藏 | fav/update | POST | 收藏/取消 |
| 我的收藏 | fav/my_list | GET | 获取收藏 |

#### 6.2.4 聊天接口

| 接口 | 路由 | 方法 | 说明 |
|------|------|------|------|
| 获取会话 | chat/get_session | POST | 获取/创建会话 |
| 发送消息 | chat/send | POST | 发送消息 |
| 会话列表 | chat/session_list | GET | 获取会话列表 |
| 消息列表 | chat/message_list | GET | 获取消息列表 |

#### 6.2.5 管理接口

| 接口 | 路由 | 方法 | 说明 |
|------|------|------|------|
| 后台首页 | admin/home | GET | 管理首页数据 |
| 管理员登录 | admin/login | POST | 管理员登录 |
| 内容列表 | admin/xxx_list | GET | 管理列表 |
| 内容新增 | admin/xxx_insert | POST | 新增内容 |
| 内容编辑 | admin/xxx_edit | POST | 编辑内容 |
| 内容删除 | admin/xxx_del | POST | 删除内容 |
| 用户列表 | admin/user_list | GET | 用户列表 |
| 用户详情 | admin/user_detail | GET | 用户详情 |

---

## 7. 核心代码实现

### 7.1 云函数入口

**文件**：[index.js](fir\cloudfunctions\mcloud\index.js)

```javascript
const application = require('./framework/core/application.js');

exports.main = async (event, context) => {
    return await application.app(event, context);
}
```

**作用**：云函数入口文件，所有请求的入口点。

### 7.2 应用核心

**文件**：[application.js](file://application.js)

**核心流程**：
1. 获取路由配置
2. 解析路由得到Controller和Action
3. 加载并实例化Controller
4. 调用Controller的对应方法
5. 返回处理结果

### 7.3 路由配置

**文件**：[route.js](file:///c\project\campus\public\route.js)

**配置格式**：
```javascript
'路由路径': '控制器文件名@方法名#预处理'
```

**示例**：
```javascript
'news/list': 'news_controller@getNewsList',
'news/view': 'news_controller@viewNews',
'board/insert': 'board_controller@insertBoard#demo',
```

### 7.4 控制器基类

**文件**：[base_controller.js](file://
**核心方法**：
- `validateData(rules)` - 参数校验
- `getUserId()` - 获取用户ID
- `getOpenId()` - 获取OpenID

### 7.5 数据模型基类

**文件**：[model.js](file:///c:\Usemcloud\framework\database\model.js)

**核心方法**：
```javascript
// 查询单条
static async getOne(where, fields, orderBy)

// 插入数据
static async insert(data)

// 更新数据
static async edit(where, data)

// 删除数据
static async del(where)

// 统计数量
static async count(where)

// 递增字段
static async inc(where, field, val)

// 获取列表（分页）
static async getList(where, fields, orderBy, page, size)

// 获取所有
static async getAll(where, fields, orderBy, size)
```

### 7.6 前端云函数调用封装

**文件**：[cloud_helper.js](follege-master\miniprogram\helper\cloud_helper.js)

```javascript
// 调用云函数（提交操作）
async function callCloudSumbit(route, params, options) {
    return await callCloud(route, params, options);
}

// 调用云函数（获取数据）
async function callCloudData(route, params, options) {
    return await callCloud(route, params, options);
}

// 核心调用方法
function callCloud(route, params, options) {
    return new Promise((resolve, reject) => {
        wx.cloud.callCloud({
            name: 'mcloud',
            data: {
                route: route,
                token,
                PID,
                params
            },
            success: (res) => { resolve(res.result); },
            fail: (err) => { reject(err); }
        });
    });
}
```

### 7.7 控制器示例 - 新闻控制器

**文件**：[news_controller.js](filroject\campus\controller\news_controller.js)

```javascript
class NewsController extends BaseProjectController {

    /** 资讯列表 */
    async getNewsList() {
        // 1. 数据校验
        let rules = {
            cateId: 'string',
            search: 'string|min:1|max:30',
            page: 'must|int|default=1',
            size: 'int',
        };

        // 2. 获取参数
        let input = this.validateData(rules);

        // 3. 调用Service
        let service = new NewsService();
        return await service.getNewsList(input);
    }

    /** 浏览资讯 */
    async viewNews() {
        let rules = {
            id: 'must|id',
        };
        let input = this.validateData(rules);

        let service = new NewsService();
        return await service.viewNews(input.id);
    }
}
```

### 7.8 服务层示例 - 新闻服务

**文件**：[news_service.js](file:loud\project\campus\service\news_service.js)

```javascript
class NewsService extends BaseProjectService {

    async getNewsList({cateId, search, page, size}) {
        // 构建查询条件
        let where = {
            NEWS_STATUS: 1
        };
        if (cateId) {
            where.NEWS_CATE_ID = cateId;
        }

        // 构建排序
        let orderBy = {
            NEWS_VOUCH: 'desc',
            NEWS_ADD_TIME: 'desc'
        };

        // 调用Model获取数据
        let list = await NewsModel.getAll(where, '*', orderBy);

        return { list };
    }

    async viewNews(id) {
        // 增加浏览数
        await NewsModel.inc({ NEWS_ID: id }, 'NEWS_VIEW_CNT', 1);
        
        // 获取详情
        return await NewsModel.getOne({ NEWS_ID: id });
    }
}
```

### 7.9 模型层示例 - 新闻模型

**文件**：[news_model.js](file:///c:\U
```javascript
class NewsModel extends BaseProjectModel {
}

NewsModel.CL = BaseProjectModel.C('news');

NewsModel.DB_STRUCTURE = {
    _pid: 'string|true',
    NEWS_ID: 'string|true',
    NEWS_TITLE: 'string|false|comment=标题',
    NEWS_STATUS: 'int|true|default=1',
    NEWS_CATE_ID: 'string|true',
    NEWS_CATE_NAME: 'string|true',
    NEWS_CONTENT: 'array|true|default=[]',
    NEWS_VIEW_CNT: 'int|true|default=0',
    NEWS_PIC: 'array|false|default=[]',
    NEWS_ADD_TIME: 'int|true',
    NEWS_EDIT_TIME: 'int|true',
};

NewsModel.FIELD_PREFIX = "NEWS_";

module.exports = NewsModel;
```

---

## 8. 部署与运维

### 8.1 项目结构

```
WeCollege-master/
├── cloudfunctions/          # 云函数目录
│   └── mcloud/
│       ├── index.js         # 云函数入口
│       ├── framework/       # 框架核心
│       │   ├── core/        # 核心模块
│       │   ├── platform/    # 平台层
│       │   ├── database/    # 数据库层
│       │   └── utils/       # 工具函数
│       └── project/         # 业务项目
│           └── campus/      # 校园项目
│               ├── controller/
│               ├── service/
│               ├── model/
│               └── public/
└── miniprogram/             # 小程序前端
    ├── app.js               # 小程序入口
    ├── app.json             # 全局配置
    ├── helper/              # 工具库
    ├── cmpts/              # 公共组件
    └── projects/
        └── campus/         # 业务项目
            └── pages/      # 页面
```

### 8.2 部署步骤

1. **云函数部署**
   - 在微信开发者工具中右键 cloudfunctions 文件夹
   - 选择"上传并部署"
   - 等待部署完成

2. **小程序部署**
   - 在微信开发者工具中点击"上传"
   - 在微信公众平台提交审核
   - 审核通过后发布

### 8.3 环境配置

| 配置项 | 说明 |
|--------|------|
| CLOUD_ID | 云开发环境ID |
| TEST_MODE | 测试模式开关 |
| IS_DEMO | 演示模式开关 |
| PID | 项目标识 |

### 8.4 注意事项

1. 云函数每次修改后需要重新上传部署
2. 数据库集合需要手动创建
3. 管理后台需要配置管理员账号
4. 内容审核配置需要在微信公众平台设置

---

## 附录

### A. 错误码定义

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 500 | 服务器错误 |
| 1600 | 逻辑错误 |
| 1301 | 数据校验错误 |
| 1302 | Header校验错误 |
| 2401 | 管理员错误 |
| 2501 | 服务者错误 |

### B. 状态码定义

| 状态码 | 用户状态 | 内容状态 |
|--------|----------|----------|
| 0 | 待审核 | 禁用 |
| 1 | 正常 | 启用 |
| 8 | 审核未过 | - |
| 9 | 禁用 | - |

---

