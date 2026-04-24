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
const JobModel = require('../model/job_model.js');
const UserModel = require('../model/user_model.js');

class JobService extends BaseProjectService {

	/** 点赞 */
	async likeJob(userId, id) {
		let job = await JobModel.getOne(id);
		if (!job) return { success: false, msg: '职位不存在' };

		let likeList = job.JOB_LIKE_LIST || [];
		let index = likeList.indexOf(userId);

		if (index > -1) {
			// 取消点赞
			likeList.splice(index, 1);
			await JobModel.edit(id, {
				JOB_LIKE_LIST: likeList,
				JOB_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: false, likeCnt: likeList.length };
		} else {
			// 点赞
			likeList.push(userId);
			await JobModel.edit(id, {
				JOB_LIKE_LIST: likeList,
				JOB_LIKE_CNT: likeList.length
			});
			return { success: true, isLike: true, likeCnt: likeList.length };
		}
	}

	/** 浏览 */
	async viewJob(userId, id) {
		let fields = '*';

		let where = {
			_id: id,
			//JOB_STATUS: 1
		}

		if (userId && util.isDefined(where.JOB_STATUS)) delete where.JOB_STATUS;

		let job = await JobModel.getOne(where, fields);
		if (!job) return null;

		JobModel.inc(id, 'JOB_VIEW_CNT', 1);

		return job;
	}

	/** 获取 */
	async getJobDetail(id) {
		return await JobModel.getOne(id);
	}

	/** 修改状态 */
	async statusJob(userId, id, status) {
		let data = {
			JOB_STATUS: Number(status)
		}
		let where = { 
			_id: id,
		}
		if (userId) where.JOB_USER_ID = userId; // for  admin

		return await JobModel.edit(where, data);
	}

	/** 删除 */
	async delJob(userId, id) {
		let where = { 
			_id: id,
			JOB_USER_ID: userId
		}
		return await JobModel.del(where);
	}

	/** 插入 */
	async insertJob(userId, {
		cateId,
		cateName,
		order,
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let jobObj = dataUtil.dbForms2Obj(formsArr);

		let data = {
			JOB_CATE_ID: cateId,
			JOB_CATE_NAME: cateName,
			JOB_ORDER: order || 9999, // 默认排序号
			JOB_FORMS: formsArr,
			JOB_OBJ: jobObj,
			JOB_USER_ID: userId,
			JOB_DAY: timeUtil.time('Y-M-D'),
			JOB_ADD_TIME: Date.now(),
			JOB_EDIT_TIME: Date.now()
		};

		let id = await JobModel.insert(data);
		return { id };
	}

	/** 修改 */
	async editJob(userId, {
		id,
		cateId,
		cateName,
		order,
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let jobObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			JOB_FORMS: formsArr,
			JOB_OBJ: jobObj,
			JOB_EDIT_TIME: Date.now()
		};
		if (util.isDefined(cateId)) data.JOB_CATE_ID = cateId;
		if (util.isDefined(cateName)) data.JOB_CATE_NAME = cateName;
		if (util.isDefined(order)) data.JOB_ORDER = order;
		
		let where = { 
			_id: id,
			JOB_USER_ID: userId
		};
		await JobModel.edit(where, data);
	}

	/** 更新forms信息 */
	async updateJobForms({
		id,
		hasImageForms
	}) {
		return await JobModel.editForms(id, 'JOB_FORMS', 'JOB_OBJ', hasImageForms);
	}

	/** 列表与搜索 */
	async getJobList(userId, {
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
			'JOB_ORDER': 'asc',
			'JOB_ADD_TIME': 'desc'
		};
		let fields = 'JOB_ORDER,JOB_CATE_ID,JOB_CATE_NAME,JOB_STATUS,JOB_COMMENT_CNT,JOB_VIEW_CNT,JOB_FAV_CNT,JOB_FAV_LIST,JOB_LIKE_CNT,JOB_LIKE_LIST,JOB_ADD_TIME,JOB_USER_ID,JOB_OBJ,user.USER_NAME,user.USER_PIC';

		let where = {};
		where.and = {
			//JOB_STATUS: 1,
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};


		if (util.isDefined(search) && search) {
			if (search == '我的发布') {
				where.and.JOB_USER_ID = userId;
			}
			else if (search == '我的点赞') {
				where.and.JOB_LIKE_LIST = userId;
			}
			else if (search == '我的收藏') {
				where.and.JOB_FAV_LIST = userId;
			}
			else {
				where.or = [
					{ 'JOB_OBJ.title': ['like', search] },
					{ 'JOB_OBJ.poster': ['like', search] },
					{ 'JOB_OBJ.desc': ['like', search] },
				];
			}

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.JOB_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.JOB_STATUS = Number(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'JOB_ADD_TIME');
					break;
				}
				case 'fav': {
					orderBy = {
						'JOB_FAV_CNT': 'desc',
						'JOB_ADD_TIME': 'desc'
					}
					break;
				}
				case 'comment': {
					orderBy = {
						'JOB_COMMENT_CNT': 'desc',
						'JOB_ADD_TIME': 'desc'
					}
					break;
				}
				case 'like': {
					orderBy = {
						'JOB_LIKE_CNT': 'desc',
						'JOB_ADD_TIME': 'desc'
					}
					break;
				}
				case 'today': {
					where.and.JOB_DAY = timeUtil.time('Y-M-D');
					break;
				}
				case 'yesterday': {
					where.and.JOB_DAY = timeUtil.time('Y-M-D', -86400);
					break;
				}
			}
		}

		let joinParams = {
			from: UserModel.CL,
			localField: 'JOB_USER_ID',
			foreignField: 'USER_MINI_OPENID',
			as: 'user',
		};

		return await JobModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

	}

}

module.exports = JobService;