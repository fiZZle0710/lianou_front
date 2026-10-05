/**
 * 前端假数据层（mock 数据）
 * - 所有「多对象/多类型」数据集中在这里，按 id 组织，方便以后整体替换成接口返回。
 * - 对接后端时，把下面的导出换成接口返回即可，页面逻辑不用改。
 * - 每个「取数」位置都留有 // ⚠️ 对接后端 注释，标明替换点。
 */

// 用户，key = 用户id
export const mockUsers = {
  1: { id: 1, nickname: "罗大侠", level: 12, avatar: "", intro: "资深导演，擅长科幻题材，热爱有创意的合作。", avatarFrame: "", education: "中央戏剧学院", career: "导演 / 编剧", tags: ["导演", "编剧", "科幻"] },
  2: { id: 2, nickname: "冯大侠", level: 8, avatar: "", intro: "插画师，喜欢国风与治愈系画风。", avatarFrame: "", education: "", career: "插画师", tags: ["插画", "国风", "设计"] },
  3: { id: 3, nickname: "创意设计师", level: 8, avatar: "", intro: "平面设计 / 视觉设计，欢迎合作。", avatarFrame: "", education: "", career: "设计师", tags: ["设计", "视觉"] },
  4: { id: 4, nickname: "灵感收藏家", level: 5, avatar: "", intro: "收集灵感，也乐于分享灵感。", avatarFrame: "", education: "", career: "", tags: ["灵感", "收藏"] },
  5: { id: 5, nickname: "剪辑达人", level: 9, avatar: "", intro: "资深剪辑，精通各类风格。", avatarFrame: "", education: "", career: "剪辑师", tags: ["剪辑", "音效"] },
  6: { id: 6, nickname: "张编剧", level: 6, avatar: "", intro: "专注剧本创作，擅长叙事结构。", avatarFrame: "", education: "", career: "编剧", tags: ["编剧", "剧本"] },
  7: { id: 7, nickname: "李剪辑", level: 9, avatar: "", intro: "剪辑师，熟悉各类风格，期待合作。", avatarFrame: "", education: "", career: "剪辑师", tags: ["剪辑"] }
}

// 作品，key = 作品id（含详情页所需完整字段）
export const mockWorks = {
  1: {
    id: 1, title: "科幻短片《星尘》", author: "罗大侠", likes: 120, cover: "", intro: "一部关于太空与思念的科幻短片。",
    avatar: "", username: "罗大侠", authorId: 1, time: "2小时前",
    text: "今天尝试了新的创作风格，把《星尘》的分镜重新梳理了一遍，大家觉得怎么样？",
    tags: ["科幻", "创作", "短片"], images: [""], views: 156, comments: 28, shares: 12, likes: 120,
    isLiked: false, isFollowed: false, isCollected: false,
    coop: { topic: "科幻短片共创计划", count: 6, deadline: "7天后截止" }
  },
  2: {
    id: 2, title: "国风插画《山水》", author: "冯大侠", likes: 88, cover: "", intro: "一组水墨国风插画。",
    avatar: "", username: "冯大侠", authorId: 2, time: "昨天",
    text: "新画的国风系列，尝试把山水意象融入现代构图。",
    tags: ["国风", "插画", "艺术"], images: [""], views: 89, comments: 15, shares: 8, likes: 88,
    isLiked: false, isFollowed: false, isCollected: false,
    coop: { topic: "国风插画共创", count: 4, deadline: "3天后截止" }
  },
  3: {
    id: 3, title: "灵感素材合集", author: "灵感收藏家", likes: 42, cover: "", intro: "近期收集的灵感素材。",
    avatar: "", username: "灵感收藏家", authorId: 4, time: "3小时前",
    text: "分享一些近期收集的灵感素材，欢迎交流～",
    tags: ["灵感", "素材"], images: [""], views: 233, comments: 42, shares: 20, likes: 42,
    isLiked: false, isFollowed: false, isCollected: false, coop: null
  },
  4: {
    id: 4, title: "剪辑练习作品", author: "剪辑达人", likes: 210, cover: "", intro: "一支混剪练习。",
    avatar: "", username: "剪辑达人", authorId: 5, time: "1天前",
    text: "新作品上线啦！欢迎大家来点评交流！",
    tags: ["剪辑", "混剪"], images: [""], views: 489, comments: 67, shares: 31, likes: 210,
    isLiked: false, isFollowed: false, isCollected: false, coop: null
  }
}

// 项目，key = 项目id
export const mockProjects = {
  1: { id: 1, title: "科幻短片共创", owner: "罗大侠", ownerId: 1, ownerLevel: 12, coopCount: 8, skills: ["编剧", "导演", "剪辑"], requirements: [{ label: "主题：科幻", ok: true }, { label: "等级 LV.5 以上", ok: true }, { label: "有 1 次共创经历", ok: false }, { label: "优先技能：剪辑", ok: true }], members: ["张", "李", "王"], current: 3, total: 6, deadline: "2026-09-01", intro: "寻找热爱科幻的伙伴一起完成一部短片，欢迎加入！" },
  2: { id: 2, title: "国风插画合集", owner: "冯大侠", ownerId: 2, ownerLevel: 8, coopCount: 5, skills: ["插画", "文案"], requirements: [{ label: "主题：国风", ok: true }, { label: "等级 LV.3 以上", ok: true }, { label: "有插画经验", ok: true }], members: ["王"], current: 2, total: 4, deadline: "2026-08-20", intro: "一起做一套国风插画，需要插画师和文案。" },
  3: { id: 3, title: "民谣歌曲创作", owner: "创意设计师", ownerId: 3, ownerLevel: 8, coopCount: 4, skills: ["作词", "作曲", "吉他"], requirements: [{ label: "主题：民谣", ok: true }, { label: "有编曲经验", ok: false }], members: ["李"], current: 1, total: 3, deadline: "2026-07-15", intro: "想一起做几首温暖的民谣。" }
}

// 私聊记录，key = 对方 userId
export const mockChats = {
  1: [
    { role: "left", type: "text", content: "罗大侠：你好呀，最近在做什么创作？" },
    { role: "right", type: "text", content: "在想一个共创项目～" },
    { role: "left", type: "text", content: "罗大侠：科幻短片那个项目要不要一起？" }
  ],
  2: [
    { role: "left", type: "text", content: "冯大侠：新作品发你啦" },
    { role: "right", type: "text", content: "马上看！" },
    { role: "left", type: "text", content: "冯大侠：多提意见～" }
  ],
  3: [
    { role: "left", type: "text", content: "创意设计师：这条笔记很有趣" },
    { role: "right", type: "text", content: "谢谢喜欢！" }
  ]
}

// 群聊记录，key = 群 id
export const mockGroups = {
  101: [
    { role: "left", type: "text", content: "张三: 项目文档我更新好了" },
    { role: "right", type: "text", content: "收到，我来看看" },
    { role: "left", type: "text", content: "李四: 我也看下" }
  ],
  102: [
    { role: "left", type: "text", content: "李四: 新活动报名啦" },
    { role: "right", type: "text", content: "我报名！" },
    { role: "left", type: "text", content: "王五: 算我一个" }
  ]
}

// 项目申请列表，key = 项目 id
export const mockProjectApplications = {
  1: [
    { id: 1, name: "张编剧", level: 6, coopCount: 2, intro: "我擅长剧本创作，有多年短视频经验，希望能加入贵项目！", filled: 3, total: 6, status: "pending" },
    { id: 2, name: "李剪辑", level: 9, coopCount: 5, intro: "资深剪辑师，熟悉各类风格，期待合作。", filled: 3, total: 6, status: "pending" }
  ],
  2: [
    { id: 3, name: "王插画", level: 4, coopCount: 1, intro: "喜欢国风插画，想一起创作。", filled: 2, total: 4, status: "pending" }
  ]
}

// 我的申请，key = 当前用户 id
export const mockMyApplications = {
  1: [
    { id: 1, projectName: "科幻短片共创", time: "2026-08-02 提交", status: "reviewing" },
    { id: 2, projectName: "国风插画合集", time: "2026-07-28 提交", status: "approved" },
    { id: 3, projectName: "民谣歌曲创作", time: "2026-07-15 提交", status: "expired" }
  ]
}