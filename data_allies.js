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
        skills: []
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
        skills: []
    },
    josuke: {
        id: 'josuke',
        name: '東方仗助',
        displayName: '東方仗助',
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
