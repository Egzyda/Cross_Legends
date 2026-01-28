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
            { type: 'status', status: 'paralysis', chance: 100 }
        ],
        description: '単体魔法攻撃（威力120%、麻痺100%）'
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


    // --- タンク系 ---
    taunt: {
        id: 'taunt',
        name: '挑発',
        type: 'buff',
        target: 'self',
        mpCost: 40,
        priority: 'first',
        effects: [
            { type: 'taunt', duration: 3 },
            { type: 'buff', stat: 'physicalDefense', value: 0.2, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.2, duration: 3 }
        ],
        description: '挑発＋物防/魔防+20% (3T)（先制）'
    },
    iron_wall: {
        id: 'iron_wall',
        name: '鉄壁',
        type: 'buff',
        target: 'self',
        mpCost: 30,
        priority: 'first',
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.5, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.5, duration: 3 }
        ],
        description: '自分の物防/魔防+50% (3T)（先制）'
    },

    counter_stance: {
        id: 'counter_stance',
        name: '反撃の構え',
        type: 'buff',
        target: 'self',
        mpCost: 35,
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.1, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.1, duration: 3 },
            { type: 'counter', power: 150, duration: 3 }
        ],
        description: '物防/魔防+10%、反撃状態（威力150%）(3T)'
    },
    fortitude: {
        id: 'fortitude',
        name: '不屈',
        type: 'buff',
        target: 'self',
        mpCost: 50,
        effects: [
            { type: 'heal', value: 0.3 },
            { type: 'buff', stat: 'physicalDefense', value: 0.1, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.1, duration: 3 }
        ],
        description: '自身のHP30%回復＋物防/魔防10%アップ (3T)'
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
        mpCost: 50,
        healPercent: 20,
        description: '全体HP 20%回復'
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
        description: '単体の物攻/魔攻+35% (3T)'
    },
    attack_boost_all: {
        id: 'attack_boost_all',
        name: '全体攻撃強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.2, duration: 3 },
            { type: 'buff', stat: 'magicAttack', value: 0.2, duration: 3 }
        ],
        description: '全体の物攻/魔攻+20% (3T)'
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
        description: '単体の物防/魔防+40% (3T)'
    },
    defense_boost_all: {
        id: 'defense_boost_all',
        name: '全体防御強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'physicalDefense', value: 0.25, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.25, duration: 3 }
        ],
        description: '全体の物防/魔防+25% (3T)'
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
        description: '単体の速度+60% (3T)'
    },
    speed_boost_all: {
        id: 'speed_boost_all',
        name: '全体速度上昇',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'buff', stat: 'speed', value: 0.35, duration: 3 }
        ],
        description: '全体の速度+35% (3T)'
    },
    luck_boost: {
        id: 'luck_boost',
        name: 'クリティカル率上昇',
        type: 'buff',
        target: 'single_ally',
        mpCost: 30,
        effects: [
            { type: 'critBoost', value: 50, duration: 3 }
        ],
        description: '単体のクリ率+50% (3T)'
    },
    luck_boost_all: {
        id: 'luck_boost_all',
        name: '全体クリティカル率上昇',
        type: 'buff',
        target: 'all_allies',
        mpCost: 50,
        effects: [
            { type: 'critBoost', value: 30, duration: 3 }
        ],
        description: '全体のクリ率+30% (3T)'
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
        description: '単体の物攻/魔攻-30% (3T)'
    },
    weaken_all: {
        id: 'weaken_all',
        name: '全体攻撃弱体',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 45,
        effects: [
            { type: 'debuff', stat: 'physicalAttack', value: -0.2, duration: 3 },
            { type: 'debuff', stat: 'magicAttack', value: -0.2, duration: 3 }
        ],
        description: '全体の物攻/魔攻-20% (3T)'
    },
    armor_break: {
        id: 'armor_break',
        name: '防御破壊',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 25,
        effects: [
            { type: 'debuff', stat: 'physicalDefense', value: -0.35, duration: 3 },
            { type: 'debuff', stat: 'magicDefense', value: -0.35, duration: 3 }
        ],
        description: '単体の物防/魔防-35% (3T)'
    },
    armor_break_all: {
        id: 'armor_break_all',
        name: '全体防御破壊',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 45,
        effects: [
            { type: 'debuff', stat: 'physicalDefense', value: -0.2, duration: 3 },
            { type: 'debuff', stat: 'magicDefense', value: -0.2, duration: 3 }
        ],
        description: '全体の物防/魔防-20% (3T)'
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
        description: '単体の速度-30% (3T)'
    },
    speed_down_all: {
        id: 'speed_down_all',
        name: '全体速度低下',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 40,
        effects: [
            { type: 'debuff', stat: 'speed', value: -0.2, duration: 3 }
        ],
        description: '全体の速度-20% (3T)'
    },
    luck_down: {
        id: 'luck_down',
        name: 'クリティカル率低下',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 20,
        effects: [
            { type: 'critBoost', value: -30, duration: 3 }
        ],
        description: '単体のクリ率-30% (3T)'
    },
    luck_down_all: {
        id: 'luck_down_all',
        name: '全体クリティカル率低下',
        type: 'debuff',
        target: 'all_enemies',
        mpCost: 35,
        effects: [
            { type: 'critBoost', value: -20, duration: 3 }
        ],
        description: '全体のクリ率-20% (3T)'
    },


    // --- その他サポート系 ---

    all_boost: {
        id: 'all_boost',
        name: '全能力強化',
        type: 'buff',
        target: 'all_allies',
        mpCost: 60,
        effects: [
            { type: 'buff', stat: 'physicalAttack', value: 0.2, duration: 3 },
            { type: 'buff', stat: 'magicAttack', value: 0.2, duration: 3 },
            { type: 'buff', stat: 'physicalDefense', value: 0.2, duration: 3 },
            { type: 'buff', stat: 'magicDefense', value: 0.2, duration: 3 },
            { type: 'buff', stat: 'speed', value: 0.2, duration: 3 }
        ],
        description: '全体の全ステータス+20% (3T)'
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
        description: '単体を毒状態にする (3T)'
    },
    paralyze_single: {
        id: 'paralyze_single',
        name: '拘束',
        type: 'debuff',
        target: 'single_enemy',
        mpCost: 35,
        effects: [
            { type: 'status', status: 'paralysis', chance: 100, duration: 3 }
        ],
        description: '単体を麻痺状態にする (3T)'
    }
};

// タイプ別スキルプール
const SKILL_POOLS = {
    physical_attacker: ['strong_attack', 'double_attack', 'ultra_attack', 'wide_attack', 'critical_attack'],
    magic_attacker: ['magic_shot', 'strong_magic_shot', 'magic_storm', 'magic_impact', 'continuous_magic_shot'],
    tank: ['taunt', 'iron_wall', 'counter_stance', 'fortitude'],
    healer: ['heal', 'heal_all', 'revive', 'cure_status'],
    support: ['attack_boost', 'attack_boost_all', 'defense_boost', 'defense_boost_all', 'speed_boost', 'speed_boost_all', 'luck_boost', 'luck_boost_all'],
    debuffer: ['weaken', 'weaken_all', 'armor_break', 'armor_break_all', 'speed_down', 'speed_down_all', 'luck_down', 'luck_down_all']
};

// スキル出現率設定（報酬選択時に使用）
const SKILL_ACQUISITION_RATES = {
    ownRole: 0.80,      // 自分の役割のスキル: 80%
    otherRole: 0.20     // 他の役割のスキル: 20% (各役割4%ずつ、5役割)
};

// イベントデータ
const EVENTS = [
    {
        id: 'merchant',
        title: '商人との遭遇',
        description: '旅の商人に出会った。いい物を売っていそうだ。',
        options: [
            {
                text: '無視して進む',
                effect: { type: 'none' }
            },
            {
                text: '脅して奪う<br><span class="event-desc">成功で品物 / 失敗で反撃（ダメージ）</span>',
                effect: {
                    type: 'luck_check',
                    risk: 'medium',
                    success: { type: 'item', item: 'random', message: '商人から品物を奪った！' },
                    fail: { type: 'damage', percent: 20, message: '用心棒に反撃された！全員HP20%ダメージ' }
                }
            }
        ]
    },
    {
        id: 'altar',
        title: '神秘の祭壇',
        description: '不思議な力を感じる祭壇だ。代償を払えば力が得られそうだ。',
        options: [
            {
                text: 'HPを捧げる<br><span class="event-desc">全員HP-20% → ランダムスキル習得</span>',
                effect: { type: 'sacrifice_hp', percent: 20, reward: 'random_skill' }
            },
            {
                text: 'MPを捧げる<br><span class="event-desc">全員MP-30% → 全員ステータスUP</span>',
                effect: { type: 'sacrifice_mp', percent: 30, reward: 'stat_boost_all' }
            },
            {
                text: '立ち去る',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'old_treasure',
        title: '古びた宝箱',
        description: 'かなり古そうな宝箱がある。罠が仕掛けられているかもしれない。',
        options: [
            {
                text: '開ける<br><span class="event-desc">成功ですごい薬 / 失敗で罠（ダメージ）</span>',
                effect: {
                    type: 'luck_check',
                    risk: 'high',
                    success: { type: 'item', item: 'revive_potion', message: 'なんと！「蘇生薬」を見つけた！' },
                    fail: { type: 'damage', percent: 25, message: '罠発動！全員HP25%ダメージ！' }
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
        title: '不思議な泉',
        description: 'キラキラと光る泉だ。',
        options: [
            {
                text: '飲む<br><span class="event-desc">50%で全回復 / 50%でダメージ</span>',
                effect: {
                    type: 'random',
                    outcomes: [
                        { type: 'heal_all', percent: 100, message: '体が軽い！全員HP全回復！', weight: 50 },
                        { type: 'damage', percent: 15, message: 'お腹を壊した...全員HP15%ダメージ', weight: 50 }
                    ]
                }
            },
            {
                text: 'ボトルに汲む<br><span class="event-desc">MP回復薬を入手</span>',
                effect: { type: 'item', item: 'mp_potion' }
            }
        ]
    },
    {
        id: 'trap',
        title: '落とし穴',
        description: '足元の地面が突然崩れた！',
        options: [
            {
                text: '受け身を取る<br><span class="event-desc">全員HP-10%</span>',
                effect: { type: 'damage', percent: 10 }
            },
            {
                text: '回避を試みる<br><span class="event-desc">失敗で大ダメージ</span>',
                effect: {
                    type: 'luck_check',
                    risk: 'medium',
                    success: { type: 'none', message: '華麗に回避した！' },
                    fail: { type: 'damage', percent: 30, message: '失敗！激しく打ち付けた...全員HP30%ダメージ' }
                }
            }
        ]
    },
    {
        id: 'training',
        title: '森の訓練場',
        description: '古い訓練用具が残されている。少し体を動かせそうだ。',
        options: [
            {
                text: '軽く運動<br><span class="event-desc">SP+3</span>',
                effect: { type: 'gain_sp', value: 3, message: 'いい運動になった。' }
            },
            {
                text: 'ハードトレーニング<br><span class="event-desc">全員HP-30% → 全員 攻/防+5%永続</span>',
                effect: { type: 'stat_boost_all', stat: 'all', value: 0.05, cost: { type: 'hp', percent: 30 } }
            }
        ]
    },
    {
        id: 'cursed_statue',
        title: '呪いの像',
        description: '禍々しいオーラを放つ像がある。「力を欲するか...？」',
        options: [
            {
                text: '力を得る<br><span class="event-desc">全員の最大HP-10% → 全員の攻撃+15%永続</span>',
                effect: { type: 'stat_trade', targetStat: 'attack', targetValue: 0.15, costStat: 'max_hp', costValue: 0.10 }
            },
            {
                text: '像を破壊する<br><span class="event-desc">成功でSP獲得 / 失敗で呪い</span>',
                effect: {
                    type: 'luck_check',
                    risk: 'low',
                    success: { type: 'gain_sp', value: 5, message: '像の中から魔力の欠片（SP）が出てきた！' },
                    fail: { type: 'status_all', status: 'curse', duration: 3, message: '呪い（攻撃ダウン）を受けてしまった...' }
                }
            },
            {
                text: '無視する',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'lost_adventurer',
        title: '迷子の冒険者',
        description: '道に迷った冒険者が困っている。「ポーションを恵んでくれませんか...」',
        options: [
            {
                text: 'HP回復薬をあげる<br><span class="event-desc">SP+10</span>',
                effect: { type: 'trade_item', reqItem: 'hp_potion', reward: { type: 'gain_sp', value: 10 } }
            },
            {
                text: '無視する',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'gambler',
        title: '怪しい賭博師',
        description: '「へい旦那、運試ししていかねぇかい？」',
        options: [
            {
                text: '100円賭ける<br><span class="event-desc">50%で300円</span>',
                effect: { type: 'gamble_gold', cost: 100, reward: 300, chance: 50 }
            },
            {
                text: '500円賭ける<br><span class="event-desc">30%で1500円</span>',
                effect: { type: 'gamble_gold', cost: 500, reward: 1500, chance: 30 }
            },
            {
                text: '興味ない',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'sanctuary',
        title: '静寂の聖域',
        description: '清らかな空気が流れる場所だ。心が安らぐ。',
        options: [
            {
                text: '休息する<br><span class="event-desc">全員HP30%回復</span>',
                effect: { type: 'heal_all', percent: 30 }
            },
            {
                text: '瞑想する<br><span class="event-desc">全員MP50%回復</span>',
                effect: { type: 'heal_mp_all', percent: 50, message: '精神が研ぎ澄まされた！' }
            }
        ]
    },
    {
        id: 'library',
        title: '古代の書庫',
        description: 'ボロボロの本が散らばっている。何か役に立つ知識があるかもしれない。',
        options: [
            {
                text: '本を読む<br><span class="event-desc">全員MP-20% → SP+5</span>',
                effect: { type: 'gain_sp', value: 5, cost: { type: 'mp', percent: 20 } }
            },
            {
                text: '立ち去る',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'blacksmith',
        title: '旅の鍛冶屋',
        description: '「武器の手入れをしてやろうか？もちろんタダじゃないがな」',
        options: [
            {
                text: '武器を磨く<br><span class="event-desc">300円: 誰か1人の攻撃+10%永続</span>',
                effect: { type: 'upgrade_stat', stat: 'attack', value: 0.10, cost: 300, target: 'single' }
            },
            {
                text: '防具を叩く<br><span class="event-desc">300円: 誰か1人の防御+10%永続</span>',
                effect: { type: 'upgrade_stat', stat: 'defense', value: 0.10, cost: 300, target: 'single' }
            },
            {
                text: '今はいい',
                effect: { type: 'none' }
            }
        ]
    },
    {
        id: 'monster_nest',
        title: '魔物の巣穴',
        description: '強力な魔物の気配がする...倒せば良い物を持っているかもしれない。',
        options: [
            {
                text: '挑む<br><span class="event-desc">エリート戦闘開始</span>',
                effect: { type: 'battle_start', rank: 'elite' }
            },
            {
                text: 'こっそり通り抜ける<br><span class="event-desc">見つかると戦闘開始</span>',
                effect: {
                    type: 'luck_check',
                    risk: 'medium',
                    success: { type: 'none', message: '気づかれずに通り抜けた。' },
                    fail: { type: 'battle_start', rank: 'normal', message: '見つかってしまった！戦闘開始！' }
                }
            }
        ]
    },
    {
        id: 'fairy',
        title: 'いたずら妖精',
        description: '妖精が目の前を飛び回っている。',
        options: [
            {
                text: '遊んであげる<br><span class="event-desc">全員MP全回復</span>',
                effect: { type: 'heal_mp_all', percent: 100 }
            },
            {
                text: '踊ってもらう<br><span class="event-desc">成功で全体強化 / 失敗でMP減少</span>',
                effect: {
                    type: 'luck_check',
                    risk: 'low',
                    success: { type: 'stat_boost_all', stat: 'all', value: 0.03, message: '不思議な粉を浴びて力が湧いてきた！' },
                    fail: { type: 'mp_damage_all', percent: 20, message: 'MPを吸い取られて逃げられた...' }
                }
            }
        ]
    },
    {
        id: 'wishing_well',
        title: '願いの井戸',
        description: 'コインを投げ入れると願いが叶うという井戸だ。',
        options: [
            {
                text: '小銭を投げる<br><span class="event-desc">50円: 低確率でアイテム</span>',
                effect: { type: 'gacha_item', cost: 50, chance: 30 }
            },
            {
                text: '大金を投げる<br><span class="event-desc">300円: 高確率でレアアイテム</span>',
                effect: { type: 'gacha_item', cost: 300, chance: 80, rare: true }
            },
            {
                text: '立ち去る',
                effect: { type: 'none' }
            }
        ]
    }
];

// アイテムデータ（12種類）
const ITEMS = {
    // === 単体バフ系（3ターン） ===
    power_crystal: {
        id: 'power_crystal',
        name: '力の結晶',
        description: '単体の物攻/魔攻+50% (3T)',
        type: 'buff_item',
        price: 100,
        target: 'single_ally',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'physicalAttack', value: 0.5, duration: 3 },
                { stat: 'magicAttack', value: 0.5, duration: 3 }
            ]
        }
    },
    guard_crystal: {
        id: 'guard_crystal',
        name: '守護の結晶',
        description: '単体の物防/魔防+50% (3T)',
        type: 'buff_item',
        price: 100,
        target: 'single_ally',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'physicalDefense', value: 0.5, duration: 3 },
                { stat: 'magicDefense', value: 0.5, duration: 3 }
            ]
        }
    },
    swift_crystal: {
        id: 'swift_crystal',
        name: '迅速の結晶',
        description: '単体の速度+50% (3T)',
        type: 'buff_item',
        price: 100,
        target: 'single_ally',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'speed', value: 0.5, duration: 3 }
            ]
        }
    },
    crit_crystal: {
        id: 'crit_crystal',
        name: '会心の結晶',
        description: '単体の会心率+50% (3T)',
        type: 'buff_item',
        price: 100,
        target: 'single_ally',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'critBoost', value: 50, duration: 3 }
            ]
        }
    },
    // === 全体バフ系（3ターン） ===
    power_spread_crystal: {
        id: 'power_spread_crystal',
        name: '力の拡散結晶',
        description: '全体の物攻/魔攻+30% (3T)',
        type: 'buff_item',
        price: 150,
        target: 'all_allies',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'physicalAttack', value: 0.3, duration: 3 },
                { stat: 'magicAttack', value: 0.3, duration: 3 }
            ]
        }
    },
    guard_spread_crystal: {
        id: 'guard_spread_crystal',
        name: '守護の拡散結晶',
        description: '全体の物防/魔防+30% (3T)',
        type: 'buff_item',
        price: 150,
        target: 'all_allies',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'physicalDefense', value: 0.3, duration: 3 },
                { stat: 'magicDefense', value: 0.3, duration: 3 }
            ]
        }
    },
    swift_spread_crystal: {
        id: 'swift_spread_crystal',
        name: '迅速の拡散結晶',
        description: '全体の速度+30% (3T)',
        type: 'buff_item',
        price: 150,
        target: 'all_allies',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'speed', value: 0.3, duration: 3 }
            ]
        }
    },
    crit_spread_crystal: {
        id: 'crit_spread_crystal',
        name: '会心の拡散結晶',
        description: '全体の会心率+30% (3T)',
        type: 'buff_item',
        price: 150,
        target: 'all_allies',
        effect: {
            type: 'buff',
            effects: [
                { stat: 'critBoost', value: 30, duration: 3 }
            ]
        }
    },
    // === デバフアイテム ===
    weaken_crystal: {
        id: 'weaken_crystal',
        name: '力弱体の結晶',
        description: '単体の物攻/魔攻-50% (3T)',
        type: 'debuff_item',
        price: 100,
        target: 'single_enemy',
        effect: {
            type: 'debuff',
            effects: [
                { stat: 'physicalAttack', value: -0.5, duration: 3 },
                { stat: 'magicAttack', value: -0.5, duration: 3 }
            ]
        }
    },
    guard_break_crystal: {
        id: 'guard_break_crystal',
        name: '守護弱体の結晶',
        description: '単体の物防/魔防-50% (3T)',
        type: 'debuff_item',
        price: 100,
        target: 'single_enemy',
        effect: {
            type: 'debuff',
            effects: [
                { stat: 'physicalDefense', value: -0.5, duration: 3 },
                { stat: 'magicDefense', value: -0.5, duration: 3 }
            ]
        }
    },
    weaken_spread_crystal: {
        id: 'weaken_spread_crystal',
        name: '力弱体の拡散結晶',
        description: '全体の物攻/魔攻-30% (3T)',
        type: 'debuff_item',
        price: 150,
        target: 'all_enemies',
        effect: {
            type: 'debuff',
            effects: [
                { stat: 'physicalAttack', value: -0.3, duration: 3 },
                { stat: 'magicAttack', value: -0.3, duration: 3 }
            ]
        }
    },
    guard_break_spread_crystal: {
        id: 'guard_break_spread_crystal',
        name: '守護弱体の拡散結晶',
        description: '全体の物防/魔防-30% (3T)',
        type: 'debuff_item',
        price: 150,
        target: 'all_enemies',
        effect: {
            type: 'debuff',
            effects: [
                { stat: 'physicalDefense', value: -0.3, duration: 3 },
                { stat: 'magicDefense', value: -0.3, duration: 3 }
            ]
        }
    },
    // === 回復系 ===
    hp_potion: {
        id: 'hp_potion',
        price: 200,
        name: 'HP回復薬',
        description: '単体HP30%回復',
        type: 'consumable',
        target: 'single_ally',
        effect: { type: 'heal', percent: 30 }
    },
    mp_potion: {
        id: 'mp_potion',
        price: 200,
        name: 'MP回復薬',
        description: '単体MP30%回復',
        type: 'consumable',
        target: 'single_ally',
        effect: { type: 'mp_heal', percent: 30 }
    },
    hp_potion_all: {
        id: 'hp_potion_all',
        price: 300,
        name: 'HP全体回復薬',
        description: '全体HP20%回復',
        type: 'consumable',
        target: 'all_allies',
        effect: { type: 'heal', percent: 20 }
    },
    mp_potion_all: {
        id: 'mp_potion_all',
        price: 300,
        name: 'MP全体回復薬',
        description: '全体MP20%回復',
        type: 'consumable',
        target: 'all_allies',
        effect: { type: 'mp_heal', percent: 20 }
    },
    // === 特殊アイテム ===
    revive_potion: {
        id: 'revive_potion',
        price: 500,
        name: '蘇生薬',
        description: '戦闘不能の味方1人をHP100%で復活',
        type: 'consumable',
        target: 'single_ally_dead',
        usableOnMap: true,
        effect: { type: 'revive', percent: 100 }
    },
    status_recovery_potion: {
        id: 'status_recovery_potion',
        name: '状態異常回復薬',
        description: '味方1人の全ての状態異常を回復',
        price: 150,
        type: 'consumable',
        target: 'single_ally',
        usableOnMap: true,
        effect: { type: 'status_cure' }
    }
};

// アイテム出現プール（ランダム獲得用）
const ITEM_POOL = [
    'power_crystal', 'guard_crystal', 'swift_crystal', 'crit_crystal',
    'power_spread_crystal', 'guard_spread_crystal', 'swift_spread_crystal', 'crit_spread_crystal',
    'weaken_crystal', 'guard_break_crystal', 'weaken_spread_crystal', 'guard_break_spread_crystal',
    'hp_potion', 'mp_potion', 'hp_potion_all', 'mp_potion_all',
    'revive_potion', 'status_recovery_potion'
];

// ノードタイプ定義
const NODE_TYPES = {
    battle: { icon: '🗡️', name: '戦闘' },
    elite: { icon: '⚔️', name: 'エリート' },
    rest: { icon: '🔥', name: '休憩' },
    event: { icon: '❓', name: 'イベント' },
    shop: { icon: '🛒', name: 'ショップ' },
    boss: { icon: '👑', name: 'ボス' }
};

// マップ構成
const MAP_CONFIG = {
    act1: {
        nodes: 10,
        composition: {
            battle: 4,
            elite: 1,
            rest: 1,
            event: 2,
            shop: 1,
            boss: 1
        },
        enemies: ['slime', 'kuribo', 'abo', 'wadorudo', 'kamec'],
        elites: ['arboc', 'buggy', 'shadow', 'kabaton', 'avdol'],
        bosses: ['baikinman', 'giginebura', 'geto', 'bangiras', 'orochimaru', 'sarah_kazuno'],
        multiplier: { start: 0.9, mid: 1.1, elite: 1.25, boss: 1.4 }
    },
    act2: {
        nodes: 10,
        composition: {
            battle: 4,
            elite: 1,
            rest: 1,
            event: 2,
            shop: 1,
            boss: 1
        },
        enemies: ['bullfango', 'metroid', 'redead', 'bombhei', 'toxtricity'],
        elites: ['koopajr', 'metaknight', 'hisoka', 'darkprecure', 'teostra'],
        bosses: ['freeza', 'dio', 'aizen', 'necrozma', 'masterhand', 'shigaraki', 'koopa', 'zabuza'],
        multiplier: { start: 1.0, mid: 1.0, elite: 1.0, boss: 1.0 }  // 難易度システムで調整
    }
};

// 難易度設定（0-10）
const DIFFICULTY_CONFIG = {
    0: {
        name: '基準',
        description: '標準的な難易度',
        hpMultiplier: 1.00,
        attackMultiplier: 1.00,
        eliteBonus: 0,
        restHealPercent: 100,
        shopPriceMultiplier: 1.00
    },
    1: {
        name: '難易度1',
        description: '少し難易度アップ',
        hpMultiplier: 1.05,
        attackMultiplier: 1.02,
        eliteBonus: 1,
        restHealPercent: 100,
        shopPriceMultiplier: 1.05
    },
    2: {
        name: '難易度2',
        description: 'エリート数が増加',
        hpMultiplier: 1.10,
        attackMultiplier: 1.04,
        eliteBonus: 1,
        restHealPercent: 90,
        shopPriceMultiplier: 1.10
    },
    3: {
        name: '難易度3',
        description: '休憩の回復量が減少',
        hpMultiplier: 1.15,
        attackMultiplier: 1.06,
        eliteBonus: 1,
        restHealPercent: 80,
        shopPriceMultiplier: 1.15
    },
    4: {
        name: '難易度4',
        description: 'エリート数がさらに増加',
        hpMultiplier: 1.20,
        attackMultiplier: 1.08,
        eliteBonus: 2,
        restHealPercent: 70,
        shopPriceMultiplier: 1.20
    },
    5: {
        name: '難易度5',
        description: '中級者向けの難易度',
        hpMultiplier: 1.25,
        attackMultiplier: 1.10,
        eliteBonus: 2,
        restHealPercent: 60,
        shopPriceMultiplier: 1.25
    },
    6: {
        name: '難易度6',
        description: '休憩の回復量がさらに減少',
        hpMultiplier: 1.30,
        attackMultiplier: 1.12,
        eliteBonus: 2,
        restHealPercent: 60,
        shopPriceMultiplier: 1.30
    },
    7: {
        name: '難易度7',
        description: 'エリートが大幅に増加',
        hpMultiplier: 1.35,
        attackMultiplier: 1.15,
        eliteBonus: 3,
        restHealPercent: 50,
        shopPriceMultiplier: 1.40
    },
    8: {
        name: '難易度8',
        description: '上級者向けの難易度',
        hpMultiplier: 1.40,
        attackMultiplier: 1.18,
        eliteBonus: 3,
        restHealPercent: 50,
        shopPriceMultiplier: 1.50
    },
    9: {
        name: '難易度9',
        description: '非常に高い難易度',
        hpMultiplier: 1.45,
        attackMultiplier: 1.20,
        eliteBonus: 3,
        restHealPercent: 40,
        shopPriceMultiplier: 1.60
    },
    10: {
        name: '難易度10（極限）',
        description: '最高難易度',
        hpMultiplier: 1.50,
        attackMultiplier: 1.25,
        eliteBonus: 4,
        restHealPercent: 40,
        shopPriceMultiplier: 1.80
    }
};
