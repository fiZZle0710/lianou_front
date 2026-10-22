<template>
  <!-- 发布入口选择弹窗 - 底部弹出（底栏 + / 广场右上角 + / 项目中心 + 共用） -->
  <view class="modal-mask" @click="close">
    <view class="modal-sheet" @click.stop>
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
  /* 弹层底色用 CSS 多层渐变（矢量），不再用 402×368 的 PNG：
     位图在宽屏被横向拉伸后边角发糊，渐变则任意屏宽都清晰。
     7 层由 Figma 稿数值拟合得到（402×368 下与原图平均 ΔE≈1.2），
     顺序=CSS 叠放顺序（上→下）：薄荷、白色主光、右下阴影、右上灰、左侧薄荷、右下灰绿、竖向底色。
     几何按 Figma「莲藕加号 › 主页 › iPhone 17 - 1」（402×874，3x 导出实测）对齐：
     圆角 30px=56rpx、无投影（稿上无 shadow）、按钮区距顶 77px、底部留白 56px（含安全区）。 */
  overflow: hidden;
  border-radius: 56rpx 56rpx 0 0;
  background:
    radial-gradient(29.3% 77.2% at 100.0% 90.7%, rgba(66, 104, 94, 0.272) 0%, rgba(66, 104, 94, 0.228) 12%, rgba(66, 104, 94, 0.138) 25%, rgba(66, 104, 94, 0.060) 38%, rgba(66, 104, 94, 0.017) 50%, rgba(66, 104, 94, 0.003) 62%, rgba(66, 104, 94, 0.000) 75%, rgba(66, 104, 94, 0.000) 88%, rgba(66, 104, 94, 0.000) 100%),
    radial-gradient(39.8% 34.2% at 88.1% 36.8%, rgba(151, 134, 134, 0.156) 0%, rgba(151, 134, 134, 0.151) 12%, rgba(151, 134, 134, 0.138) 25%, rgba(151, 134, 134, 0.118) 38%, rgba(151, 134, 134, 0.094) 50%, rgba(151, 134, 134, 0.067) 62%, rgba(151, 134, 134, 0.040) 75%, rgba(151, 134, 134, 0.015) 88%, rgba(151, 134, 134, 0.000) 100%),
    radial-gradient(33.4% 41.6% at 99.9% 96.4%, rgba(156, 174, 169, 0.481) 0%, rgba(156, 174, 169, 0.456) 12%, rgba(156, 174, 169, 0.394) 25%, rgba(156, 174, 169, 0.308) 38%, rgba(156, 174, 169, 0.214) 50%, rgba(156, 174, 169, 0.125) 62%, rgba(156, 174, 169, 0.055) 75%, rgba(156, 174, 169, 0.012) 88%, rgba(156, 174, 169, 0.000) 100%),
    radial-gradient(36.6% 37.3% at 99.9% 72.9%, rgba(207, 210, 209, 0.446) 0%, rgba(207, 210, 209, 0.427) 12%, rgba(207, 210, 209, 0.374) 25%, rgba(207, 210, 209, 0.301) 38%, rgba(207, 210, 209, 0.218) 50%, rgba(207, 210, 209, 0.135) 62%, rgba(207, 210, 209, 0.065) 75%, rgba(207, 210, 209, 0.017) 88%, rgba(207, 210, 209, 0.000) 100%),
    radial-gradient(36.9% 137.4% at 45.6% 93.0%, rgba(254, 254, 254, 1.000) 0%, rgba(254, 254, 254, 0.985) 12%, rgba(254, 254, 254, 0.942) 25%, rgba(254, 254, 254, 0.875) 38%, rgba(254, 254, 254, 0.784) 50%, rgba(254, 254, 254, 0.667) 62%, rgba(254, 254, 254, 0.521) 75%, rgba(254, 254, 254, 0.331) 88%, rgba(254, 254, 254, 0.000) 100%),
    radial-gradient(37.6% 57.8% at 52.5% 3.7%, rgba(59, 154, 133, 0.627) 0%, rgba(59, 154, 133, 0.573) 12%, rgba(59, 154, 133, 0.441) 25%, rgba(59, 154, 133, 0.285) 38%, rgba(59, 154, 133, 0.149) 50%, rgba(59, 154, 133, 0.058) 62%, rgba(59, 154, 133, 0.013) 75%, rgba(59, 154, 133, 0.001) 88%, rgba(59, 154, 133, 0.000) 100%),
    linear-gradient(180deg, #d7e5e2 0.0%, #e9eceb 25.0%, #f1f3f3 50.0%, #eff3f2 75.0%, #f1f4f3 100.0%);
  animation: slideUp 0.3s ease;
  /* 底部「取消」已移除 → 留白改由弹层自身承担（40rpx），并保留 iPhone 底部安全区 */
  padding-bottom: calc(env(safe-area-inset-bottom) + 42rpx);
}

/* 右上角关闭：本弹层唯一的「取消」入口
   ⚠️ z-index 必须高于 .sheet-title / .option-list(1)：标题是全宽块级元素，
      同级 z-index 且 DOM 在叉号之后时会盖住叉号，导致"看得见、点不动"。 */
.sheet-close {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  /* 圆形底 30px=56rpx、纯白（Figma 稿里是 Ellipse 30×30 #FFFFFF + ✕ 矢量） */
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border-radius: 50%;
  background: #ffffff;
}

.sheet-close-t {
  font-size: 36rpx;
  color: #666;
  line-height: 1;
}

.sheet-close:active {
  background: rgba(255, 255, 255, 0.7);
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
  padding: 114rpx 0 30rpx;
}

.option-list {
  position: relative;
  z-index: 1;
  /* 稿实测左右边距 107.94px → 201rpx，按钮净宽 348rpx ≈ 屏宽 46% */
  padding: 0 201rpx;
}

/* 圆角矩形按钮：规格对齐 Figma「莲藕加号」稿（3x 导出实测）
   —— 宽186 / 高50.7 / 圆角14 / 间距10.7 px，
      按画板 402px ↔ 750rpx 换算（1px = 1.8657rpx） */
.option-pill {
  height: 95rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4e6f66;
  color: #fff;
  font-size: 31rpx;
  border-radius: 26rpx;
  margin-bottom: 20rpx;
}

.option-pill:last-child {
  margin-bottom: 0;
}

.option-pill:active {
  background: #3f5c55;
}

</style>
