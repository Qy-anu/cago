const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		commentList: [],
		commentContent: '',
		commentFocus: false,
		isCommentSubmitting: false,
		isLogin: false,
		nowUserId: '',
		commentImages: [],
		focusCommentOnLoad: false,
		defaultAvatarText: '用户',
		lostAvatarText: '用',
		lostPicList: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		this._cloudUrlCache = {};
		ProjectBiz.initPage(this);

		if (!pageHelper.getOptions(this, options)) return;

		this.setData({
			focusCommentOnLoad: options && options.focusComment == '1'
		});

		await PassportBiz.loginSilence(this);
		await this._loadDetail();
		await this._loadComments();

		if (this.data.focusCommentOnLoad) {
			setTimeout(() => {
				this.setData({
					commentFocus: true
				});
			}, 200);
		}
	},

	async _getCloudImageUrl(fileId) {
		if (!fileId || typeof fileId !== 'string') return fileId || '';
		if (!fileId.startsWith('cloud://')) return fileId;
		if (this._cloudUrlCache[fileId]) return this._cloudUrlCache[fileId];

		let tempUrl = await cloudHelper.getTempFileURLOne(fileId).catch(() => '');
		this._cloudUrlCache[fileId] = tempUrl || fileId;
		return this._cloudUrlCache[fileId];
	},

	async _normalizeLostDetail(lost) {
		if (!lost) return lost;

		let newLost = {
			...lost,
			LOST_OBJ: lost.LOST_OBJ ? { ...lost.LOST_OBJ } : {},
			user: lost.user ? { ...lost.user } : {}
		};

		let lostPicList = [];
		if (newLost.LOST_FORMS && Array.isArray(newLost.LOST_FORMS)) {
			for (let form of newLost.LOST_FORMS) {
				if (form.type === 'image' && form.val && Array.isArray(form.val)) {
					form.val = await Promise.all(form.val.map(pic => this._getCloudImageUrl(pic)));
					lostPicList = lostPicList.concat(form.val);
				}
			}
		}

		newLost.user.USER_PIC = await this._getCloudImageUrl(newLost.user.USER_PIC || '');
		newLost.user.USER_NAME = newLost.user.USER_NAME || this.data.defaultAvatarText;
		newLost.avatarText = (newLost.user.USER_NAME || this.data.defaultAvatarText).charAt(0) || '用';
		return { newLost, lostPicList };
	},

	async _normalizeCommentList(commentList = []) {
		return await Promise.all(commentList.map(async item => {
			let newItem = {
				...item,
				COMMENT_OBJ: item.COMMENT_OBJ ? { ...item.COMMENT_OBJ } : {},
				user: item.user ? { ...item.user } : {}
			};

			let imgList = Array.isArray(newItem.COMMENT_OBJ.img) ? newItem.COMMENT_OBJ.img : [];
			if (imgList.length) {
				newItem.COMMENT_OBJ.img = await Promise.all(imgList.map(img => this._getCloudImageUrl(img)));
			} else {
				newItem.COMMENT_OBJ.img = [];
			}

			newItem.user.USER_PIC = await this._getCloudImageUrl(newItem.user.USER_PIC || '');
			newItem.user.USER_NAME = newItem.user.USER_NAME || this.data.defaultAvatarText;
			newItem.avatarText = (newItem.user.USER_NAME || this.data.defaultAvatarText).charAt(0) || '用';
			return newItem;
		}));
	},

	_loadDetail: async function () {
		let id = this.data.id;
		if (!id) return;

		let params = {
			id,
		};
		let opt = {
			title: 'bar'
		};
		let lost = await cloudHelper.callCloudData('lost/view', params, opt);
		if (!lost) {
			this.setData({
				isLoad: null
			})
			return;
		}

		let normalizedResult = await this._normalizeLostDetail(lost);
		if (!normalizedResult || !normalizedResult.newLost) {
			this.setData({
				isLoad: null
			});
			return;
		}
		let { newLost, lostPicList } = normalizedResult;

		this.setData({
			isLoad: true,
			lost: newLost,
			lostAvatarText: newLost.avatarText || '用',
			lostPicList: lostPicList || [],
		});

	},

	_loadComments: async function () {
		let id = this.data.id;
		if (!id) return;

		let params = {
			oid: id,
			page: 1,
			size: 50,
			isTotal: true,
		};
		let opt = {
			title: 'bar'
		};
		let result = await cloudHelper.callCloud('comment/list', params, opt).catch(() => null);
		if (!result || !result.data) return;

		this.setData({
			commentList: await this._normalizeCommentList(result.data.list || []),
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.setData({
			nowUserId: PassportBiz.getUserId(),
			isLogin: PassportBiz.isLogin()
		});

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		await this._loadComments();
		wx.stopPullDownRefresh();
	},

	bindCommentInput: function (e) {
		this.setData({
			commentContent: e.detail.value
		});
	},

	bindCommentFocus: async function () {
		if (!await PassportBiz.loginMustCancelWin(this)) return;
		this.setData({
			commentFocus: true
		});
		wx.pageScrollTo({
			scrollTop: 999999,
			duration: 200
		});
	},

	bindChooseCommentImage: async function () {
		if (!await PassportBiz.loginMustCancelWin(this)) return;
		let maxCount = 8 - this.data.commentImages.length;
		if (maxCount <= 0) return pageHelper.showModal('最多上传8张图片');

		wx.chooseMedia({
			count: maxCount,
			mediaType: ['image'],
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				let tempFiles = (res.tempFiles || []).map(item => item.tempFilePath);
				this.setData({
					commentImages: this.data.commentImages.concat(tempFiles),
					commentFocus: false
				});
			}
		});
	},

	bindRemoveCommentImage: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let commentImages = this.data.commentImages;
		commentImages.splice(idx, 1);
		this.setData({ commentImages });
	},

	bindCommentSubmit: async function () {
		if (!await PassportBiz.loginMustCancelWin(this)) return;
		if (this.data.isCommentSubmitting) return;

		let content = (this.data.commentContent || '').trim();
		let images = this.data.commentImages || [];
		if (!content && !images.length) return pageHelper.showModal('评论内容和图片不能都为空');

		let forms = [];
		if (content) {
			forms.push({
				mark: 'content',
				title: '评论内容',
				type: 'textarea',
				val: content
			});
		}
		if (images.length) {
			forms.push({
				mark: 'img',
				title: '图片',
				type: 'image',
				val: images
			});
		}

		this.setData({
			isCommentSubmitting: true
		});

		try {
			let result = await cloudHelper.callCloudSumbit('comment/insert', {
				oid: this.data.id,
				type: 'lost',
				forms
			});
			let commentId = result.data.id;
			await cloudHelper.transFormsTempPics(forms, 'comment/', commentId, 'comment/update_forms');

			this.setData({
				commentContent: '',
				commentImages: [],
				commentFocus: false
			});

			await this._loadDetail();
			await this._loadComments();
			pageHelper.showSuccToast('评论成功');
		} catch (err) {
			console.log(err);
		} finally {
			this.setData({
				isCommentSubmitting: false
			});
		}
	},

	bindCommentLikeTap: async function (e) {
		if (!await PassportBiz.loginMustCancelWin(this)) return;
		let id = pageHelper.dataset(e, 'id');
		let idx = pageHelper.dataset(e, 'idx');
		let commentList = this.data.commentList;

		try {
			let res = await cloudHelper.callCloudSumbit('comment/like', { id }, { title: '处理中' });
			commentList[idx].like = res.data === true;
			commentList[idx].COMMENT_LIKE_CNT += res.data === true ? 1 : -1;
			if (commentList[idx].COMMENT_LIKE_CNT < 0) commentList[idx].COMMENT_LIKE_CNT = 0;
			this.setData({ commentList });
		} catch (err) {
			console.log(err);
		}
	},

	bindCommentDelTap: async function (e) {
		let id = pageHelper.dataset(e, 'id');
		let cb = async () => {
			try {
				await cloudHelper.callCloudSumbit('comment/del', {
					id,
					type: 'lost',
					isAdmin: false
				}, { title: '删除中' });
				await this._loadDetail();
				await this._loadComments();
				pageHelper.showSuccToast('删除成功');
			} catch (err) {
				console.log(err);
			}
		};
		pageHelper.showConfirm('确认删除这条评论？', cb);
	},

	bindChatTap: async function (e) {
		if (!await PassportBiz.loginMustCancelWin(this)) return;

		let userId = pageHelper.dataset(e, 'userId');
		let userName = pageHelper.dataset(e, 'userName');
		let sourceType = pageHelper.dataset(e, 'sourceType');
		let sourceId = pageHelper.dataset(e, 'sourceId');
		let sourceTitle = pageHelper.dataset(e, 'sourceTitle');
		if (!userId) return pageHelper.showModal('未获取到对方用户信息，请刷新后重试');

		try {
			let res = await cloudHelper.callCloudSumbit('chat/get_session', {
				targetUserId: userId,
				sourceType: sourceType,
				sourceId: sourceId,
				sourceTitle: sourceTitle
			});
			let sessionId = (res && res.data && (res.data.CHAT_SESSION_ID || res.data._id)) || '';
			if (!sessionId) return pageHelper.showModal('未获取到会话信息，请稍后重试');

			wx.navigateTo({
				url: '/projects/campus/pages/chat/detail/chat_detail?sessionId=' + sessionId + '&targetUserId=' + userId + '&targetUserName=' + encodeURIComponent(userName || '用户')
			});
		} catch (err) {
			console.log(err);
		}
	},

	bindFavTap: async function () {
		if (!await PassportBiz.loginMustCancelWin(this)) return;
		
		try {
			let oldFav = this.data.lost.fav;
			let res = await cloudHelper.callCloudSumbit('fav/update', { oid: this.data.id, type: 'lost' });
			let lost = this.data.lost;
			
			// 直接切换本地状态，确保和用户操作一致
			lost.fav = !oldFav;
			if (!oldFav) {
				lost.LOST_FAV_CNT++;
				pageHelper.showSuccToast('收藏成功');
			} else {
				lost.LOST_FAV_CNT--;
				if (lost.LOST_FAV_CNT < 0) lost.LOST_FAV_CNT = 0;
				pageHelper.showSuccToast('取消收藏');
			}
			
			this.setData({ lost });
		} catch (err) {
			console.log(err);
		}
	},

	bindShareTap: function () {
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage']
		});
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	url: function (e) {
		pageHelper.url(e, this);
	},

	onPageScroll: function (e) {
		// 回页首按钮
		pageHelper.showTopBtn(e, this);

	},

	bindLikeTap: async function (e) {
		if (!await PassportBiz.loginMustBackWin(this)) return;

		let id = this.data.id;
		let lost = this.data.lost;

		try {

			let params = {
				id
			}
			let options = {
				title: lost.like ? '点赞取消中' : '点赞中'
			}
			await cloudHelper.callCloudSumbit('lost/like', params, options).then(res => {
				if (res.data === true) {
					lost.like = true;
					lost.LOST_LIKE_CNT++;
					this.setData({ lost });
					pageHelper.showSuccToast('点赞成功');
				}
				else {
					lost.like = false;
					lost.LOST_LIKE_CNT--;
					if (lost.LOST_LIKE_CNT < 0) lost.LOST_LIKE_CNT = 0;
					this.setData({ lost });
					pageHelper.showSuccToast('已取消');
				}

			});
		}
		catch (err) {
			console.error(err);
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function (res) {
		return {
			title: this.data.lost.LOST_TITLE,
			imageUrl: this.data.lost.LOST_PIC[0]
		}
	}
})