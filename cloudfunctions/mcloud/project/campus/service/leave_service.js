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
const LeaveModel = require('../model/leave_model.js');
const UserModel = require('../model/user_model.js');

class LeaveService extends BaseProjectService {

	/** 点赞 */
	async likeLeave(userId, id) {
		let leave = await LeaveModel.getOne(id);
		if (!leave) return { success: false, msg: '离校信息不存在' };

		let likeList = leave.LEAVE_LIKE_LIST || [];
		let index = likeList.indexOf(userId);

		if (index > -1) {
			// 取消点赞
			likeList.splice(index, 1);
			await LeaveModel.edit(id, {
				LEAVE_LIKE_LIST: likeList,
				LEAVE_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: false, likeCnt: likeList.length };
		} else {
			// 点赞
			likeList.push(userId);
			await LeaveModel.edit(id, {
				LEAVE_LIKE_LIST: likeList,
				LEAVE_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: true, likeCnt: likeList.length };
		}
	}

	/** 浏览 */
	async viewLeave(userId, id) {
		let fields = '*';

		let where = {
			_id: id,
			//LEAVE_STATUS: 1
		}

		if (userId && util.isDefined(where.LEAVE_STATUS)) delete where.LEAVE_STATUS;

		let leave = await LeaveModel.getOne(where, fields);
		if (!leave) return null;

		LeaveModel.inc(id, 'LEAVE_VIEW_CNT', 1);

		return leave;
	}

	/** 获取 */
	async getLeaveDetail(id) {
		return await LeaveModel.getOne(id);
	}

	/**修改状态 */
	async statusLeave(userId, id, status) {
		let data = {
			LEAVE_STATUS: Number(status)
		}
		let where = { 
			_id: id,
		}
		if (userId) where.LEAVE_USER_ID = userId; // for  admin

		return await LeaveModel.edit(where, data);
	}

	/** 删除 */
	async delLeave(userId, id) {
		let where = { 
			_id: id,
			LEAVE_USER_ID: userId
		}
		return await LeaveModel.del(where);
	}

	/** 插入 */
	async insertLeave(userId, {
		cateId,
		cateName,
		order,
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let leaveObj = dataUtil.dbForms2Obj(formsArr);

		let data = {
			LEAVE_CATE_ID: cateId,
			LEAVE_CATE_NAME: cateName,
			LEAVE_ORDER: order || 9999, // 默认排序号
			LEAVE_FORMS: formsArr,
			LEAVE_OBJ: leaveObj,
			LEAVE_USER_ID: userId,
			LEAVE_DAY: timeUtil.time('Y-M-D'),
			LEAVE_ADD_TIME: Date.now(),
			LEAVE_EDIT_TIME: Date.now()
		};

		let id = await LeaveModel.insert(data);
		return { id };
	}

	/** 修改 */
	async editLeave(userId, {
		id,
		cateId,
		cateName,
		order,
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let leaveObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			LEAVE_FORMS: formsArr,
			LEAVE_OBJ: leaveObj,
			LEAVE_EDIT_TIME: Date.now()
		};
		if (util.isDefined(cateId)) data.LEAVE_CATE_ID = cateId;
		if (util.isDefined(cateName)) data.LEAVE_CATE_NAME = cateName;
		if (util.isDefined(order)) data.LEAVE_ORDER = order;
		
		let where = { 
			_id: id,
			LEAVE_USER_ID: userId
		};
		await LeaveModel.edit(where, data);
	}

	/** 更新forms信息 */
	async updateLeaveForms({
		id,
		hasImageForms
	}) {
		return await LeaveModel.editForms(id, 'LEAVE_FORMS', 'LEAVE_OBJ', hasImageForms);
	}

	/** 列表与搜索 */
	async getLeaveList(userId, {
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
			'LEAVE_ORDER': 'asc',
			'LEAVE_ADD_TIME': 'desc'
		};
		let fields = 'LEAVE_ORDER,LEAVE_CATE_ID,LEAVE_CATE_NAME,LEAVE_STATUS,LEAVE_COMMENT_CNT,LEAVE_VIEW_CNT,LEAVE_FAV_CNT,LEAVE_FAV_LIST,LEAVE_LIKE_CNT,LEAVE_LIKE_LIST,LEAVE_ADD_TIME,LEAVE_USER_ID,LEAVE_OBJ,user.USER_NAME,user.USER_PIC';

		let where = {};
		where.and = {
			//LEAVE_STATUS: 1,
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};


		if (util.isDefined(search) && search) {
			if (search == '我的发布') {
				where.and.LEAVE_USER_ID = userId;
			}
			else if (search == '我的点赞') {
				where.and.LEAVE_LIKE_LIST = userId;
			}
			else if (search == '我的收藏') {
				where.and.LEAVE_FAV_LIST = userId;
			}
			else {
				where.or = [
					{ 'LEAVE_OBJ.title': ['like', search] },
					{ 'LEAVE_OBJ.poster': ['like', search] },
					{ 'LEAVE_OBJ.tel': ['like', search] },
					{ 'LEAVE_OBJ.wx': ['like', search] }, 
					{ 'LEAVE_OBJ.desc': ['like', search] },
				];
			}

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.LEAVE_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.LEAVE_STATUS = Number(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'LEAVE_ADD_TIME');
					break;
				}
				case 'fav': {
					orderBy = {
						'LEAVE_FAV_CNT': 'desc',
						'LEAVE_ADD_TIME': 'desc'
					}
					break;
				}
				case 'comment': {
					orderBy = {
						'LEAVE_COMMENT_CNT': 'desc',
						'LEAVE_ADD_TIME': 'desc'
					}
					break;
				}
				case 'like': {
					orderBy = {
						'LEAVE_LIKE_CNT': 'desc',
						'LEAVE_ADD_TIME': 'desc'
					}
					break;
				}
				case 'today': {
					where.and.LEAVE_DAY = timeUtil.time('Y-M-D');
					break;
				}
				case 'yesterday': {
					where.and.LEAVE_DAY = timeUtil.time('Y-M-D', -86400);
					break;
				}
			}
		}

		let joinParams = {
			from: UserModel.CL,
			localField: 'LEAVE_USER_ID',
			foreignField: 'USER_MINI_OPENID',
			as: 'user',
		};

		return await LeaveModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

	}

}

module.exports = LeaveService;