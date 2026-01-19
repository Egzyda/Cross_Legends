// ========================================
// Cross Legends - 敵キャラクターデータ
// ========================================

// 敵キャラクター
const ENEMIES = {
    // 第1幕 雑魚
    slime: {
        id: 'wadorudo',
        name: 'ワドルドゥ',
        displayName: 'ワドルドゥ',
        type: 'balance',
        baseStats: {
            hp: 90, mp: 65, physicalAttack: 53, magicAttack: 34,
            physicalDefense: 54, magicDefense: 55, speed: 55, luck: 41
        },
        skills: ['focus'],
        image: { full: 'img/enemy/wadorudo.png' },
        rank: 'normal'
    },
    goblin: {
        id: 'goblin',
        name: 'スライム',
        displayName: 'スライム',
        type: 'physical_attacker',
        baseStats: {
            hp: 95, mp: 60, physicalAttack: 60, magicAttack: 30,
            physicalDefense: 50, magicDefense: 45, speed: 60, luck: 45
        },
        skills: ['strong_attack'],
        image: { full: 'img/enemy/slime.png' },
        rank: 'normal'
    },
    wolf: {
        id: 'wolf',
        name: 'アーボ',
        displayName: 'アーボ',
        type: 'physical_attacker',
        baseStats: {
            hp: 85, mp: 50, physicalAttack: 65, magicAttack: 25,
            physicalDefense: 45, magicDefense: 40, speed: 75, luck: 50
        },
        skills: ['double_attack'],
        image: { full: 'img/enemy/abo.png' },
        rank: 'normal'
    },
        wolf: {
        id: 'wolf',
        name: 'クリボー',
        displayName: 'アーボ',
        type: 'physical_attacker',
        baseStats: {
            hp: 85, mp: 50, physicalAttack: 65, magicAttack: 25,
            physicalDefense: 45, magicDefense: 40, speed: 75, luck: 50
        },
        skills: ['double_attack'],
        image: { full: 'img/enemy/abo.png' },
        rank: 'normal'
    },
        wolf: {
        id: 'wolf',
        name: 'ブルファンゴ',
        displayName: 'アーボ',
        type: 'physical_attacker',
        baseStats: {
            hp: 85, mp: 50, physicalAttack: 65, magicAttack: 25,
            physicalDefense: 45, magicDefense: 40, speed: 75, luck: 50
        },
        skills: ['double_attack'],
        image: { full: 'img/enemy/abo.png' },
        rank: 'normal'
    },
            wolf: {
        id: 'wolf',
        name: 'カメック',
        displayName: 'アーボ',
        type: 'physical_attacker',
        baseStats: {
            hp: 85, mp: 50, physicalAttack: 65, magicAttack: 25,
            physicalDefense: 45, magicDefense: 40, speed: 75, luck: 50
        },
        skills: ['double_attack'],
        image: { full: 'img/enemy/abo.png' },
        rank: 'normal'
    },

    // 第1幕 エリート
    orc: {
        id: 'orc',
        name: 'バギー',
        displayName: 'バギー',
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
        name: 'ギギネブラ',
        displayName: '竜騎士',
        type: 'balance',
        baseStats: {
            hp: 220, mp: 130, physicalAttack: 106, magicAttack: 68,
            physicalDefense: 108, magicDefense: 110, speed: 90, luck: 75
        },
        skills: ['strong_attack', 'wide_attack', 'iron_wall'],
        image: { full: 'img/enemy/giginebura.png' },
        rank: 'boss'
    },
    demon_lord: {
        id: 'demon_lord',
        name: 'シャドウ',
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
    demon_lord: {
        id: 'demon_lord',
        name: 'アーボック',
        displayName: '魔王',
        type: 'magic_attacker',
        baseStats: {
            hp: 200, mp: 180, physicalAttack: 80, magicAttack: 120,
            physicalDefense: 90, magicDefense: 130, speed: 100, luck: 80
        },
        skills: ['magic_storm', 'strong_magic_shot', 'heal'],
        image: { full: 'img/enemy/arboc.png' },
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
    tyranitar: {
        id: 'tyranitar',
        name: 'バンギラス',
        displayName: 'バンギラス',
        type: 'magic_attacker',
        baseStats: {
            hp: 280, mp: 200, physicalAttack: 50, magicAttack: 150,
            physicalDefense: 80, magicDefense: 150, speed: 100, luck: 90
        },
        skills: ['magic_storm', 'heal', 'poison_fog'],
        image: { full: 'img/enemy/tyranitar.png' },
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
        id: 'dio',
        name: 'ディオ・ブランドー',
        displayName: 'ディオ',
        type: 'balance',
        baseStats: {
            hp: 400, mp: 250, physicalAttack: 176, magicAttack: 150,
            physicalDefense: 180, magicDefense: 184, speed: 120, luck: 100
        },
        skills: ['ultra_attack', 'magic_storm', 'heal_all', 'all_boost'],
        image: { full: 'img/enemy/dio.png' },
        rank: 'last_boss'
    }
};
