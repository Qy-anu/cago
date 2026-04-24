/**
 * Notes: 聊天模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-23 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const ChatService = require('../service/chat_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const contentCheck = require('../../../framework/validate/content_check.js');

class ChatController extends BaseProjectController {

	/** 获取或创建会话 */
	async getOrCreateSession() {
		let rules = {
			targetUserId: 'must|string',
			sourceType: 'string',
			sourceId: 'string',
			sourceTitle: 'string',
		};

		let input = this.validateData(rules);

		let service = new ChatService();
		return await service.getOrCreateSession(this._userId, input.targetUserId, {
			sourceType: input.sourceType,
			sourceId: input.sourceId,
			sourceTitle: input.sourceTitle
		});
	}

	/** 发送消息 */
	async sendMessage() {
		let rules = {
			targetUserId: 'must|string',
			content: 'must|string|min:1|max:500',
			type: 'string|default=text',
			sourceType: 'string',
			sourceId: 'string',
			sourceTitle: 'string',
		};

		let input = this.validateData(rules);

		await contentCheck.checkTextMultiClient(input);

		let service = new ChatService();
		return await service.sendMessage(this._userId, input);
	}

	/** 获取会话列表 */
	async getSessionList() {
		let rules = {
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		let input = this.validateData(rules);

		let service = new ChatService();
		let result = await service.getSessionList(this._userId, input);

		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].CHAT_SESSION_LAST_TIME = timeUtil.timestamp2Time(list[k].CHAT_SESSION_LAST_TIME, 'Y-M-D h:m');
		}

		return result;
	}

	/** 获取消息列表 */
	async getMessageList() {
		let rules = {
			sessionId: 'must|string',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		let input = this.validateData(rules);

		let service = new ChatService();
		let result = await service.getMessageList(this._userId, input);

		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].CHAT_ADD_TIME = timeUtil.timestamp2Time(list[k].CHAT_ADD_TIME, 'h:m');
			list[k].isMy = (list[k].CHAT_FROM_USER_ID === this._userId);
		}

		return result;
	}

	/** 获取未读消息总数 */
	async getUnreadCount() {
		let service = new ChatService();
		let count = await service.getUnreadCount(this._userId);
		return { count };
	}

}

module.exports = ChatController;