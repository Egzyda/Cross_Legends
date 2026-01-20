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
            displayName: '星屑クルージング',
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
        skills: [],
        excludeSkills: ['taunt'] // 上位互換のため除外
    },
    sky: {
        id: 'sky',
        name: 'キュアスカイ',
        displayName: 'キュアスカイ',
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
        skills: [],
        excludeSkills: ['strong_attack', 'ultra_attack'] // 上位互換のため除外
    },
    josuke: {
        id: 'josuke',
        name: '東方仗助',
        displayName: '東方仗助',
        stats: {
            hp: 125,
            mp: 130,
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
            healPercent: 45,
            mpCost: 35,
            description: '単体HP 45%回復'
        },
        image: {
            full: 'img/josuke_full.png',
            face: 'img/josuke_face.png'
        },
        skills: [],
        excludeSkills: ['heal'] // 上位互換のため除外
    },
    yoshiko: {
        id: 'yoshiko',
        name: '津島善子',
        displayName: '津島善子',
        stats: {
            hp: 110,
            mp: 140,
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
            mpCost: 20,
            type: 'magic_attack',
            target: 'all_enemies',
            effects: [
                { type: 'status', status: 'stun', chance: 100, duration: 1 }
            ],
            description: '敵全体をスタン状態にする（1ターン行動不能）'
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
            mp: 90,
            physicalAttack: 115,
            magicAttack: 115,
            physicalDefense: 70,
            magicDefense: 70,
            speed: 90,
            luck: 60
        },
        type: 'support',
        uniqueSkill: {
            id: 'aura_sphere',
            displayName: 'はどうだん',
            basePower: 180,
            mpCost: 35,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [],
            description: '単体に魔法攻撃（威力180%、必中）'
        },
        image: {
            full: 'img/Lucario_full.png',
            face: 'img/Lucario_face.png'
        },
        skills: [],
        excludeSkills: ['magic_shot', 'strong_magic_shot'] // 上位互換のため除外
    },
    setsuna: {
        id: 'setsuna',
        name: '優木せつ菜',
        displayName: '優木せつ菜',
        stats: {
            hp: 120,
            mp: 100,
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
            basePower: 150,
            mpCost: 50,
            target: 'all_enemies',
            type: 'physical_attack',
            target: 'all_enemies',
            effects: [],
            description: '全体に物理攻撃（威力150%）'
        },
        image: {
            full: 'img/setsuna_full.png',
            face: 'img/setsuna_face.png'
        },
        skills: [],
        excludeSkills: ['wide_attack'] // 上位互換のため除外
    },
    ceras: {
        id: 'ceras',
        name: 'セラス・柳田・リリエンフェルト',
        displayName: 'セラス',
        stats: {
            hp: 150,
            mp: 110,
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
            healPercent: 40,
            mpCost: 70,
            type: 'revive',
            target: 'single_ally_dead',
            effects: [],
            description: '戦闘不能の味方をHP40%で蘇生'
        },
        image: {
            full: 'img/Ceras_full.png',
            face: 'img/Ceras_face.png'
        },
        skills: [],
        excludeSkills: ['revive'] // 上位互換のため除外
    },
    kuroo: {
        id: 'kuroo',
        name: '黒尾鉄朗',
        displayName: '黒尾鉄朗',
        stats: {
            hp: 180,
            mp: 60,
            physicalAttack: 90,
            magicAttack: 30,
            physicalDefense: 130,
            magicDefense: 110,
            speed: 70,
            luck: 70
        },
        type: 'tank',
        uniqueSkill: {
            id: 'doshatto',
            displayName: 'ドシャット',
            mpCost: 30,
            type: 'buff',
            target: 'self',
            effects: [
                { type: 'buff', stat: 'physicalDefense', value: 0.4, duration: 2 },
                { type: 'counter', power: 90, duration: 2 }
            ],
            description: '防御+40%、攻撃受けた時に反撃（威力90%）2ターン'
        },
        image: {
            full: 'img/kuroo_full.png',
            face: 'img/kuroo_face.png'
        },
        skills: [],
        excludeSkills: ['counter_stance'] // 上位互換のため除外
    },
    shiki: {
        id: 'shiki',
        name: '若菜四季',
        displayName: '若菜四季',
        stats: {
            hp: 110,
            mp: 150,
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
            mpCost: 20,
            type: 'mp_heal',
            target: 'all_allies',
            mpHealPercent: 20,
            effects: [],
            description: '味方全員のMPを20%回復'
        },
        image: {
            full: 'img/shiki_full.png',
            face: 'img/shiki_face.png'
        },
        skills: []
    },
    shoto: {
        id: 'shoto',
        name: '轟焦凍',
        displayName: '轟焦凍',
        stats: {
            hp: 125,
            mp: 100,
            physicalAttack: 70,
            magicAttack: 145,
            physicalDefense: 75,
            magicDefense: 80,
            speed: 95,
            luck: 50
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'ice_wall',
            displayName: '穿天氷壁',
            basePower: 120,
            mpCost: 45,
            type: 'magic_attack',
            target: 'all_enemies',
            effects: [],
            description: '全体に魔法攻撃（威力120%）'
        },
        image: {
            full: 'img/shoto_full.png',
            face: 'img/shoto_face.png'
        },
        skills: [],
        excludeSkills: ['magic_storm'] // 上位互換のため除外
    },
    kakasi: {
        id: 'kakasi',
        name: 'はたけカカシ',
        displayName: 'はたけカカシ',
        stats: {
            hp: 120,
            mp: 80,
            physicalAttack: 140,
            magicAttack: 60,
            physicalDefense: 70,
            magicDefense: 60,
            speed: 130,
            luck: 80
        },
        type: 'physical_attacker',
        uniqueSkill: {
            id: 'raikiri',
            displayName: '雷切',
            basePower: 200,
            mpCost: 40,
            type: 'physical_attack',
            target: 'single_enemy',
            critBonus: 50,
            effects: [],
            description: '単体物理攻撃（威力200%、高クリティカル）'
        },
        image: {
            full: 'img/kakasi_full.png',
            face: 'img/kakasi_face.png'
        },
        skills: [],
        excludeSkills: ['strong_attack'] // 上位互換のため除外
    },
    shota: {
        id: 'shota',
        name: '相澤消太',
        displayName: '相澤消太',
        stats: {
            hp: 130,
            mp: 90,
            physicalAttack: 95,
            magicAttack: 95,
            physicalDefense: 85,
            magicDefense: 85,
            speed: 90,
            luck: 70
        },
        type: 'debuffer',
        uniqueSkill: {
            id: 'erasure',
            displayName: '抹消',
            mpCost: 25,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [
                { type: 'status', status: 'stun', chance: 100, duration: 1 }
            ],
            description: '敵単体をスタンにする（1ターン行動不能）'
        },
        image: {
            full: 'img/shota_full.png',
            face: 'img/shota_face.png'
        },
        skills: []
    },
    shizuku: {
        id: 'shizuku',
        name: '桜坂しずく',
        displayName: '桜坂しずく',
        stats: {
            hp: 120,
            mp: 110,
            physicalAttack: 80,
            magicAttack: 80,
            physicalDefense: 90,
            magicDefense: 90,
            speed: 90,
            luck: 70
        },
        type: 'debuffer',
        uniqueSkill: {
            id: 'solitude_rain',
            displayName: 'Solitude Rain',
            basePower: 0,
            mpCost: 25,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [
                { type: 'status', status: 'poison', chance: 100, duration: 3 }
            ],
            description: '敵単体を毒状態にする（3ターン継続ダメージ）'
        },
        image: {
            full: 'img/shizuku_full.png',
            face: 'img/shizuku_face.png'
        },
        skills: []
    },
    gojo: {
        id: 'gojo',
        name: '五条悟',
        displayName: '五条悟',
        stats: {
            hp: 115,
            mp: 120,
            physicalAttack: 45,
            magicAttack: 155,
            physicalDefense: 65,
            magicDefense: 95,
            speed: 95,
            luck: 55
        },
        type: 'magic_attacker',
        uniqueSkill: {
            id: 'muryokushou',
            displayName: '無量空処',
            basePower: 240,
            mpCost: 55,
            type: 'magic_attack',
            target: 'single_enemy',
            effects: [],
            description: '単体に強力な魔法攻撃（威力240%）'
        },
        image: {
            full: 'img/satoru_full.png',
            face: 'img/satoru_face.png'
        },
        skills: [],
        excludeSkills: ['strong_magic_shot'] // 上位互換のため除外
    }
};