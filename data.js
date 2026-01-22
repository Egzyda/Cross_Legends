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
        power: 200,
        mpCost: 60,
        description: '単体に強力な物理攻撃（威力200%）'
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
    physical_charge: {
        id: 'physical_charge',
        name: '物理充填',
        type: 'buff',
        target: 'self',
        mpCost: 15,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 1.0, duration: 1 }
        ],
        description: '次ターン物理攻撃+100%'
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
        mpCost: 60,
        description: '単体に魔法攻撃（威力200%）'
    },
    magic_storm: {
        id: 'magic_storm',
        name: '魔力の嵐',
        type: 'magic_attack',
        target: 'all_enemies',
        power: 100,
        mpCost: 50,
        description: '全体に魔法攻撃（威力100%）'
    },
    magic_impact: {
        id: 'magic_impact',
        name: '魔力衝撃',
        type: 'magic_attack',
        target: 'single_enemy',
        power: 120,
        mpCost: 35,
        effects: [
            { type: 'status', status: 'paralysis', chance: 30 }
        ],
        description: '単体魔法攻撃（威力120%、麻痺30%）'
    },
    continuous_magic_shot: {
        id: 'continuous_magic_shot',
        name: '連続魔力弾',
        type: 'magic_attack',
        target: 'single_enemy',
        power: 80,
        hits: 2,
        mpCost: 40,
        description: '単体に2回魔法攻撃（威力80%×2）'
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
        mpCost: 40,
        priority: 'first',
        effects: [
            { type: 'taunt', duration: 2 },
            { type: 'buff', stat: 'physicalDefense', value: 0.2, duration: 2 },
            { type: 'buff', stat: 'magicDefense', value: 0.2, duration: 2 }
        ],
        description: '2ターン挑発状態、自分の物防/魔防+20%（先制）'
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
        description: '2ターン自分の物防/魔防+50%（先制）'
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
        description: '物防+30%、攻撃受けた時に反撃（威力80%）2ターン'
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
        description: 'HP30%以下で発動可、HP50%回復+物防/魔防+40% 3ターン'
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

    // --- サポート系（バフ） ---
    attack_boost: {
        id: 'attack_boost',
        name: '攻撃強化',
        type: 'buff',
        target: 'single_ally',
        mpCost: 30,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.35, duration: 3 },
            { type: 'buff', stat: 'magicAttack', value: 0.35, duration: 3 }
        ],
        description: '単体の物攻/魔攻+35% 3ターン'
    },
    attack_boost_all: {
        id: 'attack_boost_all',
        name: '全体攻撃強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.2, duration: 2 },
            { type: 'buff', stat: 'magicAttack', value: 0.2, duration: 2 }
        ],
        description: '全体の物攻/魔攻+20% 2ターン'
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
        description: '単体の物防/魔防+40% 3ターン'
    },
    defense_boost_all: {
        id: 'defense_boost_all',
        name: '全体防御強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.25, duration: 2 },
            { type: 'buff', stat: 'magicDefense', value: 0.25, duration: 2 }
        ],
        description: '全体の物防/魔防+25% 2ターン'
    },
    speed_boost: {
        id: 'speed_boost',
        name: '速度上昇',
        type: 'buff',
        target: 'single_ally',
        mpCost: 30,
        effects: [
            { type: 'buff', stat: 'speed', value: 0.6, duration: 3 }
        ],
        description: '単体の速度+60% 3ターン'
    },
    speed_boost_all: {
        id: 'speed_boost_all',
        name: '全体速度上昇',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'speed', value: 0.35, duration: 2 }
        ],
        description: '全体の速度+35% 2ターン'
    },
    luck_boost: {
        id: 'luck_boost',
        name: '幸運付与',
        type: 'buff',
        target: 'single_ally',
        mpCost: 30,
        effects: [
            { type: 'buff', stat: 'luck', value: 0.5, duration: 3 },
            { type: 'critBoost', value: 30, duration: 3 }
        ],
        description: '単体の運+50%+クリ率+30% 3ターン'
    },
    luck_boost_all: {
        id: 'luck_boost_all',
        name: '全体幸運付与',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'luck', value: 0.3, duration: 2 },
            { type: 'critBoost', value: 15, duration: 2 }
        ],
        description: '全体の運+30%+クリ率+15% 2ターン'
    },

    // --- デバッファー系（デバフ） ---
    weaken: {
        id: 'weaken',
        name: '攻撃弱体',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 25,
        effects: [
            { type: 'debuff', stat: 'physicalAttack', value: -0.3, duration: 3 },
            { type: 'debuff', stat: 'magicAttack', value: -0.3, duration: 3 }
        ],
        description: '単体の物攻/魔攻-30% 3ターン'
    },
    weaken_all: {
        id: 'weaken_all',
        name: '全体攻撃弱体',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 45,
        effects: [
            { type: 'debuff', stat: 'physicalAttack', value: -0.2, duration: 2 },
            { type: 'debuff', stat: 'magicAttack', value: -0.2, duration: 2 }
        ],
        description: '全体の物攻/魔攻-20% 2ターン'
    },
    armor_break: {
        id: 'armor_break',
        name: '防御破壊',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 25,
        effects: [
            { type: 'debuff', stat: 'physicalDefense', value: -0.35, duration: 2 },
            { type: 'debuff', stat: 'magicDefense', value: -0.35, duration: 2 }
        ],
        description: '単体の物防/魔防-35% 2ターン'
    },
    armor_break_all: {
        id: 'armor_break_all',
        name: '全体防御破壊',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 45,
        effects: [
            { type: 'debuff', stat: 'physicalDefense', value: -0.2, duration: 2 },
            { type: 'debuff', stat: 'magicDefense', value: -0.2, duration: 2 }
        ],
        description: '全体の物防/魔防-20% 2ターン'
    },
    speed_down: {
        id: 'speed_down',
        name: '速度低下',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 20,
        effects: [
            { type: 'debuff', stat: 'speed', value: -0.3, duration: 3 }
        ],
        description: '単体の速度-30% 3ターン'
    },
    speed_down_all: {
        id: 'speed_down_all',
        name: '全体速度低下',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 40,
        effects: [
            { type: 'debuff', stat: 'speed', value: -0.2, duration: 2 }
        ],
        description: '全体の速度-20% 2ターン'
    },
    luck_down: {
        id: 'luck_down',
        name: '不運付与',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 20,
        effects: [
            { type: 'debuff', stat: 'luck', value: -0.4, duration: 3 }
        ],
        description: '単体の運-40% 3ターン'
    },
    luck_down_all: {
        id: 'luck_down_all',
        name: '全体不運付与',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 35,
        effects: [
            { type: 'debuff', stat: 'luck', value: -0.25, duration: 2 }
        ],
        description: '全体の運-25% 2ターン'
    },


    // --- その他サポート系 ---

    all_boost: {
        id: 'all_boost',
        name: '全能力強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 60,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.2, duration: 2 },
            { type: 'buff', stat: 'magicAttack', value: 0.2, duration: 2 },
            { type: 'buff', stat: 'physicalDefense', value: 0.2, duration: 2 },
            { type: 'buff', stat: 'magicDefense', value: 0.2, duration: 2 },
            { type: 'buff', stat: 'speed', value: 0.2, duration: 2 }
        ],
        description: '全体の全ステータス+20% 2ターン'
    },

    // --- 敵専用スキル ---
    poison_single: {
        id: 'poison_single',
        name: 'どくどく',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 20,
        effects: [
            { type: 'status', status: 'poison', chance: 100, duration: 3 }
        ],
        description: '単体を毒状態にする（3ターン）'
    },
    paralyze_single: {
        id: 'paralyze_single',
        name: '拘束',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 25,
        effects: [
            { type: 'status', status: 'paralysis', chance: 100, duration: 2 }
        ],
        description: '単体を麻痺状態にする（2ターン）'
    }
};

// タイプ別スキルプール
const SKILL_POOLS = {
    physical_attacker: ['strong_attack', 'double_attack', 'ultra_attack', 'wide_attack', 'critical_attack', 'physical_charge'],
    magic_attacker: ['magic_shot', 'strong_magic_shot', 'magic_storm', 'magic_impact', 'continuous_magic_shot', 'magic_charge'],
    tank: ['taunt', 'iron_wall', 'counter_stance', 'fortitude'],
    healer: ['heal', 'heal_all', 'revive', 'cure_status'],
    support: ['attack_boost', 'attack_boost_all', 'defense_boost', 'defense_boost_all', 'speed_boost', 'speed_boost_all', 'luck_boost', 'luck_boost_all'],
    debuffer: ['weaken', 'weaken_all', 'armor_break', 'armor_break_all', 'speed_down', 'speed_down_all', 'luck_down', 'luck_down_all']
};

// スキル出現率設定（報酬選択時に使用）
const SKILL_ACQUISITION_RATES = {
    ownRole: 0.70,      // 自分の役割のスキル: 70%
    otherRole: 0.30     // 他の役割のスキル: 30% (各役割6%ずつ、5役割)
};

// イベントデータ
const EVENTS = [
    {
        id: 'merchant',
        title: '商人との遭遇',
        description: '旅の商人に出会った。',
        options: [
            {
                text: '無視して進む',
                effect: { type: 'none' }
            },
            {
                text: '脅して奪う（運判定）',
                effect: {
                    type: 'luck_check',
                    success: { type: 'item', item: 'hp_potion', message: '商人から品物を奪った！' },
                    fail: { type: 'damage', percent: 15, message: '反撃されてしまった...' }
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
        id: 'treasure_find',
        title: '宝箱発見',
        description: '道端に宝箱が落ちている！',
        options: [
            {
                text: '開ける（何が出るか...）',
                effect: {
                    type: 'random',
                    outcomes: [
                        { type: 'item', item: 'random', weight: 50, message: 'アイテムを発見した！' },
                        { type: 'damage', percent: 15, weight: 50, message: '罠だった！ダメージを受けた...' }
                    ]
                }
            },
            {
                text: '無視する',
                effect: { type: 'none' }
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
        title: '罠',
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
            }
        ]
    }
];

// アイテムデータ
const ITEMS = {
    hp_potion: {
        id: 'hp_potion',
        name: 'HP回復薬',
        description: 'HP50%回復',
        type: 'consumable',
        effect: { type: 'heal', percent: 50 },
        maxStack: 3
    },
    mp_potion: {
        id: 'mp_potion',
        name: 'MP回復薬',
        description: 'MP50%回復',
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
        enemies: ['slime', 'kuribo', 'abo', 'wadorudo', 'kamec'],
        elites: ['arboc', 'buggy', 'shadow', 'kabaton'],
        bosses: ['baikinman', 'giginebura', 'geto', 'bangiras', 'orochimaru'],
        multiplier: { start: 0.9, mid: 1.1, elite: 1.25, boss: 1.4 }
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
        enemies: ['bullfango', 'metroid', 'redead', 'bombhei', 'toxtricity'],
        elites: ['koopajr', 'metaknight', 'hisoka', 'darkprecure'],
        bosses: ['freeza', 'dio', 'aizen', 'necrozma', 'masterhand', 'shigaraki', 'koopa'],
        multiplier: { start: 1.5, mid: 1.7, elite: 1.9, boss: 2.2 }
    }
};
