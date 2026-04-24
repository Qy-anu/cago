/**
 * Notes: 兼职模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2024-03-23 04:00:00 
 */

const BaseProjectService = require('./base_project_service.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const util = require('../../../framework/utils/util.js');
const cloudUtil = require('../../../framework/cloud/cloud_util.js');
const LostModel = require('../model/lost_model.js');
const UserModel = require('../model/user_model.js');

class LostService extends BaseProjectService {

	/** 点赞 */
	async likeLost(userId, id) {
		let lost = await LostModel.getOne(id);
		if (!lost) return { success: false, msg: '失物不存在' };

		let likeList = lost.LOST_LIKE_LIST || [];
		let index = likeList.indexOf(userId);

		if (index > -1) {
			// 取消点赞
			likeList.splice(index, 1);
			await LostModel.edit(id, {
				LOST_LIKE_LIST: likeList,
				LOST_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: false, likeCnt: likeList.length };
		} else {
			// 点赞
			likeList.push(userId);
			await LostModel.edit(id, {
				LOST_LIKE_LIST: likeList,
				LOST_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: true, likeCnt: likeList.length };
		}
	}

	/** 浏览 */
	async viewLost(userId, id) {
		let fields = '*';

		let where = {
			_id: id,
			//LOST_STATUS: 1
		}

		if (userId && util.isDefined(where.LOST_STATUS)) delete where.LOST_STATUS;

		let lost = await LostModel.getOne(where, fields);
		if (!lost) return null;

		LostModel.inc(id, 'LOST_VIEW_CNT', 1);

		return lost;
	}

	/** 获取 */
	async getLostDetail(id) {
		return await LostModel.getOne(id);
	}

	/** 修改状态 */
	async statusLost(userId, id, status) {
		let data = {
			LOST_STATUS: Number(status)
		}
		let where = { 
			_id: id,
		}
		if (userId) where.LOST_USER_ID = userId; // for  admin

		return await LostModel.edit(where, data);
	}

	/** 删除 */
	async delLost(userId, id) {
		let where = { 
			_id: id,
			LOST_USER_ID: userId
		}
		return await LostModel.del(where);
	}

	/** 插入 */
	async insertLost(userId, {
		cateId,
		cateName,
		order,
		forms
	}) {
		//this.AppError('[校园圈]该功能暂不开放，如有需要请加作者微信：cclinux0730');

		// 「脏数据」来源：Model.clearDirtyData 会遍历 data 的每个键，凡不在 LostModel.DB_STRUCTURE 里声明的键都会抛 AppError('脏数据')。
		// 所以不要往 data 里塞 _id、cateId、自定义字段名；计数器等未写的字段由 DB 默认值与 Model.insert 补齐。
		// 表单须同时写 LOST_FORMS（数组，供 editForms 按 mark 替换图片）与 LOST_OBJ（对象，列表/检索用）；勿把数组直接赋给 LOST_OBJ。
		let formsArr = Array.isArray(forms) ? forms : [];
		// dbForms2Obj 内部会 dbFormsFix，且会原地修正 formsArr 里的数字等类型
		let lostObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			LOST_USER_ID: userId,
			LOST_CATE_ID: String(cateId),
			LOST_CATE_NAME: cateName || '',
			LOST_ORDER: Number(order) || 0,
			LOST_FORMS: formsArr,
			LOST_OBJ: lostObj,
			LOST_STATUS: 1
		};
		// _pid 由 MultiModel.insert 内部写入，无需重复赋值

		let id = await LostModel.insert(data);
		return {
			id
		};
	}

	/** 修改 */
	async editLost(userId, {
		id,
		cateId,
		cateName,
		order,
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let lostObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			LOST_CATE_ID: String(cateId),
			LOST_CATE_NAME: cateName || '',
			LOST_ORDER: Number(order) || 0,
			LOST_FORMS: formsArr,
			LOST_OBJ: lostObj
		};
		await LostModel.edit(id, data);
	}

	/** 更新forms信息 */
	async updateLostForms({
		id,
		hasImageForms
	}) {
		return await LostModel.editForms(id, 'LOST_FORMS', 'LOST_OBJ', hasImageForms);
	}

	/** 列表与搜索 */
	async getLostList(userId, {
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
			'LOST_ORDER': 'asc',
			'LOST_ADD_TIME': 'desc'
		};
		let fields = 'LOST_ORDER,LOST_CATE_ID,LOST_CATE_NAME,LOST_STATUS,LOST_COMMENT_CNT,LOST_VIEW_CNT,LOST_FAV_CNT,LOST_FAV_LIST,LOST_LIKE_CNT,LOST_LIKE_LIST,LOST_ADD_TIME,LOST_USER_ID,LOST_OBJ,user.USER_NAME,user.USER_PIC';

		let where = {};
		where.and = {
			//LOST_STATUS: 1,
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

    // ========== 新增：按状态过滤列表 ==========
 // if (sortType === 'status') {
    // 前端传sortVal=1 → 显示进行中；sortVal=2 → 显示已结束
//    where.and.LOST_STATUS = Number(sortVal);
//  } else {
    // 默认显示进行中（如果没选状态，只查1）
 //   where.and.LOST_STATUS = 1;
//  }


		if (util.isDefined(search) && search) {
			if (search == '我的发布') {
				where.and.LOST_USER_ID = userId;
			}
			else if (search == '我的点赞') {
				where.and.LOST_LIKE_LIST = userId;
			}
			else if (search == '我的收藏') {
				where.and.LOST_FAV_LIST = userId;
			}
			else {
				where.or = [
					{ 'LOST_OBJ.title': ['like', search] },
					{ 'LOST_OBJ.desc': ['like', search] },
					{ 'LOST_OBJ.poster': ['like', search] },
					{ 'LOST_OBJ.tel': ['like', search] },
					{ 'LOST_OBJ.wx': ['like', search] },
				];
			}

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.LOST_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.LOST_STATUS = Number(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'LOST_ADD_TIME');
					break;
				}
				case 'fav': {
					orderBy = {
						'LOST_FAV_CNT': 'desc',
						'LOST_ADD_TIME': 'desc'
					}
					break;
				}
				case 'comment': {
					orderBy = {
						'LOST_COMMENT_CNT': 'desc',
						'LOST_ADD_TIME': 'desc'
					}
					break;
				}
				case 'like': {
					orderBy = {
						'LOST_LIKE_CNT': 'desc',
						'LOST_ADD_TIME': 'desc'
					}
					break;
				}
				case 'today': {
					where.and.LOST_DAY = timeUtil.time('Y-M-D');
					break;
				}
				case 'yesterday': {
					where.and.LOST_DAY = timeUtil.time('Y-M-D', -86400);
					break;
				}
			}
		}

		let joinParams = {
			from: UserModel.CL,
			localField: 'LOST_USER_ID',
			foreignField: 'USER_MINI_OPENID',
			as: 'user',
		};

		return await LostModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

	}

}

module.exports = LostService;