'use strict'

{
    function init() {
        todays_recipe_reload();
    }

    const recipes = [
        // 野菜のおかず
        ["旬野菜（春）",1269],
        ["旬野菜（夏）",1301],
        ["旬野菜（秋・冬）",65],
        ["にんじん",521],
        ["たまねぎ",1333],
        ["じゃがいも",1332],
        ["キャベツ",523],
        ["きのこ",537],
        ["豆類",538],
        ["脇役野菜・珍しい野菜",1283],
        // お肉のおかず
        ["牛肉",71],
        ["豚肉",589],
        ["鶏肉",590],
        ["挽き肉",1403],
        ["ソーセージ",594],
        ["ハム",595],
        ["ベーコン",596],
        ["ラム肉",934],
        ["モツ",1504],
        // 魚介のおかず
        ["鮭・サーモン",66],
        ["いわし",543],
        ["さば",544],
        ["あじ",545],
        ["ぶり",546],
        ["さんま",547],
        ["鯛",548],
        ["マグロ",549],
        ["その他お魚",550],
        ["海老",551],
        ["イカ",552],
        ["たこ",553],
        ["貝類",554],
        ["蟹",558],
        ["ツナ缶",560],
        ["練り物",561],
        // ごはんもの
        ["どんぶりもの",25],
        ["カレー",26],
        ["オムライス",168],
        ["寿司",165],
        ["炒めご飯・チャーハン",163],
        ["炊き込み・まぜご飯",164],
        ["リゾット・雑炊類",169],
        ["アレンジごはん",166],
        // パスタ・グラタン
        ["トマト系パスタ",27],
        ["クリーム系パスタ",58],
        ["オイル・塩系パスタ",28],
        ["チーズ系パスタ",378],
        ["ジェノベーゼ",380],
        ["和風パスタ",133],
        ["冷製・アイデアパスタ",118],
        ["スープパスタ",379],
        ["ニョッキ",385],
        ["グラタン",386],
        ["ラザニア・ラビオリ",387],
        ["手作りパスタに挑戦",388],
        // 麺
        ["うどん",70],
        ["蕎麦",245],
        ["そうめん",247],
        ["中華麺",248],
        ["アジアの麺",249],
        ["手打ち麺に挑戦！",250],
        // シチュー・スープ・汁物
        ["シチュー・スープ・汁物",15],
        // サラダ
        ["サラダ",14],
        // コロッケ・メンチカツ
        ["コロッケ・メンチカツ",1627],
        // 鍋もの
        ["鍋もの",1607],
        // 粉もの
        ["粉もの",1641],
        // たまご・大豆加工品
        ["たまご・大豆加工品",13],
        // 海藻・乾物・こんにゃく
        ["海藻・乾物・こんにゃく",1436],
        // ソース・ドレッシング
        ["ソース・ドレッシング",1371],
        // ヘルシーおかず
        ["ヘルシーおかず",1643],
    ];
    
    function todays_recipe_reload() {
        const btn = document.getElementById('btn');

        btn.addEventListener('click', () => {
            const todays_recipes = create_todays_recipes();
            set_todays_recipes(todays_recipes);
        });
    }

    function create_todays_recipes() {
        const recipe_indexes = [];
        for (let i = 0; i < recipes.length; i++) {
            recipe_indexes[i] = i;
        }

        const todays_recipes = [];
        for (let i = 0; i < 3; i++) {
            const recipe_index = recipe_indexes.splice(Math.floor(Math.random() * recipe_indexes.length), 1)[0];
            todays_recipes[i] = recipes[recipe_index];
        }

        return todays_recipes;
    }

    function set_todays_recipes(todays_recipes) {
        const parent = document.getElementById('todays_recipes');

        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        for (let i = 0; i < todays_recipes.length; i++) {
            const child_div = document.createElement('div');

            const child_link = document.createElement('a');
            child_link.textContent = todays_recipes[i][0];
            child_link.href = 'https://cookpad.com/category/' + todays_recipes[i][1];
            child_link.setAttribute('target', '_blank');

            child_div.appendChild(child_link);
            parent.appendChild(child_div);
        }
    }

    init();
}