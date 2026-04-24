/**
 * Notes: 新手指南模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-22
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const GuideModel = require('../model/guide_model.js');

class GuideService extends BaseProjectService {

	/** 浏览资讯信息 */
	async viewGuide(id) {

		let fields = '*';

		let where = {
			_id: id,
			GUIDE_STATUS: 1
		}
		let guide = await GuideModel.getOne(where, fields);
		if (!guide) return null;

		return guide;
	}


	/** 取得分页列表 */
	async getGuideList({
		cateId,
		search,
		sortType,
		sortVal,
		orderBy,
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'GUIDE_ORDER': 'asc',
			'GUIDE_ADD_TIME': 'desc'
		};
		let fields = 'GUIDE_PIC,GUIDE_VIEW_CNT,GUIDE_TITLE,GUIDE_DESC,GUIDE_CATE_ID,GUIDE_ADD_TIME,GUIDE_ORDER,GUIDE_STATUS,GUIDE_CATE_NAME,GUIDE_OBJ';

		let where = {};
		where.and = {
			_pid: this.getProjectId()
		};
		where.and.GUIDE_STATUS = 1;

		if (cateId && cateId !== '0') where.and.GUIDE_CATE_ID = cateId;

		if (util.isDefined(search) && search) {
			where.or = [
				{ GUIDE_TITLE: ['like', search] },
			];
		} else if (sortType && util.isDefined(sortVal)) {
			switch (sortType) {
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'GUIDE_ADD_TIME');
					break;
				}
				case 'cateId': {
					if (sortVal) where.and.GUIDE_CATE_ID = String(sortVal);
					break;
				}
			}
		}

		return await GuideModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

}

module.exports = GuideService;