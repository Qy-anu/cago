const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
	data: {
		isLoad: false,
		list: [],
		nowUserId: '',
		page: 1,
		canLoadMore: true
	},

	onLoad: async function (options) {
		ProjectBiz.initPage(this);
		await PassportBiz.loginMustBackWin(this);
		
		this.setData({
			nowUserId: PassportBiz.getUserId()
		});
		
		await this._loadList();
	},

	onShow: function () {
		if (this.data.isLoad) {
			this.setData({
				page: 1,
				canLoadMore: true
			});
			this._loadList();
		}
	},

	_loadList: async function () {
		let params = {
			page: this.data.page,
			size: 20,
		};
		let opt = {
			title: 'bar'
		};
		let result = await cloudHelper.callCloudData('chat/session_list', params, opt);
		
		if (!result) return;
		
		let newList = result.list || [];
		
		let list = (this.data.page === 1) ? newList : this.data.list.concat(newList);
		
		this.setData({
			list,
			isLoad: true,
			canLoadMore: (newList.length >= 20)
		});
	},

	onReachBottom: async function () {
		if (!this.data.canLoadMore) return;
		
		this.setData({
			page: this.data.page + 1
		});
		
		await this._loadList();
	},

	onPullDownRefresh: async function () {
		this.setData({
			page: 1,
			canLoadMore: true
		});
		
		await this._loadList();
		wx.stopPullDownRefresh();
	},

	url: function (e) {
		let sessionId = pageHelper.dataset(e, 'id');
		let targetUserId = pageHelper.dataset(e, 'target');
		let targetUserName = pageHelper.dataset(e, 'name');
		if (!sessionId) return pageHelper.showModal('会话信息异常，请稍后重试');
		if (!targetUserId) return pageHelper.showModal('聊天对象信息异常，请稍后重试');
		
		wx.navigateTo({
			url: `/projects/campus/pages/chat/detail/chat_detail?sessionId=${sessionId}&targetUserId=${targetUserId}&targetUserName=${targetUserName}`
		});
	}

})
