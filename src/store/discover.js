import { defineStore } from 'pinia';
import { songAPI } from '@/api';

/**
 * 发现音乐模块的Store
 * 包含推荐歌单、排行榜、歌手列表等功能
 */
export const useDiscoverStore = defineStore('discover', {
  state: () => ({
    // 推荐歌单
    playlists: [],
    // 排行榜数据
    rankings: [],
    // 歌手列表
    artists: [],
    // 最新音乐
    newMusics: [],
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  }),

  getters: {
    // 获取热门歌单
    hotPlaylists: (state) => state.playlists.filter(playlist => playlist.playCount > 1000000),
    // 获取前三名的排行榜
    topThreeRankings: (state) => state.rankings.slice(0, 3),
    // 获取其余排行榜
    otherRankings: (state) => state.rankings.slice(3)
  },

  actions: {
    /**
     * 获取推荐歌单
     * @param {number} limit - 获取数量
     * @param {string} category - 歌单分类
     */
    async fetchPlaylists(limit = 30, category = '全部') {
      this.loading = true;
      try {
        const res = await songAPI.getPlaylists({ limit, category });
        this.playlists = res.data;
        this.error = null;
      } catch (err) {
        this.error = `获取推荐歌单失败: ${err.message}`;
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取排行榜数据
     */
    async fetchRankings() {
      this.loading = true;
      try {
        const res = await songAPI.getRankings();
        this.rankings = res.data;
        this.error = null;
      } catch (err) {
        this.error = `获取排行榜失败: ${err.message}`;
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取歌手列表
     * @param {number} limit - 获取数量
     * @param {string} area - 地区
     * @param {string} type - 类型
     */
    async fetchArtists(limit = 30, area = '全部', type = '全部') {
      this.loading = true;
      try {
        const res = await songAPI.getArtists({ limit, area, type });
        this.artists = res.data;
        this.error = null;
      } catch (err) {
        this.error = `获取歌手列表失败: ${err.message}`;
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取最新音乐
     * @param {number} limit - 获取数量
     */
    async fetchNewMusics(limit = 30) {
      this.loading = true;
      try {
        const res = await songAPI.getNewMusics({ limit });
        this.newMusics = res.data;
        this.error = null;
      } catch (err) {
        this.error = `获取最新音乐失败: ${err.message}`;
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    }
  }
});