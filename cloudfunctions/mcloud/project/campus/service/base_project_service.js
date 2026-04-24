/**
 * Notes: 业务基类 
 * Date: 2021-03-15 04:00:00 
 */

const dbUtil = require('../../../framework/database/db_util.js');
const util = require('../../../framework/utils/util.js');
const cloudUtil = require('../../../framework/cloud/cloud_util.js');
const AdminModel = require('../../../framework/platform/model/admin_model.js');
const NewsModel = require('../model/news_model.js');
const BaseService = require('../../../framework/platform/service/base_service.js');

class BaseProjectService extends BaseService {
	getProjectId() {
		return util.getProjectId();
	}

	async genDetailQr(type, id) {
		const BaseProjectAdminService = require('./admin/base_project_admin_service.js');
		let service = new BaseProjectAdminService();
		return service.genDetailQr(type, id);
	}

	async initSetup() {
		let F = (c) => 'bx_' + c;
		//const INSTALL_CL = 'setup_campus';
		//const COLLECTIONS = ['setup', 'admin', 'log', 'news', 'comment', 'fav', 'user', 'job', 'lost', 'leave', 'board'];
    const INSTALL_CL = 'setup_campus';
    const COLLECTIONS = ['setup', 'admin', 'log', 'news', 'guide', 'comment', 'fav', 'user', 'job', 'lost', 'leave', 'board', 'chat', 'chat_session'];

		const CONST_PIC = '/images/cover.gif';



		const NEWS_CATE = '1=通知公告';


		if (await dbUtil.isExistCollection(F(INSTALL_CL))) {
			return;
		}

		console.log('### initSetup...');

		let arr = COLLECTIONS;
		for (let k = 0; k < arr.length; k++) {
			if (!await dbUtil.isExistCollection(F(arr[k]))) {
				await dbUtil.createCollection(F(arr[k]));
			}
		}

		if (await dbUtil.isExistCollection(F('admin'))) {
			let adminCnt = await AdminModel.count({});
			if (adminCnt == 0) {
				let data = {};
				data.ADMIN_NAME = 'admin';
				data.ADMIN_PASSWORD = 'e10adc3949ba59abbe56e057f20f883e';
				data.ADMIN_DESC = '超管';
				data.ADMIN_TYPE = 1;
				await AdminModel.insert(data);
			}
		}


		if (await dbUtil.isExistCollection(F('news'))) {
			let newsCnt = await NewsModel.count({});
			if (newsCnt == 0) {
				let newsArr = NEWS_CATE.split(',');
				for (let j in newsArr) {
					let title = newsArr[j].split('=')[1];
					let cateId = newsArr[j].split('=')[0];

					let data = {};
					data.NEWS_TITLE = title + '标题1';
					data.NEWS_DESC = title + '简介1';
					data.NEWS_CATE_ID = cateId;
					data.NEWS_CATE_NAME = title;
					data.NEWS_CONTENT = [{ type: 'text', val: title + '内容1' }];
					data.NEWS_PIC = [CONST_PIC];

					await NewsModel.insert(data);
				}
			}
		}

		if (!await dbUtil.isExistCollection(F(INSTALL_CL))) {
			await dbUtil.createCollection(F(INSTALL_CL));
		}
	}

	_fixCloudFileId(fileId = '') {
		if (!fileId || typeof fileId !== 'string') return '';
		fileId = fileId.trim();
		if (!fileId) return '';

		if (
			fileId.startsWith('cloud://')
			|| fileId.startsWith('http://')
			|| fileId.startsWith('https://')
			|| fileId.startsWith('/')) {
			return fileId;
		}

		if (fileId.startsWith('cloud')) return 'cloud://' + fileId;
		return fileId;
	}

	async _transOneCloudFile(fileId = '') {
		fileId = this._fixCloudFileId(fileId);
		if (!fileId) return '';
		if (fileId.startsWith('http://') || fileId.startsWith('https://') || fileId.startsWith('/')) return fileId;

		try {
			let tempUrl = await cloudUtil.getTempFileURLOne(fileId);
			return tempUrl || fileId;
		} catch (err) {
			console.error('[trans cloud file failed]', fileId, err);
			return fileId;
		}
	}

	async transObjectCloudFiles(obj = {}, keys = []) {
		if (!obj || !keys || !keys.length) return obj;

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			obj[key] = await this._transOneCloudFile(obj[key]);
		}
		return obj;
	}

	async transArrayCloudFiles(obj = {}, keys = []) {
		if (!obj || !keys || !keys.length) return obj;

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let list = Array.isArray(obj[key]) ? obj[key] : [];
			obj[key] = await Promise.all(list.map(item => this._transOneCloudFile(item)));
		}
		return obj;
	}

	async transUserCloudFields(user = {}) {
		if (!user) return user;
		return await this.transObjectCloudFiles(user, ['USER_PIC']);
	}

	async transCommentCloudFields(comment = {}) {
		if (!comment) return comment;
		if (comment.user) comment.user = await this.transUserCloudFields(comment.user);
		if (comment.COMMENT_OBJ) comment.COMMENT_OBJ = await this.transArrayCloudFiles(comment.COMMENT_OBJ, ['img']);
		return comment;
	}

	async transJobCloudFields(job = {}) {
		if (!job) return job;
		if (job.user) job.user = await this.transUserCloudFields(job.user);
		if (job.JOB_OBJ) job.JOB_OBJ = await this.transArrayCloudFiles(job.JOB_OBJ, ['pic']);
		return job;
	}

	async transLeaveCloudFields(leave = {}) {
		if (!leave) return leave;
		if (leave.user) leave.user = await this.transUserCloudFields(leave.user);
		if (leave.LEAVE_OBJ) leave.LEAVE_OBJ = await this.transArrayCloudFiles(leave.LEAVE_OBJ, ['pic']);
		return leave;
	}

}

module.exports = BaseProjectService;