/**
 * Notes: 路由配置文件
  * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * User: CC
 * Date: 2020-10-14 07:00:00
 */

module.exports = {
	'test/test': 'test/test_controller@test',

	'home/setup_get': 'home_controller@getSetup',

	'passport/login': 'passport_controller@login',
	'passport/phone': 'passport_controller@getPhone',
	'passport/my_detail': 'passport_controller@getMyDetail',
	'passport/register': 'passport_controller@register',
	'passport/edit_base': 'passport_controller@editBase',

	// 收藏
	'fav/update': 'fav_controller@updateFav',
	'fav/del': 'fav_controller@delFav',
	'fav/is_fav': 'fav_controller@isFav',
	'fav/my_list': 'fav_controller@getMyFavList',

	'admin/home': 'admin/admin_home_controller@adminHome',
	'admin/clear_vouch': 'admin/admin_home_controller@clearVouchData',

	'admin/login': 'admin/admin_mgr_controller@adminLogin',
	'admin/mgr_list': 'admin/admin_mgr_controller@getMgrList',
	'admin/mgr_insert': 'admin/admin_mgr_controller@insertMgr#demo',
	'admin/mgr_del': 'admin/admin_mgr_controller@delMgr#demo',
	'admin/mgr_detail': 'admin/admin_mgr_controller@getMgrDetail',
	'admin/mgr_edit': 'admin/admin_mgr_controller@editMgr#demo',
	'admin/mgr_status': 'admin/admin_mgr_controller@statusMgr#demo',
	'admin/mgr_pwd': 'admin/admin_mgr_controller@pwdMgr#demo',
	'admin/log_list': 'admin/admin_mgr_controller@getLogList',
	'admin/log_clear': 'admin/admin_mgr_controller@clearLog#demo',

	'admin/setup_set': 'admin/admin_setup_controller@setSetup#demo',
	'admin/setup_set_content': 'admin/admin_setup_controller@setContentSetup#demo',
	'admin/setup_qr': 'admin/admin_setup_controller@genMiniQr',

	// 用户
	'admin/user_list': 'admin/admin_user_controller@getUserList',
	'admin/user_detail': 'admin/admin_user_controller@getUserDetail',
	'admin/user_del': 'admin/admin_user_controller@delUser#demo',
	'admin/user_status': 'admin/admin_user_controller@statusUser#demo',

	'admin/user_data_get': 'admin/admin_user_controller@userDataGet',
	'admin/user_data_export': 'admin/admin_user_controller@userDataExport',
	'admin/user_data_del': 'admin/admin_user_controller@userDataDel',


	// 内容
	'home/list': 'home_controller@getHomeList',
	'news/list': 'news_controller@getNewsList',
	'news/view': 'news_controller@viewNews',

	'admin/news_list': 'admin/admin_news_controller@getAdminNewsList',
	'admin/news_insert': 'admin/admin_news_controller@insertNews#demo',
	'admin/news_detail': 'admin/admin_news_controller@getNewsDetail',
	'admin/news_edit': 'admin/admin_news_controller@editNews#demo',
	'admin/news_update_forms': 'admin/admin_news_controller@updateNewsForms#demo',
	'admin/news_update_pic': 'admin/admin_news_controller@updateNewsPic#demo',
	'admin/news_update_content': 'admin/admin_news_controller@updateNewsContent#demo',
	'admin/news_del': 'admin/admin_news_controller@delNews#demo',
	'admin/news_sort': 'admin/admin_news_controller@sortNews#demo',
	'admin/news_status': 'admin/admin_news_controller@statusNews#demo',
	'admin/news_vouch': 'admin/admin_news_controller@vouchNews#demo',

	// 新手指南
	'guide/list': 'guide_controller@getGuideList',
	'guide/view': 'guide_controller@viewGuide',

	'admin/guide_list': 'admin/admin_guide_controller@getAdminGuideList',
	'admin/guide_insert': 'admin/admin_guide_controller@insertGuide#demo',
	'admin/guide_detail': 'admin/admin_guide_controller@getGuideDetail',
	'admin/guide_edit': 'admin/admin_guide_controller@editGuide#demo',
	'admin/guide_update_forms': 'admin/admin_guide_controller@updateGuideForms#demo',
	'admin/guide_update_pic': 'admin/admin_guide_controller@updateGuidePic#demo',
	'admin/guide_update_content': 'admin/admin_guide_controller@updateGuideContent#demo',
	'admin/guide_del': 'admin/admin_guide_controller@delGuide#demo',
	'admin/guide_sort': 'admin/admin_guide_controller@sortGuide#demo',
	'admin/guide_status': 'admin/admin_guide_controller@statusGuide#demo',
	'admin/guide_vouch': 'admin/admin_guide_controller@vouchGuide#demo',

	// 兼职
	'job/list': 'job_controller@getJobList',
	'job/insert': 'job_controller@insertJob',
	'job/edit': 'job_controller@editJob',
	'job/status': 'job_controller@statusJob',
	'job/update_forms': 'job_controller@updateJobForms',
	'job/del': 'job_controller@delJob',
	'job/view': 'job_controller@viewJob',
	'job/like': 'job_controller@likeJob',
	'job/detail': 'job_controller@getJobDetail',

	'admin/job_detail': 'admin/admin_job_controller@getAdminJobDetail',
	'admin/job_list': 'admin/admin_job_controller@getAdminJobList',
	'admin/job_status': 'admin/admin_job_controller@statusJob#demo',
	'admin/job_del': 'admin/admin_job_controller@delJob#demo',
	'admin/job_sort': 'admin/admin_job_controller@sortJob#demo',
	'admin/job_data_get': 'admin/admin_job_controller@jobDataGet',
	'admin/job_data_export': 'admin/admin_job_controller@jobDataExport',
	'admin/job_data_del': 'admin/admin_job_controller@jobDataDel',


	// 表白墙
	'board/list': 'board_controller@getBoardList',
	'board/insert': 'board_controller@insertBoard',
	'board/edit': 'board_controller@editBoard',
	'board/status': 'board_controller@statusBoard',
	'board/update_forms': 'board_controller@updateBoardForms',
	'board/del': 'board_controller@delBoard',
	'board/view': 'board_controller@viewBoard',
	'board/like': 'board_controller@likeBoard',
	'board/detail': 'board_controller@getBoardDetail',

	// 情绪互助社区
	'emotion/list': 'emotion_controller@getEmotionList',
	'emotion/insert': 'emotion_controller@insertEmotion',
	'emotion/edit': 'emotion_controller@editEmotion',
	'emotion/status': 'emotion_controller@statusEmotion',
	'emotion/update_forms': 'emotion_controller@updateEmotionForms',
	'emotion/del': 'emotion_controller@delEmotion',
	'emotion/view': 'emotion_controller@viewEmotion',
	'emotion/like': 'emotion_controller@likeEmotion',
	'emotion/fav': 'emotion_controller@favEmotion',
	'emotion/detail': 'emotion_controller@getEmotionDetail',

	'admin/board_detail': 'admin/admin_board_controller@getAdminBoardDetail',
	'admin/board_list': 'admin/admin_board_controller@getAdminBoardList',
	'admin/board_status': 'admin/admin_board_controller@statusBoard#demo',
	'admin/board_del': 'admin/admin_board_controller@delBoard#demo',
	'admin/board_sort': 'admin/admin_board_controller@sortBoard#demo',
	'admin/board_data_get': 'admin/admin_board_controller@boardDataGet',
	'admin/board_data_export': 'admin/admin_board_controller@boardDataExport',
	'admin/board_data_del': 'admin/admin_board_controller@boardDataDel',

	// 失物招领
	'lost/list': 'lost_controller@getLostList',
	'lost/insert': 'lost_controller@insertLost',
	'lost/edit': 'lost_controller@editLost',
	'lost/status': 'lost_controller@statusLost',
	'lost/update_forms': 'lost_controller@updateLostForms',
	'lost/del': 'lost_controller@delLost',
	'lost/view': 'lost_controller@viewLost',
	'lost/like': 'lost_controller@likeLost',
	'lost/detail': 'lost_controller@getLostDetail',

	'admin/lost_detail': 'admin/admin_lost_controller@getAdminLostDetail',
	'admin/lost_list': 'admin/admin_lost_controller@getAdminLostList',
	'admin/lost_status': 'admin/admin_lost_controller@statusLost#demo',
	'admin/lost_del': 'admin/admin_lost_controller@delLost#demo',
	'admin/lost_sort': 'admin/admin_lost_controller@sortLost#demo',
	'admin/lost_data_get': 'admin/admin_lost_controller@lostDataGet',
	'admin/lost_data_export': 'admin/admin_lost_controller@lostDataExport',
	'admin/lost_data_del': 'admin/admin_lost_controller@lostDataDel',

	// 闲置
	'leave/list': 'leave_controller@getLeaveList',
	'leave/insert': 'leave_controller@insertLeave',
	'leave/edit': 'leave_controller@editLeave',
	'leave/status': 'leave_controller@statusLeave',
	'leave/update_forms': 'leave_controller@updateLeaveForms',
	'leave/del': 'leave_controller@delLeave',
	'leave/view': 'leave_controller@viewLeave',
	'leave/like': 'leave_controller@likeLeave',
	'leave/detail': 'leave_controller@getLeaveDetail',

	'admin/leave_detail': 'admin/admin_leave_controller@getAdminLeaveDetail',
	'admin/leave_list': 'admin/admin_leave_controller@getAdminLeaveList',
	'admin/leave_status': 'admin/admin_leave_controller@statusLeave#demo',
	'admin/leave_del': 'admin/admin_leave_controller@delLeave#demo',
	'admin/leave_sort': 'admin/admin_leave_controller@sortLeave#demo',
	'admin/leave_data_get': 'admin/admin_leave_controller@leaveDataGet',
	'admin/leave_data_export': 'admin/admin_leave_controller@leaveDataExport',
	'admin/leave_data_del': 'admin/admin_leave_controller@leaveDataDel',

	// 评论
	'comment/list': 'comment_controller@getCommentList',
	'comment/insert': 'comment_controller@insertComment',
	'comment/update_forms': 'comment_controller@updateCommentForms',
	'comment/del': 'comment_controller@delComment',
	'comment/like': 'comment_controller@likeComment',

	'chat/get_session': 'chat_controller@getOrCreateSession',
	'chat/send': 'chat_controller@sendMessage',
	'chat/session_list': 'chat_controller@getSessionList',
	'chat/message_list': 'chat_controller@getMessageList',
	'chat/unread_count': 'chat_controller@getUnreadCount',
}