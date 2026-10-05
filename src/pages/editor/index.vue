<template>
  <!-- ============================================================ -->
  <!-- 视频剪辑编辑页面（核心页面）                                    -->
  <!-- 适配安卓端，预留FFmpeg调用入口                                  -->
  <!-- ============================================================ -->
  <view class="page">
    <!-- ==================== 顶部导航栏 ==================== -->
    <view class="editor-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
      </view>
      <view class="header-center">
        <view class="resolution-btn" @click="showExportPanel = true">
          <text class="resolution-text">{{ projectConfig.output.resolution }}</text>
        </view>
      </view>
      <view class="header-right">
        <view class="export-btn" @click="showExportPanel = true">
          <text class="export-text">导出</text>
        </view>
      </view>
    </view>

    <!-- ==================== 主体区域 ==================== -->
    <view class="editor-body">
      <!-- 视频预览画布区 -->
      <view class="canvas-area">
        <view class="video-canvas">
          <view v-if="projectConfig.videoClips.length === 0" class="canvas-placeholder">
            <text class="placeholder-icon">🎬</text>
            <text class="placeholder-text">点击下方"素材"导入视频</text>
          </view>
          <view v-else class="canvas-preview">
            <video
              v-if="previewSrc"
              id="previewVideo"
              class="preview-video"
              :src="previewSrc"
              :controls="false"
              :show-center-play-btn="false"
              :enable-progress-gesture="false"
              object-fit="contain"
              @play="onVideoPlay"
              @pause="onVideoPause"
              @ended="onVideoEnded"
              @timeupdate="onTimeUpdate"
            ></video>
            <view v-else class="canvas-placeholder">
              <text class="placeholder-icon">🎬</text>
              <text class="placeholder-text">选中片段后可预览</text>
            </view>

            <!-- 播放/暂停遮罩按钮 -->
            <view v-if="previewSrc && !isPlaying" class="play-overlay" @click="togglePlay">
              <text class="play-overlay-icon">▶</text>
            </view>

            <!-- 底部预览控制条 -->
            <view v-if="previewSrc" class="preview-controls">
              <slider
                class="preview-slider"
                :value="currentTime"
                :max="previewDuration"
                :activeColor="'#007aff'"
                :backgroundColor="'#555'"
                :block-size="16"
                @changing="seekPreview"
                @change="seekPreview"
              />
              <view class="preview-time">
                <text class="preview-time-text">{{ formatTime(currentTime) }} / {{ formatTime(previewDuration) }}</text>
              </view>
            </view>
          </view>

          <!-- 文字图层叠加显示 -->
          <view
            v-for="(textLayer, idx) in projectConfig.textLayers"
            :key="textLayer.id"
            v-if="isTextVisible(textLayer)"
            class="text-overlay"
            :style="{
              left: textLayer.x + 'rpx',
              top: textLayer.y + 'rpx',
              fontSize: textLayer.size + 'rpx',
              color: textLayer.color,
              fontFamily: textLayer.font,
              transform: 'rotate(' + (textLayer.rotation ? textLayer.rotation : 0) + 'deg)'
            }"
          >
            <text>{{ textLayer.content }}</text>
          </view>

          <view class="add-material" @click="showMaterialPanel">
            <text class="add-material-icon">＋</text>
            <text class="add-material-text">素材</text>
          </view>

          <view class="toolbar-right">
            <view class="tool-btn" @click="deleteSelectedClip">
              <text class="tool-icon">🗑️</text>
              <text class="tool-label">删除</text>
            </view>
            <view class="tool-btn" @click="splitClip">
              <text class="tool-icon">✂️</text>
              <text class="tool-label">分割</text>
            </view>
            <view class="tool-btn" @click="cropCanvas">
              <text class="tool-icon">✂️</text>
              <text class="tool-label">剪裁</text>
            </view>
            <view class="tool-btn" @click="undoAction">
              <text class="tool-icon">↩️</text>
              <text class="tool-label">撤销</text>
            </view>
            <view class="tool-btn" @click="redoAction">
              <text class="tool-icon">↪️</text>
              <text class="tool-label">重做</text>
            </view>
          </view>
        </view>
      </view>

      <view class="canvas-actions">
        <view class="action-btn" @click="togglePlay">
          <text class="action-icon">▶️</text>
          <text class="action-label">预览</text>
        </view>
        <view class="action-btn" @click="setCover">
          <text class="action-icon">🖼️</text>
          <text class="action-label">封面</text>
        </view>
        <view class="action-btn vol-control">
          <text class="action-icon">🔊</text>
          <input
            class="vol-slider"
            type="slider"
            min="0"
            max="100"
            :value="projectConfig.audioSettings.originalVolume"
            @input="onVolumeChange"
          />
          <text class="action-label vol-value">{{ projectConfig.audioSettings.originalVolume }}%</text>
        </view>
      </view>

      <!-- ==================== 时间轴 ==================== -->
      <view class="timeline-section">
        <scroll-view scroll-x class="timeline-scroll" show-scrollbar="false">
          <view class="timeline-track">
            <view
              v-for="(clip, idx) in projectConfig.videoClips"
              :key="clip.id"
              class="timeline-clip"
              :class="{ selected: selectedClipId === clip.id }"
              :style="{ width: getClipWidth(clip) }"
              @click="selectClip(clip.id)"
            >
              <view class="clip-preview" :style="{ background: getClipColor(clip) }">
                <text class="clip-index">{{ idx + 1 }}</text>
              </view>
            </view>
            <view class="timeline-add" @click="importVideo(['album'])">
              <text class="add-text">＋ 视频</text>
            </view>
            <view
              v-for="(audio, idx) in projectConfig.audioSettings.backgroundMusic"
              :key="audio.id"
              class="timeline-audio"
              :style="{ width: getAudioWidth(audio) }"
            >
              <view class="audio-label">
                <text>🎵 {{ audio.name ? audio.name : ('音频' + (idx + 1)) }}</text>
              </view>
            </view>
            <view class="timeline-add" @click="importAudio">
              <text class="add-text">＋ 音频</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="bottom-menu">
        <view
          v-for="menu in bottomMenus"
          :key="menu.key"
          class="menu-item"
          :class="{ active: activePanel === menu.key }"
          @click="togglePanel(menu.key)"
        >
          <text class="menu-icon">{{ menu.icon }}</text>
          <text class="menu-label">{{ menu.label }}</text>
        </view>
      </view>
    </view>

    <!-- ============================================================ -->
    <!-- 素材面板 -->
    <!-- ============================================================ -->
    <view v-if="activePanel === 'material'" class="panel-mask" @click="closePanel">
      <view class="panel-sheet material-sheet" @click.stop>
        <view class="panel-handle"><view class="handle-bar"></view></view>
        <view class="panel-title">素材库</view>
        <view class="material-tabs">
          <view
            class="mat-tab"
            :class="{ active: materialTab === 'video' }"
            @click="materialTab = 'video'"
          >视频</view>
          <view
            class="mat-tab"
            :class="{ active: materialTab === 'audio' }"
    @click="materialTab = 'audio'"
  >音频</view>
        </view>
        <scroll-view scroll-y class="material-list">
          <view v-if="materialTab === 'video'">
            <view class="mat-import-btn" @click="importVideo(['album'])">
              <text class="import-icon">＋</text>
              <text class="import-text">从相册导入视频</text>
            </view>
            <view
              v-for="(clip, idx) in projectConfig.videoClips"
              :key="clip.id"
              class="material-item"
            >
              <view class="mat-thumb" :style="{ background: getClipColor(clip) }">
                <text class="mat-thumb-text">V{{ idx + 1 }}</text>
              </view>
              <view class="mat-info">
                <text class="mat-name">{{ clip.name ? clip.name : ('视频片段 ' + (idx + 1)) }}</text>
                <text class="mat-duration">{{ clip.duration ? clip.duration : 0 }}秒</text>
              </view>
              <text class="mat-delete" :data-id="clip.id" @click="onRemoveClip">✕</text>
            </view>
          </view>
          <view v-if="materialTab === 'audio'">
            <view class="mat-import-btn" @click="importVoice">
              <text class="import-icon">＋</text>
              <text class="import-text">导入配音文件</text>
            </view>
            <view v-for="(voice, idx) in projectConfig.audioSettings.voice" :key="voice.id" class="material-item">
              <view class="mat-thumb audio-thumb"><text>🎙️</text></view>
              <view class="mat-info">
                <text class="mat-name">{{ voice.name ? voice.name : ('配音 ' + (idx + 1)) }}</text>
                <text class="mat-duration">{{ voice.duration ? voice.duration : 0 }}秒</text>
                <view class="vol-slider-row">
                  <text class="vol-label">音量</text>
                  <input class="vol-slider-inline bgm-vol" type="slider" min="0" max="100" :value="voice.volume" :data-id="voice.id" @input="onVoiceVolumeChange" />
                  <text class="vol-val">{{ voice.volume }}%</text>
                </view>
              </view>
              <text class="mat-delete" :data-id="voice.id" @click="onRemoveVoice">✕</text>
            </view>
            <view class="mat-import-btn" @click="importAudio">
              <text class="import-icon">＋</text>
<text class="import-text">导入背景音乐</text>
            </view>
            <view class="material-item">
              <view class="mat-thumb audio-thumb"><text>🔊</text></view>
              <view class="mat-info">
                <text class="mat-name">原视频音轨</text>
                  <view class="orig-toggle">
                    <text class="orig-toggle-t">原音频</text>
                    <view class="mini-switch" :class="{ on: projectConfig.audioSettings.originalEnabled }" @click="toggleOriginal">
                      <view class="mini-knob"></view>
                    </view>
                  </view>
                <view class="vol-slider-row">
                  <text class="vol-label">音量</text>
                  <input
                    class="vol-slider-inline"
                    type="slider"
                    min="0"
                    max="100"
                    :value="projectConfig.audioSettings.originalVolume"
                    @input="onVolumeChange"
                  />
                  <text class="vol-val">{{ projectConfig.audioSettings.originalVolume }}%</text>
                </view>
              </view>
            </view>
            <view
              v-for="(audio, idx) in projectConfig.audioSettings.backgroundMusic"
              :key="audio.id"
              class="material-item"
            >
              <view class="mat-thumb audio-thumb"><text>🎵</text></view>
              <view class="mat-info">
                <text class="mat-name">{{ audio.name ? audio.name : ('背景音乐 ' + (idx + 1)) }}</text>
                <text class="mat-duration">{{ audio.duration ? audio.duration : 0 }}秒</text>
                <view class="vol-slider-row">
                  <text class="vol-label">音量</text>
                  <input
                    class="vol-slider-inline bgm-vol"
                    type="slider"
                    min="0"
                    max="100"
                    :value="audio.volume"
                    :data-id="audio.id"
                    @input="onBgVolumeChange"
                  />
                  <text class="vol-val">{{ audio.volume }}%</text>
                </view>
              </view>
              <text class="mat-delete" :data-id="audio.id" @click="onRemoveAudio">✕</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- ============================================================ -->
    <!-- 文本面板 -->
    <!-- ============================================================ -->
    <view v-if="activePanel === 'text'" class="panel-mask" @click="closePanel">
      <view class="panel-sheet text-sheet" @click.stop>
        <view class="panel-handle"><view class="handle-bar"></view></view>
        <view class="panel-title">文字图层</view>
        <view class="add-text-btn" @click="addTextLayer">
          <text>＋ 新增文字</text>
        </view>
        <scroll-view scroll-y class="text-layer-list">
          <view
            v-for="(layer, idx) in projectConfig.textLayers"
            :key="layer.id"
            class="text-layer-item"
            :class="{ editing: editingTextId === layer.id }"
          >
            <input
              class="text-content-input"
              v-model="layer.content"
              type="text"
              placeholder="输入文字..."
              @focus="editingTextId = layer.id"
            />
            <view class="text-style-row">
              <picker :value="idx" :range="fontOptions" :data-id="layer.id" @change="onFontChange">
                <view class="style-picker">
                  <text>{{ layer.font }}</text>
                </view>
              </picker>
              <view class="style-stepper">
                <text class="stepper-btn" :data-id="layer.id" @click="onTextSizeDown">−</text>
                <text class="stepper-val">{{ layer.size }}</text>
                <text class="stepper-btn" :data-id="layer.id" @click="onTextSizeUp">+</text>
              </view>
            </view>
            <view class="text-style-row">
              <view class="color-picker-row">
                <text
                  v-for="c in colorOptions"
                  :key="c"
                  class="color-dot"
                  :class="{ active: layer.color === c }"
                  :style="{ background: c }"
                  :data-id="layer.id"
                  :data-color="c"
                  @click="onColorSelect"
                ></text>
              </view>
              <text class="delete-text-btn" :data-id="layer.id" @click="onRemoveTextLayer">✕</text>
            </view>
            <view class="text-pos-hint">
              <text>X:{{ layer.x }} Y:{{ layer.y }}</text>
              <view class="pos-adjust">
                <text class="pos-btn" :data-id="layer.id" @click="onPosLeft">←</text>
                <text class="pos-btn" :data-id="layer.id" @click="onPosUp">↑</text>
                <text class="pos-btn" :data-id="layer.id" @click="onPosDown">↓</text>
                <text class="pos-btn" :data-id="layer.id" @click="onPosRight">→</text>
              </view>
            </view>
          </view>
          <view v-if="projectConfig.textLayers.length === 0" class="text-empty">
            <text>暂无文字，点击上方按钮添加</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- ============================================================ -->
    <!-- 导出面板 -->
    <!-- ============================================================ -->
    <view v-if="showExportPanel" class="panel-mask" @click="showExportPanel = false">
      <view class="panel-sheet export-sheet" @click.stop>
        <view class="panel-handle"><view class="handle-bar"></view></view>
        <view class="panel-title">导出设置</view>
        <view class="export-section">
          <text class="sec-label">输出分辨率</text>
          <view class="resolution-list">
            <view
              v-for="res in resolutionOptions"
              :key="res.key"
              class="res-item"
              :class="{ selected: projectConfig.output.resolution === res.key }"
              :data-key="res.key"
              @click="onResolutionSelect"
            >
              <text class="res-name">{{ res.label }}</text>
              <text class="res-desc">{{ res.desc }}</text>
            </view>
          </view>
        </view>
        <view class="export-info">
          <view class="info-row">
            <text class="info-label">片段数</text>
            <text class="info-value">{{ projectConfig.videoClips.length }} 个</text>
          </view>
          <view class="info-row">
            <text class="info-label">音频轨</text>
<text class="info-value">{{ projectConfig.audioSettings.backgroundMusic.length + projectConfig.audioSettings.voice.length + (projectConfig.audioSettings.originalEnabled ? 1 : 0) }} 轨</text>
          </view>
          <view class="info-row">
            <text class="info-label">文字层</text>
            <text class="info-value">{{ projectConfig.textLayers.length }} 层</text>
          </view>
          <view class="info-row">
            <text class="info-label">画布裁剪</text>
            <text class="info-value">{{ projectConfig.output.crop ? '已裁剪' : '原始' }}</text>
          </view>
        </view>
        <view class="export-actions">
          <view class="export-btn-large" @click="startRender">
            <text>开始渲染导出</text>
          </view>
          <view class="export-preview-btn" @click="previewProjectJson">
            <text>查看工程JSON</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ============================================================ -->
    <!-- 剪裁面板 -->
    <!-- ============================================================ -->
    <view v-if="showCropPanel" class="panel-mask" @click="showCropPanel = false">
      <view class="panel-sheet crop-sheet" @click.stop>
        <view class="panel-handle"><view class="handle-bar"></view></view>
        <view class="panel-title">画面剪裁</view>
        <view class="crop-presets">
          <view
            v-for="preset in cropPresets"
            :key="preset.key ? preset.key : 'original'"
            class="crop-preset-item"
            :class="{ selected: projectConfig.output.crop === preset.key }"
            :data-key="preset.key"
            @click="onCropSelect"
          >
            <text class="preset-name">{{ preset.label }}</text>
            <text class="preset-ratio">{{ preset.ratio }}</text>
          </view>
        </view>
        <view class="crop-confirm">
          <view class="crop-btn" @click="showCropPanel = false">完成裁剪</view>
        </view>
      </view>
    </view>
  </view>
</template>

<!-- ================================================================ -->
<!-- JavaScript -->
<!-- ================================================================ -->
<script>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { exportVideo } from '@/utils/videoExport.js'
import { uploadWorkFile } from '@/api/works.js'
export default {
  setup() {
    const createEmptyProject = () => ({
      version: '1.0.0',
      meta: { name: '未命名项目', createTime: Date.now(), lastModified: Date.now() },
      videoClips: [],
      audioSettings: { originalEnabled: true, originalVolume: 100, backgroundMusic: [], voice: [] },
      textLayers: [],
      output: { resolution: '1080p', crop: null, fps: 30, bitrate: 10 }
    })

    const projectConfig = reactive(createEmptyProject())
    const activePanel = ref('')
    const showExportPanel = ref(false)
    const showCropPanel = ref(false)
    const materialTab = ref('video')
    const selectedClipId = ref(null)
    const editingTextId = ref(null)
    let clipIdCounter = 0
    let audioIdCounter = 0
    let voiceIdCounter = 0
    let textIdCounter = 0

    // ========== 效果预览 ==========
    const instance = getCurrentInstance()
    const previewSrc = ref('')
    const isPlaying = ref(false)
    const currentTime = ref(0)
    let videoCtx = null
    const previewDuration = computed(function() {
      const clip = projectConfig.videoClips.find(function(c) { return c.id === selectedClipId.value })
      return clip ? (clip.duration || 0) : 0
    })

    const bottomMenus = [
      { key: 'material', icon: '📁', label: '素材' },
      { key: 'text', icon: '📝', label: '文字' }
    ]

    const fontOptions = ['默认', '黑体', '宋体', '楷体', '微软雅黑', 'Noto Sans SC']
    const colorOptions = ['#ffffff', '#000000', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de']
    const resolutionOptions = [
      { key: '480p', label: '480P (SD)', desc: '852×480' },
      { key: '720p', label: '720P (HD)', desc: '1280×720' },
      { key: '1080p', label: '1080P (FHD)', desc: '1920×1080' },
      { key: '2k', label: '2K (QHD)', desc: '2560×1440' },
      { key: '4k', label: '4K (UHD)', desc: '3840×2160' }
    ]
    const cropPresets = [
      { key: null, label: '原始比例', ratio: 'auto' },
      { key: '16:9', label: '横屏 16:9', ratio: '16:9' },
      { key: '1:1', label: '方形 1:1', ratio: '1:1' },
      { key: '4:3', label: '经典 4:3', ratio: '4:3' },
      { key: '9:16', label: '竖屏 9:16', ratio: '9:16' }
    ]

    function getClipColor(clip) {
      return clip.color ? clip.color : '#444'
    }
    function getClipWidth(clip) {
      return (clip.duration ? clip.duration : 3) * 8 + 40 + 'rpx'
    }
    function getAudioWidth(audio) {
      return (audio.duration ? audio.duration : 5) * 8 + 40 + 'rpx'
    }

    // ========== 生命周期 ==========
    function onMounted() {
      try {
        const sysInfo = uni.getSystemInfoSync()
        if (sysInfo.platform === 'android' || sysInfo.platform === 'app-plus') {
          plus.android.requestPermissions(
            ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'],
            function(res) { console.log('权限回调', res) }
          )
        }
      } catch (e) {
        console.log('非原生环境，跳过权限检查')
      }
    }
    // ========== 素材导入 ==========
    // sourceType: ['camera'] = 拍摄视频 / ['album'] = 从相册导入（缺省为相册）
    function importVideo(sourceType) {
      const sourceTypes = Array.isArray(sourceType) ? sourceType : ['album']
      uni.chooseVideo({
        count: 1,
        sourceType: sourceTypes,
        maxDuration: 600,
        success(res) {
          const clip = {
            id: 'clip_' + (++clipIdCounter),
            name: res.tempFilePath.split('/').pop() || '视频片段',
            path: res.tempFilePath,
            duration: Math.round(res.duration) || 3,
            width: res.width || 1920,
            height: res.height || 1080,
            color: randomColor(),
            startTime: 0,
            endTime: Math.round(res.duration) || 3,
            speed: 1.0
          }
          projectConfig.videoClips.push(clip)
          selectedClipId.value = clip.id
          setPreviewClip(clip)
          try {
            const platform = uni.getSystemInfoSync().platform
            if (platform === 'android' || platform === 'app-plus') {
              copyToCache(clip.path)
            }
          } catch (e) {}
          uni.showToast({ title: '视频已导入', icon: 'success' })
          closePanel()
        },
        fail() {
          uni.showToast({ title: '取消导入', icon: 'none' })
        }
      })
    }

    // ========== 入口分流：「+ → 拍摄视频 / 导入视频」区分处理 ==========
    // from=shoot：进页面直接调起系统相机；from=album：进页面直接调起系统相册
    // 这样两个入口不再弹出"拍摄/相册"二次选择菜单，行为彻底区分
    onLoad(function(options) {
      const from = (options && options.from) || ''
      if (from !== 'shoot' && from !== 'album') return
      // 延时等待导航动画结束，避免部分安卓机型系统相机/相册被页面切换打断
      setTimeout(function() {
        importVideo(from === 'shoot' ? ['camera'] : ['album'])
      }, 350)
    })

    function pickAudioFile(onSuccess) {
      if (typeof uni.chooseMessageFile === "function") {
        uni.chooseMessageFile({
          count: 1,
          type: "file",
          extension: ["mp3", "m4a", "wav", "aac"],
          success: onSuccess,
          fail: function() { uni.showToast({ title: "取消导入", icon: "none" }) }
        })
      } else {
        uni.showToast({ title: "请在 App 端导入音频", icon: "none" })
      }
    }

    function importAudio() {
      pickAudioFile(function(res) {
        const f = res.tempFiles ? res.tempFiles[0] : null
        const filePath = f ? f.path : (res.tempFilePath || "")
        const audioItem = {
          id: "audio_" + (++audioIdCounter),
          name: (f && f.name) || "背景音乐",
          path: filePath,
          volume: 80,
          duration: 5,
          startTime: 0,
          fadeIn: 0.5,
          fadeOut: 0.5
        }
        projectConfig.audioSettings.backgroundMusic.push(audioItem)
        uni.showToast({ title: "背景音乐已导入", icon: "success" })
      })
    }

    function importVoice() {
      pickAudioFile(function(res) {
        const f = res.tempFiles ? res.tempFiles[0] : null
        const filePath = f ? f.path : (res.tempFilePath || "")
        const voiceItem = {
          id: "voice_" + (++voiceIdCounter),
          name: (f && f.name) || "配音",
          path: filePath,
          volume: 100,
          duration: 5,
          startTime: 0
        }
        projectConfig.audioSettings.voice.push(voiceItem)
        uni.showToast({ title: "配音已导入", icon: "success" })
      })
    }

    function onVoiceVolumeChange(e) {
      const id = e.currentTarget ? e.currentTarget.dataset.id : null
      if (id) {
        const v = projectConfig.audioSettings.voice.find(function(a) { return a.id === id })
        if (v) v.volume = e.detail.value ? parseInt(e.detail.value) : 100
      }
    }
    function onRemoveVoice(e) {
      const id = e.currentTarget.dataset.id
      const idx = projectConfig.audioSettings.voice.findIndex(function(a) { return a.id === id })
      if (idx > -1) projectConfig.audioSettings.voice.splice(idx, 1)
    }
    function toggleOriginal() {
      projectConfig.audioSettings.originalEnabled = !projectConfig.audioSettings.originalEnabled
    }

    // ========== 视频操作 ==========
    function selectClip(clipId) {
      selectedClipId.value = clipId
      const clip = projectConfig.videoClips.find(function(c) { return c.id === clipId })
      setPreviewClip(clip)
    }

    function splitClip() {
      const clip = projectConfig.videoClips.find(function(c) { return c.id === selectedClipId.value })
      if (!clip) {
        uni.showToast({ title: '请先选中一个片段', icon: 'none' })
        return
      }
      const mid = Math.floor(clip.duration / 2)
      const newClip = {
        id: 'clip_' + (++clipIdCounter),
        name: clip.name + '_2',
        path: clip.path,
        duration: clip.duration - mid,
        width: clip.width,
        height: clip.height,
        color: randomColor(),
        startTime: mid,
        endTime: clip.duration,
        speed: clip.speed
      }
      clip.duration = mid
      clip.endTime = mid
      const idx = projectConfig.videoClips.findIndex(function(c) { return c.id === clip.id })
      projectConfig.videoClips.splice(idx + 1, 0, newClip)
      uni.showToast({ title: '已分割', icon: 'success' })
    }

    function deleteSelectedClip() {
      if (!selectedClipId.value) {
        uni.showToast({ title: '请先选中片段', icon: 'none' })
        return
      }
      removeClip(selectedClipId.value)
    }

    function onRemoveClip(e) {
      const id = e.currentTarget.dataset.id
      removeClip(id)
    }

    function removeClip(clipId) {
      const idx = projectConfig.videoClips.findIndex(function(c) { return c.id === clipId })
      if (idx > -1) {
        projectConfig.videoClips.splice(idx, 1)
        if (selectedClipId.value === clipId) {
          selectedClipId.value = null
          previewSrc.value = ''
          currentTime.value = 0
          isPlaying.value = false
        }
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }

    function cropCanvas() {
      showCropPanel.value = true
    }

    // ========== 音频 ==========
    function onVolumeChange(e) {
      projectConfig.audioSettings.originalVolume = e.detail.value ? parseInt(e.detail.value) : 100
    }

    function onBgVolumeChange(e) {
      const id = e.currentTarget ? e.currentTarget.dataset.id : null
      if (id) {
        const audio = projectConfig.audioSettings.backgroundMusic.find(function(a) { return a.id === id })
        if (audio) {
          audio.volume = e.detail.value ? parseInt(e.detail.value) : 80
        }
      }
    }

    function onRemoveAudio(e) {
      const id = e.currentTarget.dataset.id
      removeAudio(id)
    }

    function removeAudio(audioId) {
      const idx = projectConfig.audioSettings.backgroundMusic.findIndex(function(a) { return a.id === audioId })
      if (idx > -1) {
        projectConfig.audioSettings.backgroundMusic.splice(idx, 1)
      }
    }

    // ========== 文字 ==========
    function addTextLayer() {
      const layer = {
        id: 'text_' + (++textIdCounter),
        content: '双击编辑文字',
        font: '默认',
        size: 32,
        color: '#ffffff',
        x: 100,
        y: 100,
        rotation: 0,
        opacity: 1.0,
        startTime: 0,
        endTime: 10
      }
      projectConfig.textLayers.push(layer)
      editingTextId.value = layer.id
    }

    function onRemoveTextLayer(e) {
      const id = e.currentTarget.dataset.id
      const idx = projectConfig.textLayers.findIndex(function(l) { return l.id === id })
      if (idx > -1) {
        projectConfig.textLayers.splice(idx, 1)
        if (editingTextId.value === id) {
          editingTextId.value = null
        }
      }
    }

    function onFontChange(e) {
      const id = e.currentTarget.dataset.id
      const layer = projectConfig.textLayers.find(function(l) { return l.id === id })
      if (layer) {
        layer.font = fontOptions[e.detail.value]
      }
    }

    function onTextSizeDown(e) {
      const id = e.currentTarget.dataset.id
      adjustTextSize(id, -4)
    }

    function onTextSizeUp(e) {
      const id = e.currentTarget.dataset.id
      adjustTextSize(id, 4)
    }

    function adjustTextSize(layerId, delta) {
      const layer = projectConfig.textLayers.find(function(l) { return l.id === layerId })
      if (layer) {
        layer.size = Math.max(12, Math.min(200, layer.size + delta))
      }
    }

    function onColorSelect(e) {
      const id = e.currentTarget.dataset.id
      const color = e.currentTarget.dataset.color
      const layer = projectConfig.textLayers.find(function(l) { return l.id === id })
      if (layer) {
        layer.color = color
      }
    }

    function onPosLeft(e) {
      const id = e.currentTarget.dataset.id
      const layer = projectConfig.textLayers.find(function(l) { return l.id === id })
      if (layer) layer.x = Math.max(0, layer.x - 10)
    }

    function onPosUp(e) {
      const id = e.currentTarget.dataset.id
      const layer = projectConfig.textLayers.find(function(l) { return l.id === id })
      if (layer) layer.y = Math.max(0, layer.y - 10)
    }

    function onPosDown(e) {
      const id = e.currentTarget.dataset.id
      const layer = projectConfig.textLayers.find(function(l) { return l.id === id })
      if (layer) layer.y = Math.min(600, layer.y + 10)
    }

    function onPosRight(e) {
      const id = e.currentTarget.dataset.id
      const layer = projectConfig.textLayers.find(function(l) { return l.id === id })
      if (layer) layer.x = Math.min(700, layer.x + 10)
    }

    // ========== 导出（成片 → 3.9 上传 → 交给视频发布页 3.1 创建作品） ==========
    function startRender() {
      uni.showToast({ title: '准备渲染...', icon: 'loading' })
      exportVideo(projectConfig).then(function(res) {
        uni.hideToast()
        // ⚠️ 导出 SDK 目前是占位实现：res.videoPath（成片本地路径）接入真实 SDK 后才有值
        const videoPath = res && res.videoPath
        if (!videoPath) {
          uni.showToast({ title: '渲染完成（SDK 占位，暂无成片文件）', icon: 'none' })
          uni.navigateTo({ url: '/pages/publish/index' })
          return
        }
        uni.showToast({ title: '上传成片...', icon: 'loading' })
        uploadWorkFile(videoPath).then(function(up) {
          uni.hideToast()
          // 成片信息通过本地缓存透给视频发布页（路径过长，不适合放 URL 参数）
          uni.setStorageSync('video_publish_payload', {
            path: videoPath,
            url: (up && up.url) || '',
            size: (up && up.file_size) || 0
          })
          uni.showToast({ title: '上传完成', icon: 'success' })
          uni.navigateTo({ url: '/pages/publish/index' })
        }).catch(function(err) {
          uni.hideToast()
          uni.showToast({ title: (err && err.message) || '成片上传失败', icon: 'none' })
        })
      }).catch(function(err) {
        uni.hideToast()
        uni.showToast({ title: (err && err.message) || '导出失败', icon: 'none' })
      })
    }

    function previewProjectJson() {
      const json = getProjectJson()
      uni.setClipboardData({
        data: json,
        success() {
          uni.showToast({ title: '工程JSON已复制到剪贴板', icon: 'success' })
        }
      })
    }

    function getProjectJson() {
      projectConfig.meta.lastModified = Date.now()
      return JSON.stringify(projectConfig, null, 2)
    }

    function onResolutionSelect(e) {
      const key = e.currentTarget.dataset.key
      projectConfig.output.resolution = key
    }

    function onCropSelect(e) {
      const key = e.currentTarget.dataset.key
      const crop = key === "null" || key === "undefined" ? null : key
      projectConfig.output.crop = crop
      // 剪裁数据落地到选中片段
      const clip = projectConfig.videoClips.find(function(c) { return c.id === selectedClipId.value })
      if (clip) clip.crop = crop
    }

    // ========== 公共 ==========
    function showMaterialPanel() {
      activePanel.value = 'material'
    }

    function togglePanel(key) {
      activePanel.value = activePanel.value === key ? '' : key
    }

    function closePanel() {
      activePanel.value = ''
    }

    function randomColor() {
      const colors = ['#4A90D9', '#50C878', '#FF6B6B', '#FFD93D', '#6C5CE7', '#A29BFE', '#FD79A8', '#00CEC9']
      return colors[Math.floor(Math.random() * colors.length)]
    }

    function goBack() {
      uni.navigateBack()
    }

    // ========== 效果预览 ==========
    function setPreviewClip(clip) {
      if (!clip) return
      previewSrc.value = clip.path || ''
      currentTime.value = 0
      isPlaying.value = false
    }

    function ensureVideoCtx() {
      if (!videoCtx && instance && instance.proxy) {
        try {
          videoCtx = uni.createVideoContext('previewVideo', instance.proxy)
        } catch (e) {
          videoCtx = null
        }
      }
      return videoCtx
    }

    function togglePlay() {
      if (projectConfig.videoClips.length === 0) {
        uni.showToast({ title: '请先导入视频', icon: 'none' })
        return
      }
      if (!selectedClipId.value) {
        selectedClipId.value = projectConfig.videoClips[0].id
        setPreviewClip(projectConfig.videoClips[0])
      }
      const ctx = ensureVideoCtx()
      if (!ctx) return
      if (isPlaying.value) {
        ctx.pause()
      } else {
        ctx.play()
      }
    }

    function onVideoPlay() { isPlaying.value = true }
    function onVideoPause() { isPlaying.value = false }
    function onVideoEnded() { isPlaying.value = false; currentTime.value = 0 }

    function onTimeUpdate(e) {
      currentTime.value = (e && e.detail && e.detail.currentTime) ? e.detail.currentTime : 0
    }

    function seekPreview(e) {
      const t = e.detail.value || 0
      currentTime.value = t
      const ctx = ensureVideoCtx()
      if (ctx) ctx.seek(t)
    }

    function isTextVisible(layer) {
      if (!layer) return false
      const t = currentTime.value || 0
      return t >= (layer.startTime || 0) && t <= (layer.endTime || 999)
    }

    function formatTime(sec) {
      sec = Math.max(0, Math.floor(sec || 0))
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s)
    }

    function setCover() {
      uni.showToast({ title: '设置封面（占位）', icon: 'none' })
    }

    function undoAction() {
      uni.showToast({ title: '撤销操作（占位）', icon: 'none' })
    }

    function redoAction() {
      uni.showToast({ title: '重做操作（占位）', icon: 'none' })
    }

    function copyToCache(srcPath) {}

    // ========== 导出 ==========
    return {
      projectConfig,
      activePanel,
      showExportPanel,
      showCropPanel,
      materialTab,
      selectedClipId,
      editingTextId,
      bottomMenus,
      fontOptions,
      colorOptions,
      resolutionOptions,
      cropPresets,
      getClipColor,
      getClipWidth,
      getAudioWidth,
      importVideo,
      importAudio,
      showMaterialPanel,
      selectClip,
      splitClip,
      deleteSelectedClip,
      onRemoveClip,
      removeClip,
      cropCanvas,
      onVolumeChange,
      onBgVolumeChange,
      onRemoveAudio,
      importVoice,
      onVoiceVolumeChange,
      onRemoveVoice,
      toggleOriginal,
      addTextLayer,
      onRemoveTextLayer,
      onFontChange,
      onTextSizeDown,
      onTextSizeUp,
      onColorSelect,
      onPosLeft,
      onPosUp,
      onPosDown,
      onPosRight,
      startRender,
      previewProjectJson,
      onResolutionSelect,
      onCropSelect,
      togglePanel,
      closePanel,
      goBack,
      togglePlay,
      setCover,
      undoAction,
      redoAction,
      previewSrc,
      isPlaying,
      currentTime,
      previewDuration,
      onVideoPlay,
      onVideoPause,
      onVideoEnded,
      onTimeUpdate,
      seekPreview,
      formatTime,
      isTextVisible
    }
  }
}
</script>

<style scoped>
/* 全局 */
.page { background: #1a1a1a; min-height: 100vh; display: flex; flex-direction: column; color: #fff; }

/* 顶部导航 */
.editor-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 30rpx; padding-top: calc(60rpx + env(safe-area-inset-top)); background: #1a1a1a;
}
.header-left, .header-center, .header-right { flex: 1; }
.header-left { display: flex; }
.header-center { display: flex; justify-content: center; }
.header-right { display: flex; justify-content: flex-end; }
.back-btn { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 40rpx; color: #fff; }
.resolution-btn { padding: 8rpx 24rpx; background: #333; border-radius: 20rpx; }
.resolution-text { font-size: 24rpx; color: #fff; font-weight: 500; }
.export-btn { padding: 12rpx 30rpx; background: #007aff; border-radius: 24rpx; }
.export-text { font-size: 26rpx; color: #fff; font-weight: 600; }

.editor-body { flex: 1; display: flex; flex-direction: column; }

/* 画布 */
.canvas-area { flex: 1; padding: 16rpx; min-height: 350rpx; }
.video-canvas {
  position: relative; width: 100%; height: 100%; min-height: 350rpx;
  background: #000; border-radius: 12rpx;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.canvas-placeholder { display: flex; flex-direction: column; align-items: center; }
.placeholder-icon { font-size: 80rpx; }
.placeholder-text { font-size: 26rpx; color: #666; margin-top: 16rpx; }
.canvas-clips-preview { position: relative; width: 90%; height: 80%; }
.clip-thumb-wrapper { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.clip-thumb { width: 100%; height: 100%; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; }
.clip-thumb-label { font-size: 24rpx; color: #fff; opacity: 0.7; }

/* 效果预览 */
.canvas-preview { position: relative; width: 100%; height: 100%; min-height: 350rpx; display: flex; align-items: center; justify-content: center; }
.preview-video { width: 100%; height: 100%; }
.play-overlay {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: 100rpx; height: 100rpx; border-radius: 50%; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 20;
}
.play-overlay-icon { font-size: 48rpx; color: #fff; margin-left: 8rpx; }
.preview-controls {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 30;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  padding: 20rpx 20rpx 12rpx;
}
.preview-slider { margin: 0; }
.preview-time { text-align: right; padding-top: 6rpx; }
.preview-time-text { font-size: 20rpx; color: #ddd; }
.text-overlay { z-index: 25; }

.text-overlay {
  position: absolute; pointer-events: none;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.5); max-width: 80%; overflow: hidden;
}

.add-material {
  position: absolute; left: 16rpx; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; align-items: center;
  padding: 16rpx; background: rgba(255,255,255,0.1); border-radius: 16rpx;
}
.add-material-icon { font-size: 36rpx; color: #fff; font-weight: bold; }
.add-material-text { font-size: 18rpx; color: #fff; margin-top: 6rpx; }

.toolbar-right {
  position: absolute; right: 8rpx; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 12rpx;
}
.tool-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 10rpx; background: rgba(255,255,255,0.1); border-radius: 12rpx; width: 72rpx;
}
.tool-btn:active { background: rgba(255,255,255,0.2); }
.tool-icon { font-size: 24rpx; }
.tool-label { font-size: 16rpx; color: #fff; margin-top: 4rpx; }

.canvas-actions {
  display: flex; justify-content: center; gap: 30rpx;
  padding: 14rpx 20rpx; background: #222; align-items: center;
}
.action-btn { display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.action-icon { font-size: 32rpx; }
.action-label { font-size: 20rpx; color: #fff; }
.vol-control { flex-direction: row; gap: 8rpx; }
.vol-slider { width: 120rpx; height: 40rpx; }
.vol-value { font-size: 18rpx; color: #999; min-width: 50rpx; text-align: center; }

/* 时间轴 */
.timeline-section { padding: 8rpx 16rpx; background: #222; }
.timeline-scroll { width: 100%; overflow: hidden; }
.timeline-track { display: flex; gap: 8rpx; align-items: center; padding: 8rpx 0; }
.timeline-clip {
  height: 72rpx; background: #444; border-radius: 6rpx; flex-shrink: 0;
  overflow: hidden; border: 2px solid transparent;
}
.timeline-clip.selected { border-color: #007aff; }
.clip-preview { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.clip-index { font-size: 20rpx; color: #fff; opacity: 0.6; }
.timeline-audio {
  height: 56rpx; background: #2a4a2a; border-radius: 6rpx;
  display: flex; align-items: center; padding: 0 12rpx; flex-shrink: 0;
}
.audio-label text { font-size: 18rpx; color: #8f8; }
.timeline-add {
  height: 72rpx; display: flex; align-items: center; justify-content: center;
  padding: 0 16rpx; background: #333; border-radius: 6rpx; flex-shrink: 0;
}
.add-text { font-size: 20rpx; color: #999; white-space: nowrap; }

.bottom-menu {
  display: flex; justify-content: space-around;
  padding: 12rpx 16rpx; padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  background: #1a1a1a; border-top: 1px solid #333;
}
.menu-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; padding: 8rpx 40rpx; border-radius: 12rpx; }
.menu-item.active { background: #333; }
.menu-icon { font-size: 32rpx; }
.menu-label { font-size: 20rpx; color: #999; }
.menu-item.active .menu-label { color: #007aff; }

/* 面板 */
.panel-mask {
  position: fixed; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 1000;
}
.panel-sheet {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #1e1e1e; border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh; padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.panel-handle { display: flex; justify-content: center; padding: 16rpx 0 8rpx; }
.handle-bar { width: 56rpx; height: 6rpx; background: #444; border-radius: 3rpx; }
.panel-title { text-align: center; font-size: 30rpx; font-weight: 700; color: #fff; padding: 0 30rpx 16rpx; }

.material-tabs { display: flex; margin: 0 30rpx; border-bottom: 1px solid #333; }
.mat-tab { flex: 1; text-align: center; padding: 16rpx 0; font-size: 26rpx; color: #999; position: relative; }
.mat-tab.active { color: #007aff; font-weight: 500; }
.mat-tab.active::after {
  content: ''; position: absolute; bottom: 0; left: 50%;
  transform: translateX(-50%); width: 40rpx; height: 4rpx; background: #007aff; border-radius: 2rpx;
}
.material-list { padding: 16rpx 30rpx; max-height: 400rpx; }
.mat-import-btn {
  display: flex; align-items: center; gap: 12rpx;
  padding: 20rpx; background: #2a2a2a; border-radius: 12rpx;
  border: 1px dashed #444; margin-bottom: 12rpx;
}
.import-icon { font-size: 32rpx; color: #007aff; }
.import-text { font-size: 26rpx; color: #007aff; }
.material-item { display: flex; align-items: center; gap: 14rpx; padding: 16rpx 0; border-bottom: 1px solid #2a2a2a; }
.mat-thumb { width: 72rpx; height: 72rpx; border-radius: 10rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mat-thumb-text { font-size: 22rpx; color: #fff; opacity: 0.7; }
.audio-thumb { background: #2a4a2a; font-size: 28rpx; }
.mat-info { flex: 1; min-width: 0; }
.mat-name { font-size: 24rpx; color: #fff; display: block; }
.mat-duration { font-size: 20rpx; color: #888; display: block; margin-top: 4rpx; }
.mat-delete { font-size: 24rpx; color: #ff3b30; padding: 8rpx; }
.vol-slider-row { display: flex; align-items: center; gap: 8rpx; margin-top: 6rpx; }
.vol-label { font-size: 18rpx; color: #888; }
.vol-slider-inline { width: 100rpx; height: 32rpx; }
.vol-val { font-size: 18rpx; color: #ddd; min-width: 36rpx; }

.add-text-btn {
  margin: 0 30rpx 16rpx; padding: 20rpx; background: #2a2a2a;
  border-radius: 12rpx; border: 1px dashed #444;
  text-align: center; font-size: 26rpx; color: #007aff;
}
.text-layer-list { padding: 0 30rpx 20rpx; max-height: 500rpx; }
.text-layer-item { background: #2a2a2a; border-radius: 16rpx; padding: 20rpx; margin-bottom: 12rpx; }
.text-layer-item.editing { border: 1px solid #007aff; }
.text-content-input { width: 100%; height: 60rpx; background: #333; border-radius: 8rpx; padding: 0 16rpx; font-size: 26rpx; color: #fff; margin-bottom: 12rpx; }
.text-style-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 10rpx; }
.style-picker { padding: 10rpx 20rpx; background: #333; border-radius: 8rpx; font-size: 22rpx; color: #ddd; }
.style-stepper { display: flex; align-items: center; gap: 8rpx; }
.stepper-btn { width: 44rpx; height: 44rpx; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: #fff; }
.stepper-val { font-size: 22rpx; color: #fff; min-width: 40rpx; text-align: center; }
.color-picker-row { display: flex; gap: 8rpx; flex: 1; flex-wrap: wrap; }
.color-dot { width: 36rpx; height: 36rpx; border-radius: 50%; border: 2px solid transparent; }
.color-dot.active { border-color: #fff; }
.delete-text-btn { font-size: 24rpx; color: #ff3b30; padding: 8rpx; }
.text-pos-hint { display: flex; justify-content: space-between; align-items: center; font-size: 18rpx; color: #888; margin-top: 6rpx; }
.pos-adjust { display: flex; gap: 6rpx; }
.pos-btn { width: 40rpx; height: 40rpx; background: #333; border-radius: 6rpx; display: flex; align-items: center; justify-content: center; font-size: 18rpx; color: #ddd; }
.text-empty { text-align: center; padding: 40rpx 0; font-size: 24rpx; color: #666; }

.export-section { padding: 0 30rpx 20rpx; }
.sec-label { font-size: 24rpx; color: #888; display: block; margin-bottom: 12rpx; }
.resolution-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.res-item { padding: 14rpx 20rpx; background: #2a2a2a; border-radius: 12rpx; border: 1px solid transparent; flex: 1; min-width: 130rpx; text-align: center; }
.res-item.selected { border-color: #007aff; background: #1a2a3a; }
.res-name { font-size: 22rpx; color: #fff; display: block; font-weight: 500; }
.res-desc { font-size: 18rpx; color: #888; display: block; margin-top: 4rpx; }

.export-info { margin: 0 30rpx 20rpx; padding: 16rpx; background: #2a2a2a; border-radius: 12rpx; }
.info-row { display: flex; justify-content: space-between; padding: 8rpx 0; }
.info-label { font-size: 22rpx; color: #888; }
.info-value { font-size: 22rpx; color: #fff; }

.export-actions { padding: 0 30rpx 20rpx; display: flex; flex-direction: column; gap: 12rpx; }
.export-btn-large { height: 80rpx; background: #007aff; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #fff; font-weight: 600; }
.export-preview-btn { height: 64rpx; background: #333; border-radius: 32rpx; display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: #999; }

.crop-presets { padding: 0 30rpx; display: flex; flex-wrap: wrap; gap: 12rpx; }
.crop-preset-item { padding: 18rpx 28rpx; background: #2a2a2a; border-radius: 12rpx; border: 1px solid transparent; text-align: center; }
.crop-preset-item.selected { border-color: #007aff; background: #1a2a3a; }
.preset-name { font-size: 24rpx; color: #fff; display: block; }
.preset-ratio { font-size: 18rpx; color: #888; display: block; margin-top: 4rpx; }
.crop-confirm { padding: 24rpx 30rpx 20rpx; }
.crop-btn { height: 72rpx; background: #007aff; border-radius: 36rpx; display: flex; align-items: center; justify-content: center; font-size: 26rpx; color: #fff; font-weight: 600; }
/* 音频三轨：原音频开关 + 配音 */
.orig-toggle { display: flex; align-items: center; justify-content: space-between; margin-top: 8rpx; }
.orig-toggle-t { font-size: 22rpx; color: #888; }
.mini-switch { width: 76rpx; height: 40rpx; border-radius: 20rpx; background: #444; position: relative; transition: 0.2s; }
.mini-switch.on { background: #34c759; }
.mini-knob { width: 32rpx; height: 32rpx; border-radius: 50%; background: #fff; position: absolute; top: 4rpx; left: 4rpx; transition: 0.2s; }
.mini-switch.on .mini-knob { left: 40rpx; }
</style>
