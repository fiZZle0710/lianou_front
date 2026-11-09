<template>
  <!--
    统一搜索放大镜
    - 全站只用这一枚（= Figma「我的」分类栏右上角那枚细线小放大镜 icon-search-thin.svg），
      不要再用 🔍 emoji：emoji 的形状与颜色由各端系统字体决定，iOS / Android / 小程序长得都不一样
    - size 传 rpx 数值，默认 33（首页右上角的设计值）；各处只按所在一行的高度改这一个数
  -->
  <image
    class="search-magnifier"
    src="/static/icons/icon-search-thin.svg"
    mode="aspectFit"
    :style="{ width: size + 'rpx', height: size + 'rpx' }"
  />
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 33
  }
})
</script>

<style scoped>
.search-magnifier {
  display: block;
  flex-shrink: 0;
}
</style>
