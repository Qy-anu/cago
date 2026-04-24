/**
 * Notes: 新手指南模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-22
 */

const BaseProjectController = require('./base_project_controller.js');
const GuideService = require('../service/guide_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');

class GuideController extends BaseProjectController {

	// 把列表转换为显示模式
	transGuideList(list) {
		let ret = [];
		for (let k = 0; k < list.length; k++) {
			let node = {};
			node.type = 'guide';
			node.id = list[k]._id;
			node.title = list[k].GUIDE_TITLE;
			node.desc = list[k].GUIDE_DESC;
			node.ext = list[k].GUIDE_ADD_TIME;
			node.pic = (list[k].GUIDE_PIC && list[k].GUIDE_PIC[0]) ? list[k].GUIDE_PIC[0] : '';
			ret.push(node);
		}
		return ret;
	}

	/** 浏览详细 */
	async viewGuide() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new GuideService();
		let guide = await service.viewGuide(input.id);

		if (guide) {
			guide.GUIDE_ADD_TIME = timeUtil.timestamp2Time(guide.GUIDE_ADD_TIME, 'Y-M-D h:m');
		}

		return guide;
	}

	/** 列表与搜索 */
	async getGuideList() {

		// 数据校验
		let rules = {
			cateId: 'string',
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

		let service = new GuideService();
		let result = await service.getGuideList(input);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].GUIDE_ADD_TIME = timeUtil.timestamp2Time(list[k].GUIDE_ADD_TIME, 'Y-M-D');

			if (list[k].GUIDE_OBJ && list[k].GUIDE_OBJ.desc)
				delete list[k].GUIDE_OBJ.desc;
		}
		result.list = this.transGuideList(list);

		return result;

	}

}

module.exports = GuideController;