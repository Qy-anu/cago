/**
 * Notes: 聊天模块业务逻辑
 */

const BaseProjectService = require('./base_project_service.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const util = require('../../../framework/utils/util.js');
const cloudUtil = require('../../../framework/cloud/cloud_util.js');
const ChatModel = require('../model/chat_model.js');
const ChatSessionModel = require('../model/chat_session_model.js');
const UserModel = require('../model/user_model.js');

class ChatService extends BaseProjectService {

	async _getSessionByAnyId(sessionId) {
		if (!sessionId) return null;

		let session = await ChatSessionModel.getOne(sessionId).catch(() => null);
		if (session) return session;

		session = await ChatSessionModel.getOne({
			CHAT_SESSION_ID: sessionId
		}).catch(() => null);
		return session || null;
	}

	/** 获取或创建会话 */
	async getOrCreateSession(userId, targetUserId, {
		sourceType = '',
		sourceId = '',
		sourceTitle = ''
	} = {}) {
		// 确定会话的用户A和用户B，保证一致性
		let userA = userId < targetUserId ? userId : targetUserId;
		let userB = userId < targetUserId ? targetUserId : userId;

		let where = {
			CHAT_SESSION_USER_ID_A: userA,
			CHAT_SESSION_USER_ID_B: userB
		};

		// 如果有来源信息，增加来源条件
		if (sourceType && sourceId) {
			where.CHAT_SESSION_SOURCE_TYPE = sourceType;
			where.CHAT_SESSION_SOURCE_ID = sourceId;
		}

		let session = await ChatSessionModel.getOne(where);

		if (!session) {
			// 创建新会话
			let data = {
				CHAT_SESSION_USER_ID_A: userA,
				CHAT_SESSION_USER_ID_B: userB,
				CHAT_SESSION_LAST_TIME: Date.now(),
				CHAT_SESSION_LAST_CONTENT: '',
				CHAT_SESSION_UNREAD_A: 0,
				CHAT_SESSION_UNREAD_B: 0,
				CHAT_SESSION_ADD_TIME: Date.now(),
				CHAT_SESSION_EDIT_TIME: Date.now(),
			};

			// 填充来源信息
			if (sourceType && sourceId) {
				data.CHAT_SESSION_SOURCE_TYPE = sourceType;
				data.CHAT_SESSION_SOURCE_ID = sourceId;
				data.CHAT_SESSION_SOURCE_TITLE = sourceTitle || '';
			}

			let id = await ChatSessionModel.insert(data);
			session = await ChatSessionModel.getOne(id);
		}

		return session;
	}

	/** 发送消息 */
	async sendMessage(userId, {
		targetUserId,
		content,
		type = 'text',
		sourceType = '',
		sourceId = '',
		sourceTitle = ''
	}) {
		// 获取或创建会话
		let session = await this.getOrCreateSession(userId, targetUserId, {
			sourceType,
			sourceId,
			sourceTitle
		});
		let sessionId = session._id || session.CHAT_SESSION_ID;
		if (!sessionId) throw new Error('chat session id missing');
		
		// 创建消息
		let data = {
			CHAT_SESSION_ID: sessionId,
			CHAT_FROM_USER_ID: userId,
			CHAT_TO_USER_ID: targetUserId,
			CHAT_TYPE: type,
			CHAT_CONTENT: content,
			CHAT_READ: 0,
			CHAT_ADD_TIME: Date.now(),
			CHAT_EDIT_TIME: Date.now(),
		};
		
		let id = await ChatModel.insert(data);
		
		// 更新会话
		let updateData = {
			CHAT_SESSION_LAST_TIME: Date.now(),
			CHAT_SESSION_LAST_CONTENT: content
		};
		
		// 更新未读数
		if (session.CHAT_SESSION_USER_ID_A === userId) {
			updateData.CHAT_SESSION_UNREAD_B = (session.CHAT_SESSION_UNREAD_B || 0) + 1;
		} else {
			updateData.CHAT_SESSION_UNREAD_A = (session.CHAT_SESSION_UNREAD_A || 0) + 1;
		}
		
		await ChatSessionModel.edit(session._id || session.CHAT_SESSION_ID, updateData);
		
		return { id, sessionId };
	}

	/** 获取会话列表 */
	async getSessionList(userId, {
		page,
		size,
		isTotal = true,
		oldTotal
	}) {
		let orderBy = {
			'CHAT_SESSION_LAST_TIME': 'desc'
		};
		
		let fields = 'CHAT_SESSION_ID,CHAT_SESSION_USER_ID_A,CHAT_SESSION_USER_ID_B,CHAT_SESSION_LAST_TIME,CHAT_SESSION_LAST_CONTENT,CHAT_SESSION_UNREAD_A,CHAT_SESSION_UNREAD_B,CHAT_SESSION_SOURCE_TYPE,CHAT_SESSION_SOURCE_ID,CHAT_SESSION_SOURCE_TITLE';
		
		let where = {};
		where.or = [
			{ CHAT_SESSION_USER_ID_A: userId },
			{ CHAT_SESSION_USER_ID_B: userId }
		];
		where.and = {
			_pid: this.getProjectId()
		};
		
		let result = await ChatSessionModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
		let list = Array.isArray(result.list) ? result.list : [];
		
		// 收集所有需要查询的用户ID
		let targetUserIds = [];
		for (let k = 0; k < list.length; k++) {
			let item = list[k];
			let targetUserId = (item.CHAT_SESSION_USER_ID_A === userId)
				? item.CHAT_SESSION_USER_ID_B
				: item.CHAT_SESSION_USER_ID_A;
			
			item.TARGET_USER_ID = targetUserId || '';
			item.CHAT_SESSION_UNREAD = (item.CHAT_SESSION_USER_ID_A === userId)
				? (item.CHAT_SESSION_UNREAD_A || 0)
				: (item.CHAT_SESSION_UNREAD_B || 0);
			item.TARGET_USER_NAME = '用户';
			item.TARGET_USER_PIC = '';
			
			if (targetUserId) {
				targetUserIds.push(targetUserId);
			}
		}
		
		// 批量查询用户信息
		let users = {};
		if (targetUserIds.length > 0) {
			try {
				let userList = await UserModel.getAll(
					{ USER_MINI_OPENID: { $in: targetUserIds } },
					'USER_NAME,USER_PIC,USER_MINI_OPENID'
				);
				for (let user of userList) {
					users[user.USER_MINI_OPENID] = user;
				}
			} catch (err) {
				console.error('[chat session list user load failed]', err);
			}
		}
		
		// 填充用户信息
		for (let k = 0; k < list.length; k++) {
			let item = list[k];
			if (item.TARGET_USER_ID && users[item.TARGET_USER_ID]) {
				item.TARGET_USER_NAME = users[item.TARGET_USER_ID].USER_NAME || '用户';
				item.TARGET_USER_PIC = users[item.TARGET_USER_ID].USER_PIC || '';
			}
		}
		
		result.list = list;
		return result;
	}

	/** 获取消息列表 */
	async getMessageList(userId, {
		sessionId,
		page,
		size,
		isTotal = true,
		oldTotal
	}) {
		let session = await this._getSessionByAnyId(sessionId);
		if (!session) {
			return {
				list: [],
				page,
				size,
				total: 0,
				count: 0
			};
		}

		let orderBy = {
			'CHAT_ADD_TIME': 'desc'
		};
		
		let fields = '_id,CHAT_ID,CHAT_SESSION_ID,CHAT_FROM_USER_ID,CHAT_TO_USER_ID,CHAT_TYPE,CHAT_CONTENT,CHAT_READ,CHAT_ADD_TIME';
		let sessionIds = [session._id];
		if (session.CHAT_SESSION_ID && session.CHAT_SESSION_ID !== session._id) {
			sessionIds.push(session.CHAT_SESSION_ID);
		}
		
		let where = {
			or: sessionIds.map(id => ({ CHAT_SESSION_ID: id })),
			and: {
				_pid: this.getProjectId()
			}
		};
		
		let result = await ChatModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
		let msgList = Array.isArray(result.list) ? result.list : [];
		
		// 标记未读消息为已读（失败不影响主流程）
		let unreadMsgs = msgList.filter(item => item.CHAT_TO_USER_ID === userId && item.CHAT_READ === 0 && item._id);
		let maxUnreadToMark = Math.min(unreadMsgs.length, 10);
		for (let i = 0; i < maxUnreadToMark; i++) {
			try {
				await ChatModel.edit(unreadMsgs[i]._id, { CHAT_READ: 1 });
			} catch (err) {
				console.error('[mark msg read failed]', unreadMsgs[i]._id, err);
			}
		}
		
		// 重置会话未读数（失败不影响主流程）
		if (unreadMsgs.length > 0) {
			try {
				let updateData = {};
				if (session.CHAT_SESSION_USER_ID_A === userId) {
					updateData.CHAT_SESSION_UNREAD_A = 0;
				} else {
					updateData.CHAT_SESSION_UNREAD_B = 0;
				}
				await ChatSessionModel.edit(session._id || session.CHAT_SESSION_ID, updateData);
			} catch (err) {
				console.error('[reset session unread failed]', sessionId, err);
			}
		}
		
		return {
			...result,
			sessionInfo: {
				CHAT_SESSION_SOURCE_TYPE: session.CHAT_SESSION_SOURCE_TYPE || '',
				CHAT_SESSION_SOURCE_ID: session.CHAT_SESSION_SOURCE_ID || '',
				CHAT_SESSION_SOURCE_TITLE: session.CHAT_SESSION_SOURCE_TITLE || ''
			}
		};
	}

	/** 获取未读消息总数 */
	async getUnreadCount(userId) {
		let where = {};
		where.or = [
			{ CHAT_SESSION_USER_ID_A: userId },
			{ CHAT_SESSION_USER_ID_B: userId }
		];
		where.and = {
			_pid: this.getProjectId()
		};
		
		let list = await ChatSessionModel.getAll(where, 'CHAT_SESSION_USER_ID_A,CHAT_SESSION_USER_ID_B,CHAT_SESSION_UNREAD_A,CHAT_SESSION_UNREAD_B');
		
		let total = 0;
		for (let item of list) {
			if (item.CHAT_SESSION_USER_ID_A === userId) {
				total += item.CHAT_SESSION_UNREAD_A || 0;
			} else {
				total += item.CHAT_SESSION_UNREAD_B || 0;
			}
		}
		
		return total;
	}

}

module.exports = ChatService;
