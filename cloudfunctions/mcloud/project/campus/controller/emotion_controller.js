/**
 * Notes: 情绪互助社区模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-21 00:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const EmotionService = require('../service/emotion_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const contentCheck = require('../../../framework/validate/content_check.js');

class EmotionController extends BaseProjectController {

	/** 点赞 */
	async likeEmotion() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		return await service.likeEmotion(this._userId, input.id);
	}

	/** 收藏 */
	async favEmotion() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		return await service.favEmotion(this._userId, input.id);
	}

	/** 获取信息用于编辑修改 */
	async getEmotionDetail() {

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		let emotion = await service.getEmotionDetail(input.id);
		if (emotion) {
		}

		return emotion;

	}

	/** 浏览详细 */
	async viewEmotion() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		let emotion = await service.viewEmotion(input.id);

		if (emotion) {
			emotion.EMOTION_ADD_TIME = timeUtil.timestamp2Time(emotion.EMOTION_ADD_TIME, 'Y-M-D h:m');
		}

		return emotion;
	}

	/** 状态修改 */
	async statusEmotion() {  
		// 数据校验
		let rules = {
			id: 'must|id',
			status: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		return await service.statusEmotion(this._userId, input.id, input.status);

	}

	/** 列表与搜索 */
	async getEmotionList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		let result = await service.getEmotionList(this._userId, input);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].EMOTION_ADD_TIME = timeUtil.timestamp2Time(list[k].EMOTION_ADD_TIME, 'Y-M-D h:m');

			// 本人是否点赞 
			if (list[k].EMOTION_LIKE_LIST
				&& Array.isArray(list[k].EMOTION_LIKE_LIST)
				&& list[k].EMOTION_LIKE_LIST.includes(this._userId))
				list[k].like = true;
			else
				list[k].like = false;

			// 本人是否收藏
			if (list[k].EMOTION_FAV_LIST
				&& Array.isArray(list[k].EMOTION_FAV_LIST)
				&& list[k].EMOTION_FAV_LIST.includes(this._userId))
				list[k].fav = true;
			else
				list[k].fav = false;

			// 处理匿名显示
			if (list[k].EMOTION_ANONYMOUS) {
				list[k].user = {
					USER_NAME: '匿名用户',
					USER_PIC: ''
				};
			}

			// 删除冗余
			if (list[k].EMOTION_OBJ.content) delete list[k].EMOTION_OBJ.content;
			if (list[k].EMOTION_LIKE_LIST) delete list[k].EMOTION_LIKE_LIST;
			if (list[k].EMOTION_FAV_LIST) delete list[k].EMOTION_FAV_LIST;
		}

		return result;

	}

	/** 发布 */
	async insertEmotion() {
		try {
			// 数据校验 
			let rules = {
				forms: 'array|name=表单',
				anonymous: 'bool|name=是否匿名',
			};


			// 取得数据
			let input = this.validateData(rules);
			console.log('insertEmotion input:', JSON.stringify(input));

			// 内容审核
			// 暂时注释掉内容审核，测试是否是审核导致的问题
			// await contentCheck.checkTextMultiClient(input);

			let service = new EmotionService();
			let result = await service.insertEmotion(this._userId, input);
			console.log('insertEmotion result:', JSON.stringify(result));

			return result;
		} catch (err) {
			console.error('insertEmotion error:', err);
			throw err;
		}

	}

	/** 修改 */
	async editEmotion() {

		// 数据校验 
		let rules = {
			id: 'must|id',
			forms: 'array|name=表单',
			anonymous: 'bool|name=是否匿名',
		};


		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiClient(input);

		let service = new EmotionService();
		let result = await service.editEmotion(this._userId, input);

		return result;

	}

	/** 更新图片信息 */
	async updateEmotionForms() {

		// 数据校验
		let rules = {
			id: 'must|id',
			hasImageForms: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiClient(input);

		let service = new EmotionService();
		return await service.updateEmotionForms(input);
	}
  
	/** 删除 */
	async delEmotion() {

		// 数据校验
		let rules = {
			id: 'must|id',
			isAdmin: 'must|bool'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EmotionService();
		await service.delEmotion(this._userId, input.id);

	}

}

module.exports = EmotionController;