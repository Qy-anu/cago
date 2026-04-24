/**
 * Notes: 情绪互助社区业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-21 00:00:00 
 */

const ProjectSetting = require('../public/project_setting.js');

class EmotionBiz {

	/**
	 * 初始化表单数据
	 */
	static initFormData() {
		console.log('EMOTION_FIELDS:', ProjectSetting.EMOTION_FIELDS);
		return {
			fields: ProjectSetting.EMOTION_FIELDS || [],
			formForms: [],
			anonymous: false
		};
	}

	/**
	 * 表单校验
	 */
	static CHECK_FORM = {
	};

}

module.exports = EmotionBiz;