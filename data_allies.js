// ========================================
// Cross Legends - 味方キャラクターデータ
// ========================================

// プレイアブルキャラクター
const CHARACTERS = {
    keke: {
        id: 'keke',
        name: '唐可可',
        displayName: '唐可可',
        stats: {
            hp: 190,
            mp: 140,
            physicalAttack: 75,
            magicAttack: 35,
            physicalDefense: 145,
            magicDefense: 105,
            speed: 70,
            luck: 50
        },
        type: 'tank',
        uniqueSkill: {
            id: 'taunt',
            displayName: '星屑クルージング',
            basePower: 0,
            mpCost: 40,
            priority: 'first',
            effects: [
                { type: 'taunt', duration: 3 },
                { type: 'buff', stat: 'physicalDefense', value: 0.25, duration: 3 },
                { type: 'buff', stat: 'magicDefense', value: 0.25, duration: 3 }
            ],
            description: '3ターン挑発+自分の物防/魔防+25%（先制）',
        },
        image: {
            full: 'img/keke_full.png',
            face: 'img/keke_face.png'
        },
        skills: [],
        excludeSkills: ['taunt']
    },
    sky: {
        id: 'sky',
        name: 'キュアスカイ',
        displayName: 'キュアスカイ',
        stats: {
            hp: 135,
            mp: 175,
            physicalAttack: 140,
            magicAttack: 35,
            physicalDefense: 60,
            magicDefense: 55,
            speed: 110,
            luck: 95
        },
        type: 'physical_attacker',
        uniqueSkill: {
            id: 'ultra_attack',
            displayName: 'スカイパンチ',
            basePower: 220,
            mpCost: 60,
            effects: [],
            description: '単体に強力な物理攻撃（威力220%）',
        },
        image: {
            full: 'img/sky_full.png',
            face: 'img/sky_face.png'
        },
        skills: [],
        excludeSkills: ['ultra_attack']
    },
    josuke: {
        id: 'josuke',
        name: '東方仗助',
        displayName: '東方仗助',
        stats: {
            hp: 125,
            mp: 225,
            physicalAttack: 110,
            magicAttack: 50,
            physicalDefense: 85,
            magicDefense: 85,
            speed: 95,
            luck: 60
        },
        type: 'healer',
        uniqueSkill: {
            id: 'heal',
            displayName: 'クレイジー・D',
            healPercent: 48,
            mpCost: 35,
            description: '単体HP 48%回復',
        },
        image: {
            full: 'img/josuke_full.png',
            face: 'img/josuke_face.png'
        },
        skills: [],
        excludeSkills: ['heal']
    },
    yoshiko: {
        id: 'yoshiko',
        name: '津島善子',
        displayName: '津島善子',
        stats: {
            hp: 110,
            mp: 170,
            physicalAttack: 40,
            magicAttack: 120,
            physicalDefense: 60,
            magicDefense: 120,
            speed: 100,
            luck: 0
        },
        type: 'debuffer',
        uniqueSkill: {
            id: 'daten_bind',
            displayName: '堕天龍鳳凰縛',
            basePower: 0,
            mpCost: 25,
            type: 'debuff',
            target: 'single_enemy',
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '敵単体を麻痺状態にする（3T）',
        },
        image: {
            full: 'img/yoshiko_full.png',
            face: 'img/yoshiko_face.png'
        },
        skills: []
    },
    lucario: {
        id: 'lucario',
        name: 'ルカリオ',
        displayName: 'ルカリオ',
        stats: {
            hp: 130,
            mp: 185,
            physicalAttack: 110,
            magicAttack: 120,
            physicalDefense: 70,
            magicDefense: 70,
            speed: 90,
            luck: 60
        },
        type: 'support',
        uniqueSkill: {
            id: 'aura_sphere',
            displayName: 'はどうだん',
            basePower: 170,
            mpCost: 30,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [],
            description: '単体に魔法攻撃（威力170%）',
        },
        image: {
            full: 'img/Lucario_full.png',
            face: 'img/Lucario_face.png'
        },
        skills: [],
        excludeSkills: ['magic_shot']
    },
    setsuna: {
        id: 'setsuna',
        name: '優木せつ菜',
        displayName: '優木せつ菜',
        stats: {
            hp: 120,
            mp: 150,
            physicalAttack: 60,
            magicAttack: 140,
            physicalDefense: 110,
            magicDefense: 80,
            speed: 80,
            luck: 50
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'scarlet_storm',
            displayName: 'せつ菜⭐︎スカーレットストーム',
            basePower: 90,
            mpCost: 50,
            target: 'all_enemies',
            type: 'magic_attack',
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力90%）＋火傷にする（3T）',
        },
        image: {
            full: 'img/setsuna_full.png',
            face: 'img/setsuna_face.png'
        },
        skills: [],
        excludeSkills: ['wide_attack']
    },
    ceras: {
        id: 'ceras',
        name: 'セラス・柳田・リリエンフェルト',
        displayName: 'セラス',
        stats: {
            hp: 150,
            mp: 190,
            physicalAttack: 40,
            magicAttack: 90,
            physicalDefense: 110,
            magicDefense: 120,
            speed: 60,
            luck: 60
        },
        type: 'healer',
        uniqueSkill: {
            id: 'fusion_crust',
            displayName: 'フュージョンクラスト',
            healPercent: 36,
            mpCost: 80,
            type: 'revive',
            target: 'single_ally_dead',
            effects: [],
            description: '戦闘不能の味方をHP36%で蘇生',
        },
        image: {
            full: 'img/Ceras_full.png',
            face: 'img/Ceras_face.png'
        },
        skills: [],
        excludeSkills: ['revive']
    },
    kuroo: {
        id: 'kuroo',
        name: '黒尾鉄朗',
        displayName: '黒尾鉄朗',
        stats: {
            hp: 180,
            mp: 130,
            physicalAttack: 90,
            magicAttack: 30,
            physicalDefense: 130,
            magicDefense: 110,
            speed: 60,
            luck: 60
        },
        type: 'tank',
        uniqueSkill: {
            id: 'doshatto',
            displayName: 'ドシャット',
            mpCost: 35,
            type: 'buff',
            target: 'self',
            effects: [
                { type: 'buff', stat: 'physicalDefense', value: 0.15, duration: 3 },
                { type: 'buff', stat: 'magicDefense', value: 0.15, duration: 3 },
                { type: 'counter', power: 180, duration: 3 }
            ],
            description: '物防・魔防+15%、反撃状態（威力180%）3T',
        },
        image: {
            full: 'img/kuroo_full.png',
            face: 'img/kuroo_face.png'
        },
        skills: [],
        excludeSkills: ['counter_stance']
    },
    shiki: {
        id: 'shiki',
        name: '若菜四季',
        displayName: '若菜四季',
        stats: {
            hp: 110,
            mp: 190,
            physicalAttack: 50,
            magicAttack: 80,
            physicalDefense: 70,
            magicDefense: 140,
            speed: 80,
            luck: 60
        },
        type: 'support',
        uniqueSkill: {
            id: 'delorieran',
            displayName: 'デロリエラン',
            mpCost: 50,
            type: 'mp_heal',
            target: 'all_allies',
            mpHealPercent: 35,
            description: '味方全体のMP 35%回復'
        },
        image: {
            full: 'img/shiki_full.png',
            face: 'img/shiki_face.png'
        },
        skills: [],
        excludeSkills: ['mp_restore']
    },
    shizuku: {
        id: 'shizuku',
        name: '桜坂しずく',
        displayName: '桜坂しずく',
        stats: {
            hp: 135,
            mp: 190,
            physicalAttack: 50,
            magicAttack: 95,
            physicalDefense: 75,
            magicDefense: 130,
            speed: 80,
            luck: 55
        },
        type: 'healer',
        uniqueSkill: {
            id: 'kiraboshi_oath',
            displayName: '綺羅星の誓い',
            mpCost: 60,
            type: 'heal',
            target: 'all_allies',
            healPercent: 25,
            description: '味方全体HP 25%回復'
        },
        image: {
            full: 'img/shizuku_full.png',
            face: 'img/shizuku_face.png'
        },
        skills: [],
        excludeSkills: ['heal_all']
    },
    gojo: {
        id: 'satoru',
        name: '五条悟',
        displayName: '五条悟',
        stats: {
            hp: 125,
            mp: 185,
            physicalAttack: 55,
            magicAttack: 140,
            physicalDefense: 75,
            magicDefense: 95,
            speed: 115,
            luck: 60
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'reversal_red',
            displayName: '術式反転「赫」',
            basePower: 200,
            mpCost: 55,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [],
            description: '単体に強力な魔法攻撃（威力200%）'
        },
        image: {
            full: 'img/satoru_full.png',
            face: 'img/satoru_face.png'
        },
        skills: [],
        excludeSkills: ['strong_magic_shot']
    },
    blastoise: {
        id: 'blastoise',
        name: 'カメックス',
        displayName: 'カメックス',
        stats: {
            hp: 200,
            mp: 155,
            physicalAttack: 60,
            magicAttack: 120,
            physicalDefense: 150,
            magicDefense: 125,
            speed: 55,
            luck: 30
        },
        type: 'tank',
        uniqueSkill: {
            id: 'gmax',
            displayName: 'キョダイマックス',
            mpCost: 70,
            type: 'buff',
            target: 'self',
            priority: 'first',
            effects: [
                { type: 'status', status: 'gmax', duration: 4 },
                { type: 'buff', stat: 'physicalAttack', value: 1.0, duration: 4 },
                { type: 'buff', stat: 'magicAttack', value: 1.0, duration: 4 },
                { type: 'buff', stat: 'physicalDefense', value: 1.0, duration: 4 },
                { type: 'buff', stat: 'magicDefense', value: 1.0, duration: 4 },
                { type: 'buff', stat: 'speed', value: 1.0, duration: 4 },
                { type: 'buff', stat: 'luck', value: 1.0, duration: 4 }
            ],
            description: '4T 全ステータス+100% & 巨体化（先制）'
        },
        image: {
            full: 'img/blastoise_full.png',
            face: 'img/blastoise_face.png'
        },
        skills: []
    },
    kaede: {
        id: 'kaede',
        name: '高垣楓',
        displayName: '高垣楓',
        stats: {
            hp: 130,
            mp: 210,
            physicalAttack: 40,
            magicAttack: 110,
            physicalDefense: 70,
            magicDefense: 120,
            speed: 90,
            luck: 70
        },
        type: 'healer',
        uniqueSkill: {
            id: 'koikaze',
            displayName: 'こいかぜ',
            mpCost: 60,
            type: 'heal',
            target: 'all_allies',
            healPercent: 30,
            description: '全体HP 30%回復'
        },
        image: {
            full: 'img/kaede_full.png',
            face: 'img/kaede_face.png'
        },
        skills: [],
        excludeSkills: ['heal_all']
    },
    kirby: {
        id: 'kirby',
        name: 'カービィ',
        displayName: 'カービィ',
        stats: {
            hp: 130,
            mp: 190,
            physicalAttack: 90,
            magicAttack: 90,
            physicalDefense: 80,
            magicDefense: 80,
            speed: 100,
            luck: 100
        },
        type: 'support',
        uniqueSkill: {
            id: 'inhale',
            displayName: '吸い込み',
            mpCost: 25,
            type: 'cure',
            target: 'all_allies',
            description: '味方全体の状態異常を全て解除'
        },
        image: {
            full: 'img/kirby_full.png',
            face: 'img/kirby_face.png'
        },
        skills: [],
        excludeSkills: ['cure_status']
    },
    mari: {
        id: 'mari',
        name: 'マリ',
        displayName: 'マリ',
        stats: {
            hp: 185,
            mp: 160,
            physicalAttack: 60,
            magicAttack: 120,
            physicalDefense: 135,
            magicDefense: 125,
            speed: 65,
            luck: 40
        },
        type: 'tank',
        uniqueSkill: {
            id: 'shiny_tornado',
            displayName: 'シャイニートルネード',
            basePower: 150,
            mpCost: 60,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [
                { type: 'taunt', duration: 3 }
            ],
            description: '単体魔法攻撃（威力150%）＋3T挑発状態'
        },
        image: {
            full: 'img/mari_full.png',
            face: 'img/mari_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    jyotaro: {
        id: 'jyotaro',
        name: '空条承太郎',
        displayName: '空条承太郎',
        stats: {
            hp: 140,
            mp: 140,
            physicalAttack: 135,
            magicAttack: 35,
            physicalDefense: 95,
            magicDefense: 75,
            speed: 120,
            luck: 65
        },
        type: 'physical_attacker',
        uniqueSkill: {
            id: 'star_platinum',
            displayName: 'スタープラチナ',
            basePower: 22,
            mpCost: 60,
            type: 'physical_attack',
            target: 'single_enemy',
            hits: 10,
            effects: [],
            description: '単体物理攻撃（10回連続攻撃、威力22%）'
        },
        image: {
            full: 'img/jyotaro_full.png',
            face: 'img/jyotaro_face.png'
        },
        skills: [],
        excludeSkills: ['ultra_attack']
    },
    blueeyes: {
        id: 'blueeyes',
        name: '青眼の白龍',
        displayName: '青眼の白龍',
        stats: {
            hp: 120,
            mp: 185,
            physicalAttack: 55,
            magicAttack: 150,
            physicalDefense: 70,
            magicDefense: 90,
            speed: 90,
            luck: 60
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'burst_stream',
            displayName: '滅びの爆裂疾風弾',
            basePower: 140,
            mpCost: 50,
            type: 'magic_attack',
            target: 'single_enemy',
            critBonus: 40,
            effects: [],
            description: '単体魔法攻撃（威力140%、高クリティカル）'
        },
        image: {
            full: 'img/blueeyes_full.png',
            face: 'img/blueeyes_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    marco: {
        id: 'marco',
        name: 'マルコ',
        displayName: 'マルコ',
        stats: {
            hp: 130,
            mp: 205,
            physicalAttack: 115,
            magicAttack: 65,
            physicalDefense: 80,
            magicDefense: 90,
            speed: 105,
            luck: 70
        },
        type: 'healer',
        uniqueSkill: {
            id: 'pineapple_stake',
            displayName: '鳳梨磔',
            mpCost: 45,
            type: 'heal',
            target: 'all_allies',
            healPercent: 20,
            description: '味方全体HP 20%回復'
        },
        image: {
            full: 'img/marco_full.png',
            face: 'img/marco_face.png'
        },
        skills: [],
        excludeSkills: ['heal_all']
    },
    doraemon: {
        id: 'doraemon',
        name: 'ドラえもん',
        displayName: 'ドラえもん',
        stats: {
            hp: 125,
            mp: 210,
            physicalAttack: 80,
            magicAttack: 95,
            physicalDefense: 85,
            magicDefense: 85,
            speed: 100,
            luck: 65
        },
        type: 'support',
        uniqueSkill: {
            id: 'big_light',
            displayName: 'ビッグライト',
            mpCost: 50,
            type: 'buff',
            target: 'all_allies',
            effects: [
                { type: 'buff', stat: 'physicalAttack', value: 0.5, duration: 3 },
                { type: 'buff', stat: 'magicAttack', value: 0.5, duration: 3 }
            ],
            description: '味方全体の物攻・魔攻+50%（3T）'
        },
        image: {
            full: 'img/doraemon_full.png',
            face: 'img/doraemon_face.png'
        },
        skills: [],
        excludeSkills: ['attack_boost_all']
    },
    frieren: {
        id: 'frieren',
        name: 'フリーレン',
        displayName: 'フリーレン',
        stats: {
            hp: 115,
            mp: 200,
            physicalAttack: 45,
            magicAttack: 145,
            physicalDefense: 75,
            magicDefense: 110,
            speed: 85,
            luck: 55
        },
        type: 'debuffer',
        uniqueSkill: {
            id: 'judrajim',
            displayName: '破滅の雷を放つ魔法 - ジュドラジルム',
            basePower: 140,
            mpCost: 65,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '単体魔法攻撃（威力140%）＋麻痺（3T）'
        },
        image: {
            full: 'img/frieren_full.png',
            face: 'img/frieren_face.png'
        },
        skills: [],
        excludeSkills: ['magic_impact']
    },
    hajime: {
        id: 'hajime',
        name: '梅宮一',
        displayName: '梅宮一',
        stats: {
            hp: 200,
            mp: 140,
            physicalAttack: 85,
            magicAttack: 25,
            physicalDefense: 140,
            magicDefense: 100,
            speed: 50,
            luck: 60
        },
        type: 'tank',
        uniqueSkill: {
            id: 'teppen_strike',
            displayName: 'てっぺんの一撃',
            basePower: 220,
            mpCost: 60,
            type: 'physical_attack',
            target: 'single_enemy',
            effects: [],
            description: '単体に強力な物理攻撃（威力220%）'
        },
        image: {
            full: 'img/hajime_full.png',
            face: 'img/hajime_face.png'
        },
        skills: [],
        excludeSkills: ['ultra_attack']
    },
    gaara: {
        id: 'gaara',
        name: '我愛羅',
        displayName: '我愛羅',
        stats: {
            hp: 150,
            mp: 140,
            physicalAttack: 110,
            magicAttack: 50,
            physicalDefense: 150,
            magicDefense: 120,
            speed: 55,
            luck: 40
        },
        type: 'tank',
        uniqueSkill: {
            id: 'sand_coffin',
            displayName: '砂縛柩',
            basePower: 0,
            mpCost: 25,
            type: 'debuff',
            target: 'single_enemy',
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '敵単体を麻痺状態にする（3T）'
        },
        image: {
            full: 'img/gaara_full.png',
            face: 'img/gaara_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    yami: {
        id: 'yami',
        name: 'ヤミ・スケヒロ',
        displayName: 'ヤミ・スケヒロ',
        stats: {
            hp: 140,
            mp: 135,
            physicalAttack: 155,
            magicAttack: 30,
            physicalDefense: 75,
            magicDefense: 50,
            speed: 95,
            luck: 70
        },
        type: 'physical_attacker',
        uniqueSkill: {
            id: 'dark_slash',
            displayName: '闇纏・次元斬り',
            basePower: 150,
            mpCost: 30,
            type: 'physical_attack',
            target: 'single_enemy',
            effects: [
                { type: 'debuff', stat: 'physicalDefense', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.15, duration: 3 }
            ],
            description: '単体物理攻撃（威力150%）＋敵の防御-15% 3ターン'
        },
        image: {
            full: 'img/yami_full.png',
            face: 'img/yami_face.png'
        },
        skills: [],
        excludeSkills: ['strong_attack']
    },
    gintoki: {
        id: 'gintoki',
        name: '坂田銀時',
        displayName: '坂田銀時',
        stats: {
            hp: 130,
            mp: 135,
            physicalAttack: 140,
            magicAttack: 25,
            physicalDefense: 85,
            magicDefense: 70,
            speed: 105,
            luck: 85
        },
        type: 'physical_attacker',
        uniqueSkill: {
            id: 'mentan_ken',
            displayName: 'メンタンピンドラドラドラゴンショウリュウケン',
            basePower: 150,
            mpCost: 30,
            type: 'physical_attack',
            target: 'single_enemy',
            effects: [
                { type: 'debuff', stat: 'physicalAttack', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'magicAttack', value: -0.15, duration: 3 }
            ],
            description: '単体物理攻撃（威力150%）＋攻撃-15% 3T'
        },
        image: {
            full: 'img/gintoki_full.png',
            face: 'img/gintoki_face.png'
        },
        skills: [],
        excludeSkills: ['strong_attack']
    },
    yor: {
        id: 'yor',
        name: 'ヨル・フォージャー',
        displayName: 'ヨル・フォージャー',
        stats: {
            hp: 120,
            mp: 115,
            physicalAttack: 150,
            magicAttack: 20,
            physicalDefense: 60,
            magicDefense: 55,
            speed: 125,
            luck: 90
        },
        type: 'physical_attacker',
        uniqueSkill: {
            id: 'assassination',
            displayName: '暗殺術',
            basePower: 65,
            mpCost: 40,
            type: 'physical_attack',
            target: 'single_enemy',
            hits: 2,
            critBonus: 40,
            effects: [],
            description: '単体物理攻撃（2連続、威力65%）＋クリティカル率+40%（この攻撃のみ）'
        },
        image: {
            full: 'img/yor_full.png',
            face: 'img/yor_face.png'
        },
        skills: [],
        excludeSkills: ['double_attack']
    },
    naruto: {
        id: 'naruto',
        name: 'うずまきナルト',
        displayName: 'うずまきナルト',
        stats: {
            hp: 145,
            mp: 130,
            physicalAttack: 120,
            magicAttack: 135,
            physicalDefense: 75,
            magicDefense: 65,
            speed: 100,
            luck: 75
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'rasengan',
            displayName: '螺旋丸',
            basePower: 220,
            mpCost: 60,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [],
            description: '単体に強力な魔法攻撃（威力220%）'
        },
        image: {
            full: 'img/naruto_full.png',
            face: 'img/naruto_face.png'
        },
        skills: [],
        excludeSkills: ['strong_magic_shot']
    },
    roy: {
        id: 'roy',
        name: 'ロイ・マスタング',
        displayName: 'ロイ・マスタング',
        stats: {
            hp: 115,
            mp: 175,
            physicalAttack: 35,
            magicAttack: 145,
            physicalDefense: 65,
            magicDefense: 90,
            speed: 95,
            luck: 70
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'flame_alchemy',
            displayName: '焔の錬金術',
            basePower: 200,
            mpCost: 60,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '単体魔法攻撃（威力200%）＋火傷100% 3ターン'
        },
        image: {
            full: 'img/roy_full.png',
            face: 'img/roy_face.png'
        },
        skills: [],
        excludeSkills: ['strong_magic_shot']
    },
    gamma: {
        id: 'gamma',
        name: 'ガンマ',
        displayName: 'ガンマ',
        stats: {
            hp: 120,
            mp: 175,
            physicalAttack: 30,
            magicAttack: 150,
            physicalDefense: 60,
            magicDefense: 105,
            speed: 90,
            luck: 60
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'electric_tower',
            displayName: 'エレクトリック・タワー',
            basePower: 90,
            mpCost: 50,
            type: 'magic_attack',
            target: 'all_enemies',
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '全体魔法攻撃（威力90%）＋麻痺100% 3T'
        },
        image: {
            full: 'img/gamma_full.png',
            face: 'img/gamma_face.png'
        },
        skills: [],
        excludeSkills: ['magic_storm']
    },
    yosano: {
        id: 'akiko',
        name: '与謝野晶子',
        displayName: '与謝野晶子',
        stats: {
            hp: 130,
            mp: 210,
            physicalAttack: 45,
            magicAttack: 80,
            physicalDefense: 90,
            magicDefense: 110,
            speed: 75,
            luck: 55
        },
        type: 'healer',
        uniqueSkill: {
            id: 'thou_shalt_not_die',
            displayName: '君死給勿',
            mpCost: 50,
            type: 'heal',
            target: 'single_ally',
            healPercent: 65,
            description: '単体HP 65%回復'
        },
        image: {
            full: 'img/akiko_full.png',
            face: 'img/akiko_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    kaho: {
        id: 'kaho',
        name: '日野下花帆',
        displayName: '日野下花帆',
        stats: {
            hp: 135,
            mp: 190,
            physicalAttack: 40,
            magicAttack: 75,
            physicalDefense: 95,
            magicDefense: 115,
            speed: 80,
            luck: 65
        },
        type: 'healer',
        uniqueSkill: {
            id: 'ouka_ranman',
            displayName: '謳歌爛漫',
            mpCost: 80,
            type: 'heal',
            target: 'all_allies',
            healPercent: 50,
            description: '味方全体HP 50%回復'
        },
        image: {
            full: 'img/kaho_full.png',
            face: 'img/kaho_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    minato: {
        id: 'minato',
        name: '波風ミナト',
        displayName: '波風ミナト',
        stats: {
            hp: 125,
            mp: 170,
            physicalAttack: 100,
            magicAttack: 70,
            physicalDefense: 70,
            magicDefense: 75,
            speed: 130,
            luck: 60
        },
        type: 'support',
        uniqueSkill: {
            id: 'flying_raijin',
            displayName: '飛雷神の術',
            mpCost: 50,
            type: 'buff',
            target: 'all_allies',
            effects: [
                { type: 'buff', stat: 'speed', value: 0.5, duration: 3 }
            ],
            description: '味方全体の速度+50% 3ターン'
        },
        image: {
            full: 'img/minato_full.png',
            face: 'img/minato_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    anya: {
        id: 'anya',
        name: 'アーニャ・フォージャー',
        displayName: 'アーニャ・フォージャー',
        stats: {
            hp: 110,
            mp: 210,
            physicalAttack: 30,
            magicAttack: 85,
            physicalDefense: 70,
            magicDefense: 100,
            speed: 85,
            luck: 120
        },
        type: 'support',
        uniqueSkill: {
            id: 'mind_reading',
            displayName: '心を読む力',
            mpCost: 50,
            type: 'buff',
            target: 'all_allies',
            effects: [
                { type: 'critBoost', value: 50, duration: 3 }
            ],
            description: '味方全体のクリティカル率+50% 3ターン'
        },
        image: {
            full: 'img/anya_full.png',
            face: 'img/anya_face.png'
        },
        skills: [],
        excludeSkills: []
    },
    shikamaru: {
        id: 'shikamaru',
        name: '奈良シカマル',
        displayName: '奈良シカマル',
        stats: {
            hp: 120,
            mp: 170,
            physicalAttack: 70,
            magicAttack: 95,
            physicalDefense: 80,
            magicDefense: 95,
            speed: 70,
            luck: 90
        },
        type: 'debuffer',
        uniqueSkill: {
            id: 'shadow_possession',
            displayName: '影真似の術',
            basePower: 140,
            mpCost: 30,
            type: 'physical_attack',
            target: 'single_enemy',
            effects: [
                { type: 'debuff', stat: 'speed', value: -0.3, duration: 3 }
            ],
            description: '単体物理攻撃（140%）＋速度-30% 3ターン'
        },
        image: {
            full: 'img/shikamaru_full.png',
            face: 'img/shikamaru_face.png'
        },
        skills: [],
        excludeSkills: ['strong_attack']
    },
    loid: {
        id: 'loid',
        name: 'ロイド・フォージャー',
        displayName: 'ロイド・フォージャー',
        stats: {
            hp: 125,
            mp: 180,
            physicalAttack: 105,
            magicAttack: 50,
            physicalDefense: 85,
            magicDefense: 80,
            speed: 110,
            luck: 80
        },
        type: 'debuffer',
        uniqueSkill: {
            id: 'spy_technique',
            displayName: 'スパイ技術',
            mpCost: 45,
            type: 'debuff',
            target: 'all_enemies',
            effects: [
                { type: 'debuff', stat: 'physicalDefense', value: -0.35, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.35, duration: 3 }
            ],
            description: '敵全体の防御（両方）-35% 3ターン'
        },
        image: {
            full: 'img/loid_full.png',
            face: 'img/loid_face.png'
        },
        skills: [],
        excludeSkills: []
    }
};