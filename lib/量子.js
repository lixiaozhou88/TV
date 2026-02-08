var rule = {
    title: '量子资源-明星专题',
    host: 'https://cj.lziapi.com',
    url: '/api.php/provide/vod/at/xml/',
    searchUrl: '/api.php/provide/vod/at/xml/?wd=**&pg=fypage',
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'PC_UA'
    },
    timeout: 5000,
    encoding: 'utf-8',
    play_parse: false,
    limit: 20,
    
    // 多个合集分类
    class_name: '儿童合集&汪汪队&小猪佩奇&超级飞侠',
    class_url: 'JOJO&wwd&xzpq&cjfx',
    
    // 定义每个分类对应的明星列表
    star_groups: {
'JOJO': ['超级宝贝JOJO', 
'安全警长','萌鸡小队','奥特曼国语','开心锤锤','百变校巴'
],
        'wwd': ['汪汪队'],
        'xzpq': ['小猪佩奇'],
        'cjfx': ['超级飞侠']
    },
    
    // 一级分类处理：根据分类获取对应的明星列表
    一级: `js:
        var d = [];
        
        // 获取当前分类对应的明星列表
        var stars = rule.star_groups[MY_CATE] || ['周星驰'];
        var allIds = {}; // 用于去重
        var groupName = '';
        
        // 根据分类代码获取分类名称
        var groupNames = {
            'hk_comedy': '香港喜剧',
            'kung_fu': '功夫巨星',
            'best_actor': '影帝精选',
            'goddess': '女神合集'
        };
        groupName = groupNames[MY_CATE] || '明星合集';
        
        log('当前分类: ' + groupName + '，包含明星: ' + stars.join(', '));
        
        // 遍历每个明星进行搜索
        stars.forEach(function(star) {
            try {
                var searchUrl = rule.host + '/api.php/provide/vod/at/xml/?wd=' + encodeURIComponent(star) + '&pg=' + MY_PAGE;
                var html = request(searchUrl);
                var xml = html;
                
                // 提取video节点
                var videoRegex = /<video>[\\s\\S]*?<\\/video>/g;
                var videos = xml.match(videoRegex) || [];
                
                log('搜索 [' + star + '] 找到 ' + videos.length + ' 个结果');
                
                videos.forEach(function(video) {
                    try {
                        var id = video.match(/<id>(\\d+)<\\/id>/) ? video.match(/<id>(\\d+)<\\/id>/)[1] : '';
                        var name = video.match(/<name>([\\s\\S]*?)<\\/name>/) ? video.match(/<name>([\\s\\S]*?)<\\/name>/)[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
                        var pic = video.match(/<pic>([\\s\\S]*?)<\\/pic>/) ? video.match(/<pic>([\\s\\S]*?)<\\/pic>/)[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
                        var note = video.match(/<note>([\\s\\S]*?)<\\/note>/) ? video.match(/<note>([\\s\\S]*?)<\\/note>/)[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
                        var last = video.match(/<last>([\\s\\S]*?)<\\/last>/) ? video.match(/<last>([\\s\\S]*?)<\\/last>/)[1] : '';
                        
                        // 去重：以ID为准
                        if (id && name && !allIds[id]) {
                            allIds[id] = true;
                            d.push({
                                vod_id: id,
                                vod_name: name,
                                vod_pic: pic,
                                vod_remarks: '[' + star + '] ' + (note || last || ''),
                                vod_content: ''
                            });
                        }
                    } catch(e) {
                        log('解析单个video失败:' + e.message);
                    }
                });
                
            } catch(e) {
                log('搜索[' + star + ']失败:' + e.message);
            }
        });
        
        // 按ID倒序排序（最新的在前）
        d.sort(function(a, b) {
            return parseInt(b.vod_id) - parseInt(a.vod_id);
        });
        
        log('分类 [' + groupName + '] 合并完成，共 ' + d.length + ' 条不重复结果');
        
        VODS = d;
    `,
    
    // 二级详情页
    二级: `js:
        try {
            var detailUrl = rule.host + '/api.php/provide/vod/at/xml/?ac=detail&ids=' + orId;
            var html = request(detailUrl);
            var xml = html;
            
            var videoMatch = xml.match(/<video>([\\s\\S]*?)<\\/video>/);
            if (videoMatch) {
                var video = videoMatch[0];
                
                var getXmlValue = function(tag) {
                    var regex = new RegExp('<' + tag + '>([\\\\s\\\\S]*?)<\\\\/' + tag + '>');
                    var match = video.match(regex);
                    return match ? match[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
                };
                
                var id = getXmlValue('id');
                var name = getXmlValue('name');
                var pic = getXmlValue('pic');
                var type = getXmlValue('type');
                var year = getXmlValue('year');
                var area = getXmlValue('area');
                var note = getXmlValue('note');
                var actor = getXmlValue('actor');
                var director = getXmlValue('director');
                var content = getXmlValue('des');
                
                // 解析播放地址
                var ddMatch = video.match(/<dd flag="([^"]*)">([\\s\\S]*?)<\\/dd>/g) || [];
                var playFromList = [];
                var playUrlList = [];
                
                ddMatch.forEach(function(dd) {
                    var flagMatch = dd.match(/flag="([^"]*)"/);
                    var flag = flagMatch ? flagMatch[1] : '量子资源';
                    var urlMatch = dd.match(/<dd[^>]*>([\\s\\S]*?)<\\/dd>/);
                    var urls = urlMatch ? urlMatch[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
                    
                    if (urls) {
                        playFromList.push(flag);
                        playUrlList.push(urls);
                    }
                });
                
                VOD = {
                    vod_id: id,
                    vod_name: name,
                    vod_pic: pic,
                    type_name: type,
                    vod_year: year,
                    vod_area: area,
                    vod_remarks: note,
                    vod_actor: actor,
                    vod_director: director,
                    vod_content: content,
                    vod_play_from: playFromList.join('$$$') || '量子资源',
                    vod_play_url: playUrlList.join('$$$') || ''
                };
            }
        } catch(e) {
            log('获取详情失败:' + e.message);
            VOD = {
                vod_id: orId,
                vod_name: '获取失败',
                vod_pic: '',
                vod_content: e.message
            };
        }
    `,
    
    // 搜索功能
    搜索: `js:
        var d = [];
        try {
            var html = request(input);
            var xml = html;
            
            var videoRegex = /<video>[\\s\\S]*?<\\/video>/g;
            var videos = xml.match(videoRegex) || [];
            
            videos.forEach(function(video) {
                try {
                    var id = video.match(/<id>(\\d+)<\\/id>/)[1];
                    var name = video.match(/<name>([\\s\\S]*?)<\\/name>/)[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim();
                    var pic = video.match(/<pic>([\\s\\S]*?)<\\/pic>/)[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim();
                    var note = video.match(/<note>([\\s\\S]*?)<\\/note>/) ? video.match(/<note>([\\s\\S]*?)<\\/note>/)[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
                    
                    if (id && name) {
                        d.push({
                            vod_id: id,
                            vod_name: name,
                            vod_pic: pic,
                            vod_remarks: note,
                            vod_content: ''
                        });
                    }
                } catch(e) {}
            });
        } catch(e) {
            log('搜索失败:' + e.message);
        }
        VODS = d;
    `,
    
    lazy: `js:
        input = /^http/.test(input) ? input : '';
    `
};
