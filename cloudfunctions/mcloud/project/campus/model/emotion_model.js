/**
 * Notes: 情绪互助社区实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-21 00:00:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class EmotionModel extends BaseProjectModel {

}

// 集合名
EmotionModel.CL = BaseProjectModel.C('emotion');

EmotionModel.DB_STRUCTURE = {
	_pid: 'string|true',

	EMOTION_ID: 'string|true',

	EMOTION_STATUS: 'int|true|default=1|comment=状态 0=仅自己可见,1=正常',
	
	EMOTION_ORDER: 'int|true|default=9999',

	EMOTION_USER_ID: 'string|true|comment=用户ID',
	EMOTION_ANONYMOUS: 'bool|true|default=false|comment=是否匿名',

	EMOTION_DAY: 'string|false|comment=日期',

	EMOTION_FORMS: 'array|true|default=[]',
	EMOTION_OBJ: 'object|true|default={}',

	EMOTION_FAV_CNT: 'int|true|default=0',
	EMOTION_FAV_LIST: 'array|true|default=[]',
	EMOTION_VIEW_CNT: 'int|true|default=0',
	EMOTION_LIKE_CNT: 'int|true|default=0',
	EMOTION_LIKE_LIST: 'array|true|default=[]',
	EMOTION_COMMENT_CNT: 'int|true|default=0', 

	EMOTION_ADD_TIME: 'int|true',
	EMOTION_EDIT_TIME: 'int|true',
	EMOTION_ADD_IP: 'string|false',
	EMOTION_EDIT_IP: 'string|false',

};

// 字段前缀
EmotionModel.FIELD_PREFIX = "EMOTION_";

module.exports = EmotionModel;