/**
 * Notes: 新手指南北后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-22
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');

const GuideModel = require('../../model/guide_model.js');

class AdminGuideService extends BaseProjectAdminService {


	/**添加新手指南 */
	async insertGuide({
		title,
		cateId,
		cateName,
		order,
		desc = '',
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let guideObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			GUIDE_TITLE: title,
			GUIDE_CATE_ID: cateId,
			GUIDE_CATE_NAME: cateName,
			GUIDE_ORDER: order,
			GUIDE_DESC: desc,
			GUIDE_FORMS: formsArr,
			GUIDE_OBJ: guideObj,
			GUIDE_PIC: [],
			GUIDE_CONTENT: [],
			GUIDE_STATUS: 1,
			GUIDE_ADD_TIME: Date.now()
		};
		let id = await GuideModel.insert(data);
		return { id };
	}

	/**删除新手指南数据 */
	async delGuide(id) {
		await GuideModel.del(id);
	}

	/**获取新手指南信息 */
	async getGuideDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}
		let guide = await GuideModel.getOne(where, fields);
		if (!guide) return null;

		return guide;
	}

	// 更新forms信息
	async updateGuideForms({
		id,
		hasImageForms
	}) {
		return await GuideModel.editForms(id, 'GUIDE_FORMS', 'GUIDE_OBJ', hasImageForms);
	}


	/**
	 * 更新富文本详细的内容及图片信息
	 * @returns 返回 urls数组 [url1, url2, url3, ...]
	 */
	async updateGuideContent({
		id,
		content
	}) {
		let data = {
			GUIDE_CONTENT: content
		};
		await GuideModel.edit(id, data);
	}

	/**
	 * 更新新手指南图片信息
	 * @returns 返回 urls数组 [url1, url2, url3, ...]
	 */
	async updateGuidePic({
		id,
		imgList
	}) {
		let data = {
			GUIDE_PIC: imgList
		};
		await GuideModel.edit(id, data);
	}


	/**更新新手指南数据 */
	async editGuide({
		id,
		title,
		cateId,
		cateName,
		order,
		desc = '',
		forms
	}) {
		let formsArr = Array.isArray(forms) ? forms : [];
		let guideObj = dataUtil.dbForms2Obj(formsArr);
		let data = {
			GUIDE_TITLE: title,
			GUIDE_CATE_ID: cateId,
			GUIDE_CATE_NAME: cateName,
			GUIDE_ORDER: order,
			GUIDE_DESC: desc,
			GUIDE_FORMS: formsArr,
			GUIDE_OBJ: guideObj,
			GUIDE_EDIT_TIME: Date.now()
		};
		await GuideModel.edit(id, data);
	}

	/**置顶与排序设定 */
	async sortGuide(id, sort) {
		await GuideModel.edit(id, { GUIDE_ORDER: sort });
	}

	/**新手指南状态修改 */
	async statusGuide(id, status) {
		await GuideModel.edit(id, { GUIDE_STATUS: status });
	}

	/**新手指南推荐设置 */
	async vouchGuide(id, vouch) {
		await GuideModel.edit(id, { GUIDE_VOUCH: vouch });
	}

	/**取得新手指南分页列表 */
	async getAdminGuideList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'GUIDE_ORDER': 'asc',
			'GUIDE_ADD_TIME': 'desc'
		};
		let fields = 'GUIDE_TITLE,GUIDE_DESC,GUIDE_CATE_ID,GUIDE_CATE_NAME,GUIDE_EDIT_TIME,GUIDE_ADD_TIME,GUIDE_ORDER,GUIDE_STATUS,GUIDE_CATE2_NAME,GUIDE_VOUCH,GUIDE_QR,GUIDE_OBJ';

		let where = {};
		where.and = {};

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
				case 'status': {
					where.and.GUIDE_STATUS = Number(sortVal);
					break;
				}
				case 'top': {
					where.and.GUIDE_ORDER = 0;
					break;
				}
			}
		}

		return await GuideModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/** 新手指南数据导出 */
	async getGuideDataExcel() {
		return await this.getDataExcel('guide', GuideModel);
	}

}

module.exports = AdminGuideService;