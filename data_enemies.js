// ========================================
// Cross Legends - 敵キャラクターデータ
// ========================================

// 敵キャラクター
const ENEMIES = {
    // ========================================
    // 1幕 通常敵（5種類）
    // ========================================

    slime: {
        id: 'slime',
        name: 'スライム',
        displayName: 'スライム',
        type: 'physical_attacker',
        baseStats: {
            hp: 120, mp: 60, physicalAttack: 60, magicAttack: 30,
            physicalDefense: 75, magicDefense: 70, speed: 60, luck: 45
        },
        skills: [],
        uniqueSkill: {
            id: 'body_slam',
            displayName: '体当たり',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 30,
            description: '単体に物理攻撃（威力160%）'
        },
        image: { full: 'img/enemy/slime.png' },
        rank: 'normal'
    },

    kuribo: {
        id: 'kuribo',
        name: 'クリボー',
        displayName: 'クリボー',
        type: 'physical_attacker',
        baseStats: {
            hp: 115, mp: 55, physicalAttack: 62, magicAttack: 28,
            physicalDefense: 70, magicDefense: 65, speed: 58, luck: 43
        },
        skills: [],
        uniqueSkill: {
            id: 'headbutt',
            displayName: '頭突き',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 30,
            description: '単体に物理攻撃（威力160%）'
        },
        image: { full: 'img/enemy/kuribo.png' },
        rank: 'normal'
    },

    abo: {
        id: 'abo',
        name: 'アーボ',
        displayName: 'アーボ',
        type: 'debuffer',
        baseStats: {
            hp: 110, mp: 70, physicalAttack: 55, magicAttack: 35,
            physicalDefense: 65, magicDefense: 75, speed: 70, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'toxic',
            displayName: 'どくどく',
            type: 'debuff',
            target: 'single_enemy',
            basePower: 0,
            mpCost: 25,
            effects: [
                { type: 'status', status: 'poison', chance: 100, duration: 3 }
            ],
            description: '単体を毒状態にする（3ターン）'
        },
        image: { full: 'img/enemy/abo.png' },
        rank: 'normal'
    },

    wadorudo: {
        id: 'wadorudo',
        name: 'ワドルドゥ',
        displayName: 'ワドルドゥ',
        type: 'magic_attacker',
        baseStats: {
            hp: 125, mp: 75, physicalAttack: 45, magicAttack: 58,
            physicalDefense: 70, magicDefense: 80, speed: 55, luck: 48
        },
        skills: [],
        uniqueSkill: {
            id: 'beam_shot',
            displayName: 'ビームショット',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 30,
            description: '単体に魔法攻撃（威力160%）'
        },
        image: { full: 'img/enemy/wadorudo.png' },
        rank: 'normal'
    },

    kamec: {
        id: 'kamec',
        name: 'カメック',
        displayName: 'カメック',
        type: 'magic_attacker',
        baseStats: {
            hp: 120, mp: 80, physicalAttack: 40, magicAttack: 60,
            physicalDefense: 65, magicDefense: 85, speed: 52, luck: 46
        },
        skills: [],
        uniqueSkill: {
            id: 'magic_wand',
            displayName: '魔法の杖',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 30,
            description: '単体に魔法攻撃（威力160%）'
        },
        image: { full: 'img/enemy/kamec.png' },
        rank: 'normal'
    },

    // ========================================
    // 1幕 エリート（4種類）
    // ========================================

    arboc: {
        id: 'arboc',
        name: 'アーボック',
        displayName: 'アーボック',
        type: 'physical_attacker',
        baseStats: {
            hp: 280, mp: 100, physicalAttack: 75, magicAttack: 45,
            physicalDefense: 110, magicDefense: 105, speed: 82, luck: 60
        },
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'toxic_fang',
            displayName: 'どくどくのキバ',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 140,
            mpCost: 35,
            effects: [
                { type: 'status', status: 'poison', chance: 100, duration: 3 }
            ],
            description: '単体に物理攻撃（威力140%）+ 毒状態にする'
        },
        image: { full: 'img/enemy/arboc.png' },
        rank: 'elite'
    },

    buggy: {
        id: 'buggy',
        name: 'バギー',
        displayName: 'バギー',
        type: 'physical_attacker',
        baseStats: {
            hp: 310, mp: 95, physicalAttack: 70, magicAttack: 40,
            physicalDefense: 120, magicDefense: 100, speed: 75, luck: 58
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'bara_bara_attack',
            displayName: 'バラバラアタック',
            type: 'physical_attack',
            target: 'all_enemies',
            basePower: 70,
            mpCost: 55,
            description: '全体に物理攻撃（威力70%）'
        },
        image: { full: 'img/enemy/buggy.png' },
        rank: 'elite'
    },

    shadow: {
        id: 'shadow',
        name: 'シャドウ',
        displayName: 'シャドウ',
        type: 'magic_attacker',
        baseStats: {
            hp: 260, mp: 120, physicalAttack: 55, magicAttack: 80,
            physicalDefense: 100, magicDefense: 125, speed: 105, luck: 70
        },
        skills: ['speed_boost_all'],
        uniqueSkill: {
            id: 'chaos_lance',
            displayName: 'カオスランス',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 48,
            effects: [
                { type: 'debuff', stat: 'speed', value: -0.25, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力160%）+ 速度-25% 3ターン'
        },
        image: { full: 'img/enemy/shadow.png' },
        rank: 'elite'
    },

    kabaton: {
        id: 'kabaton',
        name: 'カバトン',
        displayName: 'カバトン',
        type: 'physical_attacker',
        baseStats: {
            hp: 320, mp: 90, physicalAttack: 75, magicAttack: 38,
            physicalDefense: 130, magicDefense: 95, speed: 68, luck: 55
        },
        skills: ['paralyze_single'],
        uniqueSkill: {
            id: 'tackle',
            displayName: 'タックル',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 150,
            mpCost: 35,
            description: '単体に物理攻撃（威力150%）'
        },
        image: { full: 'img/enemy/kabaton.png' },
        rank: 'elite'
    },

    // ========================================
    // 1幕 ボス（5種類）
    // ========================================

    baikinman: {
        id: 'baikinman',
        name: 'ばいきんまん',
        displayName: 'ばいきんまん',
        type: 'physical_attacker',
        baseStats: {
            hp: 750, mp: 140, physicalAttack: 75, magicAttack: 60,
            physicalDefense: 160, magicDefense: 140, speed: 88, luck: 70
        },
        skills: ['poison_single'],
        uniqueSkill: {
            id: 'baikin_punch',
            displayName: 'バイキンパンチ',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 140,
            mpCost: 65,
            effects: [],
            description: '単体に強力な物理攻撃（威力140%）'
        },
        image: { full: 'img/enemy/baikinman.png' },
        rank: 'boss'
    },

    giginebura: {
        id: 'giginebura',
        name: 'ギギネブラ',
        displayName: 'ギギネブラ',
        type: 'magic_attacker',
        baseStats: {
            hp: 750, mp: 180, physicalAttack: 70, magicAttack: 75,
            physicalDefense: 150, magicDefense: 180, speed: 78, luck: 65
        },
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'poison_spray',
            displayName: '毒液噴射',
            type: 'magic_attack',
            target: 'all_enemies',
            basePower: 70,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'poison', chance: 30, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力70%）+ 毒付与30%（3T）'
        },
        image: { full: 'img/enemy/giginebura.png' },
        rank: 'boss'
    },

    geto: {
        id: 'geto',
        name: '夏油傑',
        displayName: '夏油傑',
        type: 'magic_attacker',
        baseStats: {
            hp: 780, mp: 190, physicalAttack: 65, magicAttack: 80,
            physicalDefense: 160, magicDefense: 190, speed: 82, luck: 72
        },
        skills: ['defense_boost'],
        uniqueSkill: {
            id: 'cursed_spirit_manipulation',
            displayName: '呪霊操術',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 150,
            mpCost: 55,
            description: '単体に強力な魔法攻撃（威力150%）'
        },
        image: { full: 'img/enemy/geto.png' },
        rank: 'boss'
    },

    bangiras: {
        id: 'bangiras',
        name: 'バンギラス',
        displayName: 'バンギラス',
        type: 'physical_attacker',
        baseStats: {
            hp: 800, mp: 130, physicalAttack: 85, magicAttack: 70,
            physicalDefense: 200, magicDefense: 160, speed: 72, luck: 65
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'stone_edge',
            displayName: 'ストーンエッジ',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 140,
            mpCost: 65,
            critBonus: 20,
            description: '単体に強力な物理攻撃（威力140%、クリ率+20%）'
        },
        image: { full: 'img/enemy/tyranitar.png' },
        rank: 'boss'
    },

    orochimaru: {
        id: 'orochimaru',
        name: '大蛇丸',
        displayName: '大蛇丸',
        type: 'magic_attacker',
        baseStats: {
            hp: 700, mp: 200, physicalAttack: 60, magicAttack: 80,
            physicalDefense: 140, magicDefense: 200, speed: 90, luck: 75
        },
        skills: ['speed_down'],
        uniqueSkill: {
            id: 'kusanagi_sword',
            displayName: '草薙の剣',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 220,
            mpCost: 58,
            effects: [
                { type: 'status', status: 'silence', chance: 100, duration: 3 }
            ],
            description: '単体に強力な魔法攻撃（威力220%）+ 沈黙状態にする'
        },
        image: { full: 'img/enemy/orochimaru.png' },
        rank: 'boss'
    },

    // ========================================
    // 2幕 通常敵（5種類）
    // ========================================

    bullfango: {
        id: 'bullfango',
        name: 'ブルファンゴ',
        displayName: 'ブルファンゴ',
        type: 'physical_attacker',
        baseStats: {
            hp: 180, mp: 70, physicalAttack: 95, magicAttack: 40,
            physicalDefense: 100, magicDefense: 85, speed: 75, luck: 52
        },
        skills: [],
        uniqueSkill: {
            id: 'charge',
            displayName: '突進',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 165,
            mpCost: 32,
            description: '単体に物理攻撃（威力165%）'
        },
        image: { full: 'img/enemy/fango.png' },
        rank: 'normal'
    },

    metroid: {
        id: 'metroid',
        name: 'メトロイド',
        displayName: 'メトロイド',
        type: 'magic_attacker',
        baseStats: {
            hp: 160, mp: 100, physicalAttack: 50, magicAttack: 92,
            physicalDefense: 90, magicDefense: 110, speed: 68, luck: 58
        },
        skills: [],
        uniqueSkill: {
            id: 'energy_drain',
            displayName: 'エネルギードレイン',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 35,
            effects: [
                { type: 'mp_drain', value: 0.1 }
            ],
            description: '単体に魔法攻撃（威力160%）+ MP吸収10%'
        },
        image: { full: 'img/enemy/metoroid.png' },
        rank: 'normal'
    },

    redead: {
        id: 'redead',
        name: 'リーデッド',
        displayName: 'リーデッド',
        type: 'physical_attacker',
        baseStats: {
            hp: 170, mp: 75, physicalAttack: 88, magicAttack: 45,
            physicalDefense: 95, magicDefense: 95, speed: 55, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'strangle',
            displayName: '絞殺',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 100,
            mpCost: 35,
            effects: [
                { type: 'status', status: 'stun', chance: 30, duration: 1 }
            ],
            description: '単体に物理攻撃（威力100%）+ スタン30%'
        },
        image: { full: 'img/enemy/redead.png' },
        rank: 'normal'
    },

    bombhei: {
        id: 'bombhei',
        name: 'ボム兵',
        displayName: 'ボム兵',
        type: 'physical_attacker',
        baseStats: {
            hp: 150, mp: 60, physicalAttack: 100, magicAttack: 35,
            physicalDefense: 85, magicDefense: 80, speed: 50, luck: 45
        },
        skills: [],
        uniqueSkill: {
            id: 'countdown',
            displayName: 'カウントダウン',
            type: 'special',
            target: 'all_enemies',
            basePower: 280,
            mpCost: 0,
            effects: [
                { type: 'countdown', turns: 2, action: 'explode' },
                { type: 'self_ko' }
            ],
            description: '2ターン後に全体に大ダメージ（威力280%）、自分は戦闘不能'
        },
        image: { full: 'img/enemy/bombhei.png' },
        rank: 'normal'
    },

    toxtricity: {
        id: 'toxtricity',
        name: 'ストリンダー',
        displayName: 'ストリンダー',
        type: 'magic_attacker',
        baseStats: {
            hp: 165, mp: 95, physicalAttack: 55, magicAttack: 90,
            physicalDefense: 90, magicDefense: 105, speed: 82, luck: 60
        },
        skills: [],
        uniqueSkill: {
            id: 'overdrive',
            displayName: 'オーバードライブ',
            type: 'magic_attack',
            target: 'all_enemies',
            basePower: 120,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'stun', chance: 20, duration: 1 }
            ],
            description: '全体に魔法攻撃（威力120%）+ スタン20%'
        },
        image: { full: 'img/enemy/toxtricity.png' },
        rank: 'normal'
    },

    // ========================================
    // 2幕 エリート（4種類）
    // ========================================

    koopajr: {
        id: 'koopajr',
        name: 'クッパJr.',
        displayName: 'クッパJr.',
        type: 'magic_attacker',
        baseStats: {
            hp: 400, mp: 160, physicalAttack: 75, magicAttack: 75,
            physicalDefense: 140, magicDefense: 160, speed: 85, luck: 68
        },
        skills: ['defense_boost'],
        uniqueSkill: {
            id: 'clown_blaster',
            displayName: 'クラウンブラスター',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 160,
            mpCost: 55,
            effects: [
                { type: 'status', status: 'silence', chance: 100, duration: 3 }
            ],
            description: '単体に強力な魔法攻撃（威力160%）+ 沈黙状態にする（3T）'
        },
        image: { full: 'img/enemy/koopajr.png' },
        rank: 'elite'
    },

    metaknight: {
        id: 'metaknight',
        name: 'メタナイト',
        displayName: 'メタナイト',
        type: 'physical_attacker',
        baseStats: {
            hp: 380, mp: 130, physicalAttack: 70, magicAttack: 50,
            physicalDefense: 130, magicDefense: 125, speed: 115, luck: 75
        },
        skills: ['speed_boost'],
        uniqueSkill: {
            id: 'mach_tornado',
            displayName: 'マッハトルネイド',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 70,
            hits: 2,
            mpCost: 45,
            description: '単体に2回攻撃（威力70%×2）'
        },
        image: { full: 'img/enemy/metaknight.png' },
        rank: 'elite'
    },

    hisoka: {
        id: 'hisoka',
        name: 'ヒソカ',
        displayName: 'ヒソカ',
        type: 'magic_attacker',
        baseStats: {
            hp: 390, mp: 150, physicalAttack: 70, magicAttack: 80,
            physicalDefense: 120, magicDefense: 145, speed: 100, luck: 80
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'bungee_gum',
            displayName: '伸縮自在の愛（バンジーガム）',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 140,
            mpCost: 50,
            effects: [
                { type: 'debuff', stat: 'speed', value: -0.3, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力140%）+ 速度-30% 3ターン'
        },
        image: { full: 'img/enemy/hisoka.png' },
        rank: 'elite'
    },

    darkprecure: {
        id: 'darkprecure',
        name: 'ダークプリキュア',
        displayName: 'ダークプリキュア',
        type: 'physical_attacker',
        baseStats: {
            hp: 420, mp: 140, physicalAttack: 80, magicAttack: 60,
            physicalDefense: 145, magicDefense: 135, speed: 95, luck: 70
        },
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'darkness_wing',
            displayName: 'ダークネスウィング',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 130,
            mpCost: 65,
            effects: [],
            description: '単体に強力な物理攻撃（威力130%）'
        },
        image: { full: 'img/enemy/darkprecure.png' },
        rank: 'elite'
    },

    // ========================================
    // 2幕 ラスボス（7種類）
    // ========================================

    freeza: {
        id: 'freeza',
        name: 'フリーザ',
        displayName: 'フリーザ',
        type: 'magic_attacker',
        baseStats: {
            hp: 1000, mp: 250, physicalAttack: 100, magicAttack: 80,
            physicalDefense: 140, magicDefense: 150, speed: 110, luck: 90
        },
        skills: ['magic_storm'],
        uniqueSkill: {
            id: 'death_ball',
            displayName: 'デスボール',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 180,
            mpCost: 60,
            description: '単体に超強力な魔法攻撃（威力180%）'
        },
        image: { full: 'img/enemy/freeza.png' },
        rank: 'last_boss'
    },

    dio: {
        id: 'dio',
        name: 'ディオ・ブランドー',
        displayName: 'ディオ',
        type: 'physical_attacker',
        baseStats: {
            hp: 1100, mp: 220, physicalAttack: 85, magicAttack: 90,
            physicalDefense: 240, magicDefense: 210, speed: 125, luck: 95
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'za_warudo',
            displayName: 'ザ・ワールド',
            type: 'physical_attack',
            target: 'all_enemies',
            basePower: 90,
            mpCost: 90,
            effects: [
                { type: 'status', status: 'stun', chance: 100, duration: 1 }
            ],
            description: '全体に強力な物理攻撃（威力90%）+ スタン状態にする'
        },
        image: { full: 'img/enemy/dio.png' },
        rank: 'last_boss'
    },

    aizen: {
        id: 'aizen',
        name: '愛染惣右介',
        displayName: '愛染惣右介',
        type: 'magic_attacker',
        baseStats: {
            hp: 1000, mp: 260, physicalAttack: 95, magicAttack: 85,
            physicalDefense: 230, magicDefense: 270, speed: 115, luck: 100
        },
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'kyoka_suigetsu',
            displayName: '鏡花水月',
            type: 'magic_attack',
            target: 'all_enemies',
            basePower: 90,
            mpCost: 70,
            effects: [
                { type: 'debuff', stat: 'physicalAttack', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'magicAttack', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'physicalDefense', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'speed', value: -0.15, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力90%）+ 全ステータス-15% 3ターン'
        },
        image: { full: 'img/enemy/aizen.png' },
        rank: 'last_boss'
    },

    necrozma: {
        id: 'necrozma',
        name: 'ウルトラネクロズマ',
        displayName: 'ウルトラネクロズマ',
        type: 'magic_attacker',
        baseStats: {
            hp: 1000, mp: 280, physicalAttack: 120, magicAttack: 90,
            physicalDefense: 210, magicDefense: 240, speed: 130, luck: 105
        },
        skills: ['speed_boost'],
        uniqueSkill: {
            id: 'photon_geyser',
            displayName: 'フォトンゲイザー',
            type: 'magic_attack',
            target: 'single_enemy',
            basePower: 170,
            mpCost: 65,
            description: '単体に超強力な魔法攻撃（威力170%）'
        },
        image: { full: 'img/enemy/ultra_necrozma.png' },
        rank: 'last_boss'
    },

    masterhand: {
        id: 'masterhand',
        name: 'マスターハンド',
        displayName: 'マスターハンド',
        type: 'physical_attacker',
        baseStats: {
            hp: 1200, mp: 200, physicalAttack: 95, magicAttack: 85,
            physicalDefense: 260, magicDefense: 230, speed: 105, luck: 85
        },
        skills: ['iron_wall'],
        uniqueSkill: {
            id: 'grand_slam',
            displayName: 'グランドスラム',
            type: 'physical_attack',
            target: 'single_enemy',
            basePower: 150,
            mpCost: 70,
            effects: [
                { type: 'status', status: 'stun', chance: 15, duration: 1 }
            ],
            description: '単体に超強力な物理攻撃（威力150%）+ スタン15%'
        },
        image: { full: 'img/enemy/masterhand.png' },
        rank: 'last_boss'
    },

    shigaraki: {
        id: 'shigaraki',
        name: '死柄木弔',
        displayName: '死柄木弔',
        type: 'magic_attacker',
        baseStats: {
            hp: 1000, mp: 240, physicalAttack: 110, magicAttack: 85,
            physicalDefense: 200, magicDefense: 230, speed: 100, luck: 88
        },
        skills: ['armor_break_all'],
        uniqueSkill: {
            id: 'decay',
            displayName: '崩壊',
            type: 'magic_attack',
            target: 'all_enemies',
            basePower: 90,
            mpCost: 65,
            effects: [
                { type: 'debuff', stat: 'physicalDefense', value: -0.2, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.2, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力90%）+ 防御-20% 3ターン'
        },
        image: { full: 'img/enemy/tomura.png' },
        rank: 'last_boss'
    },

    koopa: {
        id: 'koopa',
        name: 'クッパ',
        displayName: 'クッパ',
        type: 'tank',
        baseStats: {
            hp: 1300, mp: 210, physicalAttack: 90, magicAttack: 100,
            physicalDefense: 280, magicDefense: 220, speed: 85, luck: 75
        },
        skills: ['defense_boost'],
        uniqueSkill: {
            id: 'koopa_breath',
            displayName: 'クッパブレス',
            type: 'magic_attack',
            target: 'all_enemies',
            basePower: 100,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力100%）+ 火傷状態にする'
        },
        image: { full: 'img/enemy/koopa.png' },
        rank: 'last_boss'
    }

};