<template>
  <!-- 发布入口选择弹窗 - 底部弹出（底栏 + / 广场右上角 + / 项目中心 + 共用） -->
  <view class="modal-mask" @click="close">
    <view class="modal-sheet" @click.stop>
      <!-- 弹层底色：Figma 导出图（402×368，青绿渐变＋右下阴影；圆角由图片 alpha 提供） -->
      <image class="sheet-bg" src="/static/create-sheet-bg.png" mode="scaleToFill" />

      
      <view class="sheet-close" @click="close">
        <text class="sheet-close-t">✕</text>
      </view>

      <view class="sheet-title"></view>

      <view class="option-list">
        <view
          v-for="item in options"
          :key="item.key"
          class="option-pill"
          @click="selectOption(item)"
        >{{ item.name }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const emit = defineEmits(['close', 'select'])

// key 必须在 utils/nav.js 的 goCreate() 里有对应路由；数组顺序 = 界面从上到下
const options = [
  { key: 'post_video', name: '发布视频' },
  { key: 'new_project', name: '发起项目' },
  { key: 'pick_image', name: '选择图片' },
  { key: 'post_feed', name: '发布动态' }
]

function close() {
  emit('close')
}

function selectOption(item) {
  emit('select', item.key)
  close()
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-sheet {
  position: relative;
  width: 100%;
  /* 底色（青绿渐变 + 右下阴影）与 26px≈48rpx 圆角全部来自背景图，此处不再上底色/切圆角 */
  animation: slideUp 0.3s ease;
  /* 底部「取消」已移除 → 留白改由弹层自身承担（40rpx），并保留 iPhone 底部安全区 */
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}

/* 弹层底色图：铺满整层、不响应点击
   —— mode=scaleToFill 会把 402×368 纵向拉伸到实际高度，对纯渐变无可见影响 */
.sheet-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* 右上角关闭：本弹层唯一的「取消」入口
   ⚠️ z-index 必须高于 .sheet-title / .option-list(1)：标题是全宽块级元素，
      同级 z-index 且 DOM 在叉号之后时会盖住叉号，导致"看得见、点不动"。 */
.sheet-close {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  /* 小圆圈底：在青绿渐变上给叉号一个明确的"可点"affordance */
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
}

.sheet-close-t {
  font-size: 36rpx;
  color: #666;
  line-height: 1;
}

.sheet-close:active {
  background: rgba(255, 255, 255, 0.96);
  transform: scale(0.92);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.sheet-title {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  padding: 56rpx 0 30rpx;
}

.option-list {
  position: relative;
  z-index: 1;
  /* 稿实测左右边距 107.94px → 201rpx，按钮净宽 348rpx ≈ 屏宽 46% */
  padding: 0 201rpx;
}

/* 圆角矩形按钮：规格对齐 Figma「莲藕加号」稿
   —— 宽186.11 / 高50.83 / 圆角15 / 间距11.17 px，
      按画板 402px ↔ 750rpx 换算（1px = 1.8657rpx） */
.option-pill {
  height: 95rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4e6f66;
  color: #fff;
  font-size: 31rpx;
  border-radius: 28rpx;
  margin-bottom: 24rpx;
}

.option-pill:last-child {
  margin-bottom: 1;
}

.option-pill:active {
  background: #3f5c55;
}

</style>
