let behavior = require('../../../../../comm/behavior/news_index_bh.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const GuideBiz = require('../../../biz/guide_biz.js');

Page({

	behaviors: [behavior], 

	onLoad: function (options) {
		ProjectBiz.initPage(this); 
		this._setCate(GuideBiz.getCateList(), options, null);  
	},


})