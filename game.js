// ========================================
// Cross Legends - ゲームロジック
// ========================================

class Game {
    constructor() {
        this.state = {
            screen: 'title',
            party: [],
            currentAct: 1,
            currentNode: 0,
            nodeMap: [],
            items: {
                hp_potion: 0,
                mp_potion: 0,
                revive_stone: 0,
                stat_crystal: 0
            },
            battle: null
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('title');
    }

    // 画面切り替え
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenId}-screen`).classList.add('active');
        this.state.screen = screenId;
    }

    // イベントバインド
    bindEvents() {
        // タイトル画面
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showPartyScreen();
        });

        // パーティ編成
        document.getElementById('start-run-btn').addEventListener('click', () => {
            this.startRun();
        });

        // 休憩
        document.querySelectorAll('.rest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleRest(e.target.dataset.type);
            });
        });

        // 戦闘コマンド
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleBattleAction(e.target.dataset.action);
            });
        });

        // 戻るボタン
        document.getElementById('back-btn').addEventListener('click', () => {
            this.backCharacter();
        });

        // ターン実行
        document.getElementById('execute-turn-btn').addEventListener('click', () => {
            this.executeTurn();
        });

        // リトライ
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.resetGame();
        });
        document.getElementById('clear-retry-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    // パーティ編成画面表示
    showPartyScreen() {
        this.showScreen('party');
        this.renderCharacterList();
        this.state.party = [];
        this.updatePartySlots();
    }

    // キャラクターリスト描画
    renderCharacterList() {
        const list = document.getElementById('character-list');
        list.innerHTML = '';

        Object.values(CHARACTERS).forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.charId = char.id;
            card.innerHTML = `
                <img src="${char.image.face}" alt="${char.displayName}" onerror="this.style.background='#555'">
                <div class="char-name">${char.displayName}</div>
                <div class="char-type">${this.getTypeLabel(char.type)}</div>
            `;
            card.addEventListener('click', () => this.selectCharacter(char.id));
            list.appendChild(card);
        });
    }

    // タイプラベル取得
    getTypeLabel(type) {
        const labels = {
            physical_attacker: '物理アタッカー',
            magic_attacker: '魔法アタッカー',
            tank: 'タンク',
            healer: 'ヒーラー',
            support: 'サポート',
            balance: 'バランス'
        };
        return labels[type] || type;
    }

    // キャラクター選択
    selectCharacter(charId) {
        const positions = ['left', 'center', 'right'];
        const existingIndex = this.state.party.findIndex(p => p.id === charId);

        if (existingIndex >= 0) {
            // 選択解除
            this.state.party.splice(existingIndex, 1);
        } else if (this.state.party.length < 3) {
            // 新規選択
            const charData = JSON.parse(JSON.stringify(CHARACTERS[charId]));
            charData.currentHp = charData.stats.hp;
            charData.currentMp = charData.stats.mp;
            charData.position = positions[this.state.party.length];
            charData.buffs = [];
            charData.debuffs = [];
            charData.statusEffects = [];
            charData.statBoosts = {};
            charData.skills = [];
            this.state.party.push(charData);
        }

        this.updatePartySlots();
        this.updateCharacterCards();
    }

    // パーティスロット更新
    updatePartySlots() {
        const positions = ['left', 'center', 'right'];
        positions.forEach((pos, idx) => {
            const slot = document.querySelector(`.party-slot[data-position="${pos}"]`);
            const content = slot.querySelector('.slot-content');
            const member = this.state.party.find(p => p.position === pos);

            if (member) {
                content.innerHTML = `
                    <img src="${member.image.face}" alt="${member.displayName}"
                         style="width:50px;height:50px;border-radius:50%;background:#555"
                         onerror="this.style.background='#555'">
                    <div>${member.displayName}</div>
                `;
                slot.classList.add('filled');
            } else {
                content.innerHTML = '<div style="color:#666">空き</div>';
                slot.classList.remove('filled');
            }
        });

        // 開始ボタン有効化
        document.getElementById('start-run-btn').disabled = this.state.party.length !== 3;
    }

    // キャラカード選択状態更新
    updateCharacterCards() {
        document.querySelectorAll('.character-card').forEach(card => {
            const isSelected = this.state.party.some(p => p.id === card.dataset.charId);
            card.classList.toggle('selected', isSelected);
        });
    }

    // ラン開始
    startRun() {
        this.state.currentAct = 1;
        this.state.currentNode = 0;
        this.state.items = { hp_potion: 0, mp_potion: 0, revive_stone: 0, stat_crystal: 0 };
        this.generateMap();
        this.showMapScreen();
    }

    // マップ生成
    generateMap() {
        const config = this.state.currentAct === 1 ? MAP_CONFIG.act1 : MAP_CONFIG.act2;
        const nodes = [];
        const types = [];

        // ノードタイプを配列に展開
        Object.entries(config.composition).forEach(([type, count]) => {
            for (let i = 0; i < count; i++) {
                types.push(type);
            }
        });

        // シャッフル（ただしボスは最後）
        const bossIndex = types.indexOf('boss');
        types.splice(bossIndex, 1);
        this.shuffleArray(types);
        types.push('boss');

        // ノード生成
        types.forEach((type, idx) => {
            nodes.push({
                id: idx,
                type: type,
                completed: false,
                available: idx === 0
            });
        });

        this.state.nodeMap = nodes;
    }

    // 配列シャッフル
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // マップ画面表示
    showMapScreen() {
        this.showScreen('map');
        this.renderMap();
        this.renderPartyStatusBar();
    }

    // マップ描画
    renderMap() {
        const mapEl = document.getElementById('node-map');
        mapEl.innerHTML = '';

        document.getElementById('act-display').textContent = `第${this.state.currentAct}幕`;
        document.getElementById('node-progress').textContent =
            `${this.state.currentNode}/${this.state.nodeMap.length}`;

        this.state.nodeMap.forEach((node, idx) => {
            const row = document.createElement('div');
            row.className = 'node-row';

            const nodeEl = document.createElement('div');
            nodeEl.className = 'node';
            nodeEl.innerHTML = NODE_TYPES[node.type].icon;

            if (node.completed) {
                nodeEl.classList.add('completed');
            } else if (node.available) {
                nodeEl.classList.add('available');
                nodeEl.addEventListener('click', () => this.enterNode(idx));
            }

            if (idx === this.state.currentNode && !node.completed) {
                nodeEl.classList.add('current');
            }

            row.appendChild(nodeEl);
            mapEl.appendChild(row);
        });
    }

    // パーティステータスバー描画
    renderPartyStatusBar() {
        const bar = document.getElementById('party-status-bar');
        bar.innerHTML = '';

        this.state.party.forEach(member => {
            const status = document.createElement('div');
            status.className = 'party-member-status';
            const hpPercent = (member.currentHp / member.stats.hp) * 100;
            const mpPercent = (member.currentMp / member.stats.mp) * 100;

            status.innerHTML = `
                <div class="name">${member.displayName}</div>
                <div class="hp-bar"><div class="fill" style="width:${hpPercent}%"></div></div>
                <div class="mp-bar"><div class="fill" style="width:${mpPercent}%"></div></div>
            `;
            bar.appendChild(status);
        });
    }

    // ノード進入
    enterNode(nodeIdx) {
        const node = this.state.nodeMap[nodeIdx];
        this.state.currentNode = nodeIdx;

        switch (node.type) {
            case 'battle':
                this.startBattle('normal');
                break;
            case 'elite':
                this.startBattle('elite');
                break;
            case 'boss':
                this.startBattle(this.state.currentAct === 2 ? 'last_boss' : 'boss');
                break;
            case 'rest':
                this.showScreen('rest');
                break;
            case 'event':
                this.showEventScreen();
                break;
            case 'treasure':
                this.showTreasureScreen();
                break;
        }
    }

    // 戦闘開始
    startBattle(rank) {
        const config = this.state.currentAct === 1 ? MAP_CONFIG.act1 : MAP_CONFIG.act2;
        let enemies = [];
        let multiplier = 1.0;

        // 敵選出
        if (rank === 'normal') {
            const count = Math.floor(Math.random() * 3) + 1;
            multiplier = this.state.currentNode < 3 ? config.multiplier.start : config.multiplier.mid;
            for (let i = 0; i < count; i++) {
                const enemyId = config.enemies[Math.floor(Math.random() * config.enemies.length)];
                enemies.push(this.createEnemy(enemyId, multiplier));
            }
        } else if (rank === 'elite') {
            const count = Math.floor(Math.random() * 2) + 1;
            multiplier = config.multiplier.elite;
            for (let i = 0; i < count; i++) {
                const enemyId = config.elites[Math.floor(Math.random() * config.elites.length)];
                enemies.push(this.createEnemy(enemyId, multiplier, true));
            }
        } else if (rank === 'boss' || rank === 'last_boss') {
            multiplier = config.multiplier.boss;
            const enemyId = config.bosses[Math.floor(Math.random() * config.bosses.length)];
            enemies.push(this.createEnemy(enemyId, multiplier));
        }

        this.state.battle = {
            enemies: enemies,
            turn: 1,
            commands: [],
            currentCharIndex: 0,
            phase: 'command', // command, execution, reward
            rank: rank,
            log: []
        };

        this.showScreen('battle');
        // ボタンの無効化を解除（2ndバトル対策）
        document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = false);
        this.renderBattle();
        this.startCommandPhase();
    }

    // 敵生成
    createEnemy(enemyId, multiplier, isElite = false) {
        const template = ENEMIES[enemyId];
        const stats = {};

        Object.keys(template.baseStats).forEach(stat => {
            stats[stat] = Math.floor(template.baseStats[stat] * multiplier);
        });

        // エリートはHP+30%
        if (isElite) {
            stats.hp = Math.floor(stats.hp * 1.3);
        }

        return {
            id: template.id + '_' + Date.now() + Math.random(),
            templateId: template.id,
            name: template.name,
            displayName: template.displayName,
            type: template.type,
            stats: stats,
            currentHp: stats.hp,
            currentMp: stats.mp,
            skills: template.skills.slice(),
            image: template.image,
            buffs: [],
            debuffs: [],
            statusEffects: []
        };
    }

    // 戦闘描画
    renderBattle() {
        this.renderEnemies();
        this.renderAllies();
        this.renderBattleLog();
    }

    // 敵描画
    renderEnemies() {
        const area = document.getElementById('enemy-area');
        area.innerHTML = '';

        this.state.battle.enemies.forEach((enemy, idx) => {
            const unit = document.createElement('div');
            unit.className = 'battle-unit';
            if (enemy.currentHp <= 0) unit.classList.add('dead');
            unit.dataset.enemyIndex = idx;

            const hpPercent = Math.max(0, (enemy.currentHp / enemy.stats.hp) * 100);

            unit.innerHTML = `
                <img src="${enemy.image.full}" alt="${enemy.displayName}" onerror="this.style.background='#555'">
                <div class="unit-name">${enemy.displayName}</div>
                <div class="unit-hp-bar"><div class="fill" style="width:${hpPercent}%"></div></div>
                <div class="status-effects">${this.renderStatusEffects(enemy)}</div>
            `;
            area.appendChild(unit);
        });
    }

    // 味方描画
    renderAllies() {
        const area = document.getElementById('ally-area');
        area.innerHTML = '';

        this.state.party.forEach((ally, idx) => {
            const unit = document.createElement('div');
            unit.className = 'battle-unit';
            if (ally.currentHp <= 0) unit.classList.add('dead');
            unit.dataset.allyIndex = idx;

            const hpPercent = Math.max(0, (ally.currentHp / ally.stats.hp) * 100);
            const mpPercent = Math.max(0, (ally.currentMp / ally.stats.mp) * 100);

            unit.innerHTML = `
                <img src="${ally.image.face}" alt="${ally.displayName}" onerror="this.style.background='#555'">
                <div class="unit-name">${ally.displayName}</div>
                <div class="unit-hp-bar"><div class="fill" style="width:${hpPercent}%"></div></div>
                <div class="unit-mp-bar"><div class="fill" style="width:${mpPercent}%"></div></div>
                <div class="status-effects">${this.renderStatusEffects(ally)}</div>
            `;
            area.appendChild(unit);
        });
    }

    // ステータスエフェクト表示
    renderStatusEffects(unit) {
        let effects = [];
        unit.buffs.forEach(b => effects.push(`<span class="status-effect" style="color:#4ecdc4">↑${b.stat}</span>`));
        unit.debuffs.forEach(d => effects.push(`<span class="status-effect" style="color:#ff6b6b">↓${d.stat}</span>`));
        unit.statusEffects.forEach(s => {
            const labels = { poison: '毒', paralysis: '麻', silence: '沈', stun: 'ス', taunt: '挑' };
            effects.push(`<span class="status-effect">${labels[s.type] || s.type}</span>`);
        });
        return effects.join('');
    }

    // バトルログ描画
    renderBattleLog() {
        const log = document.getElementById('battle-log');
        log.innerHTML = this.state.battle.log.map(l => `<p>${l}</p>`).join('');
        log.scrollTop = log.scrollHeight;
    }

    // コマンドフェーズ開始
    startCommandPhase() {
        this.state.battle.commands = [];
        this.state.battle.currentCharIndex = 0;
        this.state.battle.phase = 'command';
        this.updateCommandUI();
    }

    // コマンドUI更新
    updateCommandUI() {
        const charCmds = document.getElementById('character-commands');
        charCmds.innerHTML = '';

        const aliveAllies = this.state.party.filter(p => p.currentHp > 0);
        const commandsCount = Object.keys(this.state.battle.commands).length;

        this.state.party.forEach((char, idx) => {
            const slot = document.createElement('div');
            slot.className = 'char-command-slot';
            if (idx === this.state.battle.currentCharIndex && char.currentHp > 0 && commandsCount < aliveAllies.length) {
                slot.classList.add('active');
            }

            const cmd = this.state.battle.commands[idx];
            slot.innerHTML = `
                <div class="cmd-name">${char.displayName}</div>
                <div class="cmd-action">${cmd ? cmd.actionName : (char.currentHp <= 0 ? '戦闘不能' : '待機中...')}</div>
            `;
            charCmds.appendChild(slot);
        });

        // 戻るボタンの制御
        const backBtn = document.getElementById('back-btn');
        const firstAliveIdx = this.state.party.findIndex(p => p.currentHp > 0);
        backBtn.disabled = (this.state.battle.currentCharIndex === firstAliveIdx);

        // 実行ボタンの制御
        const allSelected = commandsCount === aliveAllies.length;
        const execBtn = document.getElementById('execute-turn-btn');
        execBtn.classList.toggle('hidden', !allSelected);

        // 選択肢の表示/非表示
        const actionButtons = document.getElementById('action-buttons');
        // 全員選択済みなら通常アクションボタン（攻撃など）を隠し、戻る/開始のみにする工夫も可能ですが、一旦そのまま

        this.hideSelectionPanels();
    }

    // 選択パネル非表示
    hideSelectionPanels() {
        document.getElementById('target-selection').classList.add('hidden');
        document.getElementById('skill-selection').classList.add('hidden');
        document.getElementById('item-selection').classList.add('hidden');
    }

    // 戦闘アクション処理
    handleBattleAction(action) {
        const currentChar = this.state.party[this.state.battle.currentCharIndex];
        if (!currentChar || currentChar.currentHp <= 0) return;

        switch (action) {
            case 'attack':
                this.showTargetSelection('attack');
                break;
            case 'skill':
                this.showSkillSelection();
                break;
            case 'defend':
                this.setCommand({
                    type: 'defend',
                    actionName: '防御',
                    priority: 999
                });
                break;
            case 'item':
                this.showItemSelection();
                break;
        }
    }

    // ターゲット選択表示
    showTargetSelection(forAction, skillId = null) {
        this.hideSelectionPanels();
        const panel = document.getElementById('target-selection');
        panel.classList.remove('hidden');
        panel.innerHTML = '<h4>対象を選択</h4>';

        const skill = skillId ? this.getSkillData(skillId, this.state.party[this.state.battle.currentCharIndex]) : null;
        const targetType = skill?.target || 'single_enemy';

        if (targetType === 'single_enemy' || targetType === 'all_enemies' || !targetType.includes('ally')) {
            this.state.battle.enemies.forEach((enemy, idx) => {
                if (enemy.currentHp > 0) {
                    const btn = document.createElement('button');
                    btn.className = 'target-btn';
                    btn.textContent = enemy.displayName;
                    btn.addEventListener('click', () => {
                        if (forAction === 'attack') {
                            this.setCommand({
                                type: 'attack',
                                actionName: '攻撃→' + enemy.displayName,
                                target: idx,
                                targetType: 'enemy'
                            });
                        } else if (forAction === 'skill') {
                            this.setCommand({
                                type: 'skill',
                                skillId: skillId,
                                actionName: skill.displayName || skill.name,
                                target: targetType === 'all_enemies' ? 'all' : idx,
                                targetType: 'enemy',
                                priority: skill.priority === 'first' ? 999 : 0
                            });
                        }
                    });
                    panel.appendChild(btn);
                }
            });
        }

        if (targetType.includes('ally')) {
            this.state.party.forEach((ally, idx) => {
                const isValidTarget = targetType === 'single_ally_dead'
                    ? ally.currentHp <= 0
                    : ally.currentHp > 0;

                if (isValidTarget || targetType === 'all_allies') {
                    const btn = document.createElement('button');
                    btn.className = 'target-btn';
                    btn.textContent = ally.displayName;
                    btn.addEventListener('click', () => {
                        this.setCommand({
                            type: 'skill',
                            skillId: skillId,
                            actionName: skill.displayName || skill.name + '→' + ally.displayName,
                            target: targetType === 'all_allies' ? 'all' : idx,
                            targetType: 'ally',
                            priority: skill.priority === 'first' ? 999 : 0
                        });
                    });
                    panel.appendChild(btn);
                }
            });
        }

        // キャンセルボタン追加
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = '戻る';
        cancelBtn.onclick = () => this.hideSelectionPanels();
        panel.appendChild(cancelBtn);

        if (targetType === 'self') {
            const currentIdx = this.state.battle.currentCharIndex;
            this.setCommand({
                type: 'skill',
                skillId: skillId,
                actionName: skill.displayName || skill.name,
                target: currentIdx,
                targetType: 'ally',
                priority: skill.priority === 'first' ? 999 : 0
            });
        }
    }

    // スキル選択表示
    showSkillSelection() {
        this.hideSelectionPanels();
        const panel = document.getElementById('skill-selection');
        panel.classList.remove('hidden');
        panel.innerHTML = '<h4>スキルを選択</h4>';

        const currentChar = this.state.party[this.state.battle.currentCharIndex];
        const allSkills = [currentChar.uniqueSkill, ...currentChar.skills];

        allSkills.forEach(skill => {
            if (!skill) return;
            const skillData = this.getSkillData(skill.id, currentChar);
            const canUse = currentChar.currentMp >= skillData.mpCost;

            const btn = document.createElement('button');
            btn.className = 'skill-btn';
            btn.disabled = !canUse;
            btn.innerHTML = `
                <span class="skill-name">${skill.displayName || skillData.name}</span>
                <span class="skill-cost">MP: ${skillData.mpCost}</span>
                <span class="skill-desc">${skill.description || skillData.description}</span>
            `;
            btn.addEventListener('click', () => {
                if (canUse) {
                    const targetType = skillData.target;
                    if (targetType === 'self') {
                        this.showTargetSelection('skill', skill.id);
                    } else {
                        this.showTargetSelection('skill', skill.id);
                    }
                }
            });
            panel.appendChild(btn);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = '戻る';
        cancelBtn.onclick = () => this.hideSelectionPanels();
        panel.appendChild(cancelBtn);
    }

    // スキルデータ取得
    getSkillData(skillId, character) {
        // キャラのユニークスキルをチェック
        if (character.uniqueSkill && character.uniqueSkill.id === skillId) {
            return { ...SKILLS[skillId], ...character.uniqueSkill };
        }
        // 汎用スキルから取得
        return SKILLS[skillId] || {};
    }

    // アイテム選択表示
    showItemSelection() {
        this.hideSelectionPanels();
        const panel = document.getElementById('item-selection');
        panel.classList.remove('hidden');
        panel.innerHTML = '<h4>アイテムを選択</h4>';

        Object.entries(this.state.items).forEach(([itemId, count]) => {
            if (count > 0) {
                const item = ITEMS[itemId];
                const btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.innerHTML = `${item.name} (${count}個) - ${item.description}`;
                btn.addEventListener('click', () => {
                    this.showItemTargetSelection(itemId);
                });
                panel.appendChild(btn);
            }
        });

        if (Object.values(this.state.items).every(c => c === 0)) {
            panel.innerHTML += '<p style="color:#888">アイテムがありません</p>';
        }

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = '戻る';
        cancelBtn.onclick = () => this.hideSelectionPanels();
        panel.appendChild(cancelBtn);
    }

    // アイテムターゲット選択
    showItemTargetSelection(itemId) {
        const panel = document.getElementById('item-selection');
        panel.innerHTML = '<h4>対象を選択</h4>';

        const item = ITEMS[itemId];

        this.state.party.forEach((ally, idx) => {
            const isValidTarget = item.effect.type === 'revive'
                ? ally.currentHp <= 0
                : ally.currentHp > 0;

            if (isValidTarget) {
                const btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.textContent = ally.displayName;
                btn.addEventListener('click', () => {
                    this.setCommand({
                        type: 'item',
                        itemId: itemId,
                        actionName: item.name + '→' + ally.displayName,
                        target: idx,
                        targetType: 'ally'
                    });
                });
                panel.appendChild(btn);
            }
        });
    }

    // コマンドセット
    setCommand(command) {
        const charIdx = this.state.battle.currentCharIndex;
        command.charIndex = charIdx;
        command.speed = this.state.party[charIdx].stats.speed;
        this.state.battle.commands[charIdx] = command;

        this.hideSelectionPanels();

        // 次の生存キャラを探す
        let nextIdx = charIdx + 1;
        while (nextIdx < this.state.party.length && this.state.party[nextIdx].currentHp <= 0) {
            nextIdx++;
        }

        // 全員入力済みでなければインデックスを更新
        if (nextIdx < this.state.party.length) {
            this.state.battle.currentCharIndex = nextIdx;
        }

        this.updateCommandUI();
    }

    // ターン実行
    async executeTurn() {
        this.state.battle.phase = 'execution';
        document.getElementById('execute-turn-btn').classList.add('hidden');
        document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);

        // 敵の行動を追加
        this.generateEnemyCommands();

        // 全行動を速度順にソート（防御は最優先）
        const allCommands = [...this.state.battle.commands];
        this.state.battle.enemies.forEach((enemy, idx) => {
            if (enemy.currentHp > 0 && enemy.command) {
                allCommands.push({
                    ...enemy.command,
                    isEnemy: true,
                    enemyIndex: idx
                });
            }
        });

        allCommands.sort((a, b) => {
            if ((a.priority || 0) !== (b.priority || 0)) {
                return (b.priority || 0) - (a.priority || 0);
            }
            return (b.speed || 0) - (a.speed || 0);
        });

        // 行動実行
        for (const cmd of allCommands) {
            await this.executeCommand(cmd);
            this.renderBattle();
            await this.delay(500);

            // 勝敗判定
            if (this.checkBattleEnd()) {
                return;
            }
        }

        // ターン終了処理
        this.endTurn();
    }

    // 敵の行動生成
    generateEnemyCommands() {
        this.state.battle.enemies.forEach(enemy => {
            if (enemy.currentHp <= 0) return;

            // AIルール適用
            let action = null;

            // HP50%以下で回復スキルがあれば優先
            if (enemy.currentHp < enemy.stats.hp * 0.5) {
                const healSkill = enemy.skills.find(s => SKILLS[s]?.type === 'heal');
                if (healSkill && enemy.currentMp >= SKILLS[healSkill].mpCost) {
                    action = { type: 'skill', skillId: healSkill };
                }
            }

            // スキル使用
            if (!action && enemy.currentMp >= 30) {
                const usableSkills = enemy.skills.filter(s => {
                    const skill = SKILLS[s];
                    if (!skill) return false;
                    if (enemy.currentMp < skill.mpCost) return false;
                    // 挑発は複数体の時のみ
                    if (s === 'taunt' && this.state.battle.enemies.filter(e => e.currentHp > 0).length <= 1) {
                        return false;
                    }
                    return true;
                });

                if (usableSkills.length > 0 && Math.random() < 0.6) {
                    const skillId = usableSkills[Math.floor(Math.random() * usableSkills.length)];
                    action = { type: 'skill', skillId: skillId };
                }
            }

            // 通常攻撃
            if (!action) {
                action = { type: 'attack' };
            }

            // ターゲット決定
            let target = this.selectTarget();

            enemy.command = {
                ...action,
                target: target,
                targetType: 'ally',
                speed: enemy.stats.speed
            };
        });
    }

    // ターゲット選択（配置補正考慮）
    selectTarget() {
        const weights = { left: 130, center: 100, right: 70 };
        const alive = this.state.party.filter(p => p.currentHp > 0);

        // 挑発中のキャラがいればそちらを狙う
        const taunting = alive.find(p => p.statusEffects.some(e => e.type === 'taunt'));
        if (taunting) {
            return this.state.party.indexOf(taunting);
        }

        // 重み付きランダム
        let totalWeight = 0;
        const candidates = alive.map(p => {
            const weight = weights[p.position] || 100;
            totalWeight += weight;
            return { char: p, weight: totalWeight };
        });

        const roll = Math.random() * totalWeight;
        for (const c of candidates) {
            if (roll <= c.weight) {
                return this.state.party.indexOf(c.char);
            }
        }
        return this.state.party.indexOf(alive[0]);
    }

    // コマンド実行
    async executeCommand(cmd) {
        let actor, actorName;

        if (cmd.isEnemy) {
            actor = this.state.battle.enemies[cmd.enemyIndex];
            actorName = actor.displayName;
        } else {
            actor = this.state.party[cmd.charIndex];
            actorName = actor.displayName;
        }

        if (actor.currentHp <= 0) return;

        // スタン/麻痺チェック
        const stunned = actor.statusEffects.find(e => e.type === 'stun');
        if (stunned) {
            this.addLog(`${actorName}はスタンで動けない！`);
            return;
        }

        const paralysis = actor.statusEffects.find(e => e.type === 'paralysis');
        if (paralysis && Math.random() < 0.3) {
            this.addLog(`${actorName}は麻痺で動けない！`);
            return;
        }

        switch (cmd.type) {
            case 'attack':
                await this.executeAttack(actor, cmd, actorName);
                // MP回復
                actor.currentMp = Math.min(actor.stats.mp, actor.currentMp + actor.stats.mp * 0.1);
                break;
            case 'skill':
                await this.executeSkill(actor, cmd, actorName);
                break;
            case 'defend':
                actor.statusEffects.push({ type: 'defending', duration: 1 });
                this.addLog(`${actorName}は防御した！`);
                // MP回復
                actor.currentMp = Math.min(actor.stats.mp, actor.currentMp + actor.stats.mp * 0.1);
                break;
            case 'item':
                await this.executeItem(cmd, actorName);
                break;
        }
    }

    // 攻撃実行
    async executeAttack(actor, cmd, actorName) {
        let targets = [];
        if (cmd.isEnemy) {
            targets = [this.state.party[cmd.target]];
        } else {
            targets = [this.state.battle.enemies[cmd.target]];
        }

        for (const target of targets) {
            if (target.currentHp <= 0) continue;

            const damage = this.calculateDamage(actor, target, 'physical', 100);
            this.applyDamage(target, damage);
            this.addLog(`${actorName}の攻撃！${target.displayName}に${damage.value}ダメージ${damage.critical ? '（クリティカル！）' : ''}`);
        }
    }

    // スキル実行
    async executeSkill(actor, cmd, actorName) {
        const skill = SKILLS[cmd.skillId] || actor.uniqueSkill;
        if (!skill) return;

        const mpCost = skill.mpCost || 0;
        if (actor.currentMp < mpCost) {
            this.addLog(`${actorName}はMPが足りない！`);
            return;
        }
        actor.currentMp -= mpCost;

        const skillName = skill.displayName || skill.name;
        this.addLog(`${actorName}の${skillName}！`);

        // ターゲット決定
        let targets = [];
        if (skill.target === 'self') {
            targets = [actor];
        } else if (skill.target === 'all_enemies') {
            targets = cmd.isEnemy ? this.state.party.filter(p => p.currentHp > 0) : this.state.battle.enemies.filter(e => e.currentHp > 0);
        } else if (skill.target === 'all_allies') {
            targets = cmd.isEnemy ? this.state.battle.enemies.filter(e => e.currentHp > 0) : this.state.party.filter(p => p.currentHp > 0);
        } else if (cmd.targetType === 'enemy') {
            targets = [this.state.battle.enemies[cmd.target]];
        } else {
            targets = [this.state.party[cmd.target]];
        }

        // スキル効果適用
        if (skill.type === 'physical_attack' || skill.type === 'magic_attack') {
            const damageType = skill.type === 'physical_attack' ? 'physical' : 'magic';
            const hits = skill.hits || 1;

            for (let i = 0; i < hits; i++) {
                for (const target of targets) {
                    if (target.currentHp <= 0) continue;
                    const damage = this.calculateDamage(actor, target, damageType, skill.power || skill.basePower || 100, skill.critBonus);
                    this.applyDamage(target, damage);
                    this.addLog(`${target.displayName}に${damage.value}ダメージ${damage.critical ? '（クリティカル！）' : ''}`);
                }
            }
        } else if (skill.type === 'heal') {
            for (const target of targets) {
                const healAmount = Math.floor(target.stats.hp * (skill.healPercent / 100));
                target.currentHp = Math.min(target.stats.hp, target.currentHp + healAmount);
                this.addLog(`${target.displayName}のHPが${healAmount}回復！`);
            }
        } else if (skill.type === 'revive') {
            for (const target of targets) {
                if (target.currentHp <= 0) {
                    target.currentHp = Math.floor(target.stats.hp * (skill.healPercent / 100));
                    this.addLog(`${target.displayName}が復活した！`);
                }
            }
        } else if (skill.type === 'mp_heal') {
            for (const target of targets) {
                const healAmount = Math.floor(target.stats.mp * (skill.mpHealPercent / 100));
                target.currentMp = Math.min(target.stats.mp, target.currentMp + healAmount);
                this.addLog(`${target.displayName}のMPが${healAmount}回復！`);
            }
        }

        // 追加効果
        if (skill.effects) {
            for (const effect of skill.effects) {
                this.applyEffect(actor, targets, effect);
            }
        }
    }

    // エフェクト適用
    applyEffect(actor, targets, effect) {
        switch (effect.type) {
            case 'buff':
            case 'self_buff':
                const buffTargets = effect.type === 'self_buff' ? [actor] : targets;
                buffTargets.forEach(t => {
                    t.buffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
                });
                break;
            case 'debuff':
            case 'self_debuff':
                const debuffTargets = effect.type === 'self_debuff' ? [actor] : targets;
                debuffTargets.forEach(t => {
                    t.debuffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
                });
                break;
            case 'taunt':
                actor.statusEffects.push({ type: 'taunt', duration: effect.duration });
                this.addLog(`${actor.displayName}は挑発状態になった！`);
                break;
            case 'status':
                targets.forEach(t => {
                    if (!effect.chance || Math.random() * 100 < effect.chance) {
                        t.statusEffects.push({ type: effect.status, duration: effect.duration || 3 });
                        this.addLog(`${t.displayName}は${effect.status}状態になった！`);
                    }
                });
                break;
            case 'regen':
                targets.forEach(t => {
                    t.statusEffects.push({ type: 'regen', value: effect.value, duration: effect.duration });
                });
                break;
            case 'damageReduction':
                targets.forEach(t => {
                    t.statusEffects.push({ type: 'damageReduction', value: effect.value, duration: effect.duration });
                });
                break;
        }
    }

    // アイテム使用
    async executeItem(cmd, actorName) {
        const item = ITEMS[cmd.itemId];
        const target = this.state.party[cmd.target];

        this.state.items[cmd.itemId]--;

        switch (item.effect.type) {
            case 'heal':
                const healAmount = Math.floor(target.stats.hp * (item.effect.percent / 100));
                target.currentHp = Math.min(target.stats.hp, target.currentHp + healAmount);
                this.addLog(`${actorName}は${item.name}を使った！${target.displayName}のHPが${healAmount}回復！`);
                break;
            case 'mp_heal':
                const mpAmount = Math.floor(target.stats.mp * (item.effect.percent / 100));
                target.currentMp = Math.min(target.stats.mp, target.currentMp + mpAmount);
                this.addLog(`${actorName}は${item.name}を使った！${target.displayName}のMPが${mpAmount}回復！`);
                break;
            case 'revive':
                target.currentHp = Math.floor(target.stats.hp * (item.effect.percent / 100));
                this.addLog(`${actorName}は${item.name}を使った！${target.displayName}が復活した！`);
                break;
        }
    }

    // ダメージ計算
    calculateDamage(attacker, defender, type, power, critBonus = 0) {
        let attack, defense;

        if (type === 'physical') {
            attack = this.getEffectiveStat(attacker, 'physicalAttack');
            defense = this.getEffectiveStat(defender, 'physicalDefense');
        } else {
            attack = this.getEffectiveStat(attacker, 'magicAttack');
            defense = this.getEffectiveStat(defender, 'magicDefense');
        }

        // 基本ダメージ
        let damage = (attack * (power / 100)) - defense;
        damage = Math.max(1, damage);

        // 乱数
        damage *= 0.9 + Math.random() * 0.2;

        // クリティカル判定
        const luck = this.getEffectiveStat(attacker, 'luck');
        const critRate = 5 + (luck / 4) + critBonus;
        const isCritical = Math.random() * 100 < critRate;
        if (isCritical) {
            damage *= 2;
        }

        // 防御中
        if (defender.statusEffects.find(e => e.type === 'defending')) {
            damage *= 0.5;
        }

        // ダメージ軽減
        const reduction = defender.statusEffects.find(e => e.type === 'damageReduction');
        if (reduction) {
            damage *= (1 - reduction.value);
        }

        return {
            value: Math.floor(damage),
            critical: isCritical
        };
    }

    // 実効ステータス取得
    getEffectiveStat(unit, statName) {
        let value = unit.stats[statName];

        // バフ適用
        unit.buffs.forEach(b => {
            if (b.stat === statName) {
                value *= (1 + b.value);
            }
        });

        // デバフ適用
        unit.debuffs.forEach(d => {
            if (d.stat === statName) {
                value *= (1 + d.value);
            }
        });

        return Math.floor(value);
    }

    // ダメージ適用
    applyDamage(target, damage) {
        target.currentHp = Math.max(0, target.currentHp - damage.value);
    }

    // ログ追加
    addLog(message) {
        this.state.battle.log.push(message);
        this.renderBattleLog();
    }

    // 戦闘終了判定
    checkBattleEnd() {
        const alliesAlive = this.state.party.some(p => p.currentHp > 0);
        const enemiesAlive = this.state.battle.enemies.some(e => e.currentHp > 0);

        if (!alliesAlive) {
            this.gameOver();
            return true;
        }

        if (!enemiesAlive) {
            this.battleVictory();
            return true;
        }

        return false;
    }

    // ターン終了処理
    endTurn() {
        // 状態異常処理
        [...this.state.party, ...this.state.battle.enemies].forEach(unit => {
            if (unit.currentHp <= 0) return;

            // 毒ダメージ
            const poison = unit.statusEffects.find(e => e.type === 'poison');
            if (poison) {
                const damage = Math.floor(unit.stats.hp * 0.08);
                unit.currentHp = Math.max(1, unit.currentHp - damage);
                this.addLog(`${unit.displayName}は毒で${damage}ダメージ！`);
            }

            // リジェネ
            const regen = unit.statusEffects.find(e => e.type === 'regen');
            if (regen) {
                const heal = Math.floor(unit.stats.hp * regen.value);
                unit.currentHp = Math.min(unit.stats.hp, unit.currentHp + heal);
                this.addLog(`${unit.displayName}はHP${heal}回復！`);
            }

            // 効果時間減少
            unit.buffs = unit.buffs.filter(b => --b.duration > 0);
            unit.debuffs = unit.debuffs.filter(d => --d.duration > 0);
            unit.statusEffects = unit.statusEffects.filter(e => --e.duration > 0);
        });

        this.state.battle.turn++;
        this.renderBattle();

        if (this.checkBattleEnd()) return;

        // 次のコマンドフェーズ
        document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = false);
        this.startCommandPhase();
    }

    // 戦闘勝利
    battleVictory() {
        this.addLog('戦闘に勝利した！');

        // 報酬フェーズ
        setTimeout(() => {
            this.startRewardPhase();
        }, 1000);
    }

    // 報酬フェーズ開始
    startRewardPhase() {
        this.state.battle.phase = 'reward';
        this.state.battle.rewardCharIndex = 0;
        this.showRewardForCharacter(0);
    }

    // キャラ別報酬表示
    showRewardForCharacter(charIdx) {
        const char = this.state.party[charIdx];
        if (!char || char.currentHp <= 0) {
            // 戦闘不能キャラはスキップ
            if (charIdx + 1 < this.state.party.length) {
                this.showRewardForCharacter(charIdx + 1);
            } else {
                this.finishNode();
            }
            return;
        }

        this.showScreen('reward');
        document.getElementById('reward-character-name').textContent = `${char.displayName}の報酬`;

        const options = document.getElementById('reward-options');
        options.innerHTML = '';

        const isElite = this.state.battle.rank === 'elite';
        const boostPercent = isElite ? 10 : 8;

        // ステータスアップ選択肢
        const stats = ['hp', 'mp', 'physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed', 'luck'];
        const statLabels = {
            hp: 'HP', mp: 'MP', physicalAttack: '物理攻撃', magicAttack: '魔法攻撃',
            physicalDefense: '物理防御', magicDefense: '魔法防御', speed: '速度', luck: '運'
        };

        // ランダムに3つステータスを選択
        const shuffledStats = [...stats].sort(() => Math.random() - 0.5).slice(0, 2);

        shuffledStats.forEach(stat => {
            const currentValue = char.stats[stat];
            const baseValue = CHARACTERS[char.id].stats[stat];
            const boost = Math.floor(baseValue * boostPercent / 100);

            const option = document.createElement('div');
            option.className = 'reward-option';
            option.innerHTML = `
                <div class="reward-title">${statLabels[stat]} UP</div>
                <div class="reward-desc">${currentValue} → ${currentValue + boost} (+${boost})</div>
            `;
            option.addEventListener('click', () => {
                char.stats[stat] += boost;
                if (stat === 'hp') char.currentHp = Math.min(char.stats.hp, char.currentHp + boost);
                if (stat === 'mp') char.currentMp = Math.min(char.stats.mp, char.currentMp + boost);
                this.nextReward(charIdx);
            });
            options.appendChild(option);
        });

        // スキル獲得（スロットに空きがあれば）
        if (char.skills.length < 3) {
            const skillPool = SKILL_POOLS[char.type] || SKILL_POOLS.balance;
            const availableSkills = skillPool.filter(s =>
                s !== char.uniqueSkill?.id && !char.skills.some(cs => cs.id === s)
            );

            if (availableSkills.length > 0) {
                const randomSkillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                const skill = SKILLS[randomSkillId];

                const option = document.createElement('div');
                option.className = 'reward-option';
                option.innerHTML = `
                    <div class="reward-title">新スキル: ${skill.name}</div>
                    <div class="reward-desc">${skill.description}</div>
                `;
                option.addEventListener('click', () => {
                    char.skills.push({ id: randomSkillId, displayName: skill.name });
                    this.nextReward(charIdx);
                });
                options.appendChild(option);
            }
        }
    }

    // 次の報酬へ
    nextReward(currentIdx) {
        if (currentIdx + 1 < this.state.party.length) {
            this.showRewardForCharacter(currentIdx + 1);
        } else {
            this.finishNode();
        }
    }

    // ノード完了
    finishNode() {
        this.state.nodeMap[this.state.currentNode].completed = true;

        // 次のノードを利用可能に
        if (this.state.currentNode + 1 < this.state.nodeMap.length) {
            this.state.nodeMap[this.state.currentNode + 1].available = true;
        }

        // ラスボス撃破チェック
        if (this.state.battle?.rank === 'last_boss') {
            this.showScreen('clear');
            return;
        }

        // 中ボス撃破で第2幕へ
        if (this.state.battle?.rank === 'boss' && this.state.currentAct === 1) {
            this.state.currentAct = 2;
            this.generateMap();
        }

        this.showMapScreen();
    }

    // 休憩処理
    handleRest(type) {
        this.state.party.forEach(member => {
            if (member.currentHp <= 0) return;

            switch (type) {
                case 'hp':
                    member.currentHp = Math.min(member.stats.hp, member.currentHp + member.stats.hp * 0.4);
                    break;
                case 'mp':
                    member.currentMp = Math.min(member.stats.mp, member.currentMp + member.stats.mp * 0.4);
                    break;
                case 'both':
                    member.currentHp = Math.min(member.stats.hp, member.currentHp + member.stats.hp * 0.2);
                    member.currentMp = Math.min(member.stats.mp, member.currentMp + member.stats.mp * 0.2);
                    break;
            }
        });

        this.finishNode();
    }

    // イベント画面表示
    showEventScreen() {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        this.state.currentEvent = event;

        this.showScreen('event');
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-description').textContent = event.description;

        const options = document.getElementById('event-options');
        options.innerHTML = '';

        event.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'event-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => this.handleEventOption(opt));
            options.appendChild(btn);
        });
    }

    // イベント選択処理
    handleEventOption(option) {
        const effect = option.effect;
        let message = '';

        switch (effect.type) {
            case 'none':
                message = effect.message || '何も起こらなかった...';
                break;
            case 'heal_all':
                this.state.party.forEach(m => {
                    if (m.currentHp > 0) {
                        m.currentHp = Math.min(m.stats.hp, m.currentHp + m.stats.hp * (effect.percent / 100));
                    }
                });
                message = effect.message || `全員HP${effect.percent}%回復！`;
                break;
            case 'damage':
                this.state.party.forEach(m => {
                    if (m.currentHp > 0) {
                        m.currentHp = Math.max(1, m.currentHp - m.stats.hp * (effect.percent / 100));
                    }
                });
                message = effect.message || `全員HP${effect.percent}%ダメージ...`;
                break;
            case 'item':
                const itemId = effect.item === 'random' ?
                    ['hp_potion', 'mp_potion'][Math.floor(Math.random() * 2)] : effect.item;
                if (this.state.items[itemId] < 3) {
                    this.state.items[itemId]++;
                    message = effect.message || `${ITEMS[itemId].name}を入手！`;
                } else {
                    message = 'アイテムがいっぱいだ...';
                }
                break;
            case 'luck_check':
                const avgLuck = this.state.party.reduce((s, m) => s + m.stats.luck, 0) / 3;
                const success = Math.random() * 100 < 30 + avgLuck / 3;
                if (success) {
                    this.handleEventOption({ effect: effect.success });
                    return;
                } else {
                    this.handleEventOption({ effect: effect.fail });
                    return;
                }
            case 'random':
                const totalWeight = effect.outcomes.reduce((s, o) => s + o.weight, 0);
                let roll = Math.random() * totalWeight;
                for (const outcome of effect.outcomes) {
                    roll -= outcome.weight;
                    if (roll <= 0) {
                        this.handleEventOption({ effect: outcome });
                        return;
                    }
                }
                break;
            case 'stat_up_all':
                this.state.party.forEach(m => {
                    const stats = ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed'];
                    const stat = stats[Math.floor(Math.random() * stats.length)];
                    m.stats[stat] += Math.floor(CHARACTERS[m.id].stats[stat] * effect.percent / 100);
                });
                message = effect.message || '全員のステータスが上がった！';
                break;
        }

        alert(message);
        this.finishNode();
    }

    // 宝箱画面表示
    showTreasureScreen() {
        this.showScreen('treasure');
        const options = document.getElementById('treasure-options');
        options.innerHTML = '';

        const items = ['hp_potion', 'mp_potion', 'revive_stone'];
        items.forEach(itemId => {
            const item = ITEMS[itemId];
            const btn = document.createElement('button');
            btn.className = 'treasure-btn';
            btn.innerHTML = `${item.name}<br><small>${item.description}</small>`;
            btn.addEventListener('click', () => {
                if (this.state.items[itemId] < 3) {
                    this.state.items[itemId]++;
                    alert(`${item.name}を入手！`);
                } else {
                    alert('アイテムがいっぱいだ...');
                }
                this.finishNode();
            });
            options.appendChild(btn);
        });
    }

    // ゲームオーバー
    gameOver() {
        document.getElementById('gameover-message').textContent = '全滅してしまった...';
        this.showScreen('gameover');
    }

    // ゲームリセット
    resetGame() {
        this.state = {
            screen: 'title',
            party: [],
            currentAct: 1,
            currentNode: 0,
            nodeMap: [],
            items: { hp_potion: 0, mp_potion: 0, revive_stone: 0, stat_crystal: 0 },
            battle: null
        };
        this.showScreen('title');
    }

    // 遅延
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 前のキャラクターに戻る
    backCharacter() {
        let prevIdx = this.state.battle.currentCharIndex;

        // 現在のキャラがまだ入力前なら、その前から探す
        if (!this.state.battle.commands[prevIdx]) {
            prevIdx--;
        }

        while (prevIdx >= 0) {
            if (this.state.party[prevIdx].currentHp > 0) {
                // 見つかった生存キャラのコマンドを消去してそこにインデックスを戻す
                delete this.state.battle.commands[prevIdx];
                this.state.battle.currentCharIndex = prevIdx;
                this.updateCommandUI();
                return;
            }
            prevIdx--;
        }
    }
}

// ゲーム開始
const game = new Game();