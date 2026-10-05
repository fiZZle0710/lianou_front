<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */

/* 隐藏右侧滚动条（H5 预览用；App 端 scroll-view 默认无滚动条） */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
scroll-view {
  scrollbar-width: none;
}
</style>
