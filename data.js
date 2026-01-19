// ========================================
// Cross Legends - データ定義
// ========================================

// スキルデータベース
const SKILLS = {
    // --- 物理アタッカー系 ---
    strong_attack: {
        id: 'strong_attack',
        name: '強撃',
        type: 'physical_attack',
        target: 'single_enemy',
        power: 150,
        mpCost: 30,
        description: '単体に物理攻撃（威力150%）'
    },
    double_attack: {
        id: 'double_attack',
        name: '連続攻撃',
        type: 'physical_attack',
        target: 'single_enemy',
        power: 80,
        hits: 2,
        mpCost: 40,
        description: '単体に2回攻撃（威力80%×2）'
    },
    ultra_attack: {
        id: 'ultra_attack',
        name: '全力攻撃',
        type: 'physical_attack',
        target: 'single_enemy',
        power: 250,
        mpCost: 60,
        effects: [
            { type: 'self_debuff', stat: 'physicalDefense', value: -0.3, duration: 1 }
        ],
        description: '単体に強力な物理攻撃（威力250%、次ターン防御-30%）'
    },
    wide_attack: {
        id: 'wide_attack',
        name: '広範囲攻撃',
        type: 'physical_attack',
        target: 'all_enemies',
        power: 100,
        mpCost: 50,
        description: '全体に物理攻撃（威力100%）'
    },
    critical_attack: {
        id: 'critical_attack',
        name: '弱点攻撃',
        type: 'physical_attack',
        target: 'single_enemy',
        power: 120,
        mpCost: 35,
        critBonus: 30,
        description: '単体攻撃（威力120%、クリ率+30%）'
    },

    // --- 魔法アタッカー系 ---
    magic_shot: {
        id: 'magic_shot',
        name: '魔力弾',
        type: 'magic_attack',
        target: 'single_enemy',
        power: 150,
        mpCost: 30,
        description: '単体に魔法攻撃（威力150%）'
    },
    strong_magic_shot: {
        id: 'strong_magic_shot',
        name: '強魔力弾',
        type: 'magic_attack',
        target: 'single_enemy',
        power: 200,
        mpCost: 50,
        description: '単体に魔法攻撃（威力200%）'
    },
    magic_storm: {
        id: 'magic_storm',
        name: '魔力の嵐',
        type: 'magic_attack',
        target: 'all_enemies',
        power: 110,
        mpCost: 55,
        description: '全体に魔法攻撃（威力110%）'
    },
    magic_impact: {
        id: 'magic_impact',
        name: '魔力衝撃',
        type: 'magic_attack',
        target: 'single_enemy',
        power: 140,
        mpCost: 45,
        effects: [
            { type: 'debuff', stat: 'speed', value: -0.2, duration: 2 }
        ],
        description: '単体魔法攻撃（威力140%、速度-20% 2ターン）'
    },
    magic_explosion: {
        id: 'magic_explosion',
        name: '魔力爆発',
        type: 'magic_attack',
        target: 'single_enemy',
        power: 130,
        mpCost: 40,
        effects: [
            { type: 'status', status: 'paralysis', chance: 30 }
        ],
        description: '単体魔法攻撃（威力130%、麻痺30%）'
    },
    magic_charge: {
        id: 'magic_charge',
        name: '魔力充填',
        type: 'buff',
        target: 'self',
        mpCost: 15,
        effects: [
            { type: 'buff', stat: 'magicAttack', value: 1.0, duration: 1 }
        ],
        description: '次ターン魔法攻撃+100%'
    },

    // --- タンク系 ---
    taunt: {
        id: 'taunt',
        name: '挑発',
        type: 'buff',
        target: 'self',
        mpCost: 20,
        priority: 'first',
        effects: [
            { type: 'taunt', duration: 2 },
            { type: 'buff', stat: 'physicalDefense', value: 0.2, duration: 2 }
        ],
        description: '2ターン挑発状態、自分の防御+20%（先制）'
    },
    iron_wall: {
        id: 'iron_wall',
        name: '鉄壁',
        type: 'buff',
        target: 'self',
        mpCost: 30,
        priority: 'first',
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.5, duration: 2 },
            { type: 'buff', stat: 'magicDefense', value: 0.5, duration: 2 }
        ],
        description: '2ターン自分の防御+50%（先制）'
    },
    cover: {
        id: 'cover',
        name: 'かばう',
        type: 'buff',
        target: 'single_ally',
        mpCost: 25,
        effects: [
            { type: 'cover', duration: 2 }
        ],
        description: '2ターン味方1人への攻撃を代わりに受ける'
    },
    counter_stance: {
        id: 'counter_stance',
        name: '反撃の構え',
        type: 'buff',
        target: 'self',
        mpCost: 35,
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.3, duration: 2 },
            { type: 'counter', power: 80, duration: 2 }
        ],
        description: '防御+30%、攻撃受けた時に反撃（威力80%）2ターン'
    },
    fortitude: {
        id: 'fortitude',
        name: '不屈',
        type: 'buff',
        target: 'self',
        mpCost: 60,
        hpThreshold: 30,
        effects: [
            { type: 'heal', value: 0.5 },
            { type: 'buff', stat: 'physicalDefense', value: 0.4, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.4, duration: 3 }
        ],
        description: 'HP30%以下で発動可、HP50%回復+防御+40% 3ターン'
    },

    // --- ヒーラー系 ---
    heal: {
        id: 'heal',
        name: '回復',
        type: 'heal',
        target: 'single_ally',
        mpCost: 35,
        healPercent: 40,
        description: '単体HP 40%回復'
    },
    heal_all: {
        id: 'heal_all',
        name: '全体回復',
        type: 'heal',
        target: 'all_allies',
        mpCost: 60,
        healPercent: 25,
        description: '全体HP 25%回復'
    },
    revive: {
        id: 'revive',
        name: '蘇生',
        type: 'revive',
        target: 'single_ally_dead',
        mpCost: 80,
        healPercent: 30,
        description: '戦闘不能の味方をHP30%で復活'
    },
    cure_status: {
        id: 'cure_status',
        name: '状態回復',
        type: 'cure',
        target: 'single_ally',
        mpCost: 25,
        description: '単体の状態異常を全て解除'
    },
    regen: {
        id: 'regen',
        name: '再生付与',
        type: 'buff',
        target: 'single_ally',
        mpCost: 40,
        effects: [
            { type: 'regen', value: 0.1, duration: 3 }
        ],
        description: '単体に3ターンHP10%回復効果'
    },

    // --- サポート系 ---
    attack_boost: {
        id: 'attack_boost',
        name: '攻撃強化',
        type: 'buff',
        target: 'single_ally',
        mpCost: 30,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.3, duration: 3 },
            { type: 'buff', stat: 'magicAttack', value: 0.3, duration: 3 }
        ],
        description: '単体の物攻/魔攻+30% 3ターン'
    },
    defense_boost: {
        id: 'defense_boost',
        name: '防御強化',
        type: 'buff',
        target: 'single_ally',
        mpCost: 30,
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.4, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.4, duration: 3 }
        ],
        description: '単体の防御+40% 3ターン'
    },
    speed_boost: {
        id: 'speed_boost',
        name: '速度上昇',
        type: 'buff',
        target: 'all_allies',
        mpCost: 35,
        effects: [
            { type: 'buff', stat: 'speed', value: 0.25, duration: 2 }
        ],
        description: '全体の速度+25% 2ターン'
    },
    luck_boost: {
        id: 'luck_boost',
        name: '幸運付与',
        type: 'buff',
        target: 'single_ally',
        mpCost: 25,
        effects: [
            { type: 'buff', stat: 'luck', value: 0.5, duration: 3 }
        ],
        description: '単体の運+50% 3ターン'
    },
    mp_restore: {
        id: 'mp_restore',
        name: 'MP回復',
        type: 'mp_heal',
        target: 'single_ally',
        mpCost: 20,
        mpHealPercent: 30,
        description: '単体のMP 30%回復'
    },
    weaken: {
        id: 'weaken',
        name: '弱体化',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 30,
        effects: [
            { type: 'debuff', stat: 'physicalAttack', value: -0.3, duration: 3 },
            { type: 'debuff', stat: 'magicAttack', value: -0.3, duration: 3 }
        ],
        description: '敵単体の攻撃-30% 3ターン'
    },
    all_boost: {
        id: 'all_boost',
        name: '全体強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 60,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.15, duration: 2 },
            { type: 'buff', stat: 'magicAttack', value: 0.15, duration: 2 },
            { type: 'buff', stat: 'physicalDefense', value: 0.15, duration: 2 },
            { type: 'buff', stat: 'magicDefense', value: 0.15, duration: 2 },
            { type: 'buff', stat: 'speed', value: 0.15, duration: 2 }
        ],
        description: '全体の全ステータス+15% 2ターン'
    },

    // --- バランス/汎用系 ---
    normal_boost: {
        id: 'normal_boost',
        name: '通常攻撃強化',
        type: 'buff',
        target: 'self',
        mpCost: 20,
        effects: [
            { type: 'normalAttackBoost', value: 0.5, duration: 3 }
        ],
        description: '通常攻撃の威力+50% 3ターン'
    },
    focus: {
        id: 'focus',
        name: '集中',
        type: 'buff',
        target: 'self',
        mpCost: 15,
        effects: [
            { type: 'nextDamageBoost', value: 0.8, duration: 1 }
        ],
        description: '次の行動のダメージ+80%'
    },
    spirit: {
        id: 'spirit',
        name: '気合い',
        type: 'buff',
        target: 'self',
        mpCost: 0,
        hpCost: 0.2,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.4, duration: 2 },
            { type: 'buff', stat: 'magicAttack', value: 0.4, duration: 2 },
            { type: 'buff', stat: 'physicalDefense', value: 0.4, duration: 2 },
            { type: 'buff', stat: 'magicDefense', value: 0.4, duration: 2 },
            { type: 'buff', stat: 'speed', value: 0.4, duration: 2 }
        ],
        description: '自分のHP20%消費、全ステータス+40% 2ターン'
    },
    evasion_boost: {
        id: 'evasion_boost',
        name: '回避上昇',
        type: 'buff',
        target: 'self',
        mpCost: 25,
        effects: [
            { type: 'damageReduction', value: 0.3, duration: 2 }
        ],
        description: '2ターン被ダメージ30%軽減'
    },
    poison_fog: {
        id: 'poison_fog',
        name: '毒霧',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 40,
        effects: [
            { type: 'status', status: 'poison', duration: 3 }
        ],
        description: '全体に毒付与（3ターン、毎ターン最大HPの8%ダメージ）'
    }
};

// タイプ別スキルプール
const SKILL_POOLS = {
    physical_attacker: ['strong_attack', 'double_attack', 'ultra_attack', 'wide_attack', 'critical_attack'],
    magic_attacker: ['magic_shot', 'strong_magic_shot', 'magic_storm', 'magic_impact', 'magic_explosion', 'magic_charge'],
    tank: ['taunt', 'iron_wall', 'cover', 'counter_stance', 'fortitude'],
    healer: ['heal', 'heal_all', 'revive', 'cure_status', 'regen'],
    support: ['attack_boost', 'defense_boost', 'speed_boost', 'luck_boost', 'mp_restore', 'weaken', 'all_boost'],
    balance: ['normal_boost', 'focus', 'spirit', 'evasion_boost', 'poison_fog']
};

// プレイアブルキャラクター
const CHARACTERS = {
    keke: {
        id: 'keke',
        name: '唐可可',
        displayName: '可可',
        stats: {
            hp: 190,
            mp: 85,
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
            displayName: '可可のアピール',
            basePower: 0,
            mpCost: 20,
            priority: 'first',
            effects: [
                { type: 'taunt', duration: 3 },
                { type: 'buff', stat: 'physicalDefense', value: 0.3, duration: 3 }
            ],
            description: '3ターン挑発+自分の防御+30%（先制）'
        },
        image: {
            full: 'img/keke_full.png',
            face: 'img/keke_face.png'
        },
        skills: []
    },
    sky: {
        id: 'sky',
        name: 'キュアスカイ',
        displayName: 'スカイ',
        stats: {
            hp: 135,
            mp: 110,
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
            basePower: 270,
            mpCost: 60,
            effects: [
                { type: 'self_debuff', stat: 'physicalDefense', value: -0.3, duration: 1 }
            ],
            description: '単体に強力な物理攻撃（威力270%）'
        },
        image: {
            full: 'img/sky_full.png',
            face: 'img/sky_face.png'
        },
        skills: []
    },
    josuke: {
        id: 'josuke',
        name: '東方仗助',
        displayName: '仗助',
        stats: {
            hp: 125,
            mp: 130,
            physicalAttack: 50,
            magicAttack: 100,
            physicalDefense: 65,
            magicDefense: 115,
            speed: 95,
            luck: 60
        },
        type: 'healer',
        uniqueSkill: {
            id: 'heal',
            displayName: 'クレイジー・D',
            healPercent: 45,
            mpCost: 35,
            description: '単体HP 45%回復'
        },
        image: {
            full: 'img/josuke_full.png',
            face: 'img/josuke_face.png'
        },
        skills: []
    }
};

// 敵キャラクター
const ENEMIES = {
    // 第1幕 雑魚
    slime: {
        id: 'slime',
        name: 'スライム',
        displayName: 'スライム',
        type: 'balance',
        baseStats: {
            hp: 90, mp: 65, physicalAttack: 53, magicAttack: 34,
            physicalDefense: 54, magicDefense: 55, speed: 55, luck: 41
        },
        skills: ['focus'],
        image: { full: 'img/enemy_slime.png' },
        rank: 'normal'
    },
    goblin: {
        id: 'goblin',
        name: 'ゴブリン',
        displayName: 'ゴブリン',
        type: 'physical_attacker',
        baseStats: {
            hp: 95, mp: 60, physicalAttack: 60, magicAttack: 30,
            physicalDefense: 50, magicDefense: 45, speed: 60, luck: 45
        },
        skills: ['strong_attack'],
        image: { full: 'img/enemy_goblin.png' },
        rank: 'normal'
    },
    wolf: {
        id: 'wolf',
        name: 'ダイアウルフ',
        displayName: 'ウルフ',
        type: 'physical_attacker',
        baseStats: {
            hp: 85, mp: 50, physicalAttack: 65, magicAttack: 25,
            physicalDefense: 45, magicDefense: 40, speed: 75, luck: 50
        },
        skills: ['double_attack'],
        image: { full: 'img/enemy_wolf.png' },
        rank: 'normal'
    },

    // 第1幕 エリート
    orc: {
        id: 'orc',
        name: 'オーク戦士',
        displayName: 'オーク',
        type: 'physical_attacker',
        baseStats: {
            hp: 195, mp: 108, physicalAttack: 88, magicAttack: 40,
            physicalDefense: 90, magicDefense: 70, speed: 70, luck: 55
        },
        skills: ['strong_attack', 'double_attack'],
        image: { full: 'img/enemy_orc.png' },
        rank: 'elite'
    },
    dark_mage: {
        id: 'dark_mage',
        name: '闇の魔術師',
        displayName: '闇魔術師',
        type: 'magic_attacker',
        baseStats: {
            hp: 150, mp: 150, physicalAttack: 40, magicAttack: 100,
            physicalDefense: 60, magicDefense: 100, speed: 85, luck: 70
        },
        skills: ['strong_magic_shot', 'magic_explosion'],
        image: { full: 'img/enemy_dark_mage.png' },
        rank: 'elite'
    },

    // 中ボス
    dragon_knight: {
        id: 'dragon_knight',
        name: '竜騎士',
        displayName: '竜騎士',
        type: 'balance',
        baseStats: {
            hp: 220, mp: 130, physicalAttack: 106, magicAttack: 68,
            physicalDefense: 108, magicDefense: 110, speed: 90, luck: 75
        },
        skills: ['strong_attack', 'wide_attack', 'iron_wall'],
        image: { full: 'img/enemy_dragon_knight.png' },
        rank: 'boss'
    },
    demon_lord: {
        id: 'demon_lord',
        name: '魔王',
        displayName: '魔王',
        type: 'magic_attacker',
        baseStats: {
            hp: 200, mp: 180, physicalAttack: 80, magicAttack: 120,
            physicalDefense: 90, magicDefense: 130, speed: 100, luck: 80
        },
        skills: ['magic_storm', 'strong_magic_shot', 'heal'],
        image: { full: 'img/enemy_demon_lord.png' },
        rank: 'boss'
    },

    // 第2幕 雑魚
    golem: {
        id: 'golem',
        name: 'ゴーレム',
        displayName: 'ゴーレム',
        type: 'tank',
        baseStats: {
            hp: 250, mp: 80, physicalAttack: 100, magicAttack: 40,
            physicalDefense: 130, magicDefense: 100, speed: 50, luck: 40
        },
        skills: ['iron_wall'],
        image: { full: 'img/enemy_golem.png' },
        rank: 'normal'
    },
    dark_knight: {
        id: 'dark_knight',
        name: '暗黒騎士',
        displayName: '暗黒騎士',
        type: 'physical_attacker',
        baseStats: {
            hp: 200, mp: 100, physicalAttack: 120, magicAttack: 50,
            physicalDefense: 110, magicDefense: 90, speed: 90, luck: 60
        },
        skills: ['ultra_attack'],
        image: { full: 'img/enemy_dark_knight.png' },
        rank: 'normal'
    },

    // 第2幕 エリート
    lich: {
        id: 'lich',
        name: 'リッチ',
        displayName: 'リッチ',
        type: 'magic_attacker',
        baseStats: {
            hp: 280, mp: 200, physicalAttack: 50, magicAttack: 150,
            physicalDefense: 80, magicDefense: 150, speed: 100, luck: 90
        },
        skills: ['magic_storm', 'heal', 'poison_fog'],
        image: { full: 'img/enemy_lich.png' },
        rank: 'elite'
    },
    giant: {
        id: 'giant',
        name: '巨人',
        displayName: '巨人',
        type: 'physical_attacker',
        baseStats: {
            hp: 400, mp: 80, physicalAttack: 160, magicAttack: 40,
            physicalDefense: 140, magicDefense: 80, speed: 60, luck: 50
        },
        skills: ['ultra_attack', 'wide_attack'],
        image: { full: 'img/enemy_giant.png' },
        rank: 'elite'
    },

    // ラスボス
    chaos_lord: {
        id: 'chaos_lord',
        name: '混沌の王',
        displayName: '混沌の王',
        type: 'balance',
        baseStats: {
            hp: 400, mp: 250, physicalAttack: 176, magicAttack: 150,
            physicalDefense: 180, magicDefense: 184, speed: 120, luck: 100
        },
        skills: ['ultra_attack', 'magic_storm', 'heal_all', 'all_boost'],
        image: { full: 'img/enemy_chaos_lord.png' },
        rank: 'last_boss'
    }
};

// イベントデータ
const EVENTS = [
    {
        id: 'merchant',
        title: '商人との遭遇',
        description: '旅の商人に出会った。何か取引ができそうだ。',
        options: [
            {
                text: 'アイテムを購入（HP回復薬を入手）',
                effect: { type: 'item', item: 'hp_potion' }
            },
            {
                text: '無視して進む',
                effect: { type: 'none' }
            },
            {
                text: '脅して奪う（運判定）',
                effect: {
                    type: 'luck_check',
                    success: { type: 'item', item: 'hp_potion', message: '商人から品物を奪った！' },
                    fail: { type: 'damage', percent: 10, message: '反撃されてしまった...' }
                }
            }
        ]
    },
    {
        id: 'altar',
        title: '神秘の祭壇',
        description: '不思議な力を感じる祭壇を発見した。',
        options: [
            {
                text: 'HPを捧げる（HP-20%、ランダムスキル獲得）',
                effect: { type: 'sacrifice_hp', percent: 20, reward: 'random_skill' }
            },
            {
                text: 'MPを捧げる（MP-30%、ステータスUP）',
                effect: { type: 'sacrifice_mp', percent: 30, reward: 'stat_up' }
            },
            {
                text: '立ち去る',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'camp',
        title: '野営地',
        description: '安全そうな野営地を見つけた。',
        options: [
            {
                text: '休憩する（全員HP20%回復）',
                effect: { type: 'heal_all', percent: 20 }
            },
            {
                text: '訓練する（全員ランダムステータス+5%）',
                effect: { type: 'stat_up_all', percent: 5 }
            },
            {
                text: '探索する（運判定でアイテム入手 or ダメージ）',
                effect: {
                    type: 'luck_check',
                    success: { type: 'item', item: 'random', message: 'アイテムを発見した！' },
                    fail: { type: 'damage', percent: 15, message: '罠にかかってしまった...' }
                }
            }
        ]
    },
    {
        id: 'treasure_find',
        title: '宝箱発見',
        description: '道端に宝箱が落ちている！',
        options: [
            {
                text: '開ける',
                effect: { type: 'heal_all', percent: 10, bonus: 'gold', message: '全員HP10%回復+ゴールドを発見！' }
            },
            {
                text: '罠かもしれない...無視する',
                effect: { type: 'none' }
            },
            {
                text: '慎重に調べる（運判定）',
                effect: {
                    type: 'luck_check',
                    success: { type: 'item', item: 'rare', message: 'レアアイテムを発見した！' },
                    fail: { type: 'none', message: '空だった...' }
                }
            }
        ]
    },
    {
        id: 'fountain',
        title: '怪しげな泉',
        description: '光る泉を発見した。飲むと何かが起こりそうだ...',
        options: [
            {
                text: '飲む（ランダムで大回復 or ダメージ）',
                effect: {
                    type: 'random',
                    outcomes: [
                        { type: 'heal_all', percent: 50, message: '全員HP50%回復！神秘の力だ！', weight: 50 },
                        { type: 'damage', percent: 20, message: '毒だった...全員HP20%ダメージ', weight: 50 }
                    ]
                }
            },
            {
                text: '立ち去る',
                effect: { type: 'none' }
            },
            {
                text: 'ボトルに汲む（MP回復薬を入手）',
                effect: { type: 'item', item: 'mp_potion' }
            }
        ]
    },
    {
        id: 'trap',
        title: '罠！',
        description: '罠にかかってしまった！',
        options: [
            {
                text: '耐える（全員HP-15%）',
                effect: { type: 'damage', percent: 15 }
            },
            {
                text: '素早く回避を試みる（運判定）',
                effect: {
                    type: 'luck_check',
                    success: { type: 'none', message: '見事に回避した！' },
                    fail: { type: 'damage', percent: 25, message: '失敗！より大きなダメージを受けた...' }
                }
            },
            {
                text: '仲間を庇う（1人が-30%ダメージ、他は無傷）',
                effect: { type: 'damage_one', percent: 30 }
            }
        ]
    }
];

// アイテムデータ
const ITEMS = {
    hp_potion: {
        id: 'hp_potion',
        name: 'HP回復薬',
        description: '戦闘中使用、HP50%回復',
        type: 'consumable',
        effect: { type: 'heal', percent: 50 },
        maxStack: 3
    },
    mp_potion: {
        id: 'mp_potion',
        name: 'MP回復薬',
        description: '戦闘中使用、MP50%回復',
        type: 'consumable',
        effect: { type: 'mp_heal', percent: 50 },
        maxStack: 3
    },
    revive_stone: {
        id: 'revive_stone',
        name: '蘇生石',
        description: '戦闘不能から復活、HP30%',
        type: 'consumable',
        effect: { type: 'revive', percent: 30 },
        maxStack: 3
    },
    stat_crystal: {
        id: 'stat_crystal',
        name: 'ステータス結晶',
        description: '誰か1人のステータス×1.1',
        type: 'consumable',
        effect: { type: 'stat_boost', multiplier: 1.1 },
        maxStack: 3
    }
};

// ノードタイプ定義
const NODE_TYPES = {
    battle: { icon: '🗡️', name: '戦闘' },
    elite: { icon: '⚔️', name: 'エリート' },
    rest: { icon: '🔥', name: '休憩' },
    event: { icon: '❓', name: 'イベント' },
    treasure: { icon: '💎', name: '宝箱' },
    boss: { icon: '👑', name: 'ボス' }
};

// マップ構成
const MAP_CONFIG = {
    act1: {
        nodes: 10,
        composition: {
            battle: 5,
            elite: 2,
            rest: 1,
            event: 1,
            boss: 1
        },
        enemies: ['slime', 'goblin', 'wolf'],
        elites: ['orc', 'dark_mage'],
        bosses: ['dragon_knight', 'demon_lord'],
        multiplier: { start: 0.6, mid: 0.8, elite: 1.0, boss: 1.2 }
    },
    act2: {
        nodes: 10,
        composition: {
            battle: 4,
            elite: 2,
            rest: 1,
            event: 1,
            treasure: 1,
            boss: 1
        },
        enemies: ['golem', 'dark_knight'],
        elites: ['lich', 'giant'],
        bosses: ['chaos_lord'],
        multiplier: { start: 1.3, mid: 1.5, elite: 1.7, boss: 2.0 }
    }
};
