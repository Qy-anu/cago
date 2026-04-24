const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
	data: {
		isLoad: false,
		sessionId: '',
		targetUserId: '',
		targetUserName: '',
		sourceType: '',
		sourceId: '',
		sourceTitle: '',
		list: [],
		content: '',
		nowUserId: '',
		isSending: false,
		page: 1,
		canLoadMore: true
	},

	onLoad: async function (options) {
		ProjectBiz.initPage(this);
		await PassportBiz.loginMustBackWin(this);

		let sessionId = options.sessionId || '';
		let targetUserId = options.targetUserId || '';
		let targetUserName = decodeURIComponent(options.targetUserName || '');
		if (!sessionId) return pageHelper.showModal('会话参数缺失，请返回重试');
		if (!targetUserId) return pageHelper.showModal('聊天对象参数缺失，请返回重试');

		this.setData({
			nowUserId: PassportBiz.getUserId(),
			sessionId,
			targetUserId,
			targetUserName
		});

		wx.setNavigationBarTitle({
			title: targetUserName || '聊天'
		});

		await this._loadList();
	},

	_loadList: async function () {
		let params = {
			sessionId: this.data.sessionId,
			page: this.data.page,
			size: 30,
		};
		let opt = {
			title: 'bar'
		};
		let result = await cloudHelper.callCloudData('chat/message_list', params, opt).catch(() => null);

		if (!result) {
			this.setData({
				isLoad: true,
				list: this.data.page === 1 ? [] : this.data.list,
				canLoadMore: false
			});
			return;
		}

		let newList = result.list || [];
		newList.reverse();

		let list = (this.data.page === 1) ? newList : newList.concat(this.data.list);

		// 如果是第一页，获取会话详情以提取来源信息
		if (this.data.page === 1 && result.sessionInfo) {
			this.setData({
				sourceType: result.sessionInfo.CHAT_SESSION_SOURCE_TYPE || '',
				sourceId: result.sessionInfo.CHAT_SESSION_SOURCE_ID || '',
				sourceTitle: result.sessionInfo.CHAT_SESSION_SOURCE_TITLE || ''
			});
		}

		this.setData({
			list,
			isLoad: true,
			canLoadMore: (newList.length >= 30)
		});

		this._scrollToBottom();
	},

	_scrollToBottom: function () {
		setTimeout(() => {
			wx.createSelectorQuery()
				.select('#scroll-area')
				.boundingClientRect()
				.exec((res) => {
					if (res[0]) {
						wx.pageScrollTo({
							scrollTop: 99999,
							duration: 100
						});
					}
				});
		}, 100);
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

	bindContentInput: function (e) {
		this.setData({
			content: e.detail.value
		});
	},

	bindViewSourceTap: function () {
		if (!this.data.sourceType || !this.data.sourceId) return;

		let url = '';
		switch (this.data.sourceType) {
			case 'job':
				url = '/projects/campus/pages/job/detail/job_detail?id=' + this.data.sourceId;
				break;
			case 'lost':
				url = '/projects/campus/pages/lost/detail/lost_detail?id=' + this.data.sourceId;
				break;
			case 'leave':
				url = '/projects/campus/pages/leave/detail/leave_detail?id=' + this.data.sourceId;
				break;
			case 'board':
				url = '/projects/campus/pages/board/detail/board_detail?id=' + this.data.sourceId;
				break;
			default:
				return;
		}
		wx.navigateTo({ url });
	},

	bindChooseImage: function () {
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				this._uploadImage(res.tempFilePaths[0]);
			}
		});
	},

	_uploadImage: async function (tempFilePath) {
		if (this.data.isSending) return;
		
		this.setData({
			isSending: true
		});
		
		try {
			let uploadResult = await cloudHelper.callCloudUpload('chat/image', tempFilePath);
			if (!uploadResult || !uploadResult.fileID) {
				throw new Error('图片上传失败');
			}
			
			await this._sendMessage('image', uploadResult.fileID);
		} catch (err) {
			console.error(err);
			pageHelper.showModal('发送失败，请重试');
		} finally {
			this.setData({
				isSending: false
			});
		}
	},

	bindSend: async function () {
		let content = this.data.content.trim();
		if (!content) return;
		
		await this._sendMessage('text', content);
	},

	_sendMessage: async function (type, content) {
		if (this.data.isSending) return;
		
		this.setData({
			isSending: true
		});
		
		try {
			let res = await cloudHelper.callCloudSumbit('chat/send', {
				targetUserId: this.data.targetUserId,
				content: content,
				type: type,
				sourceType: this.data.sourceType,
				sourceId: this.data.sourceId,
				sourceTitle: this.data.sourceTitle
			});
			
			let newMsg = {
				_id: res.data.id,
				CHAT_SESSION_ID: this.data.sessionId,
				CHAT_FROM_USER_ID: this.data.nowUserId,
				CHAT_TO_USER_ID: this.data.targetUserId,
				CHAT_TYPE: type,
				CHAT_CONTENT: content,
				CHAT_READ: 0,
				CHAT_ADD_TIME: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
				isMy: true
			};
			
			let list = this.data.list || [];
			list.push(newMsg);
			
			this.setData({
				content: type === 'text' ? '' : this.data.content,
				list
			});
			
			this._scrollToBottom();
		} catch (err) {
			console.error(err);
			pageHelper.showModal('发送失败，请重试');
		} finally {
			this.setData({
				isSending: false
			});
		}
	}

})