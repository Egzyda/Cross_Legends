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
            physicalDefense: 100, magicDefense: 55, speed: 35, luck: 40
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
            physicalDefense: 65, magicDefense: 75, speed: 90, luck: 50
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
            hp: 125, mp: 75, physicalAttack: 45, magicAttack: 60,
            physicalDefense: 60, magicDefense: 90, speed: 65, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'beam_shot',
            displayName: 'ビームショット',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 150,
            mpCost: 30,
            description: '単体に魔法攻撃（威力150%）'
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
            physicalDefense: 65, magicDefense: 85, speed: 70, luck: 45
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
    // 1幕 エリート（4種類）
    // ========================================

    arboc: {
        id: 'arboc',
        name: 'アーボック',
        displayName: 'アーボック',
        type: 'physical_attacker',
        baseStats: {
            hp: 340, mp: 100, physicalAttack: 75, magicAttack: 0,
            physicalDefense: 130, magicDefense: 135, speed: 100, luck: 60
        },
        skills: ['weaken_all'],
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
            physicalDefense: 120, magicDefense: 100, speed: 75, luck: 50
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'bara_bara_attack',
            displayName: 'バラバラアタック',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 70,
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
            hp: 320, mp: 120, physicalAttack: 0, magicAttack: 90,
            physicalDefense: 100, magicDefense: 125, speed: 115, luck: 70
        },
        skills: ['speed_boost_all'],
        uniqueSkill: {
            id: 'chaos_lance',
            displayName: 'カオスランス',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 50,
            effects: [
                { type: 'debuff', stat: 'speed', value: -0.5, duration: 3 }
            ],
            description: '単体に魔法攻撃（威力120%）+ 速度-50% 3ターン'
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
            hp: 380, mp: 90, physicalAttack: 90, magicAttack: 0,
            physicalDefense: 130, magicDefense: 95, speed: 50, luck: 55
        },
        skills: ['paralyze_single'],
        uniqueSkill: {
            id: 'fart_gas',
            displayName: 'ひろがるオナラガス',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 70,
            mpCost: 35,
            description: '全体に物理攻撃（威力70%）'
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
            physicalDefense: 100, magicDefense: 120, speed: 85, luck: 60
        },
        skills: [],
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
    // 1幕 ボス（5種類）
    // ========================================

    baikinman: {
        id: 'baikinman',
        name: 'ばいきんまん',
        displayName: 'ばいきんまん',
        type: 'physical_attacker',
        baseStats: {
            hp: 740, mp: 140, physicalAttack: 110, magicAttack: 0,
            physicalDefense: 160, magicDefense: 120, speed: 90, luck: 70
        },
        skills: ['poison_single'],
        uniqueSkill: {
            id: 'baikin_punch',
            displayName: 'バイキンパンチ',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 120,
            mpCost: 65,
            effects: [],
            description: '単体に強力な物理攻撃（威力120%）'
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
            hp: 742, mp: 180, physicalAttack: 81, magicAttack: 86,
            physicalDefense: 150, magicDefense: 180, speed: 78, luck: 65
        },
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'poison_spray',
            displayName: '毒液噴射',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 55,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'poison', chance: 30, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力55%）+ 毒付与30%（3T）'
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
            hp: 770, mp: 190, physicalAttack: 75, magicAttack: 92,
            physicalDefense: 160, magicDefense: 190, speed: 82, luck: 72
        },
        skills: ['defense_boost'],
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
            hp: 792, mp: 130, physicalAttack: 98, magicAttack: 81,
            physicalDefense: 170, magicDefense: 160, speed: 72, luck: 65
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'stone_edge',
            displayName: 'ストーンエッジ',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 140,
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
            hp: 693, mp: 200, physicalAttack: 69, magicAttack: 92,
            physicalDefense: 140, magicDefense: 200, speed: 90, luck: 75
        },
        skills: ['speed_down'],
        uniqueSkill: {
            id: 'kusanagi_sword',
            displayName: '草薙の剣',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 200,
            mpCost: 58,
            effects: [
                { type: 'status', status: 'silence', chance: 100, duration: 3 }
            ],
            description: '単体に強力な魔法攻撃（威力200%）+ 沈黙状態にする'
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
            // ボスベース: HP740, 攻撃110程度 → 8割/5割調整済
            hp: 592, mp: 120, physicalAttack: 55, magicAttack: 0,
            physicalDefense: 128, magicDefense: 100, speed: 80, luck: 65
        },
        skills: ['speed_boost_all'],
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
        groupName: 'Saint Snow'
    },

    // Saint Snow（ペアボス）- 鹿角理亞
    leah_kazuno: {
        id: 'leah_kazuno',
        name: '鹿角理亞',
        displayName: '鹿角理亞',
        type: 'magic_attacker',
        baseStats: {
            // ボスベース: HP740, 攻撃110程度 → 8割/5割調整済
            hp: 592, mp: 140, physicalAttack: 0, magicAttack: 55,
            physicalDefense: 100, magicDefense: 128, speed: 75, luck: 65
        },
        skills: ['attack_boost_all'],
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
        groupName: 'Saint Snow'
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
            hp: 235, mp: 70, physicalAttack: 125, magicAttack: 0,
            physicalDefense: 100, magicDefense: 85, speed: 75, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'charge',
            displayName: '突進',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 165,
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
            hp: 210, mp: 100, physicalAttack: 0, magicAttack: 120,
            physicalDefense: 90, magicDefense: 110, speed: 75, luck: 60
        },
        skills: [],
        uniqueSkill: {
            id: 'energy_drain',
            displayName: 'エネルギードレイン',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 160,
            mpCost: 35,
            effects: [
                { type: 'mp_drain', value: 0.1 }
            ],
            description: '単体に魔法攻撃（威力160%）+ MP吸収10'
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
            hp: 220, mp: 75, physicalAttack: 115, magicAttack: 0,
            physicalDefense: 95, magicDefense: 95, speed: 65, luck: 50
        },
        skills: [],
        uniqueSkill: {
            id: 'strangle',
            displayName: '絞殺',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 100,
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
            hp: 120, mp: 60, physicalAttack: 85, magicAttack: 30,
            physicalDefense: 85, magicDefense: 80, speed: 5, luck: 45
        },
        skills: [],
        uniqueSkill: {
            id: 'self_destruct',
            displayName: '自爆',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 200,
            mpCost: 0,
            effects: [
                { type: 'self_ko' }
            ],
            description: '全体に物理攻撃（威力200%）、自分は戦闘不能'
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
            hp: 130, mp: 95, physicalAttack: 0, magicAttack: 75,
            physicalDefense: 90, magicDefense: 105, speed: 82, luck: 60
        },
        skills: [],
        uniqueSkill: {
            id: 'overdrive',
            displayName: 'オーバードライブ',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 120,
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
            hp: 305, mp: 160, physicalAttack: 0, magicAttack: 70,
            physicalDefense: 126, magicDefense: 144, speed: 85, luck: 68
        },
        skills: ['defense_boost'],
        uniqueSkill: {
            id: 'clown_blaster',
            displayName: 'クラウンブラスター',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 160,
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
            hp: 290, mp: 130, physicalAttack: 65, magicAttack: 0,
            physicalDefense: 117, magicDefense: 112, speed: 115, luck: 75
        },
        skills: ['speed_boost'],
        uniqueSkill: {
            id: 'mach_tornado',
            displayName: 'マッハトルネイド',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 70,
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
            hp: 300, mp: 150, physicalAttack: 0, magicAttack: 75,
            physicalDefense: 108, magicDefense: 130, speed: 100, luck: 75
        },
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'bungee_gum',
            displayName: '伸縮自在の愛（バンジーガム）',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 140,
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
            hp: 320, mp: 140, physicalAttack: 75, magicAttack: 0,
            physicalDefense: 130, magicDefense: 120, speed: 95, luck: 70
        },
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'darkness_wing',
            displayName: 'ダークネスウィング',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 130,
            mpCost: 65,
            effects: [],
            description: '単体に強力な物理攻撃（威力130%）'
        },
        image: { full: 'img/enemy/darkprecure.png' },
        rank: 'elite'
    },

    // テオ・テスカトル（魔法エリート）
    teostra: {
        id: 'teostra',
        name: 'テオ・テスカトル',
        displayName: 'テオ・テスカトル',
        type: 'magic_attacker',
        baseStats: {
            hp: 255, mp: 120, physicalAttack: 0, magicAttack: 120,
            physicalDefense: 100, magicDefense: 130, speed: 80, luck: 65
        },
        skills: [],
        uniqueSkill: {
            id: 'supernova',
            displayName: 'スーパーノヴァ',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 55,
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力60%）+ 火傷状態にする'
        },
        image: { full: 'img/enemy/teo.png' },
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
            hp: 1275, mp: 250, physicalAttack: 130, magicAttack: 105,
            physicalDefense: 110, magicDefense: 120, speed: 110, luck: 75
        },
        skills: ['magic_storm'],
        uniqueSkill: {
            id: 'death_ball',
            displayName: 'デスボール',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 160,
            mpCost: 60,
            description: '単体に超強力な魔法攻撃（威力160%）'
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
        skills: ['attack_boost'],
        uniqueSkill: {
            id: 'za_warudo',
            displayName: 'ザ・ワールド',
            type: 'physical_attack',
            target: 'all_enemies',
            power: 85,
            mpCost: 90,
            effects: [
                { type: 'status', status: 'stun', chance: 50, duration: 1 }
            ],
            description: '全体に強力な物理攻撃（威力85%）+ スタン50%'
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
        skills: ['weaken_all'],
        uniqueSkill: {
            id: 'kyoka_suigetsu',
            displayName: '鏡花水月',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 85,
            mpCost: 70,
            effects: [
                { type: 'debuff', stat: 'physicalAttack', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'magicAttack', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'physicalDefense', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.15, duration: 3 },
                { type: 'debuff', stat: 'speed', value: -0.15, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力85%）+ 全ステータス-15% 3ターン'
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
        skills: ['speed_boost'],
        uniqueSkill: {
            id: 'photon_geyser',
            displayName: 'フォトンゲイザー',
            type: 'magic_attack',
            target: 'single_enemy',
            power: 155,
            mpCost: 65,
            description: '単体に超強力な魔法攻撃（威力155%）'
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
        skills: ['iron_wall'],
        uniqueSkill: {
            id: 'grand_slam',
            displayName: 'グランドスラム',
            type: 'physical_attack',
            target: 'single_enemy',
            power: 140,
            mpCost: 70,
            effects: [
                { type: 'status', status: 'stun', chance: 15, duration: 1 }
            ],
            description: '単体に超強力な物理攻撃（威力140%）+ スタン15%'
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
        skills: ['armor_break_all'],
        uniqueSkill: {
            id: 'decay',
            displayName: '崩壊',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 85,
            mpCost: 65,
            effects: [
                { type: 'debuff', stat: 'physicalDefense', value: -0.2, duration: 3 },
                { type: 'debuff', stat: 'magicDefense', value: -0.2, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力85%）+ 防御-20% 3ターン'
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
        skills: ['defense_boost'],
        uniqueSkill: {
            id: 'koopa_breath',
            displayName: 'クッパブレス',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 90,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'burn', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力90%）+ 火傷状態にする'
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
            // ラスボスベース: HP1275, 攻撃130程度 → 8割/5割調整済
            hp: 1020, mp: 180, physicalAttack: 65, magicAttack: 0,
            physicalDefense: 150, magicDefense: 120, speed: 95, luck: 70
        },
        skills: ['attack_boost_all'],
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
            // ラスボスベース: HP1275, 攻撃130程度 → 8割/5割調整済
            hp: 1020, mp: 200, physicalAttack: 0, magicAttack: 65,
            physicalDefense: 120, magicDefense: 150, speed: 100, luck: 70
        },
        skills: ['defense_boost_all'],
        uniqueSkill: {
            id: 'crystal_ice_mirrors',
            displayName: '秘術・魔鏡氷晶',
            type: 'magic_attack',
            target: 'all_enemies',
            power: 60,
            mpCost: 60,
            effects: [
                { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
            ],
            description: '全体に魔法攻撃（威力60%）+ 麻痺状態にする'
        },
        image: { full: 'img/enemy/haku.png' },
        rank: 'last_boss',
        pairWith: 'zabuza',
        groupName: '再不斬＆白'
    }

};