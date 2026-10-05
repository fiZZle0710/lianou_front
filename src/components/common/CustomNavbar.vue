<template>
  <view class="navbar">

    <!-- 状态栏占位 -->
    <view :style="{height: statusBarHeight + 'px'}"></view>


    <view class="nav-content">

      <view
      v-if="showBack"
      class="back"
      @click="goBack"
      >
      ←
      </view>


      <view class="title">
        <slot>
          {{title}}
        </slot>
      </view>


      <view class="right">

          <slot name="right"></slot>

      </view>

    </view>

  </view>
</template>

<script setup>

import {ref} from 'vue'


const props = defineProps({
  title:{
    type:String,
    default:'我的APP'
  }
})



const statusBarHeight = ref(0)


statusBarHeight.value =
uni.getSystemInfoSync().statusBarHeight || 0



const pages = getCurrentPages()


const showBack = ref(
  pages.length > 1
)



function goBack(){

  uni.navigateBack({

    delta:1

  })

}


</script>


<style scoped>

.navbar{

background:#ffffff;

}


.nav-content{

height:44px;

display:flex;

align-items:center;

justify-content:space-between;

padding:0 15px;

}


.back{

width:40px;

font-size:24px;

}


.title{

font-size:18px;

font-weight:bold;

}


.right{

display:flex;

align-items:center;

gap:20px;

position:relative;

z-index:99;

}


</style>