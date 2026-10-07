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

/**
 * 统一「+ 发布」入口：底栏 / 广场右上角 / 项目中心三个 + 按钮共用
 * - 菜单展示在 components/common/CreateModal.vue，key 与这里一一对应
 * - 以后加菜单项，只需改 CreateModal 的 options + 这里一行
 * @param {String} key CreateModal 抛出的选项 key
 */
export function goCreate(key) {
  const map = {
    new_project: "/pages/coop/mine/index",        // 发起项目 → 我的项目网格页（点「添加新项目」再进共创招募表单）
    pick_image: "/pages/album/index",             // 选择图片 → 系统相册 → 图片发布页
    post_feed: "/pages/feed/edit/index",          // 发布动态
    post_video: "/pages/editor/index?from=album"  // 发布视频 → 编辑器导入视频（from=album 自动唤起相册）
  }
  if (!map[key]) {
    console.warn('[nav] 未知发布类型: ' + key)
    return
  }
  uni.navigateTo({ url: map[key] })
}

/**
 * 「添加新项目」→ 共创招募表单（5.1 POST /projects/）
 * ⚠️ 不放进 goCreate 的 map：那份 map 与 CreateModal 的 options 一一对应，
 *   而这个入口来自「我的项目」网格页末尾的占位卡，不是「+」菜单项。
 */
export function goCoopEdit() {
  uni.navigateTo({ url: "/pages/coop/edit/index" })
}

export default { goDetail, goCreate, goCoopEdit }