/**
 * Notes: 情绪互助社区模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-21 00:00:00 
 */

const BaseProjectService = require('./base_project_service.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const util = require('../../../framework/utils/util.js');
const cloudUtil = require('../../../framework/cloud/cloud_util.js');
const EmotionModel = require('../model/emotion_model.js');
const UserModel = require('../model/user_model.js');

class EmotionService extends BaseProjectService {

	/** 点赞 */
	async likeEmotion(userId, id) {
		let emotion = await EmotionModel.getOne(id);
		if (!emotion) return { success: false, msg: '情绪不存在' };

		let likeList = emotion.EMOTION_LIKE_LIST || [];
		let index = likeList.indexOf(userId);

		if (index > -1) {
			// 取消点赞
			likeList.splice(index, 1);
			await EmotionModel.edit(id, {
				EMOTION_LIKE_LIST: likeList,
				EMOTION_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: false, likeCnt: likeList.length };
		} else {
			// 点赞
			likeList.push(userId);
			await EmotionModel.edit(id, {
				EMOTION_LIKE_LIST: likeList,
				EMOTION_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: true, likeCnt: likeList.length };
		}
	}

	/** 收藏 */
	async favEmotion(userId, id) {
		let emotion = await EmotionModel.getOne(id);
		if (!emotion) return { success: false, msg: '情绪不存在' };

		let favList = emotion.EMOTION_FAV_LIST || [];
		let index = favList.indexOf(userId);

		if (index > -1) {
			// 取消收藏
			favList.splice(index, 1);
			await EmotionModel.edit(id, {
				EMOTION_FAV_LIST: favList,
				EMOTION_FAV_CNT: favList.length
			});
			return { success: true, isFav: false, favCnt: favList.length };
		} else {
			// 收藏
			favList.push(userId);
			await EmotionModel.edit(id, {
				EMOTION_FAV_LIST: favList,
				EMOTION_FAV_CNT: favList.length
			});
			return { success: true, isFav: true, favCnt: favList.length };
		}
	}

	/** 浏览 */
	async viewEmotion(id) {
		let fields = '*';

		let where = {
			_id: id,
			EMOTION_STATUS: 1
		}
		let emotion = await EmotionModel.getOne(where, fields);
		if (!emotion) return null;

		EmotionModel.inc(id, 'EMOTION_VIEW_CNT', 1);

		return emotion;
	}

	/** 获取 */
	async getEmotionDetail(id) {
		return await EmotionModel.getOne(id);
	}

	/** 修改状态 */
	async statusEmotion(userId, id, status) {
		let data = {
			EMOTION_STATUS: Number(status)
		}
		let where = { 
			_id: id,
		}
		if (userId) where.EMOTION_USER_ID = userId; // for  admin

		return await EmotionModel.edit(where, data);

	}

	/** 删除 */
	async delEmotion(userId, id) {
		let where = { 
			_id: id,
			EMOTION_USER_ID: userId
		}
		return await EmotionModel.del(where);
	}

	/** 插入 */
	async insertEmotion(userId, {
		forms,
		anonymous = false
	}) {
		try {
			console.log('insertEmotion service start, userId:', userId);
			console.log('insertEmotion forms:', JSON.stringify(forms));
			console.log('insertEmotion anonymous:', anonymous);
			
			let formsArr = Array.isArray(forms) ? forms : [];
			console.log('insertEmotion formsArr:', JSON.stringify(formsArr));
			
			let emotionObj = dataUtil.dbForms2Obj(formsArr);
			console.log('insertEmotion emotionObj:', JSON.stringify(emotionObj));
			
			let data = {
				EMOTION_ORDER: 9999, // 默认排序号
				EMOTION_FORMS: formsArr,
				EMOTION_OBJ: emotionObj,
				EMOTION_USER_ID: userId,
				EMOTION_ANONYMOUS: anonymous,
				EMOTION_DAY: timeUtil.time('Y-M-D'),
				EMOTION_ADD_TIME: Date.now(),
				EMOTION_EDIT_TIME: Date.now()
			};
			console.log('insertEmotion data:', JSON.stringify(data));
			
			let id = await EmotionModel.insert(data);
			console.log('insertEmotion success, id:', id);
			
			return { id };
		} catch (err) {
			console.error('insertEmotion service error:', err);
			throw err;
		}
	}

	/** 修改 */
	async editEmotion(userId, {
		id,
		forms,
		anonymous
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let emotionObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			EMOTION_FORMS: formsArr,
			EMOTION_OBJ: emotionObj,
			EMOTION_EDIT_TIME: Date.now()
		};
		if (util.isDefined(anonymous)) {
			data.EMOTION_ANONYMOUS = anonymous;
		}
		let where = { 
			_id: id,
			EMOTION_USER_ID: userId
		};
		await EmotionModel.edit(where, data);
	}

	/** 更新forms信息 */
	async updateEmotionForms({
		id,
		hasImageForms
	}) {
		return await EmotionModel.editForms(id, 'EMOTION_FORMS', 'EMOTION_OBJ', hasImageForms);
	}

	/** 列表与搜索 */
	async getEmotionList(userId, {
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal }) {
		orderBy = orderBy || {
			'EMOTION_ORDER': 'asc',
			'EMOTION_ADD_TIME': 'desc'
		};
		let fields = 'EMOTION_ORDER,EMOTION_STATUS,EMOTION_ANONYMOUS,EMOTION_COMMENT_CNT,EMOTION_VIEW_CNT,EMOTION_FAV_CNT,EMOTION_FAV_LIST,EMOTION_LIKE_CNT,EMOTION_LIKE_LIST,EMOTION_ADD_TIME,EMOTION_USER_ID,EMOTION_OBJ,user.USER_NAME,user.USER_PIC';

		let where = {};
		where.and = {
			EMOTION_STATUS: 1,
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};


		if (util.isDefined(search) && search) {
			if (search == '我的发布') {
				where.and.EMOTION_USER_ID = userId;
				if (util.isDefined(where.and.EMOTION_STATUS)) delete where.and.EMOTION_STATUS;
			}
			else if (search == '我的点赞') {
				where.and.EMOTION_LIKE_LIST = userId;
			}
			else if (search == '我的收藏') {
				where.and.EMOTION_FAV_LIST = userId;
			}
			else {
				where.or = [
					{ 'EMOTION_OBJ.content': ['like', search] },
					{ 'EMOTION_OBJ.title': ['like', search] },
				];
			}

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status': {
					where.and.EMOTION_STATUS = Number(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'EMOTION_ADD_TIME');
					break;
				}
				case 'fav': {
					orderBy = {
						'EMOTION_FAV_CNT': 'desc',
						'EMOTION_ADD_TIME': 'desc'
					}
					break;
				}
				case 'comment': {
					orderBy = {
						'EMOTION_COMMENT_CNT': 'desc',
						'EMOTION_ADD_TIME': 'desc'
					}
					break;
				}
				case 'like': {
					orderBy = {
						'EMOTION_LIKE_CNT': 'desc',
						'EMOTION_ADD_TIME': 'desc'
					}
					break;
				}
				case 'today': {
					where.and.EMOTION_DAY = timeUtil.time('Y-M-D');
					break;
				}
				case 'yesterday': {
					where.and.EMOTION_DAY = timeUtil.time('Y-M-D', -86400);
					break;
				}
			}
		}

		let joinParams = {
			from: UserModel.CL,
			localField: 'EMOTION_USER_ID',
			foreignField: 'USER_MINI_OPENID',
			as: 'user',
		};

		return await EmotionModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

	}

}

module.exports = EmotionService;