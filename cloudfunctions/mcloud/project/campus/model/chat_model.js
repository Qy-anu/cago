/**
 * Notes: 聊天消息实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2023-05-24 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class ChatModel extends BaseProjectModel {

}

// 集合名
ChatModel.CL = BaseProjectModel.C('chat');

ChatModel.DB_STRUCTURE = {
	_pid: 'string|true',

	CHAT_ID: 'string|true',

	CHAT_SESSION_ID: 'string|true|comment=会话ID',
	CHAT_FROM_USER_ID: 'string|true|comment=发送者ID',
	CHAT_TO_USER_ID: 'string|true|comment=接收者ID',

	CHAT_TYPE: 'string|true|default=text|comment=消息类型 text=文本,image=图片',
	
	CHAT_CONTENT: 'string|true|comment=消息内容',
	
	CHAT_READ: 'int|true|default=0|comment=是否已读 0=未读,1=已读',

	CHAT_ADD_TIME: 'int|true',
	CHAT_EDIT_TIME: 'int|true',
	CHAT_ADD_IP: 'string|false',
	CHAT_EDIT_IP: 'string|false',

};

// 字段前缀
ChatModel.FIELD_PREFIX = "CHAT_";

module.exports = ChatModel;
