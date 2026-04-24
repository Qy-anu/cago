module.exports = { //campus
	PROJECT_COLOR: '#636DEA',
	NAV_COLOR: '#ffffff',
	NAV_BG: '#636DEA',


	// setup
	SETUP_CONTENT_ITEMS: [
		{ title: '关于我们', key: 'SETUP_CONTENT_ABOUT' },
		{ title: '联系我们', key: 'SETUP_CONTENT_CONTACT' },
	],

	// 用户
	USER_REG_CHECK: false,
	USER_FIELDS: [
		{ mark: 'sex', title: '性别', type: 'select', selectOptions: ['男', '女'], must: true },
		{ mark: 'college', title: '院系', type: 'text', must: true },
		{ mark: 'sub', title: '专业', type: 'text', must: true },
		{ mark: 'address', title: '学号', type: 'text', desc: '请输入学号', must: false, len: 9 },
	],
	USER_CHECK_FORM: {
		name: 'formName|must|string|min:1|max:30|name=昵称',
		mobile: 'formMobile|must|mobile|name=手机',
		pic: 'formPic|must|string|name=头像',
		forms: 'formForms|array'
	},

	NEWS_NAME: '通知公告',
	NEWS_CATE: [
		{ id: 1, title: '通知公告', style: 'leftbig1' },

	],
	NEWS_FIELDS: [
	],

	GUIDE_NAME: '新手指南',
	GUIDE_CATE: [
		{ id: 1, title: '新手指南', style: 'leftbig1' },
	],
	GUIDE_FIELDS: [
	],


	BOARD_NAME: '情绪社区',
	BOARD_CATE: [
		{ id: 1, title: '情绪社区', style: 'leftbig1' },

	],
	BOARD_FIELDS: [
		{ mark: 'to', title: 'To', desc: 'Ta的名字', type: 'text', must: true },
		{ mark: 'from', title: '署名', desc: '您的署名', type: 'text', must: false },
		{ mark: 'desc', title: '心情内容', desc: '想你所想，说你想说', type: 'textarea', must: true },
		{ mark: 'pic', title: '图片', type: 'image', min: 0, max: 8, must: false },

	],

	EMOTION_NAME: '新手指南',
	EMOTION_CATE: [
		{ id: 1, title: '心情分享', style: 'leftbig1' },
		{ id: 2, title: '烦恼倾诉', style: 'leftbig1' },
		{ id: 3, title: '求助帮助', style: 'leftbig1' },

	],
	EMOTION_FIELDS: [
		{ mark: 'title', title: '标题', desc: '给心情起个标题', type: 'text', must: false },
		{ mark: 'content', title: '内容', desc: '分享你的心情...', type: 'textarea', must: true },
		{ mark: 'pic', title: '图片', type: 'image', min: 0, max: 8, must: false },

	],


	JOB_NAME: '校园生活',
	JOB_CATE: [
		{ id: 1, title: '校内兼职', style: 'leftbig1' },
		{ id: 2, title: '技能交易', style: 'leftbig1' },
		{ id: 3, title: '跑腿服务', style: 'leftbig1' },
		{ id: 4, title: '搭子交友', style: 'leftbig1' },
    { id: 5, title: '其他', style: 'leftbig1' },
		

	],
	JOB_FIELDS: [
		{ mark: 'title', title: '物品名称', type: 'text', max: 50, must: true },
		{ mark: 'desc', title: '物品介绍', type: 'textarea', must: true },
		{ mark: 'pic', title: '物品图片', type: 'image', min: 0, max: 8, must: false }
	],

	LOST_NAME: '失物招领',
	LOST_CATE: [
		{ id: 1, title: '寻找物品', style: 'leftbig1' },
		{ id: 2, title: '寻找失主', style: 'leftbig1' },

	],
	LOST_FIELDS: [
		{ mark: 'title', title: '物品名称', type: 'text', max: 50, must: true },
		{ mark: 'desc', title: '简要过程', type: 'textarea', must: true },
		{ mark: 'pic', title: '物品图片', type: 'image', min: 0, max: 8, must: true }
	],

	LEAVE_NAME: '闲置',
	LEAVE_CATE: [
		{ id: 1, title: '书籍教辅', style: 'leftbig1' },
		{ id: 2, title: '生活用品', style: 'leftbig1' },
		{ id: 3, title: '数码电子', style: 'leftbig1' },
		{ id: 4, title: '交通出行', style: 'leftbig1' },
		{ id: 5, title: '衣服鞋帽', style: 'leftbig1' },
		{ id: 6, title: '运动器材', style: 'leftbig1' },
		{ id: 7, title: '其他', style: 'leftbig1' },

	],
	LEAVE_FIELDS: [
		{ mark: 'title', title: '物品名称', type: 'text', max: 50, must: true },
		{ mark: 'price', title: '物品价格', type: 'text', must: true },
		{ mark: 'desc', title: '物品介绍', type: 'textarea', must: true },
		{ mark: 'pic', title: '物品图片', type: 'image', min: 0, max: 8, must: true }
	],

	COMMENT_NAME: '评论',
	COMMENT_FIELDS: [
		{ mark: 'content', title: '评论内容', type: 'textarea', must: true },
		{ mark: 'img', title: '图片', type: 'image', min: 0, max: 8, must: false },

	],

}