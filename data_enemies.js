// ========================================
// Cross Legends - 敵キャラクターデータ
// ========================================

// 敵キャラクター
const ENEMIES = {
    // ========================================
    // 1幕 通常敵（5種類）- 固有スキルのみ
    // ========================================

    slime: {
        id: 'slime',
        name: 'スライム',
        displayName: 'スライム',
        type: 'physical_attacker',
        baseStats: {
            hp: 120, mp: 60, physicalAttack: 60, magicAttack: 0,
            physicalDefense: 75, magicDefense: 100, speed: 30, luck: 45
        },
        skills: [],
        uniqueSkill: {
            id: 'body_slam',
            displayName: '体当たり',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 30,
            description: '単体に物理攻撃（威力150%）'
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
            hp: 115, mp: 55, physicalAttack: 60, magicAttack: 0,
            physicalDefense: 100, magicDefense: 75, speed: 40, luck: 40
        },
        skills: [],
        uniqueSkill: {
            id: 'headbutt',
            displayName: '頭突き',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 30,
            description: '単体に物理攻撃（威力150%）'
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
            hp: 110, mp: 70, physicalAttack: 60, magicAttack: 0,
            physicalDefense: 85, magicDefense: 85, speed: 90, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'toxic',
            displayName: 'どくどく',
            type: 'debuff',
            target: 'single_enemy',
            power: 0,
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
            hp: 130, mp: 75, physicalAttack: 45, magicAttack: 60,
            physicalDefense: 75, magicDefense: 90, speed: 65, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'beam_shot',
            displayName: 'ビームショット',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 30,
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 麻痺状態にする'
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
            physicalDefense: 65, magicDefense: 105, speed: 75, luck: 45
        },
        skills: [],
        uniqueSkill: {
            id: 'magic_wand',
            displayName: '魔法の杖',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 30,
            description: '単体に魔法攻撃（威力150%）'
        },
        image: { full: 'img/enemy/kamec.png' },
        rank: 'normal'
    },

    // ========================================
    // 1幕 エリート（5種類）- 固有スキル＋スキル1
    // ========================================

    arboc: {
        id: 'arboc',
        name: 'アーボック',
        displayName: 'アーボック',
        type: 'physical_attacker',
        baseStats: {
            hp: 380, mp: 100, physicalAttack: 90, magicAttack: 0,
            physicalDefense: 140, magicDefense: 140, speed: 100, luck: 60
        },
        skills: ['all_power_down'],
        uniqueSkill: {
            id: 'toxic_fang',
            displayName: 'どくどくのキバ',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 35,
            effects: [
                { type: 'status', status: 'poison', chance: 100, duration: 3 }
            ],
            description: '単体に物理攻撃（威力120%）+ 毒状態にする'
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
            hp: 370, mp: 95, physicalAttack: 90, magicAttack: 0,
            physicalDefense: 160, magicDefense: 120, speed: 75, luck: 50
        },
        skills: ['all_power_boost'],
        uniqueSkill: {
            id: 'bara_bara_attack',
            displayName: 'バラバラアタック',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 55,
            description: '全体に物理攻撃（威力60%）'
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
            hp: 320, mp: 120, physicalAttack: 0, magicAttack: 90,
            physicalDefense: 120, magicDefense: 160, speed: 125, luck: 70
        },
        skills: ['all_speed_boost'],
        uniqueSkill: {
            id: 'chaos_lance',
            displayName: 'カオスランス',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 50,
            effects: [
                { type: 'debuff', stat: 'physicalAttack', value: -0.5, duration: 3 },
                { type: 'debuff', stat: 'magicAttack', value: -0.5, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 攻撃-50% 3ターン'
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
            hp: 400, mp: 90, physicalAttack: 90, magicAttack: 0,
            physicalDefense: 170, magicDefense: 120, speed: 60, luck: 55
        },
        skills: ['paralyze_single'],
        uniqueSkill: {
            id: 'fart_gas',
            displayName: 'ひろがるオナラガス',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 35,
            description: '全体に物理攻撃（威力60%）'
        },
        image: { full: 'img/enemy/kabaton.png' },
        rank: 'elite'
    },

    avdol: {
        id: 'avdol',
        name: 'モハメド・アヴドゥル',
        displayName: 'アヴドゥル',
        type: 'magic_attacker',
        baseStats: {
            hp: 370, mp: 100, physicalAttack: 0, magicAttack: 100,
            physicalDefense: 130, magicDefense: 130, speed: 75, luck: 60
        },
        skills: ['magic_wave'],
        uniqueSkill: {
            id: 'magicians_red',
            displayName: 'マジシャンズ・レッド',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 40,
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 火傷状態にする'
        },
        image: { full: 'img/enemy/avdol.png' },
        rank: 'elite'
    },

    // ========================================
    // 1幕 ボス（7種類）- 固有スキル＋スキル2
    // ========================================

    baikinman: {
        id: 'baikinman',
        name: 'ばいきんまん',
        displayName: 'ばいきんまん',
        type: 'physical_attacker',
        baseStats: {
            hp: 740, mp: 140, physicalAttack: 120, magicAttack: 0,
            physicalDefense: 160, magicDefense: 160, speed: 90, luck: 75
        },
        skills: ['poison_all', 'heavy_wave'],
        uniqueSkill: {
            id: 'baikin_punch',
            displayName: 'バイキンパンチ',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 65,
            effects: [],
            description: '単体に強力な物理攻撃（威力150%）'
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
            hp: 820, mp: 180, physicalAttack: 0, magicAttack: 110,
            physicalDefense: 180, magicDefense: 140, speed: 105, luck: 45
        },
        skills: ['all_power_down', 'magic_bullet'],
        uniqueSkill: {
            id: 'poison_spray',
            displayName: '毒液噴射',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'poison', chance: 30, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力50%）+ 毒付与30%（3T）'
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
            hp: 770, mp: 190, physicalAttack: 0, magicAttack: 125,
            physicalDefense: 140, magicDefense: 180, speed: 85, luck: 50
        },
        skills: ['all_guard_boost', 'magic_wave'],
        uniqueSkill: {
            id: 'cursed_spirit_manipulation',
            displayName: '呪霊操術',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 150,
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
            hp: 790, mp: 130, physicalAttack: 120, magicAttack: 0,
            physicalDefense: 200, magicDefense: 150, speed: 61, luck: 75
        },
        skills: ['all_power_boost', 'heavy_wave'],
        uniqueSkill: {
            id: 'stone_edge',
            displayName: 'ストーンエッジ',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 65,
            description: '単体に強力な物理攻撃（威力150%）'
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
            hp: 750, mp: 200, physicalAttack: 0, magicAttack: 130,
            physicalDefense: 150, magicDefense: 150, speed: 130, luck: 75
        },
        skills: ['paralyze_single', 'magic_wave'],
        uniqueSkill: {
            id: 'kusanagi_sword',
            displayName: '草薙の剣',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 58,
            effects: [
                { type: 'status', status: 'silence', chance: 100, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 沈黙状態にする'
        },
        image: { full: 'img/enemy/orochimaru.png' },
        rank: 'boss'
    },

    // Saint Snow（ペアボス）- 鹿角聖良
    sarah_kazuno: {
        id: 'sarah_kazuno',
        name: '鹿角聖良',
        displayName: '鹿角聖良',
        type: 'physical_attacker',
        baseStats: {
            hp: 560, mp: 120, physicalAttack: 100, magicAttack: 0,
            physicalDefense: 180, magicDefense: 140, speed: 90, luck: 65
        },
        skills: ['all_speed_boost', 'heavy_wave'],
        uniqueSkill: {
            id: 'crash_mind',
            displayName: 'CRASH MIND',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 45,
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '単体に物理攻撃（威力120%）+ 麻痺状態にする'
        },
        image: { full: 'img/enemy/sarah.png' },
        rank: 'boss',
        pairWith: 'leah_kazuno',
        groupName: 'Saint Snow',
        groupImage: 'img/enemy/saintsnow.png'
    },

    // Saint Snow（ペアボス）- 鹿角理亞
    leah_kazuno: {
        id: 'leah_kazuno',
        name: '鹿角理亞',
        displayName: '鹿角理亞',
        type: 'magic_attacker',
        baseStats: {
            hp: 550, mp: 140, physicalAttack: 0, magicAttack: 100,
            physicalDefense: 140, magicDefense: 180, speed: 95, luck: 65
        },
        skills: ['all_power_boost', 'magic_wave'],
        uniqueSkill: {
            id: 'believe_again',
            displayName: 'Believe again',
            type: 'heal',
            target: 'single_ally',
            mpCost: 50,
            healPercent: 30,
            excludeSelf: true,
            description: '味方1体のHPを30%回復（自分以外）'
        },
        image: { full: 'img/enemy/leah.png' },
        rank: 'boss',
        pairWith: 'sarah_kazuno',
        groupName: 'Saint Snow',
        groupImage: 'img/enemy/saintsnow.png'
    },

    // ========================================
    // 2幕 通常敵（5種類）- 固有スキルのみ
    // ========================================

    bullfango: {
        id: 'bullfango',
        name: 'ブルファンゴ',
        displayName: 'ブルファンゴ',
        type: 'physical_attacker',
        baseStats: {
            hp: 200, mp: 70, physicalAttack: 120, magicAttack: 0,
            physicalDefense: 105, magicDefense: 105, speed: 130, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'charge',
            displayName: '突進',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 32,
            description: '全体に物理攻撃（威力60%）'
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
            hp: 210, mp: 100, physicalAttack: 0, magicAttack: 120,
            physicalDefense: 110, magicDefense: 140, speed: 75, luck: 60
        },
        skills: [],
        uniqueSkill: {
            id: 'energy_drain',
            displayName: 'エネルギードレイン',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 35,
            effects: [
                { type: 'mp_drain', value: 0.1 }
            ],
            description: '単体に魔法攻撃（威力120%）+ MP吸収10'
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
            hp: 220, mp: 75, physicalAttack: 95, magicAttack: 0,
            physicalDefense: 155, magicDefense: 115, speed: 55, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'strangle',
            displayName: '絞殺',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 35,
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '単体に物理攻撃（威力120%）+ 麻痺'
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
            hp: 200, mp: 60, physicalAttack: 300, magicAttack: 0,
            physicalDefense: 70, magicDefense: 70, speed: 5, luck: 0
        },
        skills: [],
        uniqueSkill: {
            id: 'self_destruct',
            displayName: '自爆',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 0,
            effects: [
                { type: 'self_ko' }
            ],
            description: '全体に物理攻撃（威力60%）、自分は戦闘不能'
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
            hp: 190, mp: 95, physicalAttack: 0, magicAttack: 115,
            physicalDefense: 120, magicDefense: 130, speed: 110, luck: 60
        },
        skills: [],
        uniqueSkill: {
            id: 'overdrive',
            displayName: 'オーバードライブ',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'stun', chance: 20, duration: 1 }
            ],
            description: '全体に魔法攻撃（威力50%）+ スタン20%'
        },
        image: { full: 'img/enemy/toxtricity.png' },
        rank: 'normal'
    },

    // ========================================
    // 2幕 エリート（5種類）- 固有スキル＋スキル1
    // ========================================

    koopajr: {
        id: 'koopajr',
        name: 'クッパJr.',
        displayName: 'クッパJr.',
        type: 'magic_attacker',
        baseStats: {
            hp: 500, mp: 160, physicalAttack: 0, magicAttack: 130,
            physicalDefense: 140, magicDefense: 140, speed: 85, luck: 45
        },
        skills: ['all_guard_boost'],
        uniqueSkill: {
            id: 'clown_blaster',
            displayName: 'クラウンブラスター',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 55,
            effects: [
                { type: 'status', status: 'silence', chance: 100, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 沈黙状態にする（3T）'
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
            hp: 480, mp: 130, physicalAttack: 140, magicAttack: 0,
            physicalDefense: 170, magicDefense: 130, speed: 135, luck: 15
        },
        skills: ['all_power_boost'],
        uniqueSkill: {
            id: 'mach_tornado',
            displayName: 'マッハトルネイド',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 45,
            description: '全体に物理攻撃（威力60%）'
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
            hp: 510, mp: 150, physicalAttack: 0, magicAttack: 140,
            physicalDefense: 150, magicDefense: 150, speed: 100, luck: 75
        },
        skills: ['paralyze_single'],
        uniqueSkill: {
            id: 'bungee_gum',
            displayName: '伸縮自在の愛（バンジーガム）',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 50,
            effects: [
                { type: 'debuff', stat: 'speed', value: -0.5, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 速度-50% 3ターン'
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
            hp: 480, mp: 140, physicalAttack: 130, magicAttack: 0,
            physicalDefense: 150, magicDefense: 160, speed: 95, luck: 15
        },
        skills: ['all_power_down'],
        uniqueSkill: {
            id: 'darkness_wing',
            displayName: 'ダークネスウィング',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 65,
            effects: [
                { type: 'status', status: 'poison', chance: 100, duration: 3 }
            ],
            description: '全体に物理攻撃（威力50%）+ 毒状態にする'
        },
        image: { full: 'img/enemy/darkprecure.png' },
        rank: 'elite'
    },

    teostra: {
        id: 'teostra',
        name: 'テオ・テスカトル',
        displayName: 'テオ・テスカトル',
        type: 'magic_attacker',
        baseStats: {
            hp: 490, mp: 120, physicalAttack: 0, magicAttack: 140,
            physicalDefense: 170, magicDefense: 130, speed: 110, luck: 25
        },
        skills: ['all_power_down'],
        uniqueSkill: {
            id: 'supernova',
            displayName: 'スーパーノヴァ',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 55,
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力50%）+ 火傷状態にする'
        },
        image: { full: 'img/enemy/teo.png' },
        rank: 'elite'
    },

    // ========================================
    // 2幕 ラスボス（9種類）- 固有スキル＋スキル2
    // ========================================

    freeza: {
        id: 'freeza',
        name: 'フリーザ',
        displayName: 'フリーザ',
        type: 'magic_attacker',
        baseStats: {
            hp: 1200, mp: 250, physicalAttack: 0, magicAttack: 160,
            physicalDefense: 180, magicDefense: 180, speed: 120, luck: 75
        },
        skills: ['magic_wave', 'all_power_boost'],
        uniqueSkill: {
            id: 'death_ball',
            displayName: 'デスボール',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 60,
            description: '単体に超強力な魔法攻撃（威力150%）'
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
            hp: 1400, mp: 220, physicalAttack: 110, magicAttack: 0,
            physicalDefense: 190, magicDefense: 170, speed: 125, luck: 75
        },
        skills: ['all_power_boost', 'heavy_strike'],
        uniqueSkill: {
            id: 'za_warudo',
            displayName: 'ザ・ワールド',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 90,
            effects: [
                { type: 'status', status: 'stun', chance: 50, duration: 1 }
            ],
            description: '全体に物理攻撃（威力50%）+ スタン50%'
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
            hp: 1275, mp: 260, physicalAttack: 0, magicAttack: 110,
            physicalDefense: 185, magicDefense: 215, speed: 115, luck: 75
        },
        skills: ['all_power_down', 'magic_bullet'],
        uniqueSkill: {
            id: 'kyoka_suigetsu',
            displayName: '鏡花水月',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 70,
            effects: [
                { type: 'debuff', stat: 'physicalAttack', value: -0.1, duration: 3 },
                { type: 'debuff', stat: 'magicAttack', value: -0.1, duration: 3 },
                { type: 'debuff', stat: 'physicalDefense', value: -0.1, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.1, duration: 3 },
                { type: 'debuff', stat: 'speed', value: -0.1, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力50%）+ 全ステータス-10% 3ターン'
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
            hp: 1275, mp: 280, physicalAttack: 0, magicAttack: 115,
            physicalDefense: 170, magicDefense: 190, speed: 130, luck: 75
        },
        skills: ['all_speed_boost', 'magic_wave'],
        uniqueSkill: {
            id: 'photon_geyser',
            displayName: 'フォトンゲイザー',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 65,
            description: '単体に超強力な魔法攻撃（威力150%）'
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
            hp: 1530, mp: 200, physicalAttack: 125, magicAttack: 0,
            physicalDefense: 210, magicDefense: 185, speed: 105, luck: 75
        },
        skills: ['all_guard_down', 'heavy_wave'],
        uniqueSkill: {
            id: 'grand_slam',
            displayName: 'グランドスラム',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 70,
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '単体に物理攻撃（威力120%）+ 麻痺状態にする'
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
            hp: 1275, mp: 240, physicalAttack: 0, magicAttack: 110,
            physicalDefense: 160, magicDefense: 185, speed: 100, luck: 75
        },
        skills: ['all_guard_down', 'poison_single'],
        uniqueSkill: {
            id: 'decay',
            displayName: '崩壊',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 65,
            effects: [
                { type: 'debuff', stat: 'physicalDefense', value: -0.2, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.2, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力50%）+ 防御-20% 3ターン'
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
            hp: 1660, mp: 210, physicalAttack: 0, magicAttack: 130,
            physicalDefense: 225, magicDefense: 175, speed: 85, luck: 75
        },
        skills: ['all_guard_boost', 'magic_bullet'],
        uniqueSkill: {
            id: 'koopa_breath',
            displayName: 'クッパブレス',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力50%）+ 火傷状態にする'
        },
        image: { full: 'img/enemy/koopa.png' },
        rank: 'last_boss'
    },

    // 再不斬＆白（ペアボス）- 桃地再不斬
    zabuza: {
        id: 'zabuza',
        name: '桃地再不斬',
        displayName: '桃地再不斬',
        type: 'physical_attacker',
        baseStats: {
            hp: 1020, mp: 180, physicalAttack: 65, magicAttack: 0,
            physicalDefense: 150, magicDefense: 120, speed: 95, luck: 70
        },
        skills: ['all_power_boost', 'heavy_wave'],
        uniqueSkill: {
            id: 'silent_killing',
            displayName: '無音殺人術 - サイレントキリング',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 50,
            effects: [
                { type: 'status', status: 'silence', chance: 100, duration: 3 }
            ],
            description: '単体に物理攻撃（威力120%）+ 沈黙状態にする'
        },
        image: { full: 'img/enemy/zabuza.png' },
        rank: 'last_boss',
        pairWith: 'haku',
        groupName: '再不斬＆白'
    },

    // 再不斬＆白（ペアボス）- 白
    haku: {
        id: 'haku',
        name: '白',
        displayName: '白',
        type: 'magic_attacker',
        baseStats: {
            hp: 1020, mp: 200, physicalAttack: 0, magicAttack: 65,
            physicalDefense: 120, magicDefense: 150, speed: 100, luck: 70
        },
        skills: ['all_guard_boost', 'poison_single'],
        uniqueSkill: {
            id: 'crystal_ice_mirrors',
            displayName: '秘術・魔鏡氷晶',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 50,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力50%）+ 麻痺状態にする'
        },
        image: { full: 'img/enemy/haku.png' },
        rank: 'last_boss',
        pairWith: 'zabuza',
        groupName: '再不斬＆白'
    }

};