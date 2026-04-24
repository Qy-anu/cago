/**
 * Notes: 聊天会话实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2023-05-24 19:20:00
 */


const BaseProjectModel = require('./base_project_model.js');

class ChatSessionModel extends BaseProjectModel {

}

// 集合名
ChatSessionModel.CL = BaseProjectModel.C('chat_session');

ChatSessionModel.DB_STRUCTURE = {
	_pid: 'string|true',

	CHAT_SESSION_ID: 'string|true',

	CHAT_SESSION_USER_ID_A: 'string|true|comment=用户AID',
	CHAT_SESSION_USER_ID_B: 'string|true|comment=用户BID',

	CHAT_SESSION_SOURCE_TYPE: 'string|false|comment=来源类型(job/lost/leave/board)',
	CHAT_SESSION_SOURCE_ID: 'string|false|comment=来源帖子ID',
	CHAT_SESSION_SOURCE_TITLE: 'string|false|comment=来源帖子标题',

	CHAT_SESSION_LAST_TIME: 'int|true|comment=最后消息时间',
	CHAT_SESSION_LAST_CONTENT: 'string|true|comment=最后消息内容',

	CHAT_SESSION_UNREAD_A: 'int|true|default=0|comment=用户A未读数',
	CHAT_SESSION_UNREAD_B: 'int|true|default=0|comment=用户B未读数',

	CHAT_SESSION_ADD_TIME: 'int|true',
	CHAT_SESSION_EDIT_TIME: 'int|true',
	CHAT_SESSION_ADD_IP: 'string|false',
	CHAT_SESSION_EDIT_IP: 'string|false',

};

// 字段前缀
ChatSessionModel.FIELD_PREFIX = "CHAT_SESSION_";

module.exports = ChatSessionModel;