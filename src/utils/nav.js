/**
 * 统一跳转工具：所有「按对象进入子页面」都走这里
 * - 传入对象类型 + id，自动拼接路由
 * - 后续如需加参数（如 name、back），在此统一维护即可
 */
export function goDetail(type, id) {
  const map = {
    work: "/pages/feed/detail/index?id=",
    user: "/pages/user/detail?id=",
    project: "/pages/project/detail?id=",
    chat: "/pages/chat/private?userId=",
    group: "/pages/chat/group?groupId="
  }
  if (!map[type]) {
    console.warn('[nav] 未知跳转类型: ' + type)
    return
  }
  uni.navigateTo({ url: map[type] + id })
}

export default { goDetail }