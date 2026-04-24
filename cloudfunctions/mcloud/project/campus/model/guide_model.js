/**
 * Notes: 新手指南实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-22
 */

const BaseProjectModel = require('./base_project_model.js');

class GuideModel extends BaseProjectModel {

}

GuideModel.CL = BaseProjectModel.C('guide');

GuideModel.DB_STRUCTURE = {
	_pid: 'string|true',
	GUIDE_ID: 'string|true',

	GUIDE_TITLE: 'string|false|comment=标题',
	GUIDE_DESC: 'string|false|comment=描述',
	GUIDE_STATUS: 'int|true|default=1|comment=状态 0/1',

	GUIDE_CATE_ID: 'string|true|comment=分类编号',
	GUIDE_CATE_NAME: 'string|true|comment=分类冗余',

	GUIDE_ORDER: 'int|true|default=9999',
	GUIDE_VOUCH: 'int|true|default=0',

	GUIDE_CONTENT: 'array|true|default=[]|comment=内容',

	GUIDE_QR: 'string|false',
	GUIDE_VIEW_CNT: 'int|true|default=0|comment=访问次数',

	GUIDE_PIC: 'array|false|default=[]|comment=封面图',

	GUIDE_FORMS: 'array|true|default=[]',
	GUIDE_OBJ: 'object|true|default={}',

	GUIDE_ADD_TIME: 'int|true',
	GUIDE_EDIT_TIME: 'int|false',
	GUIDE_ADD_IP: 'string|false',
	GUIDE_EDIT_IP: 'string|false',
};

GuideModel.FIELD_PREFIX = "GUIDE_";

module.exports = GuideModel;