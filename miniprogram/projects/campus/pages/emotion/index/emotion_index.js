let behavior = require('../../../biz/project_index_bh.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const EmotionBiz = require('../../../biz/emotion_biz.js');

Page({

	behaviors: [behavior],

	/**
	 * 页面的初始数据
	 */
	data: {
		type: 'emotion'
	},

	bindDetailTap: function (e) {
		let id = pageHelper.dataset(e, 'id');
		let focusComment = pageHelper.dataset(e, 'focusComment') || '';
		let url = '../detail/emotion_detail?id=' + id;
		if (focusComment) url += '&focusComment=1';
		wx.navigateTo({ url });
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this._onLoad(options);
	},

	bindMyTap: function (e) {
		let itemList = ['我的发布', '我的点赞', '我的收藏']; 
		wx.showActionSheet({
			itemList,
			success: async res => {
				switch (res.tapIndex) {
					case 0: {
						this._setMy(this, '我的发布');
						break;
					}
					case 1: {
						this._setMy(this, '我的点赞');
						break;
					}
					case 2: {
						this._setMy(this, '我的收藏');
						break;
					}
				}
			},
			fail: function (err) { }
		})
	},

	bindStatusTap: function (e) {
		let itemList = ['正常展示', '仅自己可见'];
		let id = pageHelper.dataset(e, 'id');
		wx.showActionSheet({
			itemList,
			success: async res => {
				switch (res.tapIndex) {
					case 0: { //启用 
						await this._setStatus(id, 1);
						break;
					}
					case 1: { //不展示 
						await this._setStatus(id, 0);
						break;
					}
				}
			},
			fail: function (err) { }
		})
	},



	bindPostTap: function (e) {
		wx.navigateTo({
			url: '../add/emotion_add'
		});
	},

	_getSearchMenu: function () {

		let sortMenus = [{
			label: '全部',
			type: 'all',
			value: ''
		}, {
			label: '今日',
			type: 'today',
			value: ''
		}, {
			label: '昨日',
			type: 'yesterday',
			value: ''
		}, {
			label: '最早ˇ',
			type: 'sort',
			value: 'EMOTION_ADD_TIME|asc'
		}, {
			label: '点赞数ˇ',
			type: 'like',
			value: ''
		}, {
			label: '评论数ˇ',
			type: 'comment',
			value: ''
		}, {
			label: '收藏数ˇ',
			type: 'fav',
			value: ''
		}];

		this.setData({
			isLoad: true,
			sortItems: [],
			sortMenus
		})

	},
})