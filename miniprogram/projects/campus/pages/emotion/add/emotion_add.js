const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const EmotionBiz = require('../../../biz/emotion_biz.js');
const validate = require('../../../../../helper/validate.js');
const PublicBiz = require('../../../../../comm/biz/public_biz.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const ProjectSetting = require('../../../public/project_setting.js');
const cacheHelper = require('../../../../../helper/cache_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		anonymous: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (!await PassportBiz.loginMustBackWin(this)) return;

		// 清除表单缓存，避免旧的分类字段影响
		cacheHelper.remove('FORM_SHOW_CMPT_cmpt-form');

		let formData = EmotionBiz.initFormData();
		console.log('formData:', formData);
		this.setData(formData);
		this.setData({
			isLoad: true
		});
		console.log('this.data.fields:', this.data.fields);
	},


	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () { },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () { },

	onPullDownRefresh: async function () { 
        wx.stopPullDownRefresh();
    },

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindAnonymousChange: function (e) {
		this.setData({
			anonymous: e.detail.value
		});
	},

	bindFormSubmit: async function () {
		if (!await PassportBiz.loginMustCancelWin(this)) return;

		let data = this.data;
		console.log('bindFormSubmit data:', data);
		
		data = validate.check(data, EmotionBiz.CHECK_FORM, this);
		if (!data) return; 
		console.log('bindFormSubmit data after validate:', data);

		let formComponent = this.selectComponent("#cmpt-form");
		console.log('bindFormSubmit formComponent:', formComponent);
		
		if (!formComponent) {
			wx.showModal({
				title: '发布失败',
				content: '表单组件未找到',
				showCancel: false
			});
			return;
		}
		
		let forms = formComponent.getForms(true);
		console.log('bindFormSubmit forms:', forms);
		
		if (!forms) return;
		data.forms = forms; 
		console.log('bindFormSubmit data with forms:', data);

		try {

			// 创建
			console.log('bindFormSubmit calling cloud function...');
			let result = await cloudHelper.callCloudSumbit('emotion/insert', data);
			console.log('bindFormSubmit cloud function result:', result);
			let emotionId = result.data.id;

			// 图片
			console.log('bindFormSubmit uploading images...');
			await cloudHelper.transFormsTempPics(forms, 'emotion/', emotionId, 'emotion/update_forms');

			let callback = async function () {
				PublicBiz.removeCacheList('admin-emotion-list');
				PublicBiz.removeCacheList('emotion-list');
				wx.navigateBack();

			}
			pageHelper.showSuccToast('发表成功', 2000, callback);

		} catch (err) {
			console.log('发布错误详情:', err);
			let errorMsg = '请打开控制台查看具体错误';
			if (err && err.msg) {
				errorMsg = err.msg;
			} else if (err && err.message) {
				errorMsg = err.message;
			} else if (err && err.errMsg) {
				errorMsg = err.errMsg;
			} else if (typeof err === 'string') {
				errorMsg = err;
			}
			wx.showModal({
				title: '发布失败',
				content: errorMsg,
				showCancel: false
			});
		}
	},


})