let behavior = require('../../../biz/project_index_bh.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const JobBiz = require('../../../biz/job_biz.js');

Page({

	behaviors: [behavior],

	/**
	 * 页面的初始数据
	 */
	data: {
		type: 'job'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this._cloudUrlCache = {};
		this._onLoad(options);
	},

	async _getCloudImageUrl(fileId) {
		if (!fileId || typeof fileId !== 'string') return fileId || '';
		if (fileId.startsWith('http://') || fileId.startsWith('https://') || fileId.startsWith('/') || fileId.startsWith('wxfile://')) return fileId;
		if (!fileId.startsWith('cloud://') && fileId.startsWith('cloud')) fileId = 'cloud://' + fileId;
		if (this._cloudUrlCache[fileId]) return this._cloudUrlCache[fileId];

		let tempUrl = await cloudHelper.getTempFileURLOne(fileId).catch(() => '');
		this._cloudUrlCache[fileId] = tempUrl || fileId;
		return this._cloudUrlCache[fileId];
	},

	async _normalizeJobItem(item) {
		if (!item) return item;

		let newItem = {
			...item,
			JOB_OBJ: item.JOB_OBJ ? { ...item.JOB_OBJ } : {}
		};

		let picList = Array.isArray(newItem.JOB_OBJ.pic) ? newItem.JOB_OBJ.pic : [];
		if (picList.length) {
			newItem.JOB_OBJ.pic = await Promise.all(picList.map(pic => this._getCloudImageUrl(pic)));
		} else {
			newItem.JOB_OBJ.pic = [];
		}

		return newItem;
	},

	bindCommListCmpt: async function (e) {
		if (Object.prototype.hasOwnProperty.call(e.detail, 'search')) {
			this.setData({
				search: '',
				sortType: '',
			});
			return;
		}

		let dataList = e.detail.dataList;
		if (dataList && Array.isArray(dataList.list)) {
			dataList = {
				...dataList,
				list: await Promise.all(dataList.list.map(item => this._normalizeJobItem(item)))
			};
		}

		this.setData({ dataList });
		if (e.detail.sortType) {
			this.setData({
				sortType: e.detail.sortType,
			});
		}
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
		let itemList = ['设为进行中', '设为已结束'];
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

	bindDetailTap: function (e) {
		let id = pageHelper.dataset(e, 'id');
		let focusComment = pageHelper.dataset(e, 'focusComment') || '';
		let url = '../detail/job_detail?id=' + id;
		if (focusComment) url += '&focusComment=1';
		wx.navigateTo({ url });
	},

	_getSearchMenu: function () {

		let sortItem1 = [
			{ label: '分类', type: 'cateId', value: '' }
		];

		if (JobBiz.getCateList().length > 1)
			sortItem1 = sortItem1.concat(JobBiz.getCateList());

		let sortMenus = [{ label: '全部', type: 'all', value: '' }];



		sortMenus = sortMenus.concat([
			{ label: '进行中', type: 'status', value: '1' },
			{ label: '已结束', type: 'status', value: '0' },
			{ label: '最早ˇ', type: 'sort', value: 'JOB_ADD_TIME|asc' },
			{ label: '点赞数ˇ', type: 'like', value: '' },
			{ label: '评论数ˇ', type: 'comment', value: '' },
			{ label: '收藏数ˇ', type: 'fav', value: '' },
		]);



		this.setData({
			isLoad: true,
			sortItems: [sortItem1],
			sortMenus
		})

	},
})
