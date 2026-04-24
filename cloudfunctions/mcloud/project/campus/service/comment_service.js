/**
 * Notes: 样片模块业务逻辑
 */

const BaseProjectService = require('./base_project_service.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const util = require('../../../framework/utils/util.js');
const cloudUtil = require('../../../framework/cloud/cloud_util.js');
const CommentModel = require('../model/comment_model.js');
const UserModel = require('../model/user_model.js');

class CommentService extends BaseProjectService {

	/** 点赞 */
	async likeComment(userId, id) {
		let comment = await CommentModel.getOne(id);
		if (!comment) return false;

		let likeList = comment.COMMENT_LIKE_LIST || [];
		let index = likeList.indexOf(userId);

		if (index > -1) {
			likeList.splice(index, 1);
			await CommentModel.edit(id, {
				COMMENT_LIKE_LIST: likeList,
				COMMENT_LIKE_CNT: likeList.length
			});
			return false;
		}

		likeList.push(userId);
		await CommentModel.edit(id, {
			COMMENT_LIKE_LIST: likeList,
			COMMENT_LIKE_CNT: likeList.length
		});
		return true;
	}

	async statComment(oid, type) {
		let PREFIX = type.toUpperCase();
		let name = type.toLowerCase();

		let cnt = await CommentModel.count({ COMMENT_OID: oid, COMMENT_TYPE: type });
		let Model = require('../model/' + name + '_model.js');

		await Model.edit(oid, { [PREFIX + '_COMMENT_CNT']: cnt });
	}

	async delComment(userId, id, type) {
		let comment = await CommentModel.getOne(id);
		if (!comment) return;

		let where = { _id: id };
		if (userId) where.COMMENT_USER_ID = userId;

		await CommentModel.del(where);
		await this.statComment(comment.COMMENT_OID, comment.COMMENT_TYPE);
	}

	async insertComment(userId, {
		oid,
		type,
		forms
	}) {

		let formsArr = Array.isArray(forms) ? forms : [];
		let commentObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			COMMENT_USER_ID: userId,
			COMMENT_TYPE: type,
			COMMENT_OID: oid,
			COMMENT_FORMS: formsArr,
			COMMENT_OBJ: commentObj,
			COMMENT_LIKE_CNT: 0,
			COMMENT_LIKE_LIST: [],
			COMMENT_ADD_TIME: Date.now(),
			COMMENT_EDIT_TIME: Date.now(),
		};

		let id = await CommentModel.insert(data);
		await this.statComment(oid, type);
		return { id };
	}

	// 更新forms信息
	async updateCommentForms({
		id,
		hasImageForms
	}) {
		return await CommentModel.editForms(id, 'COMMENT_FORMS', 'COMMENT_OBJ', hasImageForms);
	}

	async getCommentList(userId, {
		oid,
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
			'COMMENT_ADD_TIME': 'desc'
		};
		let fields = 'COMMENT_LIKE_CNT,COMMENT_LIKE_LIST,COMMENT_ADD_TIME,COMMENT_USER_ID,COMMENT_OBJ,user.USER_NAME,user.USER_PIC,user.USER_OBJ.sex';


		let where = {};
		where.and = {
			COMMENT_OID: oid,
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};


		if (util.isDefined(search) && search) {
			where.or = [
				{ 'COMMENT_OBJ.content': ['like', search] },
				{ 'user.USER_NAME': ['like', search] },
			];


		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'COMMENT_ADD_TIME');
					break;
				}
				case 'like': {
					orderBy = {
						'COMMENT_LIKE_CNT': 'desc',
						'COMMENT_ADD_TIME': 'desc'
					}
					break;
				}
				case 'mycomment': {
					where.and.COMMENT_USER_ID = userId;
					break;
				}
				case 'mylike': {
					where.and.COMMENT_LIKE_LIST = userId;
					break;
				}

			}
		}

		let joinParams = {
			from: UserModel.CL,
			localField: 'COMMENT_USER_ID',
			foreignField: 'USER_MINI_OPENID',
			as: 'user',
		};

		return await CommentModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);
	}

}

module.exports = CommentService;