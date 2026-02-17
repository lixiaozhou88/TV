globalThis.vod1 = function(ids) {
    let html1 = request('https://pbaccess.video.qq.com/trpc.videosearch.mobile_search.MultiTerminalSearch/MbSearch?vplatform=2', {
        body: {
            "version": "25042201",
            "clientType": 1,
            "filterValue": "",
            "uuid": "B1E50847-D25F-4C4B-BBA0-36F0093487F6",
            "retry": 0,
            "query": ids,
            "pagenum": 0,
            "isPrefetch": true,
            "pagesize": 30,
            "queryFrom": 0,
            "searchDatakey": "",
            "transInfo": "",
            "isneedQc": true,
            "preQid": "",
            "adClientInfo": "",
            "extraInfo": {
                "isNewMarkLabel": "1",
                "multi_terminal_pc": "1",
                "themeType": "1",
                "sugRelatedIds": "{}",
                "appVersion": ""
            }
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
            'Content-Type': 'application/json',
            'origin': 'https://v.qq.com',
            'referer': 'https://v.qq.com/'
        },
        'method': 'POST'
    }, true);
    return html1;
}

var rule = {
    title: '腾讯搜索源（点击触发搜索）',
    host: 'https://v.%71%71.com',
    homeUrl: '/x/bu/pagesheet/list?_all=1&append=1&channel=cartoon&listpage=1&offset=0&pagesize=21&iarea=-1&sort=18',
    searchUrl: '',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    url: '/x/bu/pagesheet/list?_all=1&append=1&channel=fyclass&listpage=1&offset=((fypage-1)*21)&pagesize=21&iarea=-1',
    filter_url: '',
    filter: {},
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36'
    },
    timeout: 5000,
    cate_exclude: '会员|游戏|全部',
    class_name: '少儿&动漫',
    class_url: 'child&cartoon',
    limit: 20,
    play_parse: false,
    lazy: '',

    // 一级：使用原选择器提取数据，并修改vod_id为msearch:标题
    一级: `js:
        let html = fetch(input, { headers: rule.headers });
        let items = pdfa(html, '.list_item');
        let list = [];
        items.forEach(item => {
            let title = pdfh(item, 'img&&alt');
            // 优先取data-original（懒加载真实图片），没有则取src，并自动补全完整URL
            let pic = pd(item, 'img&&data-original', MY_URL) || pd(item, 'img&&src', MY_URL) || '';
            let remark = pdfh(item, 'a&&Text') || '';
            if (title) {
                list.push({
                    vod_id: 'msearch:' + title,
                    vod_name: title,
                    vod_pic: pic,
                    vod_remarks: remark
                });
            }
        });
        VODS = list;
    `,

    二级: '',
    搜索: '',
    推荐: '',
};