/**
 * Notes: 表白墙模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2024-03-23 04:00:00 
 */

const BaseProjectService = require('./base_project_service.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const util = require('../../../framework/utils/util.js');
const cloudUtil = require('../../../framework/cloud/cloud_util.js');
const BoardModel = require('../model/board_model.js');
const UserModel = require('../model/user_model.js');

class BoardService extends BaseProjectService {

	/** 点赞 */
	async likeBoard(userId, id) {
		if (!id || !userId) this.AppError('缺少参数');

		let board = await BoardModel.getOne(id);
		if (!board) this.AppError('表白墙不存在');

		let likeList = board.BOARD_LIKE_LIST || [];
		let likeCnt = board.BOARD_LIKE_CNT || 0;

		// 检查是否已经点赞
		let index = likeList.indexOf(userId);
		let isLike = false;

		if (index > -1) {
			// 取消点赞
			likeList.splice(index, 1);
			likeCnt = Math.max(0, likeCnt - 1);
		} else {
			// 添加点赞
			likeList.push(userId);
			likeCnt++;
			isLike = true;
		}

		let data = {
			BOARD_LIKE_LIST: likeList,
			BOARD_LIKE_CNT: likeCnt
		};

		let where = {
			_id: id
		};

		await BoardModel.edit(where, data);

		return {
			success: true,
			data: {
				isLike,
				likeCnt
			}
		};
	}

	/** 浏览 */
	async viewBoard(id) {
		let fields = '*';

		let where = {
			_id: id,
			BOARD_STATUS: 1
		}
		let board = await BoardModel.getOne(where, fields);
		if (!board) return null;

		BoardModel.inc(id, 'BOARD_VIEW_CNT', 1);

		return board;
	}

	/** 获取 */
	async getBoardDetail(id) {
		return await BoardModel.getOne(id);
	}

	/** 修改状态 */
	async statusBoard(userId, id, status) {
		let data = {
			BOARD_STATUS: Number(status)
		}
		let where = { 
			_id: id,
		}
		if (userId) where.BOARD_USER_ID = userId; // for  admin

		return await BoardModel.edit(where, data);

	}

	/** 删除 */
	async delBoard(userId, id) {
		if (!id || !userId) this.AppError('缺少参数');

		let board = await BoardModel.getOne(id);
		if (!board) this.AppError('表白墙不存在');

		// 检查权限，只有作者才能删除
		if (board.BOARD_USER_ID !== userId) this.AppError('无权删除此表白');

		// 执行删除
		await BoardModel.del(id);

		return {
			success: true
		};
	}

	/** 插入 */
	async insertBoard(userId, {
		cateId,
		cateName,
		order,
		forms
	}) {
		// 构建对象
		let data = {
			BOARD_USER_ID: userId,
			BOARD_CATE_ID: cateId,
			BOARD_CATE_NAME: cateName,
			BOARD_ORDER: order,
			BOARD_ADD_TIME: this._timestamp,
			BOARD_EDIT_TIME: this._timestamp,
			BOARD_DAY: timeUtil.time('Y-M-D'),
			BOARD_STATUS: 1,
			BOARD_ANONYMOUS: true, // 强制匿名
			BOARD_OBJ: {},
			BOARD_FORMS: forms
		};

		// 处理表单数据
		if (forms && forms.length > 0) {
			for (let k = 0; k < forms.length; k++) {
				let form = forms[k];
				if (form.mark && form.val !== undefined && form.val !== null) {
					data.BOARD_OBJ[form.mark] = form.val;
				}
			}
		}

		// 生成ID
		data.BOARD_ID = dataUtil.makeID();

		// 写入数据库
		let id = await BoardModel.insert(data);

		return {
			id
		};
	}

	/** 修改 */
	async editBoard(userId, {
		id,
		cateId,
		cateName,
		order,
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let boardObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			BOARD_FORMS: formsArr,
			BOARD_OBJ: boardObj,
			BOARD_EDIT_TIME: Date.now()
		};
		if (util.isDefined(cateId)) data.BOARD_CATE_ID = cateId;
		if (util.isDefined(cateName)) data.BOARD_CATE_NAME = cateName;
		if (util.isDefined(order)) data.BOARD_ORDER = order;
		
		let where = { 
			_id: id,
			BOARD_USER_ID: userId
		};
		await BoardModel.edit(where, data);
	}

	/** 更新forms信息 */
	async updateBoardForms({
		id,
		hasImageForms
	}) {
		if (!id) this.AppError('缺少ID参数');

		let data = {
			BOARD_FORMS: hasImageForms,
			BOARD_EDIT_TIME: this._timestamp
		};

		// 处理表单数据，更新BOARD_OBJ
		if (hasImageForms && hasImageForms.length > 0) {
			let boardObj = {};
			for (let k = 0; k < hasImageForms.length; k++) {
				let form = hasImageForms[k];
				if (form.mark && form.val !== undefined && form.val !== null) {
					boardObj[form.mark] = form.val;
				}
			}
			data.BOARD_OBJ = boardObj;
		}

		let where = {
			_id: id
		};

		return await BoardModel.edit(where, data);
	}

	/** 列表与搜索 */
	async getBoardList(userId, {
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
			'BOARD_ORDER': 'asc',
			'BOARD_ADD_TIME': 'desc'
		};
		let fields = 'BOARD_ORDER,BOARD_CATE_ID,BOARD_CATE_NAME,BOARD_STATUS,BOARD_COMMENT_CNT,BOARD_VIEW_CNT,BOARD_FAV_CNT,BOARD_FAV_LIST,BOARD_LIKE_CNT,BOARD_LIKE_LIST,BOARD_ADD_TIME,BOARD_USER_ID,BOARD_OBJ,user.USER_NAME,user.USER_PIC';

		let where = {};
		where.and = {
			BOARD_STATUS: 1,
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};


		if (util.isDefined(search) && search) {
			if (search == '我的心情') {
				where.and.BOARD_USER_ID = userId;
				if (util.isDefined(where.and.BOARD_STATUS)) delete where.and.BOARD_STATUS;
			}
			else if (search == '我的点赞') {
				where.and.BOARD_LIKE_LIST = userId;
			}
			else if (search == '我的收藏') {
				where.and.BOARD_FAV_LIST = userId;
			}
			else {
				where.or = [
					{ 'BOARD_OBJ.to': ['like', search] },
					{ 'BOARD_OBJ.from': ['like', search] },
					{ 'BOARD_OBJ.desc': ['like', search] },
				];
			}

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.BOARD_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.BOARD_STATUS = Number(sortVal);
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'BOARD_ADD_TIME');
					break;
				}
				case 'fav': {
					orderBy = {
						'BOARD_FAV_CNT': 'desc',
						'BOARD_ADD_TIME': 'desc'
					}
					break;
				}
				case 'comment': {
					orderBy = {
						'BOARD_COMMENT_CNT': 'desc',
						'BOARD_ADD_TIME': 'desc'
					}
					break;
				}
				case 'like': {
					orderBy = {
						'BOARD_LIKE_CNT': 'desc',
						'BOARD_ADD_TIME': 'desc'
					}
					break;
				}
				case 'today': {
					where.and.BOARD_DAY = timeUtil.time('Y-M-D');
					break;
				}
				case 'yesterday': {
					where.and.BOARD_DAY = timeUtil.time('Y-M-D', -86400);
					break;
				}
			}
		}

		let joinParams = {
			from: UserModel.CL,
			localField: 'BOARD_USER_ID',
			foreignField: 'USER_MINI_OPENID',
			as: 'user',
		};

		return await BoardModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

	}

}

module.exports = BoardService;