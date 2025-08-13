import { defineStore } from 'pinia'
import { Howl } from 'howler'
import { useSongAPI } from '../api/index'

// 初始化API
const songAPI = useSongAPI()

/**
 * 音乐播放器状态管理模块
 * 负责管理音乐播放状态、播放列表、当前歌曲等
 */
export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: null,      // 当前播放的歌曲
    playlist: [],           // 播放列表
    isPlaying: false,       // 是否正在播放
    currentTime: 0,         // 当前播放时间
    duration: 0,            // 歌曲总时长
    volume: 0.7,            // 音量 (0-1)
    playMode: 'sequence',   // 播放模式: sequence(顺序播放), random(随机播放), loop(单曲循环)
    howler: null,           // Howler实例
    lyric: null,            // 当前歌词
    currentLyricIndex: -1,  // 当前歌词索引
    history: []             // 播放历史
  }),

  getters: {
    /**
     * 获取当前播放模式的中文名称
     * @returns {string} 播放模式中文名称
     */
    playModeText: (state) => {
      const modes = {
        sequence: '顺序播放',
        random: '随机播放',
        loop: '单曲循环'
      }
      return modes[state.playMode] || '顺序播放'
    },

    /**
     * 获取当前播放进度百分比
     * @returns {number} 播放进度百分比 (0-100)
     */
    progressPercent: (state) => {
      if (!state.duration) return 0
      return (state.currentTime / state.duration) * 100
    }
  },

  actions: {
    /**
     * 设置当前播放的歌曲
     * @param {Object} song - 歌曲对象
     */
    setCurrentSong(song) {
      this.currentSong = song
      this.loadSong(song)

      // 添加到播放历史
      this.addToHistory(song)
    },

    /**
     * 设置播放列表并播放指定歌曲
     * @param {Array} playlist - 播放列表
     * @param {number} index - 开始播放的歌曲索引，默认为0
     */
    setPlaylist(playlist, index = 0) {
      this.playlist = playlist
      if (playlist.length > 0) {
        this.playSong(index)
      }
    },

    /**
     * 播放指定索引的歌曲
     * @param {number} index - 歌曲索引
     */
    playSong(index) {
      if (index < 0 || index >= this.playlist.length) return

      const song = this.playlist[index]
      this.currentSong = song
      this.loadSong(song)

      // 添加到播放历史
      this.addToHistory(song)
    },

    /**
     * 加载并播放歌曲
     * @param {Object} song - 歌曲对象
     */
    async loadSong(song) {
      // 停止当前播放
      if (this.howler) {
        this.howler.stop()
        this.howler = null
      }

      try {
        // 获取歌曲URL
        const response = await songAPI.getSongUrl(song.id)
        const songUrl = response.data[0].url

        if (!songUrl) {
          console.error('Failed to get song URL')
          return
        }

        // 创建Howler实例
        this.howler = new Howl({
          src: [songUrl],
          volume: this.volume,
          onload: () => {
            this.duration = this.howler.duration()
            this.play()
          },
          onplay: () => {
            this.isPlaying = true
            this.updateProgress()
          },
          onpause: () => {
            this.isPlaying = false
          },
          onend: () => {
            this.handleEndOfSong()
          },
          ontimeupdate: () => {
            if (this.howler) {
              this.currentTime = this.howler.seek()
              this.updateLyricIndex()
            }
          }
        })

        // 加载歌词
        await this.loadLyric(song.id)
      } catch (error) {
        console.error('Failed to load song:', error)
      }
    },

    /**
     * 加载歌词
     * @param {number} songId - 歌曲ID
     */
    async loadLyric(songId) {
      try {
        const response = await musicAPI.getLyric(songId)
        this.lyric = response.data.lrc?.lyric || ''
        this.currentLyricIndex = -1
      } catch (error) {
        console.error('Failed to load lyric:', error)
        this.lyric = null
      }
    },

    /**
     * 更新歌词索引
     */
    updateLyricIndex() {
      if (!this.lyric) return

      const lines = this.lyric.split('\n')
      const timeRegex = /\[([\d:.]+)\]/

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]
        const match = line.match(timeRegex)

        if (match) {
          const timeStr = match[1]
          const [minutes, seconds] = timeStr.split(':')
          const time = parseInt(minutes) * 60 + parseFloat(seconds)

          if (this.currentTime >= time) {
            if (i !== this.currentLyricIndex) {
              this.currentLyricIndex = i
            }
            break
          }
        }
      }
    },

    /**
     * 播放/暂停切换
     */
    togglePlay() {
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },

    /**
     * 播放
     */
    play() {
      if (this.howler) {
        this.howler.play()
        this.isPlaying = true
      }
    },

    /**
     * 暂停
     */
    pause() {
      if (this.howler) {
        this.howler.pause()
        this.isPlaying = false
      }
    },

    /**
     * 上一首
     */
    prevSong() {
      if (this.playlist.length === 0) return

      let index = this.playlist.findIndex(song => song.id === this.currentSong.id)
      index = (index - 1 + this.playlist.length) % this.playlist.length
      this.playSong(index)
    },

    /**
     * 下一首
     */
    nextSong() {
      if (this.playlist.length === 0) return

      if (this.playMode === 'random') {
        // 随机播放模式
        const randomIndex = Math.floor(Math.random() * this.playlist.length)
        this.playSong(randomIndex)
      } else {
        // 顺序播放或单曲循环模式
        let index = this.playlist.findIndex(song => song.id === this.currentSong.id)
        index = (index + 1) % this.playlist.length
        this.playSong(index)
      }
    },

    /**
     * 处理歌曲播放结束
     */
    handleEndOfSong() {
      if (this.playMode === 'loop') {
        // 单曲循环
        this.howler.seek(0)
        this.play()
      } else {
        // 顺序播放或随机播放
        this.nextSong()
      }
    },

    /**
     * 设置播放进度
     * @param {number} percent - 进度百分比 (0-100)
     */
    setProgress(percent) {
      if (this.howler && this.duration) {
        const seekTime = (percent / 100) * this.duration
        this.howler.seek(seekTime)
        this.currentTime = seekTime
      }
    },

    /**
     * 设置音量
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(volume) {
      this.volume = volume
      if (this.howler) {
        this.howler.volume(volume)
      }
    },

    /**
     * 切换播放模式
     */
    togglePlayMode() {
      const modes = ['sequence', 'random', 'loop']
      const currentIndex = modes.indexOf(this.playMode)
      const nextIndex = (currentIndex + 1) % modes.length
      this.playMode = modes[nextIndex]
    },

    /**
     * 添加歌曲到播放历史
     * @param {Object} song - 歌曲对象
     */
    addToHistory(song) {
      // 避免重复添加
      const exists = this.history.some(item => item.id === song.id)
      if (!exists) {
        this.history.unshift({...song})
        // 限制历史记录数量
        if (this.history.length > 100) {
          this.history.pop()
        }
      }
    },

    /**
     * 更新播放进度
     */
    updateProgress() {
      if (this.howler && this.isPlaying) {
        this.currentTime = this.howler.seek()
        requestAnimationFrame(() => this.updateProgress())
      }
    }
  }
})