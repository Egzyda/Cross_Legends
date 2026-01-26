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
            items: [],
            spPool: 0,
            gold: 0, // 所持金（￥）
            battle: null,
            currentTab: 'all',
            currentSort: 'default',
            selectedChar: null,
            difficulty: 0  // 難易度（0-10）
        };

        this.init();
    }

    async init() {
        // 画像プリロード
        await this.preloadImages();
        document.getElementById('loading-overlay').classList.add('hidden');

        this.bindEvents();
        this.initTitleScreen();
        this.showScreen('title');
    }

    // 画像プリロード
    async preloadImages() {
        const images = [];

        // キャラ画像
        Object.values(CHARACTERS).forEach(char => {
            if (char.image?.full) images.push(char.image.full);
            if (char.image?.face) images.push(char.image.face);
        });

        // 敵画像
        Object.values(ENEMIES).forEach(enemy => {
            if (enemy.image?.full) images.push(enemy.image.full);
        });

        // 背景画像
        images.push(
            'img/bg/bg_title.png',
            'img/bg/bg_map.png',
            'img/bg/bg_battle.png'
        );

        const promises = images.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // エラーでも続行
                img.src = src;
            });
        });

        await Promise.all(promises);
    }

    // --- UI Helpers ---

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        container.innerHTML = ''; // Replace old toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-content">${message}</div>`;
        container.appendChild(toast);

        // Animation handled by CSS (slideInRight on mount)

        // Remove after display time (1s display + transition times)
        setTimeout(() => {
            toast.classList.add('hiding'); // Trigger slideOutRight
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 2000); // 1.5s - 2s total life time
    }

    showModal(title, body, actions = []) {
        const modal = document.getElementById('custom-modal');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const actionsEl = document.getElementById('modal-actions');

        titleEl.innerHTML = title;
        bodyEl.innerHTML = body;
        actionsEl.innerHTML = '';

        if (actions.length === 0) {
            actions.push({ text: '閉じる', onClick: () => this.closeModal() });
        }

        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = action.className || 'btn-primary';
            btn.textContent = action.text;
            btn.onclick = action.onClick;
            actionsEl.appendChild(btn);
        });

        modal.classList.remove('hidden');

        if (title === 'ステータス強化') {
            setTimeout(() => this.bindEnhanceEvents(), 0);
        }
    }

    closeModal() {
        document.getElementById('custom-modal').classList.add('hidden');
    }

    showCharacterSelectModal(title, onSelect, onCancel = null) {
        const modal = document.getElementById('character-select-modal');
        const titleEl = document.getElementById('select-modal-title');
        const grid = document.getElementById('character-select-grid');
        const cancelBtn = document.getElementById('character-select-cancel-btn');

        titleEl.textContent = title;
        grid.innerHTML = '';

        // Reuse style from horizontal party status
        grid.className = 'party-status-bar reward-layout-fix';
        grid.style.display = 'flex';
        grid.style.justifyContent = 'center';
        grid.style.gap = '10px';
        grid.style.flexWrap = 'wrap';

        this.state.party.forEach((char) => {
            const card = document.createElement('div');
            card.className = 'party-member-status';
            card.style.cursor = 'pointer';

            const hpPercent = char.stats.hp > 0 ? (char.currentHp / char.stats.hp) * 100 : 0;
            const mpPercent = char.stats.mp > 0 ? (char.currentMp / char.stats.mp) * 100 : 0;

            card.innerHTML = `
                <img src="${char.image.face}" alt="${char.displayName}" onerror="this.style.background='#555'">
                <div class="hp-mp-text">HP: ${Math.floor(char.currentHp)}/${char.stats.hp}</div>
                <div class="hp-bar"><div class="fill" style="width: ${hpPercent}%"></div></div>
                <div class="hp-mp-text">MP: ${Math.floor(char.currentMp)}/${char.stats.mp}</div>
                <div class="mp-bar"><div class="fill" style="width: ${mpPercent}%"></div></div>
            `;

            card.onclick = () => {
                this.closeCharacterSelectModal();
                onSelect(char);
            };
            grid.appendChild(card);
        });

        cancelBtn.onclick = () => {
            this.closeCharacterSelectModal();
            if (onCancel) onCancel();
        };
        // キャンセル不可の場合はボタンを隠すなどの処理が必要だが、今回は基本キャンセル可能とする
        if (!onCancel) cancelBtn.style.display = 'none';
        else cancelBtn.style.display = 'block';

        modal.classList.remove('hidden');
    }

    closeCharacterSelectModal() {
        document.getElementById('character-select-modal').classList.add('hidden');
    }

    showDamagePopup(targetUnit, value, type = 'damage') {
        // Find the unit element in DOM
        let unitEl;
        const isEnemy = this.state.battle.enemies.includes(targetUnit);
        if (isEnemy) {
            const index = this.state.battle.enemies.indexOf(targetUnit);
            unitEl = document.querySelector(`.battle-unit[data-enemy-index="${index}"]`);
        } else {
            const index = this.state.party.indexOf(targetUnit);
            unitEl = document.querySelector(`.battle-unit[data-ally-index="${index}"]`);
        }

        if (unitEl) {
            const popup = document.createElement('div');
            popup.className = `damage-popup ${type}`;
            popup.innerText = value;
            unitEl.appendChild(popup);

            // Remove after animation
            setTimeout(() => popup.remove(), 800);
        }
    }

    // 画面切り替え
    showScreen(screenId) {
        window.scrollTo(0, 0); // スクロールリセット
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenId}-screen`).classList.add('active');
        this.state.screen = screenId;
    }

    // イベントバインド
    bindEvents() {
        // グローバルでコンテキストメニュー（長押しメニュー）を禁止
        window.addEventListener('contextmenu', e => e.preventDefault());

        // タイトル画面
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.hasSaveData()) {
                this.showModal('確認', '進行中のデータがあります。<br>新しいゲームを始めるとデータは消去されます。<br>よろしいですか？', [
                    {
                        text: 'はじめる',
                        onClick: () => {
                            this.closeModal();
                            this.clearSaveData();
                            this.showPartyScreen();
                        },
                        className: 'btn-danger'
                    },
                    { text: 'キャンセル', onClick: () => this.closeModal(), className: 'btn-primary' }
                ]);
            } else {
                this.showPartyScreen();
            }
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            if (this.hasSaveData()) {
                this.loadGame();
            }
        });

        // 難易度選択
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            const difficulty = parseInt(e.target.value);
            this.state.difficulty = difficulty;
            this.updateDifficultyDescription(difficulty);
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

        // リトライ（ゲームオーバーモーダルから）
        document.getElementById('retry-btn-modal').addEventListener('click', () => {
            this.closeGameOverModal();
            this.resetGame();
        });

        // 勝利モーダルから
        document.getElementById('victory-btn-modal').addEventListener('click', () => {
            this.closeVictoryModal();
            this.resetGame();
        });

        // 休憩ボタン
        document.querySelectorAll('.rest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleRest(e.target.dataset.type);
            });
        });

        // モーダル背景タップで閉じる設定
        const modalOverlays = ['custom-modal', 'character-detail-modal', 'item-modal', 'character-select-modal'];
        modalOverlays.forEach(id => {
            const overlay = document.getElementById(id);
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    // クリックされたのが背景（オーバーレイ自体）である場合のみ閉じる
                    if (e.target === overlay) {
                        if (id === 'custom-modal') this.closeModal();
                        else if (id === 'character-detail-modal') this.closeCharacterDetail();
                        else if (id === 'item-modal') this.closeItemModal();
                        else if (id === 'character-select-modal') this.closeCharacterSelectModal();
                    }
                });
            }
        });
    }

    // --- Save System ---

    saveGame() {
        const saveData = {
            party: this.state.party,
            currentAct: this.state.currentAct,
            currentNode: this.state.currentNode,
            currentLayer: this.state.currentLayer,
            nodeMap: this.state.nodeMap,
            items: this.state.items,
            spPool: this.state.spPool,
            gold: this.state.gold, // 所持金を保存
            screen: this.state.screen
            // Battle state is complex to save mid-battle, usually save at start of battle or node
            // For now, save mostly map state
        };
        localStorage.setItem('cross_legends_save', JSON.stringify(saveData));
    }

    loadGame() {
        const json = localStorage.getItem('cross_legends_save');
        if (!json) return;

        const data = JSON.parse(json);
        this.state.party = data.party;
        this.state.currentAct = data.currentAct;
        this.state.currentNode = data.currentNode;
        this.state.currentLayer = data.currentLayer;
        this.state.nodeMap = data.nodeMap;
        this.state.items = data.items;
        this.state.spPool = data.spPool || 0;
        this.state.gold = data.gold || 0; // 所持金を復元

        // Restore screen
        if (data.screen === 'map') {
            this.showMapScreen();
        } else {
            // Default to map if saved elsewhere or unknown
            this.showMapScreen();
        }
    }

    hasSaveData() {
        return !!localStorage.getItem('cross_legends_save');
    }

    clearSaveData() {
        localStorage.removeItem('cross_legends_save');
    }

    initTitleScreen() {
        // Show/Hide Continue Button
        const continueBtn = document.getElementById('continue-btn');
        if (this.hasSaveData()) {
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }

        // 難易度説明を初期化
        this.updateDifficultyDescription(this.state.difficulty);
    }

    // 難易度説明の更新
    updateDifficultyDescription(difficulty) {
        const config = DIFFICULTY_CONFIG[difficulty];
        if (!config) return;

        const descEl = document.getElementById('difficulty-description');
        const hpPercent = Math.round((config.hpMultiplier - 1) * 100);
        const atkPercent = Math.round((config.attackMultiplier - 1) * 100);
        const eliteText = config.eliteBonus > 0 ? `+${config.eliteBonus}` : '通常';
        const restText = config.restHealPercent < 100 ? `${config.restHealPercent}%` : '100%';
        const shopText = config.shopPriceMultiplier > 1 ? `+${Math.round((config.shopPriceMultiplier - 1) * 100)}%` : '通常';

        descEl.innerHTML = `
            <div style="margin-bottom: 8px;">${config.description}</div>
            <div style="font-size: 12px; color: #aaa;">
                敵HP: ${hpPercent > 0 ? '+' : ''}${hpPercent}% /
                敵攻撃: ${atkPercent > 0 ? '+' : ''}${atkPercent}%<br>
                エリート数: ${eliteText} /
                休憩回復: ${restText} /
                ショップ価格: ${shopText}
            </div>
        `;
    }

    // パーティ編成画面表示
    showPartyScreen() {
        this.state.party = [];
        this.state.selectedChar = null;
        this.state.currentTab = 'all';
        this.state.currentSort = 'default';
        this.showScreen('party');
        this.renderPartyFilter();
        this.renderCharacterList();
        this.updatePartySlots();
    }

    // フィルター（プルダウン）描画
    renderPartyFilter() {
        const tabsContainer = document.getElementById('party-tabs');
        if (!tabsContainer) return;

        // Ensure container has correct class for sizing
        tabsContainer.className = 'filter-container';
        tabsContainer.innerHTML = '';

        // Create Filter Select Element
        const filterSelect = document.createElement('select');
        filterSelect.id = 'party-filter';
        filterSelect.style.marginRight = '10px';

        const tabs = [
            { id: 'all', label: 'すべて' },
            { id: 'tank', label: 'タンク' },
            { id: 'physical_attacker', label: '物理アタッカー' },
            { id: 'magic_attacker', label: '魔法アタッカー' },
            { id: 'healer', label: 'ヒーラー' },
            { id: 'support', label: 'サポート' },
            { id: 'debuffer', label: '妨害' }
        ];

        tabs.forEach(tab => {
            const option = document.createElement('option');
            option.value = tab.id;
            option.textContent = tab.label;
            if (this.state.currentTab === tab.id) {
                option.selected = true;
            }
            filterSelect.appendChild(option);
        });

        filterSelect.addEventListener('change', (e) => {
            this.state.currentTab = e.target.value;
            this.renderCharacterList(); // Re-render list with filter
        });

        // Create Sort Select Element
        const sortSelect = document.createElement('select');
        sortSelect.id = 'party-sort';

        const sortOptions = [
            { id: 'default', label: 'デフォルト' },
            { id: 'role', label: '役割' },
            { id: 'hp_desc', label: 'HP降順' },
            { id: 'mp_desc', label: 'MP降順' },
            { id: 'physicalAttack_desc', label: '物攻降順' },
            { id: 'magicAttack_desc', label: '魔攻降順' },
            { id: 'physicalDefense_desc', label: '物防降順' },
            { id: 'magicDefense_desc', label: '魔防降順' },
            { id: 'speed_desc', label: '速さ降順' },
            { id: 'luck_desc', label: '運降順' }
        ];

        sortOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = opt.label;
            if (this.state.currentSort === opt.id) {
                option.selected = true;
            }
            sortSelect.appendChild(option);
        });

        sortSelect.addEventListener('change', (e) => {
            this.state.currentSort = e.target.value;
            this.renderCharacterList(); // Re-render list with sort
        });

        tabsContainer.appendChild(filterSelect);
        tabsContainer.appendChild(sortSelect);
    }

    // キャラクター一覧描画（タブフィルター対応）
    renderCharacterList() {
        const list = document.getElementById('character-list');
        if (!list) return;
        list.innerHTML = '';

        let chars = Object.values(CHARACTERS);

        if (this.state.currentTab !== 'all') {
            chars = chars.filter(c => c.type === this.state.currentTab);
        }

        // Apply sorting
        if (this.state.currentSort === 'role') {
            const roleOrder = ['tank', 'physical_attacker', 'magic_attacker', 'healer', 'support', 'debuffer'];
            chars.sort((a, b) => roleOrder.indexOf(a.type) - roleOrder.indexOf(b.type));
        } else if (this.state.currentSort !== 'default') {
            // Extract stat name from sort option (e.g., 'hp_desc' -> 'hp')
            const statMatch = this.state.currentSort.match(/^(.+)_desc$/);
            if (statMatch) {
                const stat = statMatch[1];
                chars.sort((a, b) => {
                    const aValue = a.stats[stat] || 0;
                    const bValue = b.stats[stat] || 0;
                    return bValue - aValue; // Descending order
                });
            }
        }

        chars.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.charId = char.id;

            const roleLabel = this.getTypeLabel(char.type);
            const isLongName = char.displayName.length > 7;
            const nameContent = isLongName
                ? `<svg width="100%" height="100%" viewBox="0 0 100 14" preserveAspectRatio="none" style="overflow:visible; min-width: 100%;">
                     <text x="50%" y="11" font-size="10" text-anchor="middle" fill="currentColor"
                           textLength="100%" lengthAdjust="spacingAndGlyphs" font-family="inherit" font-weight="700">
                       ${char.displayName}
                     </text>
                   </svg>`
                : char.displayName;

            card.innerHTML = `
                <div class="char-type-label">${roleLabel}</div>
                <img src="${char.image.face}" alt="${char.displayName}" style="width: 50px; height: 50px; margin-bottom: 4px;">
                <div class="char-name">${nameContent}</div>
            `;

            // Check if in party
            const inParty = this.state.party.find(p => p.id === char.id);
            if (inParty) {
                card.classList.add('selected');
                const badge = document.createElement('div');
                badge.style.position = 'absolute';
                badge.style.top = '-5px';
                badge.style.right = '-5px';
                badge.style.background = 'var(--primary)';
                badge.style.color = '#fff';
                badge.style.fontSize = '10px';
                badge.style.padding = '2px 6px';
                badge.style.borderRadius = '10px';
                badge.innerText = inParty.position === 'left' ? '前' : (inParty.position === 'right' ? '後' : '中');
                card.appendChild(badge);
            }

            // Check if currently selecting
            if (this.state.selectedChar === char.id) {
                card.classList.add('selecting');
            }

            // Click event
            card.addEventListener('click', () => this.handleCharacterClick(char.id));

            // Long press for detail
            this.addLongPressListener(card, () => this.showCharacterDetail(char.id, 'party'));

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
            debuffer: '妨害',
            balance: 'バランス'
        };
        return labels[type] || type;
    }

    // キャラクタークリック処理（2段階選択）
    handleCharacterClick(charId) {
        // Already in party? Remove from party
        const existingIndex = this.state.party.findIndex(p => p.id === charId);
        if (existingIndex >= 0) {
            this.state.party.splice(existingIndex, 1);
            this.state.selectedChar = null;
            this.updatePartySlots();
            this.renderCharacterList();
            return;
        }

        // Toggle selection
        if (this.state.selectedChar === charId) {
            this.state.selectedChar = null;
        } else {
            this.state.selectedChar = charId;
        }

        this.renderCharacterList();
        this.updatePartySlots();
    }

    // スロットクリック処理
    handleSlotClick(position) {
        if (!this.state.selectedChar) return;
        if (this.state.party.length >= 3) return;

        // Check if position already filled
        if (this.state.party.find(p => p.position === position)) return;

        // Add to party
        const charData = JSON.parse(JSON.stringify(CHARACTERS[this.state.selectedChar]));
        charData.currentHp = charData.stats.hp;
        charData.currentMp = charData.stats.mp;
        charData.position = position;
        charData.buffs = [];
        charData.debuffs = [];
        charData.statusEffects = [];
        charData.statBoosts = {};
        charData.skills = [];
        this.state.party.push(charData);

        this.state.selectedChar = null;
        this.updatePartySlots();
        this.renderCharacterList();
    }

    // パーティスロット更新
    updatePartySlots() {
        const positions = ['left', 'center', 'right'];
        positions.forEach((pos) => {
            const slot = document.querySelector(`.party-slot[data-position="${pos}"]`);
            if (!slot) return;

            // Remove old click listener by replacing
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);

            const content = newSlot.querySelector('.slot-content');
            const member = this.state.party.find(p => p.position === pos);

            if (member) {
                const isLongName = member.displayName.length > 7;
                const nameContent = isLongName
                    ? `<svg width="100%" height="100%" viewBox="0 0 100 14" preserveAspectRatio="none" style="overflow:visible; min-width: 100%;">
                         <text x="50%" y="11" font-size="10" text-anchor="middle" fill="currentColor"
                               textLength="100%" lengthAdjust="spacingAndGlyphs" font-family="inherit" font-weight="700">
                           ${member.displayName}
                         </text>
                       </svg>`
                    : member.displayName;

                content.innerHTML = `
                    <div class="slot-role-label">${this.getTypeLabel(member.type)}</div>
                    <img src="${member.image.face}" alt="${member.displayName}"
                         style="width:50px;height:50px;border-radius:50%;background:#555;margin-bottom:4px;"
                         onerror="this.style.background='#555'">
                    <div class="slot-char-name">${nameContent}</div>
                `;
                newSlot.classList.add('filled');
                newSlot.classList.remove('available');
            } else {
                content.innerHTML = '<div style="color:#666">空き</div>';
                newSlot.classList.remove('filled');
                // Available if char selected
                if (this.state.selectedChar) {
                    newSlot.classList.add('available');
                } else {
                    newSlot.classList.remove('available');
                }
            }

            // Add click listener
            newSlot.addEventListener('click', () => this.handleSlotClick(pos));
        });

        document.getElementById('start-run-btn').disabled = this.state.party.length !== 3;
    }

    // Long press listener helper
    addLongPressListener(element, callback) {
        let pressTimer;
        let startX, startY;

        const startPress = (e) => {
            if (e.touches && e.touches[0]) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
            pressTimer = setTimeout(() => {
                callback();
            }, 500);
        };

        const movePress = (e) => {
            if (!pressTimer || !e.touches || !e.touches[0]) return;
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            // 10px以上動いたら長押しをキャンセル
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        };

        const endPress = () => {
            clearTimeout(pressTimer);
            pressTimer = null;
        };

        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', endPress);
        element.addEventListener('mouseleave', endPress);
        element.addEventListener('touchstart', startPress, { passive: true });
        element.addEventListener('touchmove', movePress, { passive: true });
        element.addEventListener('touchend', endPress);
        element.addEventListener('touchcancel', endPress);

        // Right click
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            callback();
        });
    }

    // ラン開始
    startRun() {
        // パーティを選択したスロット位置（左・中・右）の順に並び替える
        const posOrder = { 'left': 0, 'center': 1, 'right': 2 };
        this.state.party.sort((a, b) => posOrder[a.position] - posOrder[b.position]);

        this.state.currentAct = 1;
        this.state.currentNode = 0;
        this.state.items = [];
        this.state.spPool = 0;
        this.state.gold = 0; // 所持金を初期化
        this.generateMap();
        this.showMapScreen();
    }

    // マップ生成
    // マップ生成（Slay the Spire風：クロスなし、戦略的配置）
    // マップ生成（グリッドベース：4列固定 + 収束）
    // マップ生成（Slay the Spire風：戦略的ルート選択可能）
    generateMap() {
        const config = this.state.currentAct === 1 ? MAP_CONFIG.act1 : MAP_CONFIG.act2;

        // ボスを確定させる
        const bossId = config.bosses[Math.floor(Math.random() * config.bosses.length)];
        this.state.mapBoss = bossId;

        // ノードマップ生成（厳密な交差なし・Planar Graph）
        const nodeStore = [];
        // レイヤーごとの最大ノード数（幅）
        // 多めに確保し、後で到達不可能なものを間引くことで自然な形にする
        const LAYERS = 10;
        const nodesPerLayer = [3, 4, 4, 4, 4, 4, 4, 4, 1, 1];

        // 1. ノード初期化
        // 一旦すべての可能な位置にノードを作成する
        for (let l = 0; l < LAYERS; l++) {
            const count = nodesPerLayer[l];
            const layerNodes = [];
            for (let i = 0; i < count; i++) {
                // レーン位置は均等割り（0..count-1）で正規化
                // 描画時に中央寄せするために相対位置を持つ
                let lane = i;
                if (count === 1) lane = 2; // 中央付近

                layerNodes.push({
                    layer: l,
                    index: i,
                    lane: lane,
                    nextNodes: [],
                    parents: [],
                    type: 'battle',
                    status: 'locked',
                    valid: true // フィルタリング用フラグ
                });
            }
            nodeStore.push(layerNodes);
        }

        // 2. 接続生成（厳密なクロス禁止ロジック）
        // ルール: ノード N(i) の接続先ターゲットの最小インデックス >= ノード N(i-1) の接続先ターゲットの最大インデックス

        for (let l = 0; l < LAYERS - 1; l++) {
            const currentLayer = nodeStore[l];
            const nextLayer = nodeStore[l + 1];

            let minNextIndex = 0; // 次のノードが選べる最小のインデックス

            currentLayer.forEach((node, idx) => {
                // 自分のレーンに近いターゲット候補を探す
                // lane差が1.5以内などを候補とする（あまり遠くへは行けない）
                const potentialCandidates = nextLayer.filter(target =>
                    target.index >= minNextIndex && // クロス防止制約
                    Math.abs(target.lane - node.lane) <= 1.5 // 物理的距離制約（調整可）
                );

                if (potentialCandidates.length === 0) {
                    // 候補がない場合（端など）、接続なし（後で間引かれる）
                    return;
                }

                // ランダムに1～3個選ぶ（連続した範囲である必要あり）
                // [T1, T2, T3] のうち {T1}, {T2}, {T1, T2} など
                // 飛び地選択 {T1, T3} はクロスのもとなので禁止（連続性維持）

                const maxConnections = (l === 0) ? 2 : (Math.random() < 0.5 ? 1 : 2);
                const numConnections = Math.min(potentialCandidates.length, maxConnections);

                // 候補の中から連続した部分配列を選ぶ
                // 開始位置をランダムに
                const maxStart = Math.max(0, potentialCandidates.length - numConnections);
                const startIndex = Math.floor(Math.random() * (maxStart + 1));

                const selectedTargets = [];
                for (let k = 0; k < numConnections; k++) {
                    selectedTargets.push(potentialCandidates[startIndex + k]);
                }

                // 接続適用
                if (selectedTargets.length > 0) {
                    selectedTargets.forEach(target => {
                        node.nextNodes.push(target.index);
                        target.parents.push(node.index);
                    });

                    // 次のノードのための制約を更新
                    // 現在のノードが選んだ「最大のインデックス」が、次のノードの「最小インデックス」の下限になる
                    minNextIndex = selectedTargets[selectedTargets.length - 1].index;
                }
            });
        }

        // 3. 有効ノードの選別（Reachability Check）

        // (A) Startから到達可能なノードをマーク
        // Layer 0 は全て到達可能
        nodeStore[0].forEach(n => n.reachable = true);

        for (let l = 0; l < LAYERS - 1; l++) {
            nodeStore[l].forEach(node => {
                if (node.reachable) {
                    node.nextNodes.forEach(nextIdx => {
                        nodeStore[l + 1][nextIdx].reachable = true;
                    });
                }
            });
        }

        // (B) Bossまで到達可能なノードをマーク (Reverse check)
        // Layer 9 (Boss) はゴール
        nodeStore[LAYERS - 1].forEach(n => n.canReachBoss = true);

        for (let l = LAYERS - 2; l >= 0; l--) {
            nodeStore[l].forEach(node => {
                // 自分の子が一つでも Boss到達可能なら OK
                const hasPath = node.nextNodes.some(nextIdx => nodeStore[l + 1][nextIdx].canReachBoss);
                if (hasPath) node.canReachBoss = true;
            });
        }

        // 両方満たすノードのみ残す
        // parents/nextNodes のインデックスずれを防ぐため、再構築する

        const finalStore = [];

        for (let l = 0; l < LAYERS; l++) {
            // 有効なノードだけ抽出
            const validNodes = nodeStore[l].filter(n => n.reachable && n.canReachBoss);

            // インデックスの振り直しが必要
            // ただし nextNodes は「次のレイヤーの古いインデックス」を指しているため、
            // 次のレイヤーの修正マップが必要になる。
            finalStore.push(validNodes);
        }

        // リンク情報の再マッピング
        for (let l = 0; l < LAYERS - 1; l++) {
            const currentLayer = finalStore[l];
            const nextLayer = finalStore[l + 1];

            // nextLayerの「古いインデックス -> 新しいオブジェクト」のマップ作成
            const nextMap = {};
            nextLayer.forEach((n, newIdx) => {
                nextMap[n.index] = { newNode: n, newIdx: newIdx };
            });

            currentLayer.forEach(node => {
                // 古い nextNodes を走査し、新しいレイヤーに残っているか確認
                const newNextNodes = [];
                node.nextNodes.forEach(oldNextIdx => {
                    if (nextMap[oldNextIdx]) {
                        newNextNodes.push(nextMap[oldNextIdx].newIdx);
                        // ついでに親情報の更新などは…今回は generateMapの最後で parents を消去しているので
                        // nextNodes だけ正しければ描画はできる。
                        // 親情報が必要なのはタイプ決定時なので、ここで親情報も再構築が必要。
                    }
                });
                node.nextNodes = newNextNodes;
            });
        }

        // 親情報の再構築（タイプ決定用）
        for (let l = 1; l < LAYERS; l++) {
            const currentLayer = finalStore[l];
            const prevLayer = finalStore[l - 1];

            currentLayer.forEach(node => {
                node.parents = []; // リセット
            });

            prevLayer.forEach((pNode, pIdx) => {
                pNode.nextNodes.forEach(childIdx => {
                    const child = currentLayer[childIdx];
                    if (child) {
                        child.parents.push(pIdx);
                    }
                });
            });
        }

        // currentLayerの index プロパティなどを更新
        // laneも再計算して中央揃えにする
        for (let l = 0; l < LAYERS; l++) {
            const layerNodes = finalStore[l];
            const count = layerNodes.length;
            layerNodes.forEach((node, idx) => {
                node.index = idx; // 新しいインデックス
                node.id = `${l}-${idx}`;
                node.status = (l === 0) ? 'available' : 'locked';

                // 表示用 Lane 再計算 (均等配置)
                // 元のlane情報を維持するとスカスカになるので、詰める
                if (count === 1) node.lane = 1.5; // Fixed center
                else if (count === 2) node.lane = idx === 0 ? 1 : 2;
                else if (count === 3) node.lane = idx + 0.5;
                else node.lane = idx * (3 / (count - 1)); // 0..3に正規化
            });
        }

        // グローバルへ反映前に中身置き換え
        // nodeStore = finalStore だが、GameLogic上の nodeStore はローカル変数
        // 最後に this.state.nodeMap = finalStore する

        // ========================================
        // 4. ノードタイプの割り当て
        // ========================================
        const difficulty = this.state.difficulty || 0;
        const diffConfig = DIFFICULTY_CONFIG[difficulty];
        const eliteBoost = diffConfig ? diffConfig.eliteBonus * 5 : 0;

        const getParentTypes = (layer, nodeIdx) => {
            if (layer === 0) return [];
            const node = finalStore[layer][nodeIdx];
            return node.parents.map(pIdx => finalStore[layer - 1][pIdx].type);
        };

        let shopCount = 0;

        for (let l = 0; l < LAYERS; l++) {
            finalStore[l].forEach((node, idx) => {
                // 固定タイプ
                if (l === 0) { node.type = 'battle'; return; }
                if (l === 8) { node.type = 'rest'; return; }
                if (l === 9) { node.type = 'boss'; return; }

                const parentTypes = getParentTypes(l, idx);
                const hasRestParent = parentTypes.includes('rest');
                const hasShopParent = parentTypes.includes('shop');
                const hasEventParent = parentTypes.includes('event');

                if (l === 1) { node.type = Math.random() < 0.6 ? 'battle' : 'event'; return; }
                if (l === 2) {
                    const r = Math.random() * 100;
                    if (r < 50) node.type = 'battle';
                    else if (r < 85 - eliteBoost) node.type = 'event';
                    else node.type = 'elite';
                    return;
                }

                if (hasRestParent || hasShopParent) {
                    const eliteChance = 30 + eliteBoost;
                    node.type = Math.random() * 100 < eliteChance ? 'elite' : 'battle';
                    return;
                }

                if (l === 7) {
                    const r = Math.random() * 100;
                    if (r < 50 - eliteBoost) node.type = 'battle';
                    else if (r < 80) node.type = 'elite';
                    else node.type = 'event';
                    return;
                }

                const baseEliteWeight = l >= 5 ? 20 : 10;
                const weights = {
                    battle: 35 - eliteBoost,
                    elite: baseEliteWeight + eliteBoost,
                    event: 25,
                    shop: l >= 3 ? 10 : 0,
                    rest: 10
                };

                if (hasEventParent) {
                    weights.event = 10;
                    weights.battle += 15;
                }

                node.type = this.weightedRandom(weights);
                if (node.type === 'shop') shopCount++;
            });
        }

        // ショップ確定保証 (ノード数が減っている可能性があるので注意)
        if (shopCount === 0) {
            const targetLayers = [4, 5, 6].filter(l => finalStore[l] && finalStore[l].length > 0);
            if (targetLayers.length > 0) {
                const l = targetLayers[Math.floor(Math.random() * targetLayers.length)];
                const candidates = finalStore[l];
                candidates[Math.floor(Math.random() * candidates.length)].type = 'shop';
            }
        }

        // 休憩連続防止
        for (let l = 1; l < LAYERS - 2; l++) {
            finalStore[l].forEach((node, idx) => {
                if (node.type === 'rest') {
                    const parentTypes = getParentTypes(l, idx);
                    if (parentTypes.includes('rest')) {
                        node.type = 'battle';
                    }
                }
            });
        }

        // 最終クリーンアップ
        for (let l = 0; l < LAYERS; l++) {
            finalStore[l].forEach(n => {
                delete n.parents;
                delete n.valid;
                delete n.reachable;
                delete n.canReachBoss;
            });
        }

        this.state.nodeMap = finalStore;
        this.state.currentLayer = 0;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 重み付きランダム選択
    weightedRandom(weights) {
        let total = 0;
        Object.values(weights).forEach(w => total += w);

        let random = Math.random() * total;

        for (const type in weights) {
            random -= weights[type];
            if (random <= 0) {
                return type;
            }
        }
        return 'battle'; // Fallback
    }

    showMapScreen() {
        this.showScreen('map');
        this.renderMap();
        this.renderPartyStatusBar();
    }

    renderPartyStatusBar() {
        const bar = document.getElementById('party-status-bar');
        if (!bar) return;
        bar.innerHTML = '';

        // Controls Row (Home & Item)
        const controlsRow = document.createElement('div');
        controlsRow.className = 'controls-row';

        // 所持金表示（一番左）
        const goldDisplay = document.createElement('div');
        goldDisplay.id = 'gold-display';
        goldDisplay.innerHTML = `<span class="gold-icon">￥</span><span class="gold-amount">${this.state.gold.toLocaleString()}</span>`;
        controlsRow.appendChild(goldDisplay);

        const homeBtn = document.createElement('button');
        homeBtn.id = 'home-btn';
        homeBtn.textContent = 'ホーム';
        homeBtn.onclick = () => {
            this.saveGame();
            this.showScreen('title');
            this.initTitleScreen(); // Re-check continue button
        };
        controlsRow.appendChild(homeBtn);

        const itemBtn = document.createElement('button');
        itemBtn.id = 'item-btn';
        itemBtn.textContent = 'アイテム';
        itemBtn.onclick = () => this.showItemModal('map');
        controlsRow.appendChild(itemBtn);

        const enhanceBtn = document.createElement('button');
        enhanceBtn.id = 'enhance-btn';
        enhanceBtn.textContent = '強化';
        enhanceBtn.onclick = () => this.showEnhanceScreen();
        controlsRow.appendChild(enhanceBtn);

        bar.appendChild(controlsRow);

        // Members Row
        const membersRow = document.createElement('div');
        membersRow.className = 'members-row';

        this.state.party.forEach(member => {
            const el = document.createElement('div');
            el.className = 'party-member-status';
            const hpPercent = member.stats.hp > 0 ? (member.currentHp / member.stats.hp) * 100 : 0;
            const mpPercent = member.stats.mp > 0 ? (member.currentMp / member.stats.mp) * 100 : 0;

            el.innerHTML = `
                <img src="${member.image.face}" alt="${member.displayName}" onerror="this.style.background='#555'">
                <div class="hp-mp-text">HP: ${Math.floor(member.currentHp)}/${member.stats.hp}</div>
                <div class="hp-bar"><div class="fill" style="width: ${hpPercent}%"></div></div>
                <div class="hp-mp-text">MP: ${Math.floor(member.currentMp)}/${member.stats.mp}</div>
                <div class="mp-bar"><div class="fill" style="width: ${mpPercent}%"></div></div>
            `;

            // Single click for detail (changed from long press)
            el.onclick = () => this.showCharacterDetail(member.id, 'map');

            membersRow.appendChild(el);
        });

        bar.appendChild(membersRow);
    }

    // パーティアイコン描画（報酬画面用など）
    renderPartyIcons(container) {
        container.innerHTML = '';
        // 報酬画面専用の識別クラスを追加し、構造を一段階浅くする
        container.className = 'party-status-bar reward-layout-fix';

        this.state.party.forEach(member => {
            const el = document.createElement('div');
            el.className = 'party-member-status';
            const hpPercent = member.stats.hp > 0 ? (member.currentHp / member.stats.hp) * 100 : 0;
            const mpPercent = member.stats.mp > 0 ? (member.currentMp / member.stats.mp) * 100 : 0;

            el.innerHTML = `
                <img src="${member.image.face}" alt="${member.displayName}" onerror="this.style.background='#555'">
                <div class="hp-mp-text">HP: ${Math.floor(member.currentHp)}/${member.stats.hp}</div>
                <div class="hp-bar"><div class="fill" style="width: ${hpPercent}%"></div></div>
                <div class="hp-mp-text">MP: ${Math.floor(member.currentMp)}/${member.stats.mp}</div>
                <div class="mp-bar"><div class="fill" style="width: ${mpPercent}%"></div></div>
            `;

            el.onclick = () => this.showCharacterDetail(member.id, 'map');
            container.appendChild(el); // 直接追加することで構造を安定させる
        });
    }

    renderMap() {
        const mapEl = document.getElementById('node-map');
        mapEl.innerHTML = '';
        mapEl.classList.add('branching-map');

        document.getElementById('act-display').textContent = `第${this.state.currentAct}幕`;
        document.getElementById('node-progress').textContent =
            `階層 ${this.state.currentLayer + 1}/10`;

        // Boss Preview Header
        const bossPreview = document.createElement('div');
        bossPreview.className = 'boss-preview';
        let bossName = '???';
        let bossIcon = '👑';
        let bossImg = '';

        if (this.state.mapBoss) {
            const bossData = ENEMIES[this.state.mapBoss];
            if (bossData) {
                bossName = bossData.displayName;
                bossImg = bossData.image.face || bossData.image.full;
            }
        }
        bossPreview.innerHTML = `
            <div class="boss-label">BOSS</div>
            <div class="boss-info">
                 ${bossImg ? `<img src="${bossImg}" class="boss-mini-icon">` : bossIcon}
                 <span>${bossName}</span>
            </div>
        `;
        mapEl.appendChild(bossPreview);


        // layersContainerを基準点として作成
        const layersContainer = document.createElement('div');
        layersContainer.className = 'layers-container';
        layersContainer.style.position = 'relative';
        // Flexboxを使わず、Gridまたは絶対配置のように扱う（レーン配置のため）
        // ここでは各LayerをRowにし、各Nodeをlaneプロパティに基づいて配置するスタイルを採用

        mapEl.appendChild(layersContainer);

        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "0";
        layersContainer.appendChild(svg);

        const nodeElements = {};

        // Layer 9 (Boss) -> Layer 0 (Start) の順で描画
        [...this.state.nodeMap].reverse().forEach((layer, refreshIdx) => {
            const layerIndex = 9 - refreshIdx;

            const row = document.createElement('div');
            row.className = 'map-layer-row';
            row.dataset.layer = layerIndex;

            // 全レイヤーをFlexboxで均等配置（ノード数が可変のためGridより自然）
            row.style.display = 'flex';
            row.style.justifyContent = 'space-evenly';
            row.style.alignItems = 'center';
            row.style.width = '100%';

            // 7レーン分のセルを作成し、ノードがある場所にのみ配置
            // または、ノードに gridColumn を指定する
            layer.forEach(node => {
                const nodeEl = document.createElement('div');
                nodeEl.className = `map-node node-type-${node.type}`;
                nodeEl.id = `node-${node.id}`;

                // ボスノードかつ画像がある場合
                if (node.type === 'boss' && bossImg) {
                    nodeEl.innerHTML = `<img src="${bossImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    nodeEl.classList.add('boss-node-img');
                } else {
                    nodeEl.innerHTML = `<div class="node-icon">${NODE_TYPES[node.type].icon}</div>`;
                }

                // Grid配置ロジックは廃止（Flexboxの自動配置に任せる）

                if (node.completed) nodeEl.classList.add('completed');

                // 選択可能性判定 (以下変更なし)
                if (node.status === 'available' && node.layer === this.state.currentLayer) {
                    nodeEl.classList.add('available');
                    nodeEl.onclick = () => this.enterNode(node);
                } else if (node.status === 'locked') {
                    nodeEl.classList.add('locked');
                }

                if (layerIndex < this.state.currentLayer && !node.completed) {
                    nodeEl.classList.add('skipped');
                }

                // Bossレイヤーでまだ到達していない場合、グレーアウトしすぎないように？
                // ロック状態は標準スタイルでOK

                row.appendChild(nodeEl);
                nodeElements[node.id] = nodeEl;
            });

            layersContainer.appendChild(row);
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.drawMapConnections(svg, nodeElements, layersContainer);

                // スクロール処理
                const activeNode = mapEl.querySelector('.map-node.available');
                if (activeNode) {
                    const nodeRect = activeNode.getBoundingClientRect();
                    const containerRect = mapEl.getBoundingClientRect();
                    const currentScroll = mapEl.scrollTop;
                    const absoluteNodeTop = currentScroll + (nodeRect.top - containerRect.top);
                    const targetScroll = absoluteNodeTop - (mapEl.clientHeight / 2) + (activeNode.offsetHeight / 2);

                    mapEl.scrollTo({ top: targetScroll, behavior: 'smooth' });
                } else {
                    mapEl.scrollTop = mapEl.scrollHeight;
                }
                window.scrollTo(0, 0); // 全体スクロールリセット
            });
        });
    }

    // ノード間の接続線を描画
    drawMapConnections(svg, nodeElements, container) {
        // SVGのサイズを明示的に設定
        const containerRect = container.getBoundingClientRect();
        svg.setAttribute('width', containerRect.width);
        svg.setAttribute('height', containerRect.height);

        this.state.nodeMap.forEach(layer => {
            layer.forEach(node => {
                const startEl = nodeElements[node.id];
                if (!startEl) return;

                // containerを基準とした絶対座標を取得
                const startRect = startEl.getBoundingClientRect();
                const x1 = startRect.left - containerRect.left + startRect.width / 2;
                const y1 = startRect.top - containerRect.top + startRect.height / 2;

                node.nextNodes.forEach(nextIdx => {
                    const nextNodeId = `${node.layer + 1}-${nextIdx}`;
                    const endEl = nodeElements[nextNodeId];
                    if (endEl) {
                        const endRect = endEl.getBoundingClientRect();
                        const x2 = endRect.left - containerRect.left + endRect.width / 2;
                        const y2 = endRect.top - containerRect.top + endRect.height / 2;

                        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        line.setAttribute("x1", x1);
                        line.setAttribute("y1", y1);
                        line.setAttribute("x2", x2);
                        line.setAttribute("y2", y2);

                        // 線の配色：清潔感のある白系に変更
                        let strokeColor = "rgba(255, 255, 255, 0.5)"; // 未開放（見やすく）
                        let strokeWidth = "1.5";

                        if (node.completed && this.isNodeAvailable(node.layer + 1, nextIdx)) {
                            strokeColor = "rgba(255, 255, 255, 0.9)"; // 攻略ルート（くっきり白）
                            strokeWidth = "3";
                        } else if (node.status === 'available') {
                            strokeColor = "rgba(255, 255, 255, 0.7)"; // 選択可能候補（かなり見やすい白）
                            strokeWidth = "2";
                        }

                        line.setAttribute("stroke", strokeColor);
                        line.setAttribute("stroke-width", strokeWidth);
                        svg.appendChild(line);
                    }
                });
            });
        });
    }

    // ヘルパー：ノードが選択可能か確認
    isNodeAvailable(layerIdx, nodeIdx) {
        // ノードデータから確認
        const layer = this.state.nodeMap[layerIdx];
        if (!layer) return false;
        const node = layer[nodeIdx];
        return node && node.status === 'available';
    }

    enterNode(node) {
        // ノードオブジェクトを直接受け取る
        this.state.currentNode = node; // オブジェクト参照またはID保持

        // 以前のロジックとの互換性のため currentNodeIndex 的なものが必要なら調整
        // ここでは currentNode をオブジェクトとして扱うように全体を直すのがベストだが
        // 部分的な修正にとどめるなら注意が必要。
        // とりあえず this.state.currentNode には node オブジェクトを入れる。

        switch (node.type) {
            case 'battle':
                this.startBattle('normal');
                break;
            case 'elite':
                this.startBattle('elite');
                break;
            case 'boss':
                this.startBattle(this.state.currentAct === 2 ? 'last_boss' : 'boss', true);
                break;
            case 'rest':
                this.showScreen('rest');
                // 休憩画面にもパーティ情報を表示
                const restPartyContainer = document.getElementById('rest-party-status');
                if (restPartyContainer) {
                    this.renderPartyIcons(restPartyContainer);
                }
                break;
            case 'event':
                this.showEventScreen();
                break;
            case 'shop':
                this.showShopScreen();
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
            // 階層に基づく難易度調整
            multiplier = this.state.currentLayer < 3 ? config.multiplier.start : config.multiplier.mid;
            for (let i = 0; i < count; i++) {
                const enemyId = config.enemies[Math.floor(Math.random() * config.enemies.length)];
                enemies.push(this.createEnemy(enemyId, multiplier));
            }
        } else if (rank === 'elite') {
            // エリート1体 + 雑魚0~2体
            multiplier = config.multiplier.elite;

            // エリート1体
            const eliteId = config.elites[Math.floor(Math.random() * config.elites.length)];
            enemies.push(this.createEnemy(eliteId, multiplier, true));

            // 雑魚追加
            const minionCount = Math.floor(Math.random() * 3); // 0, 1, 2
            if (minionCount > 0) {
                const minionMultiplier = this.state.currentLayer < 3 ? config.multiplier.start : config.multiplier.mid;
                for (let i = 0; i < minionCount; i++) {
                    const enemyId = config.enemies[Math.floor(Math.random() * config.enemies.length)];
                    enemies.push(this.createEnemy(enemyId, minionMultiplier));
                }
            }
        } else if (rank === 'boss' || rank === 'last_boss') {
            multiplier = config.multiplier.boss;
            // マップで決まったボス(this.state.mapBoss)を使用
            let enemyId = this.state.mapBoss;
            if (!enemyId) { // フォールバック
                enemyId = config.bosses[Math.floor(Math.random() * config.bosses.length)];
            }
            const boss = this.createEnemy(enemyId, multiplier);
            boss.rank = rank; // ボスランクを明示的に上書き
            enemies.push(boss);
        }

        // エリート配置調整：3体の場合、エリートを中央（2番目）にする
        if (rank === 'elite' && enemies.length === 3) {
            // 0:Elite, 1:Minion, 2:Minion -> 1:Minion, 0:Elite, 2:Minion
            const temp = enemies[0];
            enemies[0] = enemies[1];
            enemies[1] = temp;
        }

        // Duplicate Name Handling
        const nameCounts = {};
        enemies.forEach(e => { nameCounts[e.name] = (nameCounts[e.name] || 0) + 1; });
        const currentCounts = {};
        enemies.forEach(e => {
            if (nameCounts[e.name] > 1) {
                currentCounts[e.name] = (currentCounts[e.name] || 0) + 1;
                const suffix = String.fromCharCode(64 + currentCounts[e.name]); // A, B, C...
                e.displayName = `${e.name}${suffix}`;
            }
        });

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
        // 前のバトルの敵・味方の表示を確実にリセットし、描画バグを防ぐ
        document.getElementById('enemy-area').innerHTML = '';
        document.getElementById('ally-area').innerHTML = '';
        // ボタンの無効化を解除（2ndバトル対策）
        document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = false);
        this.renderBattle();
        this.startCommandPhase();
    }

    // 敵生成（難易度対応）
    createEnemy(enemyId, multiplier, isElite = false) {
        const template = ENEMIES[enemyId];
        const stats = {};

        // 難易度設定を取得
        const difficulty = this.state.difficulty || 0;
        const diffConfig = DIFFICULTY_CONFIG[difficulty];
        const hpMult = diffConfig ? diffConfig.hpMultiplier : 1.0;
        const atkMult = diffConfig ? diffConfig.attackMultiplier : 1.0;

        Object.keys(template.baseStats).forEach(stat => {
            let value = template.baseStats[stat];

            // ステータスごとに倍率を適用
            if (stat === 'hp') {
                value = Math.floor(value * hpMult);
            } else if (stat === 'physicalAttack' || stat === 'magicAttack') {
                value = Math.floor(value * atkMult);
            } else if (stat === 'speed') {
                // 速度は据え置き
                value = value;
            } else {
                // 防御・MP・luckは据え置き
                value = value;
            }

            stats[stat] = value;
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
            statusEffects: [],
            uniqueSkill: template.uniqueSkill, // uniqueSkillをコピー
            rank: isElite ? 'elite' : 'normal' // デフォルトランク設定
        };
    }

    // 戦闘描画（スマホ向け軽量化：初回以外は個別更新のみ行う）
    renderBattle() {
        const enemyArea = document.getElementById('enemy-area');
        const allyArea = document.getElementById('ally-area');

        // ユニット要素がまだ無い（初回）場合はフル描画、あれば個別更新のみ
        if (enemyArea.children.length === 0 || allyArea.children.length === 0) {
            this.renderEnemies();
            this.renderVSDivider();
            this.renderAllies();
        } else {
            const allUnits = [...this.state.party, ...this.state.battle.enemies];
            allUnits.forEach(unit => this.updateUnitUI(unit));
        }
        this.renderBattleLog();
    }

    renderVSDivider() {
        const battleScreen = document.getElementById('battle-screen');
        let divider = battleScreen.querySelector('.vs-divider');
        if (!divider) {
            divider = document.createElement('div');
            divider.className = 'vs-divider';
            divider.innerHTML = '<span>VS</span>';
            const allyArea = document.getElementById('ally-area');
            battleScreen.insertBefore(divider, allyArea);
        }
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
                <div class="buff-overlay">${this.renderBuffOverlay(enemy)}</div>
                <img src="${this.getUnitImage(enemy)}" alt="${enemy.displayName}" onerror="this.style.background='#555'">
                <div class="unit-name">${enemy.displayName}</div>
                <div class="unit-hp-bar">
                    <div class="fill" style="width:${hpPercent}%"></div>
                    <div class="bar-text">${Math.floor(enemy.currentHp)}/${enemy.stats.hp}</div>
                </div>
                <div class="status-ailments">${this.renderStatusAilments(enemy)}</div>
            `;
            // 敵クリックでステータス表示
            unit.onclick = () => this.showCharacterDetail(idx, 'enemy_battle');
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
                <div class="buff-overlay">${this.renderBuffOverlay(ally)}</div>
                <img src="${this.getUnitImage(ally, 'face')}" alt="${ally.displayName}" onerror="this.style.background='#555'">
                <div class="unit-name">${ally.displayName}</div>
                <div class="unit-hp-bar">
                    <div class="fill" style="width:${hpPercent}%"></div>
                    <div class="bar-text">${Math.floor(ally.currentHp)}/${ally.stats.hp}</div>
                </div>
                <div class="unit-mp-bar">
                    <div class="fill" style="width:${mpPercent}%"></div>
                    <div class="bar-text">${Math.floor(ally.currentMp)}/${ally.stats.mp}</div>
                </div>
                <div class="status-ailments">${this.renderStatusAilments(ally)}</div>
            `;

            // Single click for detail (changed from long press)
            unit.onclick = () => this.showCharacterDetail(ally.id, 'battle');

            area.appendChild(unit);
        });
    }

    // ユニットのUIをピンポイントで更新（軽量化：画像はそのまま、数値とバーだけ書き換え）
    updateUnitUI(unit) {
        if (!unit) return;
        const selector = this.getUnitSelector(unit);
        const unitEl = document.querySelector(selector);
        if (!unitEl) return;

        // 画像更新 (G-MAX等による変更反映)
        const imgEl = unitEl.querySelector('img');
        if (imgEl) {
            const isEnemy = this.state.battle.enemies.includes(unit);
            // getUnitImageが定義されている前提
            const newSrc = this.getUnitImage(unit, isEnemy ? 'full' : 'face');
            // src属性はフルパスになることがあるため、終わりの部分一致等で判定するか、常に上書き
            // ここでは簡易的に endsWith でチェック
            if (!imgEl.src.endsWith(newSrc)) {
                imgEl.src = newSrc;
            }
        }

        // バフ・状態異常表示の更新（innerHTMLの範囲を最小限に）
        const buffOverlay = unitEl.querySelector('.buff-overlay');
        if (buffOverlay) buffOverlay.innerHTML = this.renderBuffOverlay(unit);

        const ailmentsContainer = unitEl.querySelector('.status-ailments');
        if (ailmentsContainer) ailmentsContainer.innerHTML = this.renderStatusAilments(unit);

        // バーと数値の更新
        const hpFill = unitEl.querySelector('.unit-hp-bar .fill');
        if (hpFill) hpFill.style.width = `${Math.max(0, (unit.currentHp / unit.stats.hp) * 100)}%`;
        const hpText = unitEl.querySelector('.unit-hp-bar .bar-text');
        if (hpText) hpText.innerText = `${Math.floor(unit.currentHp)}/${unit.stats.hp}`;

        const mpFill = unitEl.querySelector('.unit-mp-bar .fill');
        if (mpFill) {
            mpFill.style.width = `${Math.max(0, (unit.currentMp / unit.stats.mp) * 100)}%`;
            const mpText = unitEl.querySelector('.unit-mp-bar .bar-text');
            if (mpText) mpText.innerText = `${Math.floor(unit.currentMp)}/${unit.stats.mp}`;
        }

        // 死亡状態のクラス切り替え
        if (unit.currentHp <= 0) unitEl.classList.add('dead');
        else unitEl.classList.remove('dead');
    }

    // バフ/デバフオーバーレイ表示（画像左上に重ねて表示）
    renderBuffOverlay(unit) {
        let html = '';

        // バフの統合処理
        const buffStats = [...new Set(unit.buffs.map(b => b.stat))];
        const hasPA = buffStats.includes('physicalAttack');
        const hasMA = buffStats.includes('magicAttack');
        const hasPD = buffStats.includes('physicalDefense');
        const hasMD = buffStats.includes('magicDefense');
        const hasSpeed = buffStats.includes('speed');

        // クリティカル率バフの確認
        const hasCrit = unit.statusEffects.some(e => e.type === 'critBoost' && e.value > 0);

        // 攻撃統合表示
        if (hasPA && hasMA) {
            html += `<span class="buff-item">攻撃↑</span>`;
        } else if (hasPA) {
            html += `<span class="buff-item">物攻↑</span>`;
        } else if (hasMA) {
            html += `<span class="buff-item">魔攻↑</span>`;
        }

        // 防御統合表示
        if (hasPD && hasMD) {
            html += `<span class="buff-item">防御↑</span>`;
        } else if (hasPD) {
            html += `<span class="buff-item">物防↑</span>`;
        } else if (hasMD) {
            html += `<span class="buff-item">魔防↑</span>`;
        }

        // 速度とクリティカル統合表示
        if (hasSpeed && hasCrit) {
            html += `<span class="buff-item">速会↑</span>`;
        } else if (hasSpeed) {
            html += `<span class="buff-item">速度↑</span>`;
        } else if (hasCrit) {
            html += `<span class="buff-item">会心↑</span>`;
        }

        // その他のバフ（HP, MP, luck等）
        buffStats.forEach(stat => {
            if (!['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed'].includes(stat)) {
                const label = stat === 'hp' ? 'HP' : stat === 'mp' ? 'MP' : stat === 'luck' ? '運' : stat;
                html += `<span class="buff-item">${label}↑</span>`;
            }
        });

        // デバフの統合処理
        const debuffStats = [...new Set(unit.debuffs.map(d => d.stat))];
        const hasDebuffPA = debuffStats.includes('physicalAttack');
        const hasDebuffMA = debuffStats.includes('magicAttack');
        const hasDebuffPD = debuffStats.includes('physicalDefense');
        const hasDebuffMD = debuffStats.includes('magicDefense');
        const hasDebuffSpeed = debuffStats.includes('speed');

        // クリティカル率デバフの確認
        const hasDebuffCrit = unit.statusEffects.some(e => e.type === 'critBoost' && e.value < 0);

        // 攻撃統合表示
        if (hasDebuffPA && hasDebuffMA) {
            html += `<span class="debuff-item">攻撃↓</span>`;
        } else if (hasDebuffPA) {
            html += `<span class="debuff-item">物攻↓</span>`;
        } else if (hasDebuffMA) {
            html += `<span class="debuff-item">魔攻↓</span>`;
        }

        // 防御統合表示
        if (hasDebuffPD && hasDebuffMD) {
            html += `<span class="debuff-item">防御↓</span>`;
        } else if (hasDebuffPD) {
            html += `<span class="debuff-item">物防↓</span>`;
        } else if (hasDebuffMD) {
            html += `<span class="debuff-item">魔防↓</span>`;
        }

        // 速度とクリティカル統合表示
        if (hasDebuffSpeed && hasDebuffCrit) {
            html += `<span class="debuff-item">速会↓</span>`;
        } else if (hasDebuffSpeed) {
            html += `<span class="debuff-item">速度↓</span>`;
        } else if (hasDebuffCrit) {
            html += `<span class="debuff-item">会心↓</span>`;
        }

        // その他のデバフ（HP, MP, luck等）
        debuffStats.forEach(stat => {
            if (!['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed'].includes(stat)) {
                const label = stat === 'hp' ? 'HP' : stat === 'mp' ? 'MP' : stat === 'luck' ? '運' : stat;
                html += `<span class="debuff-item">${label}↓</span>`;
            }
        });

        return html;
    }

    // 状態異常表示（キャラ下部、漢字一文字）
    renderStatusAilments(unit) {
        const statusLabels = {
            poison: '毒', paralysis: '麻', silence: '沈', stun: 'ス',
            taunt: '挑', burn: '火', regen: '再', defending: '防', damageReduction: '軽', counter: '反'
        };

        return unit.statusEffects
            .filter(s => s.type !== 'gmax' && s.type !== 'critBoost') // gmax, critBoostはアイコン表示しない
            .map(s => {
                const label = statusLabels[s.type] || s.type.charAt(0);
                // 配色用のクラスを追加
                return `<span class="status-ailment ${s.type}">${label}</span>`;
            }).join('');
    }

    // ユニット画像取得（状態依存）
    getUnitImage(unit, type = 'full') {
        // キョダイマックス判定
        if (unit.statusEffects.some(e => e.type === 'gmax')) {
            // 画像パスのハードコード対応 (img/blastoise_gmax.png)
            // データ定義などから取得するのが理想だが、今回は仕様通り固定パスまたは拡張ルールで対応
            // 追加キャラファイルの定義: 表示画像（戦闘画面のみ）が「img/blastoise_gmax.png」
            return 'img/blastoise_gmax.png';
        }
        return type === 'face' ? unit.image.face : unit.image.full;
    }

    // バトルログ描画
    renderBattleLog() {
        const log = document.getElementById('battle-log');
        log.innerHTML = this.state.battle.log.map(l => `<p>${l}</p>`).join('');
        log.scrollTop = log.scrollHeight;
    }

    // コマンドフェーズ開始
    async startCommandPhase() {
        // 毎ターン開始時にMP10%回復（内部処理のみ）
        this.state.party.forEach(member => {
            if (member.currentHp > 0 && member.stats.mp > 0) {
                const mpRecover = Math.floor(member.stats.mp * 0.1);
                if (mpRecover > 0) {
                    member.currentMp = Math.min(member.stats.mp, member.currentMp + mpRecover);
                }
            }
        });

        this.updateBarsUI();

        this.state.battle.commands = [];
        // 最初の生存キャラクターを探してインデックスをセット
        const firstAlive = this.state.party.findIndex(p => p.currentHp > 0);
        this.state.battle.currentCharIndex = firstAlive !== -1 ? firstAlive : 0;
        this.state.battle.phase = 'command';
        this.updateCommandUI();
    }

    // 通常攻撃タイプを取得（素のステータスで高い方）
    getPrimaryAttackType(char) {
        const baseStats = CHARACTERS[char.id]?.stats || char.stats;
        return baseStats.physicalAttack >= baseStats.magicAttack ? 'physical' : 'magic';
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
            const actionText = cmd ? (cmd.actionName.includes('→') ? cmd.actionName.split('→')[0] : cmd.actionName) : (char.currentHp <= 0 ? '戦闘不能' : '');
            const targetText = (cmd && cmd.actionName.includes('→')) ? '→' + cmd.actionName.split('→')[1] : '';

            const actionAttr = actionText.length > 8 ? 'textLength="90" lengthAdjust="spacingAndGlyphs"' : '';
            const targetAttr = targetText.length > 8 ? 'textLength="90" lengthAdjust="spacingAndGlyphs"' : '';

            slot.innerHTML = `
                <div class="cmd-name">${char.displayName}</div>
                <div class="cmd-action">
                    <svg width="100%" height="14" viewBox="0 0 100 14" preserveAspectRatio="xMidYMid meet">
                        <text x="50%" y="11" font-size="10" text-anchor="middle" fill="currentColor" ${actionAttr}>${actionText}</text>
                    </svg>
                </div>
                <div class="cmd-target">
                    <svg width="100%" height="14" viewBox="0 0 100 14" preserveAspectRatio="xMidYMid meet">
                        <text x="50%" y="11" font-size="10" text-anchor="middle" fill="#a0a0b0" ${targetAttr}>${targetText}</text>
                    </svg>
                </div>
            `;
            charCmds.appendChild(slot);
        });

        // 攻撃ボタンのラベルを現在のキャラに合わせて更新
        const attackBtn = document.querySelector('[data-action="attack"]');
        const currentChar = this.state.party[this.state.battle.currentCharIndex];
        if (attackBtn && currentChar && currentChar.currentHp > 0) {
            const attackType = this.getPrimaryAttackType(currentChar);
            attackBtn.textContent = attackType === 'magic' ? '攻撃（魔法）' : '攻撃（物理）';
        }

        // 戻るボタンの制御
        const backBtn = document.getElementById('back-btn');
        const firstAliveIdx = this.state.party.findIndex(p => p.currentHp > 0);
        backBtn.disabled = (this.state.battle.currentCharIndex === firstAliveIdx);

        // 入力中キャラの点滅枠制御
        document.querySelectorAll('.battle-unit').forEach(el => el.classList.remove('active-unit'));
        const allSelected = commandsCount === aliveAllies.length;
        const currentUnitEl = document.querySelector(`.battle-unit[data-ally-index="${this.state.battle.currentCharIndex}"]`);
        if (currentUnitEl && !allSelected) currentUnitEl.classList.add('active-unit');

        // 実行ボタンの制御
        const execBtn = document.getElementById('execute-turn-btn');
        if (allSelected) {
            execBtn.classList.add('visible');
            execBtn.classList.remove('hidden');
        } else {
            execBtn.classList.remove('visible');
            execBtn.classList.add('hidden');
        }

        // Disable controls if all selected (User Request)
        const actionButtons = document.querySelectorAll('#action-buttons .action-btn');
        if (allSelected) {
            // Gray out specific Action buttons (Attack, Skill, etc.) but KEEP Back and Start active
            actionButtons.forEach(btn => {
                if (btn.id !== 'execute-turn-btn' && btn.id !== 'back-btn') {
                    btn.classList.add('faded-out');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('faded-out');
                    btn.disabled = false;
                }
            });
            execBtn.classList.add('btn-prominent'); // Highlight Start
        } else {
            // Re-enable all
            actionButtons.forEach(btn => {
                btn.classList.remove('faded-out');
                btn.disabled = false;
            });

            // Re-apply Back button logic (already handled by disabled prop above usually, but safer to re-run or let update run)
            backBtn.disabled = (this.state.battle.currentCharIndex === firstAliveIdx);
            execBtn.classList.remove('btn-prominent');
        }

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
        panel.scrollTop = 0; // スクロール位置リセット
        panel.innerHTML = '<h4>対象を選択</h4>';

        const skill = skillId ? this.getSkillData(skillId, this.state.party[this.state.battle.currentCharIndex]) : null;
        const targetType = skill?.target || 'single_enemy';

        const container = document.createElement('div');
        container.className = 'target-container';

        if (targetType.includes('enemy')) {
            this.state.battle.enemies.forEach((enemy, idx) => {
                if (enemy.currentHp > 0) {
                    const btn = document.createElement('button');
                    btn.className = 'target-btn';
                    btn.innerHTML = `
                        <img src="${enemy.image.full}" alt="${enemy.displayName}">
                        <span>${enemy.displayName}</span>
                    `;
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
                                actionName: (skill.displayName || skill.name) + (targetType === 'all_enemies' ? '' : '→' + enemy.displayName),
                                target: targetType === 'all_enemies' ? 'all' : idx,
                                targetType: 'enemy',
                                priority: skill.priority === 'first' ? 999 : 0
                            });
                        }
                    });
                    container.appendChild(btn);
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
                    btn.innerHTML = `
                        <img src="${ally.image.face}" alt="${ally.displayName}">
                        <span>${ally.displayName}</span>
                    `;
                    btn.addEventListener('click', () => {
                        this.setCommand({
                            type: 'skill',
                            skillId: skillId,
                            actionName: (skill.displayName || skill.name) + (targetType === 'all_allies' ? '' : '→' + ally.displayName),
                            target: targetType === 'all_allies' ? 'all' : idx,
                            targetType: 'ally',
                            priority: skill.priority === 'first' ? 999 : 0
                        });
                    });
                    container.appendChild(btn);
                }
            });
        }

        panel.appendChild(container);

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
            return;
        }

        if (targetType === 'all_enemies') {
            this.setCommand({
                type: 'skill',
                skillId: skillId,
                actionName: skill.displayName || skill.name,
                target: 'all',
                targetType: 'enemy',
                priority: skill.priority === 'first' ? 999 : 0
            });
            return;
        }

        if (targetType === 'all_allies') {
            this.setCommand({
                type: 'skill',
                skillId: skillId,
                actionName: skill.displayName || skill.name,
                target: 'all',
                targetType: 'ally',
                priority: skill.priority === 'first' ? 999 : 0
            });
            return;
        }
    }

    // スキル選択表示
    showSkillSelection() {
        this.hideSelectionPanels();
        const panel = document.getElementById('skill-selection');
        panel.classList.remove('hidden');
        panel.scrollTop = 0; // スクロール位置リセット
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
                <div class="skill-header">
                    <span class="skill-name">${skill.displayName || skillData.name}</span>
                    <span class="skill-cost">MP: ${skillData.mpCost}</span>
                </div>
                <div class="skill-body">
                    <span class="skill-desc">${skill.description || skillData.description}</span>
                </div>
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

        // 集計 (コマンドで予約済みのアイテムを差し引く)
        const counts = {};
        this.state.items.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
        });

        const queuedItems = this.state.battle.commands;
        if (queuedItems) {
            Object.values(queuedItems).forEach(cmd => {
                if (cmd && cmd.type === 'item' && cmd.itemId) {
                    if (counts[cmd.itemId] > 0) counts[cmd.itemId]--;
                }
            });
        }

        Object.entries(counts).forEach(([itemId, count]) => {
            if (count > 0) {
                const item = ITEMS[itemId];
                const btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.innerHTML = `${item.name} (${count}個) - ${item.description}`;
                btn.addEventListener('click', () => {
                    // 全体対象アイテムの場合はターゲット選択をスキップ
                    if (item.target === 'all_allies' || item.target === 'all_enemies') {
                        this.setCommand({
                            type: 'item',
                            itemId: itemId,
                            actionName: item.name,
                            target: 'all',
                            targetType: item.target === 'all_allies' ? 'ally' : 'enemy'
                        });
                    } else {
                        this.showItemTargetSelection(itemId);
                    }
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

        const container = document.createElement('div');
        container.className = 'target-container';

        if (item.target && item.target.includes('enemy')) {
            // 敵選択
            this.state.battle.enemies.forEach((enemy, idx) => {
                if (enemy.currentHp > 0) {
                    const btn = document.createElement('button');
                    btn.className = 'target-btn';
                    btn.innerHTML = `
                        <img src="${enemy.image.full}" alt="${enemy.displayName}" style="object-fit:contain;">
                        <span>${enemy.displayName}</span>
                    `;
                    btn.addEventListener('click', () => {
                        this.setCommand({
                            type: 'item',
                            itemId: itemId,
                            actionName: item.name + '→' + enemy.displayName,
                            target: idx,
                            targetType: 'enemy'
                        });
                    });
                    container.appendChild(btn);
                }
            });
        } else {
            // 味方選択 (既存ロジック)
            this.state.party.forEach((ally, idx) => {
                const isValidTarget = item.effect.type === 'revive'
                    ? ally.currentHp <= 0
                    : ally.currentHp > 0;

                if (isValidTarget) {
                    const btn = document.createElement('button');
                    btn.className = 'target-btn';
                    btn.innerHTML = `
                        <img src="${ally.image.face}" alt="${ally.displayName}">
                        <span>${ally.displayName}</span>
                    `;
                    btn.addEventListener('click', () => {
                        this.setCommand({
                            type: 'item',
                            itemId: itemId,
                            actionName: item.name + '→' + ally.displayName,
                            target: idx,
                            targetType: 'ally'
                        });
                    });
                    container.appendChild(btn);
                }
            });
        }

        panel.appendChild(container);

        // Add back button for item target selection as well if needed (though showItemSelection handles the main list back)
        // Usually item target selection replaces the item list in the same panel.
        // Let's add significant "Back" to Item List functionality or just cancel to main menu?
        // Current implementation replaced innerHTML so we lost the previous back button.
        // Let's add a "Cancel/Back" button to return to Item Selection or Main Menu.
        // existing implementation didn't have explicit back from target selection in this function (it relied on panel clearing or something?)
        // The original code:
        /*
        // アイテムターゲット選択
        showItemTargetSelection(itemId) {
            const panel = document.getElementById('item-selection');
            panel.innerHTML = '<h4>対象を選択</h4>';
            // ... buttons appended ...
        }
        */
        // It seems it didn't have a back button. I should add one that goes back to Item Selection.

        const backBtn = document.createElement('button');
        backBtn.className = 'btn-cancel';
        backBtn.textContent = '戻る';
        backBtn.onclick = () => this.showItemSelection(); // Go back to item list
        panel.appendChild(backBtn);
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
        const backBtn = document.getElementById('back-btn');
        if (backBtn) backBtn.disabled = true; // 確実に無効化

        await this.delay(1000);

        // 敵の行動を追加
        this.generateEnemyCommands();

        // 全行動を速度順にソート（防御は最優先）
        // filter(c => c) で死亡キャラ等の undefined なコマンドを除外してエラーを防ぐ
        const allCommands = this.state.battle.commands.filter(c => c);
        this.state.battle.enemies.forEach((enemy, idx) => {
            if (enemy.currentHp > 0 && enemy.command) {
                allCommands.push({
                    ...enemy.command,
                    isEnemy: true,
                    enemyIndex: idx
                });
            }
        });

        // 行動実行（動的順序評価）
        // コマンドリストをコピーして管理
        let pendingCommands = [...allCommands];

        while (pendingCommands.length > 0) {
            // 毎回速度を再評価してソート
            pendingCommands.sort((a, b) => {
                if ((a.priority || 0) !== (b.priority || 0)) {
                    return (b.priority || 0) - (a.priority || 0);
                }
                // 現在のスピードを取得
                const speedA = this.getUnitSpeed(a);
                const speedB = this.getUnitSpeed(b);
                return speedB - speedA;
            });

            // 先頭のコマンドを実行
            const cmd = pendingCommands.shift();
            await this.executeCommand(cmd);

            // キャラが完全に動作を終えて、HPバーが減るのを待つ余韻（最後のアクションは600msに短縮）
            await this.delay(pendingCommands.length > 0 ? 1200 : 600);
            this.renderBattle(); // 状態異常バッジ等の最終同期

            if (this.checkBattleEnd()) return;
        }

        // ターン終了処理
        this.endTurn();
    }

    // ユニットの現在の速度を取得
    getUnitSpeed(cmd) {
        let unit;
        if (cmd.isEnemy) {
            unit = this.state.battle.enemies[cmd.enemyIndex];
        } else {
            unit = this.state.party[cmd.charIndex];
        }
        if (!unit || unit.currentHp <= 0) return -1; // 死亡時は最後尾へ
        return this.getEffectiveStat(unit, 'speed');
    }

    // 敵の行動生成
    generateEnemyCommands() {
        this.state.battle.enemies.forEach(enemy => {
            if (enemy.currentHp <= 0) return;

            let targetIdx = this.selectTarget();
            let targetUnit = this.state.party[targetIdx];
            let action = null;

            if (enemy.templateId === 'bombhei') {
                action = { type: 'skill', skillId: enemy.uniqueSkill.id };
            } else {
                const stunned = enemy.statusEffects.find(e => e.type === 'stun');
                const silenced = enemy.statusEffects.find(e => e.type === 'silence');

                if (stunned || silenced) {
                    action = { type: 'attack' };
                } else {
                    if (enemy.skills.length > 0 && Math.random() < 0.2) {
                        const subSkillId = enemy.skills[0];
                        const subSkill = SKILLS[subSkillId];
                        if (subSkill) {
                            let canUse = true;
                            if (subSkill.type === 'buff' && subSkill.effects) {
                                const buffEffect = subSkill.effects.find(e => e.type === 'buff' || e.type === 'self_buff');
                                if (buffEffect) canUse = !enemy.buffs.some(b => b.stat === buffEffect.stat);
                            } else if (subSkill.type === 'debuff' && subSkill.effects) {
                                const debuffEffect = subSkill.effects.find(e => e.type === 'debuff');
                                if (debuffEffect) canUse = !targetUnit.debuffs.some(d => d.stat === debuffEffect.stat);
                                const statusEffect = subSkill.effects.find(e => e.type === 'status');
                                if (statusEffect) canUse = !targetUnit.statusEffects.some(s => s.type === statusEffect.status);
                            }
                            if (canUse) action = { type: 'skill', skillId: subSkillId };
                        }
                    }

                    if (!action && enemy.uniqueSkill && Math.random() < 0.7) {
                        let canUse = true;
                        if (enemy.uniqueSkill.effects) {
                            const statusEffect = enemy.uniqueSkill.effects.find(e => e.type === 'status');
                            if (statusEffect) canUse = !targetUnit.statusEffects.some(s => s.type === statusEffect.status);
                        }
                        if (canUse) action = { type: 'skill', skillId: enemy.uniqueSkill.id };
                    }

                    if (!action) action = { type: 'attack' };
                }
            }

            let finalTargetIdx = targetIdx;
            let finalTargetType = 'ally';

            if (action.type === 'skill' && action.skillId) {
                const skillData = this.getSkillData(action.skillId, enemy);
                if (skillData.type === 'buff' || skillData.type === 'heal' || skillData.type === 'mp_heal') {
                    const aliveAllies = this.state.battle.enemies.filter(e => e.currentHp > 0);
                    if (aliveAllies.length > 0) {
                        const allyTarget = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
                        finalTargetIdx = this.state.battle.enemies.indexOf(allyTarget);
                        finalTargetType = 'enemy';
                    }
                }
            }

            enemy.command = {
                ...action,
                target: finalTargetIdx,
                targetType: finalTargetType,
                speed: enemy.stats.speed
            };
        });
    }

    // ターゲット選択（配置補正考慮）
    selectTarget() {
        const weights = { left: 600, center: 300, right: 100 }; // 左60%, 中30%, 右10%
        const alive = this.state.party.filter(p => p.currentHp > 0);

        // 重み付きランダム
        let totalWeight = 0;
        const candidates = alive.map(p => {
            let weight = weights[p.position] || 100;

            // 挑発中のキャラはウェイト9倍
            if (p.statusEffects.some(e => e.type === 'taunt')) {
                weight *= 9;
            }

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
        let actor, actorName, actorEl;

        if (cmd.isEnemy) {
            actor = this.state.battle.enemies[cmd.enemyIndex];
            actorName = actor.displayName;
            actorEl = document.querySelector(`.battle-unit[data-enemy-index="${cmd.enemyIndex}"]`);
        } else {
            actor = this.state.party[cmd.charIndex];
            actorName = actor.displayName;
            actorEl = document.querySelector(`.battle-unit[data-ally-index="${cmd.charIndex}"]`);
        }

        if (actor.currentHp <= 0) return;

        // 行動開始：黄色枠点灯
        if (actorEl) actorEl.classList.add('acting');

        try {

            // スタン/麻痺チェック
            const stunnedIdx = actor.statusEffects.findIndex(e => e.type === 'stun');
            if (stunnedIdx !== -1) {
                this.addLog(`${actorName}はスタンで動けない！`);
                // スタンは「行動しようとした時」に消費
                actor.statusEffects[stunnedIdx].duration--;
                if (actor.statusEffects[stunnedIdx].duration <= 0) {
                    actor.statusEffects.splice(stunnedIdx, 1);
                }
                this.renderBattle(); // バッジ更新
                return;
            }

            const paralysis = actor.statusEffects.find(e => e.type === 'paralysis');
            if (paralysis && Math.random() < 0.3) {
                this.addLog(`${actorName}は麻痺で動けない！`);
                return;
            }

            // 沈黙チェック
            if (cmd.type === 'skill') {
                const silenced = actor.statusEffects.find(e => e.type === 'silence');
                if (silenced) {
                    this.addLog(`${actorName}は沈黙でスキルが使えない！`);
                    return;
                }
            }

            switch (cmd.type) {
                case 'attack':
                    await this.executeAttack(actor, cmd, actorName);
                    break;
                case 'skill':
                    await this.executeSkill(actor, cmd, actorName);
                    break;
                case 'defend':
                    this.addLog(`${actorName}は身を守っている！`);
                    await this.delay(100);
                    await this.showEffectIcon(actor, null, 'shield');

                    // エフェクトと同時にバッジを表示
                    actor.statusEffects.push({ type: 'defending', duration: 1 });

                    // MP10%回復
                    const mpRecover = Math.floor(actor.stats.mp * 0.1);
                    actor.currentMp = Math.min(actor.stats.mp, actor.currentMp + mpRecover);
                    if (mpRecover > 0) {
                        this.addLog(`${actorName}のMPが${mpRecover}回復した！`);
                    }

                    this.updateUnitUI(actor);

                    await this.delay(200); // 少し余韻
                    break;
                case 'item':
                    await this.executeItem(cmd, actorName);
                    break;
            }
        } finally {
            // 行動終了：黄色枠消灯
            if (actorEl) actorEl.classList.remove('acting');
        }
    }


    // 攻撃実行
    async executeAttack(actor, cmd, actorName) {
        let targets = [];
        if (cmd.isEnemy) {
            let target = this.state.party[cmd.target];
            // ターゲットが死亡していた場合、生存している別の味方を狙う
            if (target && target.currentHp <= 0) {
                const aliveList = this.state.party.filter(p => p.currentHp > 0);
                if (aliveList.length > 0) {
                    target = aliveList[Math.floor(Math.random() * aliveList.length)];
                    // ログ出しは削除
                }
            }
            targets = target && target.currentHp > 0 ? [target] : [];
        } else {
            let target = this.state.battle.enemies[cmd.target];
            if (target && target.currentHp <= 0) target = this.getAliveTarget(this.state.battle.enemies, 'left');
            targets = target ? [target] : [];
        }

        this.addLog(`${actorName}の攻撃！`);
        await this.delay(600); // 共通0.6秒に短縮

        const damageType = this.getPrimaryAttackType(actor);

        // エフェクトとダメージを並列実行
        await Promise.all(targets.map(async (target) => {
            if (target.currentHp <= 0) return;
            await this.showAttackEffect(actor, target, null, damageType);
            const damage = this.calculateDamage(actor, target, damageType, 100);
            this.applyDamage(target, damage);
            this.addLog(`${target.displayName}に${damage.value}ダメージ！${damage.critical ? '（Critical）' : ''}`);

            // 反撃チェック（属性不問・生存確認）
            await this.processCounter(target, actor);
        }));
    }

    // 生存ターゲットを取得
    getAliveTarget(group, preference = 'left') {
        const living = group.filter(u => u.currentHp > 0);
        if (living.length === 0) return null;

        if (preference === 'right') {
            // 一番右（インデックス最大）
            return living[living.length - 1];
        } else {
            // 一番左（インデックス最小）
            return living[0];
        }
    }

    // スキル実行
    async executeSkill(actor, cmd, actorName) {
        const skill = this.getSkillData(cmd.skillId, actor);
        if (!skill) return;

        // 不屈などの発動条件チェック
        if (skill.hpThreshold) {
            const thresholdHp = actor.stats.hp * (skill.hpThreshold / 100);
            if (actor.currentHp > thresholdHp) {
                this.addLog(`${actorName}はまだ余力がある！（HP${skill.hpThreshold}%以下で発動可能）`);
                return;
            }
        }

        const mpCost = skill.mpCost || 0;
        if (actor.currentMp < mpCost) {
            this.addLog(`${actorName}はMPが足りない！`);
            return;
        }

        // 敵はMP消費しない（MP無限）
        const isEnemy = this.state.battle.enemies.includes(actor);
        if (!isEnemy) {
            actor.currentMp -= mpCost;
            this.updateBarsUI(); // コスト支払いを即座にUI反映
        }

        const skillName = skill.displayName || skill.name;
        this.addLog(`${actorName}の${skillName}！`);
        await this.delay(600); // 共通0.6秒に短縮

        // ターゲット決定
        let targets = [];
        if (skill.target === 'self') {
            targets = [actor];
        } else if (skill.target === 'all_enemies') {
            targets = cmd.isEnemy ? this.state.party.filter(p => p.currentHp > 0) : this.state.battle.enemies.filter(e => e.currentHp > 0);
        } else if (skill.target === 'all_allies') {
            targets = cmd.isEnemy ? this.state.battle.enemies.filter(e => e.currentHp > 0) : this.state.party.filter(p => p.currentHp > 0);
        } else if (cmd.targetType === 'enemy') {
            let target = this.state.battle.enemies[cmd.target];
            if (target && target.currentHp <= 0) {
                target = this.getAliveTarget(this.state.battle.enemies, 'left');
            }
            targets = target ? [target] : [];
        } else {
            let target = this.state.party[cmd.target];
            // 敵が味方単体を狙うスキルで、対象が死んでいる場合のリターゲット
            if (cmd.isEnemy && target && target.currentHp <= 0) {
                const aliveList = this.state.party.filter(p => p.currentHp > 0);
                if (aliveList.length > 0) {
                    target = aliveList[Math.floor(Math.random() * aliveList.length)];
                    // ログ出しは削除
                }
            }
            // 蘇生スキルの場合は戦闘不能でも対象とする
            if (skill.target === 'single_ally_dead' || skill.type === 'revive') {
                targets = target ? [target] : [];
            } else {
                targets = target && target.currentHp > 0 ? [target] : [];
            }
        }

        // スキル効果適用
        if (skill.type === 'physical_attack' || skill.type === 'magic_attack' || skill.type === 'special') {
            const damageType = skill.type === 'physical_attack' ? 'physical' : 'magic';
            const hits = skill.hits || 1;
            let nextRetargetStrategy = 'right';
            const isSingleTarget = (cmd.targetType === 'enemy');
            const targetGroup = cmd.isEnemy ? this.state.party : this.state.battle.enemies;

            for (let i = 0; i < hits; i++) {
                await Promise.all(targets.map(async (target, tIdx) => {
                    if (isSingleTarget && target.currentHp <= 0) {
                        const newTarget = this.getAliveTarget(targetGroup, i === 0 ? 'left' : nextRetargetStrategy);
                        if (newTarget) { target = newTarget; targets[tIdx] = newTarget; }
                    }
                    if (target.currentHp <= 0) return;

                    await this.showAttackEffect(actor, target, skill, damageType);
                    const damage = this.calculateDamage(actor, target, damageType, skill.power || skill.basePower || 100, skill.critBonus);
                    this.applyDamage(target, damage);
                    this.addLog(`${target.displayName}に${damage.value}ダメージ！`);

                    // 反撃チェック（属性不問・生存確認）
                    await this.processCounter(target, actor);
                }));
                nextRetargetStrategy = (nextRetargetStrategy === 'right') ? 'left' : 'right';
                // スタープラチナは超高速連撃
                const hitDelay = skill.id === 'star_platinum' ? 50 : 200;
                await this.delay(hitDelay);
            }
        } else if (skill.type === 'debuff' || skill.type === 'buff' || skill.type === 'cure') {
            // 攻撃以外のスキル演出実行
            await Promise.all(targets.map(async (target) => {
                if (target.currentHp <= 0 && skill.type !== 'revive') return;

                if (skill.type === 'cure') {
                    const badStatuses = ['poison', 'paralysis', 'silence', 'stun', 'burn'];
                    const beforeCount = target.statusEffects.length;
                    // 'gmax' などの特殊ステータスは解除しない
                    target.statusEffects = target.statusEffects.filter(e => !badStatuses.includes(e.type));

                    if (target.statusEffects.length < beforeCount) {
                        await this.showAttackEffect(actor, target, skill, 'magic');
                        this.addLog(`${target.displayName}の悪い状態が浄化された！`);
                        this.updateUnitUI(target);
                    } else {
                        this.addLog(`しかし${target.displayName}には何も起こらなかった。`);
                    }
                } else {
                    await this.showAttackEffect(actor, target, skill, 'magic');
                }
            }));
        } else if (skill.type === 'heal') {
            await Promise.all(targets.map(async (target) => {
                // リッチ演出を呼び出すように修正
                await this.showAttackEffect(actor, target, skill, 'magic');
                const healAmount = Math.floor(target.stats.hp * (skill.healPercent / 100));
                target.currentHp = Math.min(target.stats.hp, target.currentHp + healAmount);
                this.showDamagePopup(target, healAmount, 'heal');
                this.addLog(`${target.displayName}のHPが${healAmount}回復！`);
            }));
            this.updateBarsUI();
        } else if (skill.type === 'revive') {
            await Promise.all(targets.map(async (target) => {
                if (target.currentHp <= 0) {
                    await this.showEffectIcon(target, skill, 'revive');
                    target.currentHp = Math.floor(target.stats.hp * (skill.healPercent / 100));
                    this.addLog(`${target.displayName}が復活した！`);
                    this.showDamagePopup(target, target.currentHp, 'heal');
                }
            }));
            this.updateBarsUI();
        } else if (skill.type === 'mp_heal') {
            await Promise.all(targets.map(async (target) => {
                await this.showEffectIcon(target, skill, 'heal');
                const healAmount = Math.floor(target.stats.mp * (skill.mpHealPercent / 100));
                target.currentMp = Math.min(target.stats.mp, target.currentMp + healAmount);
                this.showDamagePopup(target, healAmount, 'mp-heal');
                this.addLog(`${target.displayName}のMPが${healAmount}回復！`);
            }));
            this.updateBarsUI();
        }

        // 追加効果
        if (skill.effects) {
            await Promise.all(skill.effects.map(effect =>
                this.applyEffect(actor, targets, effect, skill)
            ));
        }
    }

    // エフェクト適用（重複時はターン延長）
    async applyEffect(actor, targets, effect, skill = null) {
        switch (effect.type) {
            case 'buff':
            case 'self_buff':
                const buffTargets = effect.type === 'self_buff' ? [actor] : targets;
                await Promise.all(buffTargets.map(async (t) => {
                    await this.showEffectIcon(t, skill, 'buff');
                    // 重複許可：常に新規追加
                    t.buffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
                }));
                this.renderBattle(); // UI同期（全対象完了後）
                break;
            case 'debuff':
            case 'self_debuff':
                const debuffTargets = effect.type === 'self_debuff' ? [actor] : targets;
                await Promise.all(debuffTargets.map(async (t) => {
                    if (t.currentHp <= 0) return; // 死亡時は無効
                    await this.showEffectIcon(t, skill, 'debuff');
                    // 重複許可：常に新規追加
                    t.debuffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
                }));
                this.renderBattle(); // UI同期（全対象完了後）
                break;
            case 'taunt':
                await this.showEffectIcon(actor, skill, 'shield');
                const existingTaunt = actor.statusEffects.find(e => e.type === 'taunt');
                if (existingTaunt) {
                    existingTaunt.duration = Math.max(existingTaunt.duration, effect.duration);
                } else {
                    actor.statusEffects.push({ type: 'taunt', duration: effect.duration });
                }
                this.renderBattle(); // UI即時同期
                break;
            case 'status':
                // 並列処理だとログ順序が乱れる可能性があるが、エフェクト同期優先
                await Promise.all(targets.map(async (t) => {
                    if (t.currentHp <= 0) return; // 死亡時は無効
                    if (!effect.chance || Math.random() * 100 < effect.chance) {
                        await this.showEffectIcon(t, skill, 'status', effect.status);
                        const existingStatus = t.statusEffects.find(e => e.type === effect.status);
                        if (existingStatus) {
                            existingStatus.duration = Math.max(existingStatus.duration, effect.duration || 3);
                        } else {
                            t.statusEffects.push({ type: effect.status, duration: effect.duration || 3 });
                            const statusLabels = { poison: '毒', paralysis: '麻痺', silence: '沈黙', stun: 'スタン', burn: '火傷' };
                            this.addLog(`${t.displayName}は${statusLabels[effect.status] || effect.status}状態になった！`);
                        }
                        // 追加: アライメント即時反映（エフェクト終了直後）
                        this.updateUnitUI(t);
                    }
                }));
                break;
            case 'regen':
                targets.forEach(t => {
                    const existingRegen = t.statusEffects.find(e => e.type === 'regen');
                    if (existingRegen) {
                        existingRegen.duration = Math.max(existingRegen.duration, effect.duration);
                        if (effect.value > existingRegen.value) existingRegen.value = effect.value;
                    } else {
                        t.statusEffects.push({ type: 'regen', value: effect.value, duration: effect.duration });
                    }
                });
                break;
            case 'damageReduction':
                targets.forEach(t => {
                    t.statusEffects.push({ type: 'damageReduction', value: effect.value, duration: effect.duration });
                });
                break;
            case 'counter':
                const counterTargets = effect.target === 'self' || effect.type === 'self_buff' ? [actor] : targets;
                await Promise.all(counterTargets.map(async (t) => {
                    await this.showEffectIcon(t, skill, 'shield');
                    t.statusEffects.push({ type: 'counter', power: effect.power, duration: effect.duration });
                }));
                this.renderBattle(); // UI同期
                break;
            case 'mp_drain': // メトロイドの技：敵への吸収ではなく一律20減少
                for (const t of targets) {
                    const drainAmount = 20;
                    t.currentMp = Math.max(0, t.currentMp - drainAmount);
                    this.showDamagePopup(t, drainAmount, 'mp-heal');
                    this.addLog(`${t.displayName}のMPが${drainAmount}減少した！`);
                }
                break;
            case 'self_ko': // ボム兵等の自壊
                actor.currentHp = 0;
                this.addLog(`${actor.displayName}は力尽きた！`);
                break;
            case 'countdown': // カウントダウン付与
                actor.statusEffects.push({ type: 'countdown', duration: effect.turns, action: effect.action });
                break;
            case 'critBoost': // クリティカル率バフ
                for (const t of targets) {
                    t.statusEffects.push({ type: 'critBoost', value: effect.value, duration: effect.duration });
                }
                break;
        }
    }


    //- アイテム使用
    async executeItem(cmd, actorName) {
        const item = ITEMS[cmd.itemId];

        // アイテム消費 (Arrayから削除)
        const itemIdx = this.state.items.indexOf(cmd.itemId);
        if (itemIdx > -1) {
            this.state.items.splice(itemIdx, 1);
        } else {
            // 万が一無い場合
            this.addLog(`${actorName}は${item.name}を使おうとしたが、持っていなかった！`);
            return;
        }

        this.addLog(`${actorName}は${item.name}を使った！`);
        await this.delay(500);

        // ターゲット決定
        let targets = [];
        if (item.target === 'all_allies') {
            targets = this.state.party.filter(p => p.currentHp > 0);
        } else if (item.target === 'all_enemies') {
            targets = this.state.battle.enemies.filter(e => e.currentHp > 0);
        } else {
            if (cmd.targetType === 'enemy') {
                const t = this.state.battle.enemies[cmd.target];
                if (t && t.currentHp > 0) targets = [t];
            } else {
                const t = this.state.party[cmd.target];
                // 蘇生の場合は死んでてもOK
                if (item.effect.type === 'revive' || (t && t.currentHp > 0)) {
                    targets = [t];
                }
            }
        }

        // 効果適用
        for (const target of targets) {
            // エフェクト（波紋）
            await this.showEffectIcon(target, null, 'shield');

            switch (item.effect.type) {
                case 'heal':
                    const healAmount = Math.floor(target.stats.hp * (item.effect.percent / 100));
                    target.currentHp = Math.min(target.stats.hp, target.currentHp + healAmount);
                    this.addLog(`${target.displayName}のHPが${healAmount}回復！`);
                    this.showDamagePopup(target, healAmount, 'heal');
                    break;
                case 'mp_heal':
                    const mpAmount = Math.floor(target.stats.mp * (item.effect.percent / 100));
                    target.currentMp = Math.min(target.stats.mp, target.currentMp + mpAmount);
                    this.addLog(`${target.displayName}のMPが${mpAmount}回復！`);
                    this.showDamagePopup(target, mpAmount, 'mp-heal');
                    break;
                case 'revive':
                    target.currentHp = Math.floor(target.stats.hp * (item.effect.percent / 100));
                    target.buffs = [];
                    target.debuffs = [];
                    target.statusEffects = [];
                    this.addLog(`${target.displayName}が復活した！`);
                    this.showDamagePopup(target, '復活', 'heal');
                    break;
                case 'debuff':
                    if (item.effect.effects) {
                        item.effect.effects.forEach(eff => {
                            const existing = null; // デバフも重複許可につき既存チェック無効化
                            target.debuffs.push({ stat: eff.stat, value: eff.value, duration: eff.duration });
                        });
                        this.addLog(`${target.displayName}の能力が低下した！`);
                    }
                    break;
                case 'buff':
                    if (item.effect.effects) {
                        item.effect.effects.forEach(eff => {
                            if (eff.stat === 'critBoost') {
                                target.statusEffects.push({ type: 'critBoost', value: eff.value, duration: eff.duration });
                            } else {
                                // 重複許可：常に新規追加
                                target.buffs.push({ stat: eff.stat, value: eff.value, duration: eff.duration });
                            }
                        });
                        this.addLog(`${target.displayName}のステータスが強化された！`);
                    }
                    break;
                case 'status_cure':
                    // 全ての状態異常を解除
                    if (target.statusEffects.length > 0) {
                        target.statusEffects = []; // 空にする（バフデバフは別配列なので維持される）
                        // 厳密には buff/debuff ではなく statusEffects (毒、麻痺、スタン等) のみ
                        this.addLog(`${target.displayName}の状態異常が全て回復した！`);
                        this.showDamagePopup(target, '全快', 'heal');
                    } else {
                        this.addLog(`${target.displayName}は健康そのものだ！`);
                    }
                    break;
            }
            // UI更新
            this.updateUnitUI(target);
        }
        await this.delay(300);
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

        // 基本ダメージ（除算方式：ダメージ0を回避し、防御の価値を安定させる）
        let baseDamage = attack * (power / 100);

        if (power === 0) {
            return { value: 0, critical: false };
        }

        // 防御力100につき被ダメージを約50%軽減する計算式
        let damage = baseDamage / (1 + (defense / 100));

        // 乱数
        damage *= 0.9 + Math.random() * 0.2;

        // クリティカル判定
        const luck = this.getEffectiveStat(attacker, 'luck');
        let critRate = 5 + (luck / 3) + critBonus;
        // critBoost状態異常を反映
        const critStatus = attacker.statusEffects.find(e => e.type === 'critBoost');
        if (critStatus) critRate += critStatus.value;

        const isCritical = Math.random() * 100 < critRate;
        if (isCritical) {
            damage *= 1.5;
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

        // 火傷の実効ステータス低下（物理防御・魔法防御）
        if (statName === 'physicalDefense' || statName === 'magicDefense') {
            if (unit.statusEffects.some(e => e.type === 'burn')) {
                value *= 0.85; // 15%低下
            }
        }

        // 麻痺：素早さ半減
        if (statName === 'speed') {
            if (unit.statusEffects.some(e => e.type === 'paralysis')) {
                value *= 0.5;
            }
        }

        return Math.floor(value);
    }

    // ダメージ適用
    applyDamage(target, damage) {
        target.currentHp = Math.max(0, target.currentHp - damage.value);

        // 被弾時の2連白フラッシュを適用
        const selector = this.getUnitSelector(target);
        const unitEl = document.querySelector(selector);
        if (unitEl) {
            unitEl.classList.add('flash-flicker-white');
            setTimeout(() => unitEl.classList.remove('flash-flicker-white'), 300);
        }

        if (target.currentHp <= 0) {
            target.buffs = [];
            target.debuffs = [];
            target.statusEffects = [];
        }

        this.showDamagePopup(target, damage.value, damage.critical ? 'critical' : 'damage');

        // バーの幅のみを更新（これによりCSSのtransition: 1sが効き、ぬるぬる動く）
        this.updateBarsUI();

        // 死亡時の処理：即座にrenderせず、クラス付与のみで演出を完結させる
        if (target.currentHp <= 0) {
            if (unitEl) {
                unitEl.classList.add('dead');
                // バフ・状態異常表示を即座にクリア
                const overlays = unitEl.querySelectorAll('.buff-overlay, .status-ailments');
                overlays.forEach(o => o.innerHTML = '');
            }
        }
    }

    updateBarsUI() {
        // 味方と敵、すべてのバーの幅を最新状態に同期（ transition: 1s が効く）
        const allUnits = [...this.state.party, ...this.state.battle.enemies];
        allUnits.forEach((unit, idx) => {
            const isEnemy = this.state.battle.enemies.includes(unit);
            const selector = isEnemy ? `[data-enemy-index="${this.state.battle.enemies.indexOf(unit)}"]` : `[data-ally-index="${this.state.party.indexOf(unit)}"]`;
            const unitEl = document.querySelector(selector);
            if (unitEl) {
                // HP更新
                const hpFill = unitEl.querySelector('.unit-hp-bar .fill');
                if (hpFill) hpFill.style.width = `${(unit.currentHp / unit.stats.hp) * 100}%`;
                const hpText = unitEl.querySelector('.unit-hp-bar .bar-text');
                if (hpText) hpText.innerText = `${Math.floor(unit.currentHp)}/${unit.stats.hp}`;

                // MP更新（味方ユニットのみ要素が存在するため、存在チェックを入れて適用）
                const mpFill = unitEl.querySelector('.unit-mp-bar .fill');
                if (mpFill) mpFill.style.width = `${(unit.currentMp / unit.stats.mp) * 100}%`;
                const mpText = unitEl.querySelector('.unit-mp-bar .bar-text');
                if (mpText) mpText.innerText = `${Math.floor(unit.currentMp)}/${unit.stats.mp}`;
            }
        });
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

            // 火傷ダメージ
            const burn = unit.statusEffects.find(e => e.type === 'burn');
            if (burn) {
                const damage = Math.floor(unit.stats.hp * 0.04);
                unit.currentHp = Math.max(1, unit.currentHp - damage);
                this.addLog(`${unit.displayName}は火傷で${damage}ダメージ！`);
            }

            // リジェネ
            const regen = unit.statusEffects.find(e => e.type === 'regen');
            if (regen) {
                const heal = Math.floor(unit.stats.hp * regen.value);
                unit.currentHp = Math.min(unit.stats.hp, unit.currentHp + heal);
                this.addLog(`${unit.displayName}はHP${heal}回復！`);
            }

            // カウントダウン処理
            const countdownIdx = unit.statusEffects.findIndex(e => e.type === 'countdown');
            if (countdownIdx !== -1) {
                const e = unit.statusEffects[countdownIdx];
                if (--e.duration <= 0) {
                    if (e.action === 'explode') {
                        this.addLog(`${unit.displayName}が大爆発！`);
                        const bTargets = this.state.battle.enemies.includes(unit) ? this.state.party : this.state.battle.enemies;
                        bTargets.forEach(t => {
                            if (t.currentHp > 0) {
                                // 威力280%相当のダメージ（計算にはattackerが必要なため生存ユニットとして計算）
                                const damage = this.calculateDamage(unit, t, 'magic', 280);
                                this.applyDamage(t, damage);
                            }
                        });
                        unit.currentHp = 0;
                    }
                    unit.statusEffects.splice(countdownIdx, 1);
                }
            }

            // 効果時間減少（スタン以外） ※スタンは行動試行時に減らすためここでは減らさない
            unit.buffs = unit.buffs.filter(b => --b.duration > 0);
            unit.debuffs = unit.debuffs.filter(d => --d.duration > 0);
            unit.statusEffects = unit.statusEffects.filter(e => {
                if (e.type === 'stun') return true; // スタンは維持
                return --e.duration > 0;
            });
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
        // this.addLog('戦闘に勝利した！'); // 削除：SP獲得ログと重複するため

        // 状態異常・バフリセット
        this.state.party.forEach(p => {
            p.buffs = [];
            p.debuffs = [];
            p.statusEffects = [];
        });

        // SP・お金獲得（敵ごとに計算）
        let spGain = 0;
        let goldGain = 0;
        // Actによるインフレはさせない（ユーザー指定）

        this.state.battle.enemies.forEach(enemy => {
            const rank = enemy.rank || 'normal';
            switch (rank) {
                case 'normal':
                    spGain += 3; // 1体あたり3SP
                    goldGain += 40 + Math.floor(Math.random() * 21); // 40-60円
                    break;
                case 'elite':
                    spGain += 10; // 1体あたり10SP
                    goldGain += 180 + Math.floor(Math.random() * 41); // 180-220円
                    break;
                case 'boss':
                case 'last_boss':
                    spGain += 30;
                    goldGain += 450 + Math.floor(Math.random() * 101); // 450-550円
                    break;
                default:
                    spGain += 1;
                    goldGain += 40;
            }
        });

        // 最低保証（念のため）
        if (spGain === 0) spGain = 1;
        if (goldGain === 0) goldGain = 50;
        if (spGain > 0) {
            this.state.spPool += spGain;
            this.state.gold += goldGain;
            this.addLog(`戦闘に勝利！ ${spGain} SP, ￥${goldGain} 獲得`);
        }

        // ラスボス撃破の場合は報酬フェーズをスキップして直接勝利モーダル表示
        const isLastBoss = this.state.battle.enemies.some(e => e.rank === 'last_boss');

        setTimeout(() => {
            if (isLastBoss) {
                this.showVictoryModal();
            } else {
                this.startRewardPhase();
            }
        }, 1000);
    }

    // 報酬フェーズ開始
    startRewardPhase() {
        this.state.battle.phase = 'reward';
        this.state.battle.rewardCharIndex = 0;
        this.showRewardForCharacter(0);
    }

    // キャラ別報酬表示（4択化）
    showRewardForCharacter(charIdx) {
        const char = this.state.party[charIdx];
        if (!char || char.currentHp <= 0) {
            if (charIdx + 1 < this.state.party.length) {
                this.showRewardForCharacter(charIdx + 1);
            } else {
                this.finishNode();
            }
            return;
        }

        this.showScreen('reward');
        const partyStatusContainer = document.getElementById('reward-party-status');
        this.renderPartyIcons(partyStatusContainer);

        document.getElementById('reward-character-name').textContent = `${char.displayName}の獲得フェイズ`;

        const spDisplay = document.getElementById('reward-sp-info');
        spDisplay.textContent = `共有SP: ${this.state.spPool}`;
        spDisplay.style.display = 'block'; // Ensure visible

        const options = document.getElementById('reward-options');
        options.innerHTML = '';


        const choices = [
            { id: 'skill', text: 'スキル習得', desc: '新しいスキルを覚える' },
            { id: 'sp', text: 'SPボーナス', desc: '共有SPを+1獲得' },
            { id: 'item', text: 'アイテム獲得', desc: 'ランダムなアイテムを1つ獲得' },
            { id: 'skip', text: 'スキップ', desc: '何も受け取らずに進む' }
        ];

        choices.forEach(choice => {
            const option = document.createElement('div');
            option.className = 'reward-option';
            option.innerHTML = `<div class="reward-title">${choice.text}</div><div class="reward-desc">${choice.desc}</div>`;
            option.addEventListener('click', () => this.handleRewardChoice(charIdx, choice.id));
            options.appendChild(option);
        });
    }

    handleRewardChoice(charIdx, choiceId) {
        switch (choiceId) {
            case 'skill':
                this.showDetailReward(charIdx, 'skill');
                break;
            case 'sp':
                this.state.spPool += 1;
                // this.showToast(`SP +1 獲得！（累計: ${this.state.spPool}）`, 'success'); // アイテムのみトースト表示するためコメントアウト
                this.nextReward(charIdx);
                break;
            case 'item':
                this.grantRandomItem(charIdx);
                break;
            case 'skip':
                this.nextReward(charIdx);
                break;
        }
    }

    grantRandomItem(charIdx) {
        // 戦闘後報酬では蘇生薬を出さない
        const pool = ITEM_POOL.filter(id => id !== 'revive_potion');
        const randomItemId = pool[Math.floor(Math.random() * pool.length)];
        const item = ITEMS[randomItemId];

        if (this.state.items.length < 3) {
            this.state.items.push(randomItemId);
            this.showToast(`${item.name}を獲得！`, 'success');
            this.nextReward(charIdx);
        } else {
            this.showItemSwapScreen(charIdx, randomItemId);
        }
    }

    showItemSwapScreen(charIdx, newItemId) {
        const newItem = ITEMS[newItemId];
        const options = document.getElementById('reward-options');
        document.getElementById('reward-character-name').textContent = 'アイテム入れ替え';
        options.innerHTML = '';

        const info = document.createElement('div');
        info.className = 'item-swap-card new-item';
        info.innerHTML = `<strong>新規獲得：${newItem.name}</strong><div style="font-size:11px;color:var(--text-sub);">${newItem.description}</div>`;
        options.appendChild(info);

        const label = document.createElement('div');
        label.style.cssText = 'margin:16px 0 8px;font-size:12px;color:var(--text-sub);';
        label.textContent = '捨てるアイテムを選択（またはキャンセル）：';
        options.appendChild(label);

        const grid = document.createElement('div');
        grid.className = 'item-swap-grid';

        this.state.items.forEach((existingItemId, idx) => {
            const existingItem = ITEMS[existingItemId];
            const card = document.createElement('div');
            card.className = 'item-swap-card';
            card.innerHTML = `<strong>${existingItem.name}</strong><div style="font-size:11px;color:var(--text-sub);">${existingItem.description}</div>`;
            card.onclick = () => {
                this.state.items.splice(idx, 1);
                this.state.items.push(newItemId);
                this.showToast(`${existingItem.name}を捨てて${newItem.name}を獲得`, 'success');
                this.nextReward(charIdx);
            };
            grid.appendChild(card);
        });
        options.appendChild(grid);

        const cancelBtn = document.createElement('div');
        cancelBtn.className = 'reward-option';
        cancelBtn.style.cssText = 'margin-top:16px;border-color:#666;';
        cancelBtn.innerHTML = `<div class="reward-title" style="color:#aaa;">獲得をキャンセル</div><div class="reward-desc">新アイテムを捨てる</div>`;
        cancelBtn.onclick = () => {
            this.showToast(`${newItem.name}を見送った`, 'info');
            this.nextReward(charIdx);
        };
        options.appendChild(cancelBtn);
    }

    // 詳細報酬表示（スキル習得のみ）
    showDetailReward(charIdx, type) {
        const char = this.state.party[charIdx];
        const options = document.getElementById('reward-options');
        options.innerHTML = '';

        // SP表示は維持（レイアウト固定のため）
        const spDisplay = document.getElementById('reward-sp-info');
        spDisplay.textContent = `共有SP: ${this.state.spPool}`; // 最新値を反映
        spDisplay.style.display = 'block';

        if (type === 'skill') {
            const candidateSkills = [];
            const myPoolIds = SKILL_POOLS[char.type] || [];

            // 全プールから習得可能な全スキルをリストアップ
            let allAvailableSkills = [];
            Object.keys(SKILL_POOLS).forEach(role => {
                SKILL_POOLS[role].forEach(skillId => {
                    const isDuplicate = allAvailableSkills.some(s => s.id === skillId);
                    const alreadyHas = char.skills.some(cs => cs.id === skillId) || (char.uniqueSkill && char.uniqueSkill.id === skillId);
                    const isExcluded = char.excludeSkills && char.excludeSkills.includes(skillId);

                    if (!isDuplicate && !alreadyHas && !isExcluded) {
                        allAvailableSkills.push({
                            id: skillId,
                            isMyRole: myPoolIds.includes(skillId)
                        });
                    }
                });
            });

            // 最大3つ選出するまで繰り返す
            for (let i = 0; i < 3; i++) {
                if (allAvailableSkills.length === 0) break;

                const myRoleOptions = allAvailableSkills.filter(s => s.isMyRole);
                const otherOptions = allAvailableSkills.filter(s => !s.isMyRole);

                // healスキル（単体回復）を自ロール候補に追加（ヒーラー以外で、まだ習得していない場合）
                const healSkill = allAvailableSkills.find(s => s.id === 'heal' && !s.isMyRole);
                if (healSkill) {
                    myRoleOptions.push(healSkill);
                }

                let selectedIdx = -1;
                // 70%の確率で自ロールのスキルを優先的に抽選（自ロールの在庫がある場合のみ）
                if (myRoleOptions.length > 0 && (Math.random() < 0.7 || otherOptions.length === 0)) {
                    const targetSkill = myRoleOptions[Math.floor(Math.random() * myRoleOptions.length)];
                    selectedIdx = allAvailableSkills.findIndex(s => s.id === targetSkill.id);
                } else if (otherOptions.length > 0) {
                    const targetSkill = otherOptions[Math.floor(Math.random() * otherOptions.length)];
                    selectedIdx = allAvailableSkills.findIndex(s => s.id === targetSkill.id);
                }

                if (selectedIdx !== -1) {
                    const skill = allAvailableSkills.splice(selectedIdx, 1)[0];
                    candidateSkills.push(SKILLS[skill.id]);
                }
            }

            if (candidateSkills.length === 0) {
                const option = document.createElement('div');
                option.className = 'reward-option';
                option.innerHTML = `<div class="reward-title">習得可能なスキルがありません</div>`;
                option.addEventListener('click', () => this.nextReward(charIdx));
                options.appendChild(option);
            } else {
                candidateSkills.forEach(skill => {
                    const option = document.createElement('div');
                    option.className = 'reward-option';
                    option.innerHTML = `
                        <div class="skill-item" style="background:transparent; border:none; padding:0; margin:0; box-shadow:none;">
                            <div class="skill-item-header" style="margin-bottom:4px;">
                                <span class="skill-item-name" style="font-size:16px; color:var(--primary);">${skill.name}</span>
                                <span class="skill-item-cost" style="font-size:14px;">MP: ${skill.mpCost || 0}</span>
                            </div>
                            <div class="skill-item-desc" style="font-size:12px;">${skill.description}</div>
                        </div>
                    `;
                    option.addEventListener('click', () => {
                        if (char.skills.length < 3) {
                            char.skills.push({ id: skill.id, displayName: skill.name });
                            this.nextReward(charIdx);
                        } else {
                            this.showSkillSwap(charIdx, skill);
                        }
                    });
                    options.appendChild(option);
                });
            }

        } else {
            // Skip
            this.nextReward(charIdx);
        }
    }

    // スキル入れ替え画面
    showSkillSwap(charIdx, newSkill) {
        const char = this.state.party[charIdx];
        const options = document.getElementById('reward-options');
        document.getElementById('reward-character-name').textContent = `${char.displayName}：入れ替えるスキルを選択`;
        options.innerHTML = '';

        // 新しいスキルの情報を表示
        const info = document.createElement('div');
        info.style.padding = '10px';
        info.style.marginBottom = '10px';
        info.style.background = 'rgba(79, 172, 254, 0.1)';
        info.style.borderRadius = '8px';
        info.style.border = '1px solid var(--primary)';
        info.innerHTML = `
            <div style="color:var(--primary);font-weight:bold;font-size:12px;">新規習得候補：</div>
            <div style="font-weight:bold;">${newSkill.name}</div>
            <div style="font-size:11px;color:var(--text-sub);">${newSkill.description}</div>
        `;
        options.appendChild(info);

        // 既存の3つのスキルを表示
        char.skills.forEach((oldSkill, idx) => {
            const skillData = SKILLS[oldSkill.id] || {};
            const option = document.createElement('div');
            option.className = 'reward-option';
            option.innerHTML = `
                <div class="reward-title">【入れ替え】${oldSkill.displayName || skillData.name}</div>
                <div class="reward-desc">${skillData.description || ''}</div>
            `;
            option.addEventListener('click', () => {
                this.showModal('確認', `${oldSkill.displayName || skillData.name} を忘れて ${newSkill.name} を覚えますか？`, [
                    {
                        text: '入れ替える',
                        onClick: () => {
                            this.closeModal();
                            char.skills[idx] = { id: newSkill.id, displayName: newSkill.name };
                            this.nextReward(charIdx);
                        },
                        className: 'btn-danger'
                    },
                    { text: 'キャンセル', onClick: () => this.closeModal(), className: 'btn-primary' }
                ]);
            });
            options.appendChild(option);
        });

        // 習得を諦めるボタン
        const skipOption = document.createElement('div');
        skipOption.className = 'reward-option';
        skipOption.style.marginTop = '20px';
        skipOption.style.borderColor = '#666';
        skipOption.innerHTML = `
            <div class="reward-title" style="color:#aaa;">習得を諦める</div>
            <div class="reward-desc">現在のスキルを維持します</div>
        `;
        skipOption.addEventListener('click', () => this.nextReward(charIdx));
        options.appendChild(skipOption);
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
        const node = this.state.currentNode;
        if (!node) return;

        node.completed = true;
        node.status = 'completed';

        // 次のノードを利用可能に
        const nextLayerIdx = node.layer + 1;
        if (this.state.nodeMap[nextLayerIdx]) {
            let unlockedCount = 0;
            this.state.nodeMap[nextLayerIdx].forEach((nextNode, idx) => {
                if (node.nextNodes.includes(idx)) {
                    nextNode.status = 'available';
                    unlockedCount++;
                }
            });
            // フェイルセーフ：もし接続が見つからなければ（仕様変更など）、その階層の全ノードを解放するか、一番近いものを解放
            if (unlockedCount === 0) {
                this.state.nodeMap[nextLayerIdx].forEach(n => n.status = 'available');
            }
        }

        this.state.currentLayer = nextLayerIdx;

        // 過去のノードを整理（未選択のノードをLocked/Skipped扱いに）
        // 現在のレイヤー（選択したノードがあるレイヤー）の他のノードを無効化
        const currentLayerNodes = this.state.nodeMap[node.layer];
        currentLayerNodes.forEach(n => {
            if (n.id !== node.id) {
                n.status = 'locked'; // または 'skipped'
                // UI上で暗くするためにlockedクラスなどを当てる
            }
        });

        // ラスボス撃破チェック
        if (this.state.battle?.rank === 'last_boss') {
            this.clearSaveData(); // Clear save on victory
            this.showScreen('clear');
            return;
        }

        // 中ボス撃破で第2幕へ
        if (this.state.battle?.rank === 'boss' && this.state.currentAct === 1) {
            this.state.currentAct = 2;
            this.state.party.forEach(m => {
                m.currentHp = m.stats.hp;
                m.currentMp = m.stats.mp;
            });
            this.showToast('第2幕へ突入！全回復しました！', 'success');
            this.state.currentNode = null;
            this.generateMap();
            // generateMapでcurrentLayer=0になるのでOK
        }

        this.saveGame(); // Auto-save on layer progression
        this.showMapScreen();
    }

    // 休憩処理（難易度対応）
    handleRest(type) {
        // 難易度設定を取得
        const difficulty = this.state.difficulty || 0;
        const diffConfig = DIFFICULTY_CONFIG[difficulty];
        const healMultiplier = diffConfig ? (diffConfig.restHealPercent / 100) : 1.0;

        this.state.party.forEach(member => {
            if (member.currentHp <= 0) return;

            switch (type) {
                case 'hp':
                    member.currentHp = Math.min(member.stats.hp, member.currentHp + Math.floor(member.stats.hp * 0.4 * healMultiplier));
                    break;
                case 'mp':
                    member.currentMp = Math.min(member.stats.mp, member.currentMp + Math.floor(member.stats.mp * 0.4 * healMultiplier));
                    break;
                case 'both':
                    member.currentHp = Math.min(member.stats.hp, member.currentHp + Math.floor(member.stats.hp * 0.2 * healMultiplier));
                    member.currentMp = Math.min(member.stats.mp, member.currentMp + Math.floor(member.stats.mp * 0.2 * healMultiplier));
                    break;
            }
        });

        this.finishNode();
    }

    // 運判定の成功率計算
    calculateLuckSuccessRate(risk = 'medium') {
        const avgLuck = this.state.party.reduce((s, m) => s + m.stats.luck, 0) / Math.max(1, this.state.party.length);

        let base = 30;
        let factor = 0.5; // avgLuck / 2

        switch (risk) {
            case 'low':
                base = 50;
                factor = 0.25; // avgLuck / 4
                break;
            case 'high':
                base = 10;
                factor = 0.7; // avgLuck * 0.7
                break;
            default: // medium
                base = 30;
                factor = 0.5;
                break;
        }

        return Math.min(100, Math.max(0, Math.floor(base + avgLuck * 100 * factor / 100))); // 整数丸め
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

            // 確率表示ロジック
            let label = opt.text;
            if (opt.effect.type === 'luck_check') {
                const chance = this.calculateLuckSuccessRate(opt.effect.risk);
                label += `<br><span class="success-rate">（成功率: ${chance}%）</span>`;
            } else if (opt.effect.type === 'random') {
                // randomの場合、最初のoutcomeを「成功」とみなすか、weightsから計算
                // ここでは単純にweight比率を表示
                const outcomes = opt.effect.outcomes;
                const totalWeight = outcomes.reduce((s, o) => s + o.weight, 0);
                // item または heal_all を当たりとする
                const successOutcome = outcomes.find(o => o.type === 'item' || o.type === 'heal_all');
                if (successOutcome) {
                    const chance = Math.floor((successOutcome.weight / totalWeight) * 100);
                    label += `<br><span class="success-rate">（成功率: ${chance}%）</span>`;
                }
            }

            btn.innerHTML = label;
            btn.addEventListener('click', () => this.handleEventOption(opt));
            options.appendChild(btn);
        });
    }

    // イベント選択処理
    handleEventOption(option) {
        const effect = option.effect;
        let message = '';
        const targets = this.state.party;

        // コスト支払いチェック（もしあれば）
        if (effect.cost && typeof effect.cost === 'number') { // Gold cost
            if (this.state.gold < effect.cost) {
                this.showToast('お金が足りない！', 'error');
                return;
            }
            this.state.gold -= effect.cost;
        }

        switch (effect.type) {
            case 'none':
                message = effect.message || '何も起こらなかった...';
                break;
            case 'heal_all': // HP回復
                targets.forEach(m => {
                    if (m.currentHp > 0) {
                        m.currentHp = Math.min(m.stats.hp, m.currentHp + m.stats.hp * (effect.percent / 100));
                    }
                });
                message = effect.message || `全員のHPが${effect.percent}%回復した！`;
                break;
            case 'heal_mp_all': // MP回復
                targets.forEach(m => {
                    if (m.currentHp > 0) {
                        m.currentMp = Math.min(m.stats.mp, m.currentMp + m.stats.mp * (effect.percent / 100));
                    }
                });
                message = effect.message || `全員のMPが${effect.percent}%回復した！`;
                break;
            case 'damage': // HPダメージ
                targets.forEach(m => {
                    if (m.currentHp > 0) {
                        const dmg = Math.floor(m.stats.hp * (effect.percent / 100));
                        m.currentHp = Math.max(1, m.currentHp - dmg);
                    }
                });
                message = effect.message || `全員がHPに${effect.percent}%のダメージを受けた...`;
                break;
            case 'mp_damage_all': // MPダメージ
                targets.forEach(m => {
                    if (m.currentHp > 0) {
                        const dmg = Math.floor(m.stats.mp * (effect.percent / 100));
                        m.currentMp = Math.max(0, m.currentMp - dmg);
                    }
                });
                message = effect.message || `全員がMPに${effect.percent}%のダメージを受けた...`;
                break;
            case 'item':
                const itemId = effect.item === 'random' ? ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)] : effect.item;
                if (this.state.items.length < 3) {
                    this.state.items.push(itemId);
                    message = effect.message || `${ITEMS[itemId].name}を入手した！`;
                } else {
                    message = '持ち物がいっぱいでアイテムを諦めた...';
                }
                break;
            case 'gain_sp':
                // コストとしてHP/MP消費がある場合
                if (effect.cost) {
                    if (effect.cost.type === 'hp') {
                        targets.forEach(m => { if (m.currentHp > 0) m.currentHp = Math.max(1, m.currentHp - m.stats.hp * (effect.cost.percent / 100)); });
                    } else if (effect.cost.type === 'mp') {
                        targets.forEach(m => { if (m.currentHp > 0) m.currentMp = Math.max(0, m.currentMp - m.stats.mp * (effect.cost.percent / 100)); });
                    }
                }
                this.state.spPool += effect.value;
                message = effect.message || `SPを${effect.value}獲得した！`;
                break;
            case 'stat_boost_all': // 全員ステータスUP
                // コスト処理
                if (effect.cost) {
                    if (effect.cost.type === 'hp') {
                        targets.forEach(m => { if (m.currentHp > 0) m.currentHp = Math.max(1, m.currentHp - m.stats.hp * (effect.cost.percent / 100)); });
                    }
                }
                targets.forEach(m => {
                    const stats = effect.stat === 'all' ? ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense'] : [effect.stat];
                    stats.forEach(s => {
                        m.stats[s] = Math.floor(m.stats[s] * (1 + effect.value));
                    });
                });
                message = effect.message || `全員のステータスが強化された！`;
                break;
            case 'stat_trade': // ステータス交換（MaxHP減 -> 攻撃増など）
                targets.forEach(m => {
                    // コスト（MaxHP減少など）
                    if (effect.costStat === 'max_hp') {
                        m.stats.hp = Math.floor(m.stats.hp * (1 - effect.costValue));
                        m.currentHp = Math.min(m.currentHp, m.stats.hp);
                    }
                    // 報酬
                    if (effect.targetStat === 'attack') {
                        m.stats.physicalAttack = Math.floor(m.stats.physicalAttack * (1 + effect.targetValue));
                        m.stats.magicAttack = Math.floor(m.stats.magicAttack * (1 + effect.targetValue));
                    } else if (effect.targetStat === 'defense') {
                        m.stats.physicalDefense = Math.floor(m.stats.physicalDefense * (1 + effect.targetValue));
                        m.stats.magicDefense = Math.floor(m.stats.magicDefense * (1 + effect.targetValue));
                    } else {
                        m.stats[effect.targetStat] = Math.floor(m.stats[effect.targetStat] * (1 + effect.targetValue));
                    }
                });
                message = `代償を払い、全員の力が変化した...`;
                break;
            case 'status_all': // 全員状態異常
                targets.forEach(t => {
                    t.statusEffects.push({ type: effect.status, duration: effect.duration });
                });
                message = effect.message || `全員が${effect.status}状態になってしまった...`;
                break;
            case 'luck_check':
                const successRate = this.calculateLuckSuccessRate(effect.risk);
                const roll = Math.random() * 100;
                if (roll < successRate) {
                    this.handleEventOption({ effect: effect.success });
                    return;
                } else {
                    this.handleEventOption({ effect: effect.fail });
                    return;
                }
            case 'random':
                const totalWeight = effect.outcomes.reduce((s, o) => s + o.weight, 0);
                let rnd = Math.random() * totalWeight;
                for (const outcome of effect.outcomes) {
                    rnd -= outcome.weight;
                    if (rnd <= 0) {
                        this.handleEventOption({ effect: outcome });
                        return;
                    }
                }
                break;
            case 'sacrifice_hp': // 旧仕様互換（Event 2対応）
                targets.forEach(m => {
                    if (m.currentHp > 0) m.currentHp = Math.max(1, m.currentHp - m.stats.hp * (effect.percent / 100));
                });
                if (effect.reward === 'random_skill') {
                    // ランダムスキル習得（ランダム1名）
                    const validChars = targets.filter(c => c.currentHp > 0);
                    if (validChars.length > 0) {
                        const char = validChars[Math.floor(Math.random() * validChars.length)];
                        // Character Modalで選択させるべきだが、ここではランダム
                        const pool = SKILL_POOLS[char.type] || SKILL_POOLS.physical_attacker;
                        const newSkillId = pool[Math.floor(Math.random() * pool.length)];
                        const skillData = SKILLS[newSkillId];
                        if (skillData && !char.skills.some(s => s.id === newSkillId)) {
                            char.skills.push({ id: skillData.id, displayName: skillData.name });
                            message = `${char.displayName}は${skillData.name}を習得した！`;
                        } else {
                            message = '新たな力は得られなかった...';
                        }
                    }
                }
                break;
            case 'sacrifice_mp': // 旧仕様互換
                targets.forEach(m => {
                    if (m.currentHp > 0) m.currentMp = Math.max(0, m.currentMp - m.stats.mp * (effect.percent / 100));
                });
                if (effect.reward === 'stat_boost_all' || effect.reward === 'stat_up') {
                    targets.forEach(m => {
                        ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense'].forEach(s => {
                            m.stats[s] = Math.floor(m.stats[s] * 1.05); // +5%
                        });
                    });
                    message = '全員のステータスが少し上昇した！';
                }
                break;
            case 'gamble_gold':
                if (this.state.gold < effect.cost) {
                    message = 'お金が足りない...';
                } else {
                    this.state.gold -= effect.cost;
                    if (Math.random() * 100 < effect.chance) {
                        this.state.gold += effect.reward;
                        message = `賭けに勝った！ ${effect.reward}円を手に入れた！（所持金: ${this.state.gold}円）`;
                    } else {
                        message = '賭けに負けた...';
                    }
                }
                break;
            case 'trade_item':
                const hasItem = this.state.items.includes(effect.reqItem);
                if (hasItem) {
                    const idx = this.state.items.indexOf(effect.reqItem);
                    this.state.items.splice(idx, 1);
                    // 報酬適用
                    this.handleEventOption({ effect: effect.reward });
                    return;
                } else {
                    message = '必要なアイテムを持っていない...';
                }
                break;
            case 'upgrade_stat':
                this.showCharacterSelectModal('強化するキャラクターを選択', (selectedChar) => {
                    if (effect.stat === 'attack') {
                        selectedChar.stats.physicalAttack = Math.floor(selectedChar.stats.physicalAttack * (1 + effect.value));
                        selectedChar.stats.magicAttack = Math.floor(selectedChar.stats.magicAttack * (1 + effect.value));
                    } else if (effect.stat === 'defense') {
                        selectedChar.stats.physicalDefense = Math.floor(selectedChar.stats.physicalDefense * (1 + effect.value));
                        selectedChar.stats.magicDefense = Math.floor(selectedChar.stats.magicDefense * (1 + effect.value));
                    } else {
                        selectedChar.stats[effect.stat] = Math.floor(selectedChar.stats[effect.stat] * (1 + effect.value));
                    }

                    this.showModal('イベント結果', `${selectedChar.displayName}の能力が強化された！`, [
                        { text: '次へ', onClick: () => { this.closeModal(); this.finishNode(); } }
                    ]);
                }, () => {
                    // キャンセル時（返金）
                    if (effect.cost && typeof effect.cost === 'number') {
                        this.state.gold += effect.cost;
                    }
                    this.showModal('イベント結果', '強化をやめた。（お金は戻ってきた）', [
                        { text: '次へ', onClick: () => { this.closeModal(); this.finishNode(); } }
                    ]);
                });
                return; // モーダル処理へ委譲するためここで終了
            case 'battle_start':
                this.startBattle(effect.rank);
                return; // モーダルを出さずに戦闘へ
            case 'gacha_item':
                if (Math.random() * 100 < effect.chance) {
                    const gItem = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
                    if (this.state.items.length < 3) {
                        this.state.items.push(gItem);
                        message = `当たりだ！ ${ITEMS[gItem].name}を手に入れた！`;
                    } else {
                        message = '当たりだが、アイテムがいっぱいだ...';
                    }
                } else {
                    message = 'ハズレだ...何もなかった。';
                }
                break;
        }

        // 結果モーダル表示
        this.showModal('イベント結果', message, [
            {
                text: '次へ', onClick: () => {
                    this.closeModal();
                    this.finishNode();
                }
            }
        ]);
    }

    // ショップ画面表示
    showShopScreen() {
        this.showScreen('shop');
        window.scrollTo(0, 0);
        const container = document.getElementById('shop-container');
        if (container) container.scrollTop = 0;
        container.innerHTML = '';
        const leaveBtn = document.getElementById('leave-shop-btn');
        leaveBtn.onclick = () => {
            this.finishNode();
        };

        if (!this.state.currentNode.shopData) {
            this.state.currentNode.shopData = this.generateShopStock();
        }
        const stock = this.state.currentNode.shopData;

        this.renderShopSection(container, 'スキル書', stock.skills);
        this.renderShopSection(container, 'アイテム', stock.items);
        this.renderShopSection(container, 'スペシャル', stock.special);

        this.updateShopUI();
    }

    generateShopStock() {
        const stock = { skills: [], items: [], special: [] };

        // 難易度設定を取得
        const difficulty = this.state.difficulty || 0;
        const diffConfig = DIFFICULTY_CONFIG[difficulty];
        const priceMultiplier = diffConfig ? diffConfig.shopPriceMultiplier : 1.0;

        // アイテム（6枠: 重複なし）
        const itemPool = [...ITEM_POOL];
        const itemStockCount = Math.min(6, itemPool.length);

        for (let i = 0; i < itemStockCount; i++) {
            const randIdx = Math.floor(Math.random() * itemPool.length);
            const itemId = itemPool[randIdx];
            itemPool.splice(randIdx, 1); // Remove to prevent duplicates

            const itemData = ITEMS[itemId];
            const basePrice = itemData.price || 100;
            const price = Math.max(10, Math.floor((basePrice + Math.floor(Math.random() * 101) - 50) * priceMultiplier));
            stock.items.push({ type: 'item', id: itemId, price, purchased: false });
        }

        // スキル（6枠: 重複なし）
        const allGenericSkills = [
            ...SKILL_POOLS.physical_attacker,
            ...SKILL_POOLS.magic_attacker,
            ...SKILL_POOLS.tank,
            ...SKILL_POOLS.healer,
            ...SKILL_POOLS.support,
            ...SKILL_POOLS.debuffer
        ];
        const uniqueSkills = [...new Set(allGenericSkills)]; // Unique generic skills

        const skillStockCount = Math.min(6, uniqueSkills.length);
        for (let i = 0; i < skillStockCount; i++) {
            const randIdx = Math.floor(Math.random() * uniqueSkills.length);
            const skillId = uniqueSkills[randIdx];
            uniqueSkills.splice(randIdx, 1); // Remove from pool

            // 価格: 200-400（難易度倍率適用）
            const price = Math.floor((200 + Math.floor(Math.random() * 201)) * priceMultiplier);
            stock.skills.push({ type: 'skill', id: skillId, price, purchased: false });
        }

        // スペシャル
        // SP獲得 (+3, 150-300円、難易度倍率適用）
        const spPrice = Math.floor((150 + Math.floor(Math.random() * 151)) * priceMultiplier);
        stock.special.push({ type: 'sp', value: 3, price: spPrice, name: '即効性SP (+3)', desc: 'SPを3獲得する', purchased: false });

        // 休憩セット (HP/MP 50%回復, 200-300円、難易度倍率適用）
        const healPrice = Math.floor((200 + Math.floor(Math.random() * 101)) * priceMultiplier);
        stock.special.push({ type: 'heal_all_mp', percent: 50, price: healPrice, name: '休憩セット', desc: '全員のHP・MP50%回復', purchased: false });

        // 蘇生薬（レア枠 15%）
        if (Math.random() < 0.15) {
            const revPot = ITEMS['revive_potion'];
            const revPrice = Math.max(400, Math.floor((revPot.price + Math.floor(Math.random() * 101) - 50) * priceMultiplier));
            stock.special.push({ type: 'item', id: 'revive_potion', price: revPrice, purchased: false });
        }

        return stock;
    }

    renderShopSection(container, title, items) {
        if (!items || items.length === 0) return;

        const section = document.createElement('div');
        section.className = 'shop-section';
        section.innerHTML = `<div class="shop-section-title">${title}</div>`;

        const grid = document.createElement('div');
        grid.className = 'shop-grid';

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = `shop-item ${item.purchased ? 'purchased' : ''}`;
            el.shopItemData = item; // データ紐付け
            // 初期状態の判定（updateShopUIでもやるが一応）
            if (this.state.gold < item.price && !item.purchased) el.classList.add('too-expensive');

            let content = '';
            if (item.type === 'item') {
                const data = ITEMS[item.id];
                content = `<h4>${data.name}</h4><p>${data.description}</p>`;
            } else if (item.type === 'skill') {
                const data = SKILLS[item.id];
                const char = this.state.party.find(c => c.id === item.targetCharId);
                content = `<h4>${data.name}</h4><p>${data.description}</p>`;
            } else if (item.type === 'sp' || item.type === 'heal_all_mp') {
                content = `<h4>${item.name}</h4><p>${item.desc}</p>`;
            }

            el.innerHTML = `${content}<div class="shop-price">${item.price}円</div>`;

            el.onclick = () => {
                if (item.purchased) return;
                this.handlePurchaseClick(item, el);
            };

            grid.appendChild(el);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }

    handlePurchaseClick(item, el) {
        if (this.state.gold < item.price) {
            this.showToast('お金が足りない！', 'error');
            return;
        }

        // 確認ダイアログ
        this.showModal('購入確認', `「${this.getItemName(item)}」を購入しますか？\n価格: ${item.price}円`, [
            { text: '購入する', onClick: () => { this.closeModal(); this.processPurchase(item, el); } },
            { text: 'やめる', onClick: () => { this.closeModal(); } }
        ]);
    }

    getItemName(item) {
        if (item.type === 'item') return ITEMS[item.id].name;
        if (item.type === 'skill') return SKILLS[item.id].name;
        return item.name;
    }

    processPurchase(item, el) {
        // アイテム判定（ステータス結晶や蘇生薬も含む）
        if (item.type === 'item' || (item.type === 'special' && item.id === 'revive_potion')) {
            if (this.state.items.length >= 3) {
                // アイテムがいっぱい → 入れ替え
                this.showItemSwapModal((swapped) => {
                    if (swapped) {
                        // 入れ替え完了後、購入処理
                        this.state.items.push(item.id);
                        this.finalizePurchase(item, el, `${ITEMS[item.id].name}を購入した`);
                    } else {
                        // キャンセル
                        this.showToast('購入をキャンセルしました', 'info');
                    }
                }, item.id); // 新しいアイテムを渡して比較できるようにする
                return;
            }
            this.state.items.push(item.id);
            this.finalizePurchase(item, el, `${ITEMS[item.id].name}を購入した`);

        } else if (item.type === 'skill') {
            // スキル購入フロー
            this.showCharacterSelectModal('誰に習得させる？', (targetChar) => {
                // 習得済みチェック
                if (targetChar.skills.some(s => s.id === item.id)) {
                    this.showToast(`${targetChar.displayName}は既に覚えている`, 'error');
                    return;
                }

                // スキルスロットがいっぱいの場合 (仮に6個制限)
                if (targetChar.skills.length >= 6) {
                    this.showSkillSwapModal(targetChar, item.id, (swapped) => {
                        if (swapped) {
                            this.finalizePurchase(item, el, `${targetChar.displayName}は新スキルを習得した`);
                        }
                    });
                    return;
                }

                const skillData = SKILLS[item.id];
                targetChar.skills.push({ id: skillData.id, displayName: skillData.name });
                this.finalizePurchase(item, el, `${targetChar.displayName}は${skillData.name}を習得した`);
                this.closeModal();
            });

        } else if (item.type === 'sp') {
            this.state.spPool += item.value;
            this.finalizePurchase(item, el, `SPを${item.value}獲得した`);

        } else if (item.type === 'heal_all_mp' || item.type === 'heal_all') {
            this.state.party.forEach(m => {
                if (m.currentHp > 0) {
                    m.currentHp = Math.min(m.stats.hp, m.currentHp + m.stats.hp * (item.percent / 100));
                    m.currentMp = Math.min(m.stats.mp, m.currentMp + m.stats.mp * (item.percent / 100));
                }
            });
            this.finalizePurchase(item, el, '全員のHP・MPが回復した');
        }
    }

    finalizePurchase(item, el, message) {
        this.state.gold -= item.price;
        item.purchased = true;
        this.updateShopUI();
        this.renderPartyStatusBar();
        this.showToast(message, 'success');
    }

    updateShopUI() {
        // 所持金更新
        const goldEl = document.getElementById('shop-gold-display');
        if (goldEl) {
            goldEl.innerText = `所持金: ${this.state.gold}円`;
        }

        // 全アイテムの状態更新
        const items = document.querySelectorAll('.shop-item');
        items.forEach(el => {
            const item = el.shopItemData;
            if (!item) return;

            // 購入済みクラス
            if (item.purchased) {
                el.classList.add('purchased');
                el.classList.remove('too-expensive');
            } else {
                // 金額不足クラス
                if (this.state.gold < item.price) {
                    el.classList.add('too-expensive');
                } else {
                    el.classList.remove('too-expensive');
                }
            }
        });
    }

    // ゲームオーバー
    gameOver() {
        this.clearSaveData();
        // 戦闘画面は見せたまま、オーバーレイを表示
        const modal = document.getElementById('gameover-modal');
        modal.classList.remove('hidden');
    }

    closeGameOverModal() {
        document.getElementById('gameover-modal').classList.add('hidden');
    }

    // 勝利モーダル表示
    showVictoryModal() {
        this.clearSaveData();
        // 戦闘画面は見せたまま、勝利オーバーレイを表示
        const modal = document.getElementById('victory-modal');
        modal.classList.remove('hidden');
    }

    closeVictoryModal() {
        document.getElementById('victory-modal').classList.add('hidden');
    }

    // ゲームリセット
    resetGame() {
        this.clearSaveData();
        this.state = {
            screen: 'title',
            party: [],
            currentAct: 1,
            currentLayer: 0,
            currentNode: null,
            nodeMap: [],
            items: [],
            spPool: 0,
            gold: 0,
            battle: null,
            currentTab: 'all',
            currentSort: 'default',
            selectedChar: null,
            difficulty: 1
        };
        this.showScreen('title');
    }

    // 遅延
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 前のキャラクターに戻る
    backCharacter() {
        // 現在のキャラクターが既にコマンドを入力済みなら、まずそれを消してそのキャラの再選択にする
        if (this.state.battle.commands[this.state.battle.currentCharIndex]) {
            delete this.state.battle.commands[this.state.battle.currentCharIndex];
            this.updateCommandUI();
            return;
        }

        // 未入力なら、一つ前の生存キャラクターを探す
        let prevIdx = this.state.battle.currentCharIndex - 1;

        while (prevIdx >= 0) {
            if (this.state.party[prevIdx].currentHp > 0) {
                // 見つかった生存キャラのコマンドを消去
                delete this.state.battle.commands[prevIdx];
                // インデックスをそのキャラに戻す
                this.state.battle.currentCharIndex = prevIdx;
                this.updateCommandUI();
                return;
            }
            prevIdx--;
        }
    }


    // キャラ詳細モーダル表示
    showCharacterDetail(charId, context) {
        const modal = document.getElementById('character-detail-modal');
        const nameEl = document.getElementById('detail-char-name');
        const bodyEl = document.getElementById('detail-body');

        let char;
        if (context === 'party') {
            char = CHARACTERS[charId];
        } else if (context === 'enemy_battle') {
            // 敵の場合はインデックスで取得
            char = this.state.battle.enemies[charId];
            if (!char) return;
        } else {
            char = this.state.party.find(p => p.id === charId);
            if (!char) return;
        }

        nameEl.textContent = char.name;
        bodyEl.innerHTML = '';

        // Content area
        const content = document.createElement('div');
        content.className = 'detail-content';

        // Image (Always show full, but style differs for enemy)
        const imageDiv = document.createElement('div');
        imageDiv.className = 'detail-image';
        let imgStyle = '';
        if (context === 'enemy_battle') {
            imgStyle = 'object-fit:contain; aspect-ratio:1/1; width:100%;';
        }
        // Enemy uses full image same as ally in this context
        const imgSrc = char.image.full || char.image.face;
        imageDiv.innerHTML = `<img src="${imgSrc}" alt="${char.name}" style="${imgStyle}" onerror="this.style.background='#555'">`;
        content.appendChild(imageDiv);

        // Stats area
        const statsDiv = document.createElement('div');
        statsDiv.className = 'detail-stats';

        if (context !== 'enemy_battle') {
            const typeLabel = this.getTypeLabel(char.type);
            statsDiv.innerHTML = `<div class="detail-type">タイプ：${typeLabel}</div>`;
        }

        // 通常攻撃タイプを判定（素のステータスで高い方）
        const basePhys = CHARACTERS[char.id]?.stats.physicalAttack || char.stats.physicalAttack;
        const baseMag = CHARACTERS[char.id]?.stats.magicAttack || char.stats.magicAttack;
        const primaryAttackType = basePhys >= baseMag ? 'physical' : 'magic';

        // HP/MP with colors
        const hpColor = '#4ecdc4'; // 戦闘画面のHPバーと同じ色
        const mpColor = '#4facfe'; // 戦闘画面のMPバーと同じ色

        let hpMpHtml = '';
        if (context === 'party') {
            hpMpHtml += `<div class="stat-row"><span class="stat-label" style="color:${hpColor}">HP:</span> <span class="stat-value" style="color:${hpColor}">${char.stats.hp}</span></div>`;
            hpMpHtml += `<div class="stat-row"><span class="stat-label" style="color:${mpColor}">MP:</span> <span class="stat-value" style="color:${mpColor}">${char.stats.mp}</span></div>`;
        } else {
            hpMpHtml += `<div class="stat-row"><span class="stat-label" style="color:${hpColor}">HP:</span> <span class="stat-value" style="color:${hpColor}">${Math.floor(char.currentHp)}/${char.stats.hp}</span></div>`;
            if (context !== 'enemy_battle') {
                hpMpHtml += `<div class="stat-row"><span class="stat-label" style="color:${mpColor}">MP:</span> <span class="stat-value" style="color:${mpColor}">${Math.floor(char.currentMp)}/${char.stats.mp}</span></div>`;
            }
        }
        statsDiv.innerHTML += hpMpHtml;

        // Other stats with attack highlights
        const stats = ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed', 'luck'];
        const statLabels = {
            physicalAttack: '物攻', magicAttack: '魔攻',
            physicalDefense: '物防', magicDefense: '魔防',
            speed: '速度', luck: '運'
        };

        // 攻撃力の色
        const physColor = '#ff6b6b'; // 物理攻撃色（赤系）
        const magColor = '#a29bfe'; // 魔法攻撃色（紫系）

        stats.forEach(stat => {
            const baseValue = char.stats[stat];
            let displayText = `${baseValue}`;
            let labelStyle = '';
            let valueStyle = '';

            // 物理/魔法攻撃力に色を付ける（主攻撃タイプを強調）
            if (stat === 'physicalAttack') {
                const isMain = primaryAttackType === 'physical';
                labelStyle = `color:${physColor}; ${isMain ? 'font-weight:bold;' : ''}`;
                valueStyle = `color:${physColor}; ${isMain ? 'font-weight:bold;' : ''}`;
            } else if (stat === 'magicAttack') {
                const isMain = primaryAttackType === 'magic';
                labelStyle = `color:${magColor}; ${isMain ? 'font-weight:bold;' : ''}`;
                valueStyle = `color:${magColor}; ${isMain ? 'font-weight:bold;' : ''}`;
            }

            // Battle context: show buffs/debuffs
            if (context === 'battle') {
                const effectiveValue = this.getEffectiveStat(char, stat);
                if (effectiveValue !== baseValue) {
                    const buff = char.buffs.find(b => b.stat === stat);
                    const debuff = char.debuffs.find(d => d.stat === stat);
                    const duration = buff ? buff.duration : (debuff ? debuff.duration : 0);
                    const arrow = effectiveValue > baseValue ? '↑' : '↓';
                    const changeClass = effectiveValue > baseValue ? 'stat-change' : 'stat-change down';
                    displayText = `${baseValue} → ${effectiveValue} <span class="${changeClass}">${arrow}${duration}T</span>`;
                }
            }

            statsDiv.innerHTML += `<div class="stat-row"><span class="stat-label" style="${labelStyle}">${statLabels[stat]}:</span> <span class="stat-value" style="${valueStyle}">${displayText}</span></div>`;
        });

        // 会心率 (Crit Rate)
        {
            const effectiveLuck = (context === 'battle' || context === 'enemy_battle') ? this.getEffectiveStat(char, 'luck') : char.stats.luck;
            let baseCrit = 5 + Math.floor(effectiveLuck / 3) + (char.critBonus || 0); // 基本 + 運補正 + 装備補正(仮)

            // バフ補正 (戦闘中のみ)
            let buffVal = 0;
            if (context === 'battle' || context === 'enemy_battle') {
                const critStatus = char.statusEffects.find(e => e.type === 'critBoost');
                if (critStatus) buffVal = critStatus.value;
            }

            let finalCrit = baseCrit + buffVal;
            let displayCrit = `${finalCrit}%`;

            if (buffVal !== 0) {
                const arrow = buffVal > 0 ? '↑' : '↓';
                const changeClass = buffVal > 0 ? 'stat-change' : 'stat-change down';
                // 元の値(baseCrit) → 新しい値(finalCrit) ... というよりは、最終値 + バフ分を表示
                // ここではシンプルに「最終値 (矢印)」にする
                displayCrit = `${baseCrit}% → ${finalCrit}% <span class="${changeClass}">${arrow}</span>`;
            }

            statsDiv.innerHTML += `<div class="stat-row"><span class="stat-label">会心率:</span> <span class="stat-value">${displayCrit}</span></div>`;
        }

        content.appendChild(statsDiv);
        bodyEl.appendChild(content);

        // Skills (Unified List)
        const skillsSection = document.createElement('div');
        skillsSection.className = 'detail-section';
        skillsSection.innerHTML = '<h4>【スキル】</h4>';

        // 固有スキルと通常スキルを統合
        let skillList = [];
        if (char.uniqueSkill) skillList.push(char.uniqueSkill);
        if (char.skills && char.skills.length > 0) {
            skillList = skillList.concat(char.skills);
        }

        if (skillList.length > 0) {
            skillList.forEach(skill => {
                // 文字列IDの場合とオブジェクトの場合に対応
                const skillId = (typeof skill === 'string') ? skill : skill.id;
                const skillData = SKILLS[skillId] || skill; // SKILLSになければそのまま(uniqueSkill等)、あるいはID表示

                // 敵の場合はMPコスト非表示
                const showCost = context !== 'enemy_battle';

                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item';
                skillItem.innerHTML = `
                     <div class="skill-item-header">
                         <span class="skill-item-name">${skillData.displayName || skillData.name || skillId}</span>
                         ${showCost ? `<span class="skill-item-cost">MP: ${skillData.mpCost || 0}</span>` : ''}
                     </div>
                     <div class="skill-item-desc">${skillData.description || ''}</div>
                 `;
                skillsSection.appendChild(skillItem);
            });
            bodyEl.appendChild(skillsSection);
        }

        // Status ailments (battle only)
        if ((context === 'battle' || context === 'enemy_battle') && char.statusEffects && char.statusEffects.length > 0) {
            // critBoostは詳細リストからも除外
            const visibleEffects = char.statusEffects.filter(e => e.type !== 'critBoost');

            if (visibleEffects.length > 0) {
                const statusSection = document.createElement('div');
                statusSection.className = 'detail-section';
                statusSection.innerHTML = '<h4>【状態異常】</h4><div class="status-list"></div>';

                const statusList = statusSection.querySelector('.status-list');
                visibleEffects.forEach(effect => {
                    const tag = document.createElement('span');
                    tag.className = 'status-tag ailment';
                    const labels = { poison: '毒', paralysis: '麻痺', silence: '沈黙', stun: 'スタン', taunt: '挑発', defending: '防御', gmax: 'G-MAX' };
                    tag.textContent = `${labels[effect.type] || effect.type}(残${effect.duration}T)`;
                    statusList.appendChild(tag);
                });
                bodyEl.appendChild(statusSection);
            }
        }

        modal.classList.remove('hidden');
    }

    closeCharacterDetail() {
        document.getElementById('character-detail-modal').classList.add('hidden');
    }

    // アイテムモーダル表示（配列形式対応）
    showItemModal(context) {
        const modal = document.getElementById('item-modal');
        const listEl = document.getElementById('item-list');
        listEl.innerHTML = '';

        if (this.state.items.length === 0) {
            listEl.innerHTML = '<p style="text-align:center;color:var(--text-sub);padding:20px;">アイテムがありません</p>';
            modal.classList.remove('hidden');
            return;
        }

        this.state.items.forEach((itemId, idx) => {
            const item = ITEMS[itemId];
            if (!item) return;

            const isMap = context === 'map';
            const isRecovery = item.effect.type === 'heal' || item.effect.type === 'mp_heal';
            const isUsable = !isMap || item.usableOnMap || isRecovery;

            const entry = document.createElement('div');
            entry.className = `item-entry ${!isUsable ? 'disabled' : ''}`;
            entry.innerHTML = `<div class="item-info"><div class="item-name">${item.name}</div><div class="item-desc">${item.description}</div></div>`;

            if (isUsable) {
                entry.onclick = () => this.useItemFromModal(itemId, context, idx);
            } else {
                entry.onclick = () => this.showToast('移動中は使えません', 'info');
                entry.style.opacity = '0.5';
                entry.style.cursor = 'not-allowed';
            }
            listEl.appendChild(entry);
        });

        modal.classList.remove('hidden');
    }

    closeItemModal() {
        document.getElementById('item-modal').classList.add('hidden');
    }

    // ========================================
    // 強化画面
    // ========================================

    showEnhanceScreen() {
        this.enhanceBackup = JSON.parse(JSON.stringify(this.state.party));
        this.enhanceSpBackup = this.state.spPool;
        this.enhanceSelectedCharIdx = 0;
        this.enhanceInvestments = {};
        this.state.party.forEach(p => {
            this.enhanceInvestments[p.id] = { hp: 0, mp: 0, physicalAttack: 0, magicAttack: 0, physicalDefense: 0, magicDefense: 0, speed: 0, luck: 0 };
        });

        this.showModal('ステータス強化', this.buildEnhanceContent(), [
            { text: 'リセット', onClick: () => this.resetEnhance(), className: 'btn-cancel' },
            { text: '戻る', onClick: () => this.cancelEnhance(), className: 'btn-cancel' },
            { text: '決定', onClick: () => this.confirmEnhance(), className: 'btn-primary' }
        ]);
    }

    buildEnhanceContent() {
        const char = this.state.party[this.enhanceSelectedCharIdx];
        const baseStats = CHARACTERS[char.id].stats;
        const investments = this.enhanceInvestments[char.id];
        const statLabels = { hp: 'HP', mp: 'MP', physicalAttack: '物攻', magicAttack: '魔攻', physicalDefense: '物防', magicDefense: '魔防', speed: '速度', luck: '運' };

        let html = `<div class="enhance-layout">`;
        html += `<div class="enhance-char-tabs">`;
        this.state.party.forEach((p, idx) => {
            const activeClass = idx === this.enhanceSelectedCharIdx ? 'active' : '';
            html += `<div class="enhance-tab-btn ${activeClass}" data-char-idx="${idx}"><img src="${p.image.face}" alt="${p.displayName}"></div>`;
        });
        html += `</div>`;
        html += `<div style="text-align:center;margin-bottom:12px;color:var(--warning);font-weight:bold;">残りSP: ${this.state.spPool}</div>`;
        html += `<div class="enhance-stat-list">`;
        const stats = ['hp', 'mp', 'physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed', 'luck'];
        stats.forEach(stat => {
            const current = char.stats[stat];
            const invested = investments[stat];
            // Split Value and Delta for fixed layout
            html += `<div class="enhance-stat-item">
                <span class="stat-label">${statLabels[stat]}</span>
                <span class="stat-val-base">${current}</span>
                <span class="stat-val-delta">${invested > 0 ? `(+${invested})` : ''}</span>
                <div class="enhance-btns">
                    <button class="btn-minus" data-stat="${stat}" data-delta="-5">-5</button>
                    <button class="btn-minus" data-stat="${stat}" data-delta="-1">-1</button>
                    <button class="btn-plus" data-stat="${stat}" data-delta="+1">+1</button>
                    <button class="btn-plus" data-stat="${stat}" data-delta="+5">+5</button>
                </div>
            </div>`;
        });
        html += `</div></div>`;
        return html;
    }

    bindEnhanceEvents() {
        document.querySelectorAll('.enhance-tab-btn').forEach(btn => {
            btn.onclick = () => {
                this.enhanceSelectedCharIdx = parseInt(btn.dataset.charIdx);
                this.refreshEnhanceUI();
            };
        });
        document.querySelectorAll('.enhance-btns button').forEach(btn => {
            btn.onclick = () => {
                this.adjustEnhanceStat(btn.dataset.stat, parseInt(btn.dataset.delta));
            };
        });
    }

    adjustEnhanceStat(stat, delta) {
        const char = this.state.party[this.enhanceSelectedCharIdx];
        const baseStats = CHARACTERS[char.id].stats;
        const investments = this.enhanceInvestments[char.id];
        const boostPerPoint = Math.floor(baseStats[stat] * 0.05);

        let actualDelta = delta;

        if (delta > 0) {
            // Partial Add: Cap at remaining SP
            if (this.state.spPool < delta) {
                actualDelta = this.state.spPool;
            }
            if (actualDelta === 0) {
                this.showToast('SPが足りません', 'error');
                return;
            }

            this.state.spPool -= actualDelta;
            investments[stat] += actualDelta;
            char.stats[stat] += boostPerPoint * actualDelta;

            // HP/MP Current Value Adjust (Healing effect on enhance)
            if (stat === 'hp') char.currentHp = Math.min(char.stats.hp, char.currentHp + boostPerPoint * actualDelta);
            if (stat === 'mp') char.currentMp = Math.min(char.stats.mp, char.currentMp + boostPerPoint * actualDelta);

        } else if (delta < 0) {
            // Partial Remove: Cap at invested amount
            const currentInvested = investments[stat];
            if (currentInvested === 0) return; // Cannot reduce

            actualDelta = Math.max(delta, -currentInvested);
            const absD = Math.abs(actualDelta);

            this.state.spPool += absD;
            investments[stat] += actualDelta; // negative add
            char.stats[stat] += boostPerPoint * actualDelta;

            // HP/MP Cap Adjust (If max reduced, current might need clamp, though logic usually keeps current <= max automatically or allowed overflow?
            // Usually clamp current to new max if it exceeds.
            if (stat === 'hp') char.currentHp = Math.min(char.stats.hp, char.currentHp);
            if (stat === 'mp') char.currentMp = Math.min(char.stats.mp, char.currentMp);
        }

        this.refreshEnhanceUI();
    }

    refreshEnhanceUI() {
        document.getElementById('modal-body').innerHTML = this.buildEnhanceContent();
        this.bindEnhanceEvents();
    }

    resetEnhance() {
        this.state.party = JSON.parse(JSON.stringify(this.enhanceBackup));
        this.state.spPool = this.enhanceSpBackup;
        this.state.party.forEach(p => {
            this.enhanceInvestments[p.id] = { hp: 0, mp: 0, physicalAttack: 0, magicAttack: 0, physicalDefense: 0, magicDefense: 0, speed: 0, luck: 0 };
        });
        this.refreshEnhanceUI();
        this.showToast('リセットしました', 'info');
    }

    cancelEnhance() {
        this.state.party = JSON.parse(JSON.stringify(this.enhanceBackup));
        this.state.spPool = this.enhanceSpBackup;
        this.closeModal();
    }

    confirmEnhance() {
        this.closeModal();
        this.renderPartyStatusBar();
        this.showToast('強化を適用しました', 'success');
    }

    // アイテム使用（配列形式対応 - ターゲット選択改善版）
    useItemFromModal(itemId, context, itemIndex) {
        const item = ITEMS[itemId];
        if (!item) return;

        this.closeItemModal();

        if (item.target === 'all_allies') {
            this.showModal('確認', `${item.name}を使用しますか？`, [
                {
                    text: '使用する',
                    onClick: () => {
                        this.closeModal();
                        this.applyItemEffectToAll(itemId, itemIndex);
                        if (context === 'map') this.renderPartyStatusBar();
                    }
                },
                {
                    text: 'やめる',
                    onClick: () => {
                        this.closeModal();
                        if (context === 'map' || context === 'battle') this.showItemModal(context);
                    },
                    className: 'btn-cancel'
                }
            ]);
            return;
        }

        // キャラクター選択用のカスタムHTML生成
        let listHTML = '<div id="target-select-list">';
        let hasTargets = false;

        this.state.party.forEach((member, idx) => {
            // 戦闘不能キャラは回復対象外（蘇生アイテム以外）
            if (member.currentHp <= 0 && item.effect.type !== 'revive') return;

            hasTargets = true;
            const hpPerc = Math.floor((member.currentHp / member.stats.hp) * 100);
            const mpPerc = member.stats.mp > 0 ? Math.floor((member.currentMp / member.stats.mp) * 100) : 0;

            listHTML += `
                <div class="target-char-card" data-idx="${idx}">
                    <img src="${member.image.face}" alt="${member.displayName}">
                    <div class="target-char-info">
                        <div class="target-char-name">${member.displayName}</div>
                        <!-- HP Bar -->
                        <div style="background:#333;height:6px;width:100%;margin-bottom:2px;border-radius:3px;overflow:hidden;">
                            <div style="background:#ff6b6b;height:100%;width:${hpPerc}%;"></div>
                        </div>
                        <div style="font-size:10px;color:#ddd;margin-bottom:4px;text-align:right;">${member.currentHp}/${member.stats.hp}</div>
                        <!-- MP Bar -->
                        <div style="background:#333;height:6px;width:100%;margin-bottom:2px;border-radius:3px;overflow:hidden;">
                            <div style="background:#4facfe;height:100%;width:${mpPerc}%;"></div>
                        </div>
                        <div style="font-size:10px;color:#ddd;text-align:right;">${member.currentMp}/${member.stats.mp}</div>
                    </div>
                </div>
            `;
        });
        listHTML += '</div>';

        if (!hasTargets) {
            this.showToast('対象がいません', 'error');
            return;
        }

        this.showModal('対象を選択', listHTML, [
            {
                text: 'キャンセル',
                onClick: () => {
                    this.closeModal();
                    if (context === 'map' || context === 'battle') this.showItemModal(context);
                },
                className: 'btn-cancel'
            }
        ]);

        // イベントリスナーをバインド（DOM更新後）
        setTimeout(() => {
            document.querySelectorAll('.target-char-card').forEach(card => {
                card.onclick = () => {
                    const idx = parseInt(card.dataset.idx);
                    this.applyItemEffect(itemId, this.state.party[idx], itemIndex);
                    this.closeModal();
                    if (context === 'map') this.renderPartyStatusBar();
                };
            });
        }, 50);
    }

    // アイテム効果適用（単体対象・配列形式対応）
    applyItemEffect(itemId, target, itemIndex) {
        const item = ITEMS[itemId];
        if (!item) return;

        if (typeof itemIndex === 'number') this.state.items.splice(itemIndex, 1);

        switch (item.effect.type) {
            case 'heal':
                const healAmount = Math.floor(target.stats.hp * (item.effect.percent / 100));
                target.currentHp = Math.min(target.stats.hp, target.currentHp + healAmount);
                this.showToast(`${target.displayName}のHPが${healAmount}回復！`, 'success');
                break;
            case 'mp_heal':
                const mpAmount = Math.floor(target.stats.mp * (item.effect.percent / 100));
                target.currentMp = Math.min(target.stats.mp, target.currentMp + mpAmount);
                this.showToast(`${target.displayName}のMPが${mpAmount}回復！`, 'success');
                break;
            case 'buff':
                if (item.effect.effects) {
                    item.effect.effects.forEach(eff => {
                        if (eff.stat === 'critBoost') {
                            target.statusEffects.push({ type: 'critBoost', value: eff.value, duration: eff.duration });
                        } else {
                            const existing = target.buffs.find(b => b.stat === eff.stat);
                            if (existing) {
                                existing.duration = Math.max(existing.duration, eff.duration);
                                if (eff.value > existing.value) existing.value = eff.value;
                            } else {
                                target.buffs.push({ stat: eff.stat, value: eff.value, duration: eff.duration });
                            }
                        }
                    });
                }
                this.showToast(`${target.displayName}に${item.name}を使用！`, 'success');
                break;
            case 'revive':
                target.currentHp = Math.floor(target.stats.hp * (item.effect.percent / 100));
                target.buffs = []; // Reset state
                target.debuffs = [];
                target.statusEffects = [];
                this.showToast(`${target.displayName}が復活した！`, 'success');
                break;
        }
    }

    applyItemEffectToAll(itemId, itemIndex) {
        const item = ITEMS[itemId];
        if (!item) return;

        if (typeof itemIndex === 'number') this.state.items.splice(itemIndex, 1);

        const targets = this.state.party.filter(p => p.currentHp > 0);

        switch (item.effect.type) {
            case 'heal':
                targets.forEach(t => {
                    const amt = Math.floor(t.stats.hp * (item.effect.percent / 100));
                    t.currentHp = Math.min(t.stats.hp, t.currentHp + amt);
                });
                this.showToast(`全員のHPが回復！`, 'success');
                break;
            case 'mp_heal':
                targets.forEach(t => {
                    const amt = Math.floor(t.stats.mp * (item.effect.percent / 100));
                    t.currentMp = Math.min(t.stats.mp, t.currentMp + amt);
                });
                this.showToast(`全員のMPが回復！`, 'success');
                break;
            case 'buff':
                targets.forEach(t => {
                    if (item.effect.effects) {
                        item.effect.effects.forEach(eff => {
                            if (eff.stat === 'critBoost') {
                                t.statusEffects.push({ type: 'critBoost', value: eff.value, duration: eff.duration });
                            } else {
                                const existing = t.buffs.find(b => b.stat === eff.stat);
                                if (existing) {
                                    existing.duration = Math.max(existing.duration, eff.duration);
                                    if (eff.value > existing.value) existing.value = eff.value;
                                } else {
                                    t.buffs.push({ stat: eff.stat, value: eff.value, duration: eff.duration });
                                }
                            }
                        });
                    }
                });
                this.showToast(`全員に${item.name}を使用！`, 'success');
                break;
        }
    }

    async showAttackEffect(actor, target, skill, damageType) {
        const skillId = skill ? skill.id : 'normal_attack';
        const isPhysical = (damageType === 'physical');

        // 自身対象のバフ技は画面中央に表示
        const centerScreenSkills = ['delorieran'];
        let vfxParent, unitEl;

        if (centerScreenSkills.includes(skillId)) {
            vfxParent = document.getElementById('battle-screen');
            if (!vfxParent) return;
        } else {
            unitEl = document.querySelector(this.getUnitSelector(target));
            if (!unitEl) return;
            vfxParent = unitEl;
        }

        const vfx = document.createElement('div');
        vfx.className = centerScreenSkills.includes(skillId) ? 'vfx-container-fullscreen' : 'vfx-container';
        vfxParent.appendChild(vfx);

        // --- プロレベル演出ロジック ---

        // 五条悟：無量空処（明度反転）
        if (skillId === 'muryokushou') {
            document.getElementById('battle-screen').classList.add('void-invert');
            setTimeout(() => document.getElementById('battle-screen').classList.remove('void-invert'), 800);
        }

        // === 味方固有技 ===
        if (skillId === 'taunt') { // 唐可可
            const el = document.createElement('div'); el.className = 'vfx-stardust'; vfx.appendChild(el);
        } else if (skillId === 'cure_status') {
            this.showFlashEffect(target, 'green'); // 浄化は緑のフラッシュ
        } else if (skillId === 'ultra_attack' && actor.id === 'sky') { // キュアスカイ
            // 画面揺れと色彩反転を適用（1秒間維持）
            const screen = document.getElementById('battle-screen');
            screen.classList.add('void-invert', 'screen-shake');
            setTimeout(() => screen.classList.remove('void-invert', 'screen-shake'), 600);

            // 多層レイヤーによる高輝度エフェクト
            const burst = document.createElement('div'); burst.className = 'vfx-sky-burst'; vfx.appendChild(burst);
            const cross = document.createElement('div'); cross.className = 'vfx-sky-cross'; vfx.appendChild(cross);
        } else if (skillId === 'heal' && actor.id === 'josuke') { // 東方仗助：クリスタル・リペア・ラッシュ
            const screen = document.getElementById('battle-screen');
            // 演出全体の50%（0.6s）でフラッシュ
            setTimeout(() => {
                screen.classList.add('void-invert', 'screen-shake');
                setTimeout(() => screen.classList.remove('void-invert', 'screen-shake'), 400);
            }, 600);

            const el = document.createElement('div'); el.className = 'vfx-crazy-diamond';
            for (let i = 0; i < 16; i++) {
                const shard = document.createElement('div');
                shard.className = 'vfx-diamond-shard';
                const angle = Math.random() * Math.PI * 2;
                const dist = 120 + Math.random() * 60;
                shard.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
                shard.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
                shard.style.setProperty('--delay', `${Math.random() * 0.3}s`);
                shard.style.setProperty('--size', `${10 + Math.random() * 15}px`);
                el.appendChild(shard);
            }
            vfx.appendChild(el);
        } else if (skillId === 'daten_bind') { // 津島善子：堕天龍鳳凰縛
            const screen = document.getElementById('battle-screen');
            // 暗転フラッシュ（0.9秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 300);
            }, 900);

            const el = document.createElement('div'); el.className = 'vfx-fallen-bind';
            // 暗黒オーラ
            const aura = document.createElement('div'); aura.className = 'vfx-dark-aura';
            el.appendChild(aura);
            // 8本の鎖を生成
            for (let i = 0; i < 8; i++) {
                const chain = document.createElement('div');
                chain.className = 'vfx-chain';
                chain.style.setProperty('--angle', `${i * 45}deg`);
                chain.style.setProperty('--delay', `${i * 0.05}s`);
                el.appendChild(chain);
            }
            // 紫電撃エフェクト
            const lightning = document.createElement('div'); lightning.className = 'vfx-purple-lightning';
            el.appendChild(lightning);
            vfx.appendChild(el);
        } else if (skillId === 'aura_sphere') { // ルカリオ：はどうだん
            // チャージエフェクト（actor側）
            const actorEl = document.querySelector(this.getUnitSelector(actor));
            if (actorEl) {
                const chargeVfx = document.createElement('div');
                chargeVfx.className = 'vfx-container';
                actorEl.appendChild(chargeVfx);
                const chargeCore = document.createElement('div');
                chargeCore.className = 'vfx-aura-charge-actor';
                chargeVfx.appendChild(chargeCore);
                // チャージリング
                for (let i = 0; i < 2; i++) {
                    const ring = document.createElement('div');
                    ring.className = 'vfx-aura-charge-ring';
                    ring.style.setProperty('--delay', `${i * 0.1}s`);
                    chargeVfx.appendChild(ring);
                }
                setTimeout(() => chargeVfx.remove(), 700);
            }

            const el = document.createElement('div'); el.className = 'vfx-aura-sphere';
            // 弾道計算：ターゲット要素の中心からの相対座標を算出
            const actorUnitEl = document.querySelector(this.getUnitSelector(actor));
            const actorImg = actorUnitEl ? actorUnitEl.querySelector('img') : null;
            const actorRect = (actorImg || actorUnitEl)?.getBoundingClientRect();

            const targetUnitEl = document.querySelector(this.getUnitSelector(target));
            const targetImg = targetUnitEl ? targetUnitEl.querySelector('img') : null;
            const targetRect = (targetImg || targetUnitEl)?.getBoundingClientRect();

            if (actorRect && targetRect) {
                // ターゲットの中心（基準点）
                const tx = targetRect.left + targetRect.width / 2;
                const ty = targetRect.top + targetRect.height / 2;
                // アクターの中心
                const ax = actorRect.left + actorRect.width / 2;
                const ay = actorRect.top + actorRect.height / 2;

                // ターゲット中心から見たアクター位置（開始位置）
                const startX = ax - tx;
                const startY = ay - ty;

                el.style.setProperty('--start-x', `${startX}px`);
                el.style.setProperty('--start-y', `${startY}px`);
                el.classList.add('vfx-projectile-dynamic');
            } else {
                // フォールバック
                if (this.state.battle.enemies.includes(actor)) {
                    el.classList.add('vfx-projectile-down');
                } else {
                    el.classList.add('vfx-projectile-up');
                }
            }
            // 波動球本体
            const sphere = document.createElement('div'); sphere.className = 'vfx-aura-sphere-core';
            el.appendChild(sphere);
            // 回転するエネルギーリング
            for (let i = 0; i < 3; i++) {
                const ring = document.createElement('div');
                ring.className = 'vfx-aura-ring';
                ring.style.setProperty('--delay', `${i * 0.15}s`);
                ring.style.setProperty('--angle', `${i * 60}deg`);
                el.appendChild(ring);
            }
            // 波紋エフェクト
            const ripple = document.createElement('div'); ripple.className = 'vfx-aura-ripple';
            el.appendChild(ripple);
            // 着弾衝撃波
            const impact = document.createElement('div'); impact.className = 'vfx-aura-impact';
            el.appendChild(impact);
            vfx.appendChild(el);
        } else if (skillId === 'scarlet_storm') { // 優木せつ菜：多層爆発演出
            const screen = document.getElementById('battle-screen');
            // 衝撃の瞬間に反転と揺れ（50%タイミング前後）
            setTimeout(() => {
                screen.classList.add('void-invert', 'screen-shake');
                setTimeout(() => screen.classList.remove('void-invert', 'screen-shake'), 300);
            }, 450);

            const el = document.createElement('div'); el.className = 'vfx-scarlet-storm';
            let layers = '<div class="vfx-explosion-layer outer"></div>' +
                '<div class="vfx-explosion-layer mid"></div>' +
                '<div class="vfx-explosion-layer inner"></div>';
            // 放射状の閃光を生成
            for (let i = 0; i < 12; i++) {
                layers += `<div class="vfx-flare" style="--r:${i * 30}deg"></div>`;
            }
            el.innerHTML = layers;
            vfx.appendChild(el);
        } else if (skillId === 'fusion_crust') { // セラス：フュージョンクラスト
            const el = document.createElement('div'); el.className = 'vfx-fusion-crust';
            // 赤い魔法陣
            const circle = document.createElement('div'); circle.className = 'vfx-blood-circle';
            el.appendChild(circle);
            // 血液のような赤い粒子（16個）
            for (let i = 0; i < 16; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-blood-particle';
                const angle = (i / 16) * Math.PI * 2;
                particle.style.setProperty('--angle', `${angle}rad`);
                particle.style.setProperty('--delay', `${i * 0.03}s`);
                el.appendChild(particle);
            }
            // 十字の光
            const cross = document.createElement('div'); cross.className = 'vfx-revival-cross';
            el.appendChild(cross);
            // 蘇生の赤い光
            const glow = document.createElement('div'); glow.className = 'vfx-revival-glow';
            el.appendChild(glow);
            vfx.appendChild(el);
        } else if (skillId === 'doshatto') { // 黒尾鉄朗：ドシャット
            const el = document.createElement('div'); el.className = 'vfx-doshatto';
            // 金属の壁
            const wall = document.createElement('div'); wall.className = 'vfx-metal-wall';
            el.appendChild(wall);
            // 六角形バリアパターン（7個）
            for (let i = 0; i < 7; i++) {
                const hex = document.createElement('div');
                hex.className = 'vfx-hex-barrier';
                hex.style.setProperty('--index', i);
                hex.style.setProperty('--delay', `${i * 0.08}s`);
                el.appendChild(hex);
            }
            // 反撃オーラ（赤い炎）
            const counter = document.createElement('div'); counter.className = 'vfx-counter-aura';
            el.appendChild(counter);
            vfx.appendChild(el);
        } else if (skillId === 'delorieran') { // 若菜四季：デロリエラン
            const el = document.createElement('div'); el.className = 'vfx-delorieran';
            // 紫の魔力粒子（20個）
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-mp-particle';
                particle.style.setProperty('--delay', `${i * 0.03}s`);
                particle.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
                el.appendChild(particle);
            }
            // 音符型光粒子（8個）
            for (let i = 0; i < 8; i++) {
                const note = document.createElement('div');
                note.className = 'vfx-music-note';
                note.textContent = '♪';
                note.style.setProperty('--delay', `${0.3 + i * 0.05}s`);
                note.style.setProperty('--angle', `${i * 45}deg`);
                el.appendChild(note);
            }
            // 紫の光の柱
            const pillar = document.createElement('div'); pillar.className = 'vfx-mp-pillar';
            el.appendChild(pillar);
            vfx.appendChild(el);
        } else if (skillId === 'ice_wall') { // 轟焦凍：穿天氷壁
            const screen = document.getElementById('battle-screen');
            // 青白フラッシュ（1.0秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 200);
            }, 1000);

            const el = document.createElement('div'); el.className = 'vfx-ice-wall';
            // 氷の成長エフェクト
            const growth = document.createElement('div'); growth.className = 'vfx-ice-growth';
            el.appendChild(growth);
            // 巨大な氷の壁（7本の柱で構成）
            for (let i = 0; i < 7; i++) {
                const pillar = document.createElement('div');
                pillar.className = 'vfx-ice-pillar';
                pillar.style.setProperty('--index', i);
                pillar.style.setProperty('--delay', `${i * 0.05}s`);
                el.appendChild(pillar);
            }
            // 氷の破片（12個）
            for (let i = 0; i < 12; i++) {
                const shard = document.createElement('div');
                shard.className = 'vfx-ice-shard';
                const angle = (i / 12) * Math.PI * 2;
                shard.style.setProperty('--angle', `${angle}rad`);
                shard.style.setProperty('--delay', `${0.8 + i * 0.02}s`);
                el.appendChild(shard);
            }
            // 冷気の霧
            const mist = document.createElement('div'); mist.className = 'vfx-ice-mist';
            el.appendChild(mist);
            vfx.appendChild(el);
        } else if (skillId === 'raikiri') { // はたけカカシ
            const el = document.createElement('div'); el.className = 'vfx-raikiri-arc';
            // SVGでテーパーのついた鋭いポリゴン雷を描画
            el.innerHTML = `
                <svg width="150" height="350" viewBox="0 0 150 350" style="overflow:visible;">
                    <!-- メイン: 下から上へ先細り (座標は計算済み) -->
                    <polygon points="70,350 80,350 60,300 100,250 50,180 90,100 65,50 75,0 75,0 65,50 82,100 42,180 92,250 52,300" class="raikiri-shape" />

                    <!-- 分岐: 細いテーパー -->
                    <polygon points="55,300 58,300 30,280" class="raikiri-shape branch" />
                    <polygon points="45,180 48,180 20,150" class="raikiri-shape branch" />
                    <polygon points="85,100 88,100 115,70" class="raikiri-shape branch" />
                </svg>
            `;

            const impact = document.createElement('div');
            impact.className = 'vfx-raikiri-impact';
            el.appendChild(impact);
            vfx.appendChild(el);

            // 0.5秒後にフェードアウト開始
            setTimeout(() => el.classList.add('fade-out'), 500);

            // 画面一瞬反転
            const screen = document.getElementById('battle-screen');
            setTimeout(() => screen.classList.add('void-invert'), 150);
            setTimeout(() => screen.classList.remove('void-invert'), 350);
        } else if (skillId === 'erasure') { // 相澤消太：抹消
            const screen = document.getElementById('battle-screen');
            // グレースケール化と暗転（0.9秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 300);
            }, 900);

            const el = document.createElement('div'); el.className = 'vfx-erasure';
            // 赤く光る目
            const eye1 = document.createElement('div'); eye1.className = 'vfx-erasure-eye left';
            const eye2 = document.createElement('div'); eye2.className = 'vfx-erasure-eye right';
            el.appendChild(eye1);
            el.appendChild(eye2);
            // 赤い視線ビーム
            const beam = document.createElement('div'); beam.className = 'vfx-erasure-beam';
            el.appendChild(beam);
            // 包帯（5本）
            for (let i = 0; i < 5; i++) {
                const band = document.createElement('div');
                band.className = 'vfx-erasure-band';
                band.style.setProperty('--index', i);
                band.style.setProperty('--delay', `${0.6 + i * 0.05}s`);
                el.appendChild(band);
            }
            // グレースケールフィルター
            const gray = document.createElement('div'); gray.className = 'vfx-grayscale-filter';
            el.appendChild(gray);
            vfx.appendChild(el);
        } else if (skillId === 'solitude_rain') { // 桜坂しずく：Solitude Rain
            const el = document.createElement('div'); el.className = 'vfx-solitude-rain';
            // 暗い雨雲
            const cloud = document.createElement('div'); cloud.className = 'vfx-rain-cloud';
            el.appendChild(cloud);
            // 紫の毒雨（25粒）
            for (let i = 0; i < 25; i++) {
                const drop = document.createElement('div');
                drop.className = 'vfx-raindrop';
                drop.style.setProperty('--delay', `${i * 0.04}s`);
                drop.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
                drop.style.setProperty('--duration', `${0.6 + Math.random() * 0.3}s`);
                el.appendChild(drop);
            }
            // 紫の水たまり
            const puddle = document.createElement('div'); puddle.className = 'vfx-poison-puddle';
            el.appendChild(puddle);
            // 毒の霧
            const mist = document.createElement('div'); mist.className = 'vfx-poison-mist';
            el.appendChild(mist);
            vfx.appendChild(el);
        } else if (skillId === 'star_platinum') { // 空条承太郎
            // 高速ラッシュ演出：画面揺れ＋連続衝撃波
            const screen = document.getElementById('battle-screen');
            screen.classList.add('screen-shake-rapid');
            setTimeout(() => screen.classList.remove('screen-shake-rapid'), 150);

            // 拳の軌跡エフェクト（複数レイヤー）
            const rush = document.createElement('div');
            rush.className = 'vfx-star-platinum-rush';

            // 連続パンチの軌跡を表現
            for (let i = 0; i < 5; i++) {
                const fist = document.createElement('div');
                fist.className = 'vfx-punch-trail';
                fist.style.setProperty('--angle', `${(i - 2) * 15}deg`);
                fist.style.setProperty('--delay', `${i * 0.02}s`);
                rush.appendChild(fist);
            }

            // 衝撃波
            const impact = document.createElement('div');
            impact.className = 'vfx-star-platinum-impact';
            rush.appendChild(impact);

            vfx.appendChild(rush);
        } else if (skillId === 'divine_departure') { // シャンクス：神避
            const screen = document.getElementById('battle-screen');
            // 暗転（0.4秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 100);
            }, 400);
            // 画面揺れ（0.7秒後）
            setTimeout(() => {
                screen.classList.add('screen-shake');
                setTimeout(() => screen.classList.remove('screen-shake'), 300);
            }, 700);

            const el = document.createElement('div'); el.className = 'vfx-divine-departure';
            // 黒赤の覇気オーラ
            const aura = document.createElement('div'); aura.className = 'vfx-haki-aura';
            el.appendChild(aura);
            // X字斬撃（2本）
            const slash1 = document.createElement('div'); slash1.className = 'vfx-haki-slash slash1';
            const slash2 = document.createElement('div'); slash2.className = 'vfx-haki-slash slash2';
            el.appendChild(slash1);
            el.appendChild(slash2);
            // 雷光エフェクト（6本）
            for (let i = 0; i < 6; i++) {
                const bolt = document.createElement('div');
                bolt.className = 'vfx-haki-bolt';
                bolt.style.setProperty('--angle', `${i * 60}deg`);
                bolt.style.setProperty('--delay', `${0.7 + i * 0.02}s`);
                el.appendChild(bolt);
            }
            // 衝撃波リング
            const shockwave = document.createElement('div'); shockwave.className = 'vfx-haki-shockwave';
            el.appendChild(shockwave);
            vfx.appendChild(el);
        } else if (skillId === 'gmax') { // カメックス：キョダイマックス
            const screen = document.getElementById('battle-screen');
            // 画面大揺れ（1.3秒後）
            setTimeout(() => {
                screen.classList.add('screen-shake');
                setTimeout(() => screen.classList.remove('screen-shake'), 300);
            }, 1300);

            const el = document.createElement('div'); el.className = 'vfx-gmax';
            // 地面の亀裂（8本）
            for (let i = 0; i < 8; i++) {
                const crack = document.createElement('div');
                crack.className = 'vfx-gmax-crack';
                crack.style.setProperty('--angle', `${i * 45}deg`);
                crack.style.setProperty('--delay', `${i * 0.05}s`);
                el.appendChild(crack);
            }
            // 巨大な影シルエット
            const shadow = document.createElement('div'); shadow.className = 'vfx-gmax-shadow';
            el.appendChild(shadow);
            // 赤い衝撃波（3段階）
            for (let i = 0; i < 3; i++) {
                const wave = document.createElement('div');
                wave.className = 'vfx-gmax-wave';
                wave.style.setProperty('--delay', `${1.0 + i * 0.15}s`);
                wave.style.setProperty('--scale', 1 + i * 0.3);
                el.appendChild(wave);
            }
            // 稲妻（10本）
            for (let i = 0; i < 10; i++) {
                const lightning = document.createElement('div');
                lightning.className = 'vfx-gmax-lightning';
                lightning.style.setProperty('--angle', `${i * 36}deg`);
                lightning.style.setProperty('--delay', `${1.3 + i * 0.02}s`);
                el.appendChild(lightning);
            }
            vfx.appendChild(el);
        } else if (skillId === 'koikaze') { // 高垣楓：こいかぜ
            const el = document.createElement('div'); el.className = 'vfx-koikaze';
            // 薄緑の風の波（5本）
            for (let i = 0; i < 5; i++) {
                const wind = document.createElement('div');
                wind.className = 'vfx-wind-wave';
                wind.style.setProperty('--delay', `${i * 0.08}s`);
                wind.style.setProperty('--height', `${20 + i * 15}px`);
                el.appendChild(wind);
            }
            // 桜の花びらのような光粒子（20個）
            for (let i = 0; i < 20; i++) {
                const petal = document.createElement('div');
                petal.className = 'vfx-sakura-petal';
                petal.style.setProperty('--delay', `${0.4 + i * 0.03}s`);
                petal.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
                petal.style.setProperty('--rotation', `${Math.random() * 360}deg`);
                el.appendChild(petal);
            }
            // 緑の癒しの光
            const heal = document.createElement('div'); heal.className = 'vfx-heal-glow';
            el.appendChild(heal);
            vfx.appendChild(el);
        } else if (skillId === 'inhale') { // カービィ：吸い込み
            const el = document.createElement('div'); el.className = 'vfx-inhale';
            // ピンクの渦巻き（3重）
            for (let i = 0; i < 3; i++) {
                const spiral = document.createElement('div');
                spiral.className = 'vfx-inhale-spiral';
                spiral.style.setProperty('--delay', `${i * 0.1}s`);
                spiral.style.setProperty('--size', `${150 - i * 30}px`);
                el.appendChild(spiral);
            }
            // 状態異常粒子（紫/緑/赤、各5個）
            const colors = ['#a855f7', '#22c55e', '#ef4444'];
            for (let c = 0; c < 3; c++) {
                for (let i = 0; i < 5; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'vfx-status-particle';
                    particle.style.setProperty('--color', colors[c]);
                    particle.style.setProperty('--angle', `${(c * 5 + i) * 24}deg`);
                    particle.style.setProperty('--delay', `${i * 0.05}s`);
                    el.appendChild(particle);
                }
            }
            // 浄化の白い光
            const purify = document.createElement('div'); purify.className = 'vfx-purify-light';
            el.appendChild(purify);
            // キラキラ粒子（12個）
            for (let i = 0; i < 12; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'vfx-sparkle';
                sparkle.style.setProperty('--angle', `${i * 30}deg`);
                sparkle.style.setProperty('--delay', `${0.8 + i * 0.02}s`);
                el.appendChild(sparkle);
            }
            vfx.appendChild(el);
        } else if (skillId === 'shiny_tornado') { // マリ：シャイニートルネード
            const el = document.createElement('div'); el.className = 'vfx-shiny-tornado';
            // 金色の光粒子螺旋（30個）
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-tornado-particle';
                const height = (i / 30) * 180;
                const angle = (i / 30) * Math.PI * 6; // 3回転
                particle.style.setProperty('--y', `${-height}px`);
                particle.style.setProperty('--angle', `${angle}rad`);
                particle.style.setProperty('--delay', `${i * 0.015}s`);
                el.appendChild(particle);
            }
            // 竜巻本体
            const tornado = document.createElement('div'); tornado.className = 'vfx-tornado-core';
            el.appendChild(tornado);
            // ピーク時のキラキラ爆発（15個）
            for (let i = 0; i < 15; i++) {
                const burst = document.createElement('div');
                burst.className = 'vfx-tornado-burst';
                burst.style.setProperty('--angle', `${i * 24}deg`);
                burst.style.setProperty('--delay', `${0.8 + i * 0.02}s`);
                el.appendChild(burst);
            }
            vfx.appendChild(el);
        } else if (skillId === 'burst_stream') { // 青眼の白龍：滅びの爆裂疾風弾
            const screen = document.getElementById('battle-screen');
            // 青白画面反転（0.8秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 300);
            }, 800);

            // チャージエフェクト（actor側）
            const actorEl = document.querySelector(this.getUnitSelector(actor));
            if (actorEl) {
                const chargeVfx = document.createElement('div');
                chargeVfx.className = 'vfx-container';
                actorEl.appendChild(chargeVfx);
                const charge = document.createElement('div');
                charge.className = 'vfx-burst-charge';
                chargeVfx.appendChild(charge);
                setTimeout(() => chargeVfx.remove(), 1000);
            }

            // ビーム軌跡（発射元から対象へ）
            const actorUnitEl = document.querySelector(this.getUnitSelector(actor));
            const actorImg = actorUnitEl ? actorUnitEl.querySelector('img') : null;
            const actorRect = (actorImg || actorUnitEl)?.getBoundingClientRect();

            const targetUnitEl = document.querySelector(this.getUnitSelector(target));
            const targetImg = targetUnitEl ? targetUnitEl.querySelector('img') : null;
            const targetRect = (targetImg || targetUnitEl)?.getBoundingClientRect();

            if (actorRect && targetRect) {
                const screenRect = screen.getBoundingClientRect();
                const x1 = actorRect.left + actorRect.width / 2 - screenRect.left;
                const y1 = actorRect.top + actorRect.height / 2 - screenRect.top;
                const x2 = targetRect.left + targetRect.width / 2 - screenRect.left;
                const y2 = targetRect.top + targetRect.height / 2 - screenRect.top;

                const dx = x2 - x1;
                const dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                const beamLine = document.createElement('div');
                beamLine.className = 'vfx-burst-beam-line';
                beamLine.style.setProperty('--x1', `${x1}px`);
                beamLine.style.setProperty('--y1', `${y1}px`);
                beamLine.style.setProperty('--length', `${length}px`);
                beamLine.style.setProperty('--angle', `${angle}deg`);

                screen.appendChild(beamLine);
                setTimeout(() => beamLine.remove(), 1300);

                // 爆発エフェクト（ターゲット位置にグローバル配置）
                const globalVfx = document.createElement('div');
                globalVfx.className = 'vfx-burst-stream-global';
                globalVfx.style.setProperty('--x', `${x2}px`);
                globalVfx.style.setProperty('--y', `${y2}px`);
                screen.appendChild(globalVfx);
                setTimeout(() => globalVfx.remove(), 2000);

                // 爆発本体
                const explosion = document.createElement('div'); explosion.className = 'vfx-burst-explosion';
                globalVfx.appendChild(explosion);
                // 回転する光粒子（20個）
                for (let i = 0; i < 20; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'vfx-beam-particle';
                    particle.style.setProperty('--delay', `${0.5 + i * 0.02}s`);
                    particle.style.setProperty('--angle', `${i * 18}deg`);
                    globalVfx.appendChild(particle);
                }
                // 十字の光爆発
                const cross = document.createElement('div'); cross.className = 'vfx-burst-cross';
                globalVfx.appendChild(cross);
            } else {
                // フォールバック：通常通り `vfx` に追加（座標計算失敗時）
                const el = document.createElement('div'); el.className = 'vfx-burst-stream';
                // 爆発エフェクト
                const explosion = document.createElement('div'); explosion.className = 'vfx-burst-explosion';
                el.appendChild(explosion);
                vfx.appendChild(el);
            }
        } else if (skillId === 'pineapple_stake') { // マルコ：鳳梨磔
            const el = document.createElement('div'); el.className = 'vfx-pineapple-stake';
            // 青い炎の羽根（7枚）
            for (let i = 0; i < 7; i++) {
                const feather = document.createElement('div');
                feather.className = 'vfx-phoenix-feather';
                feather.style.setProperty('--delay', `${i * 0.07}s`);
                feather.style.setProperty('--x', `${(i - 3) * 30}px`);
                el.appendChild(feather);
            }
            // 青い炎の粒子（接触時、15個）
            for (let i = 0; i < 15; i++) {
                const flame = document.createElement('div');
                flame.className = 'vfx-blue-flame-particle';
                flame.style.setProperty('--angle', `${i * 24}deg`);
                flame.style.setProperty('--delay', `${0.5 + i * 0.02}s`);
                el.appendChild(flame);
            }
            // 癒しの光
            const heal = document.createElement('div'); heal.className = 'vfx-phoenix-heal';
            el.appendChild(heal);
            vfx.appendChild(el);
        } else if (skillId === 'big_light') { // ドラえもん：ビッグライト
            const el = document.createElement('div'); el.className = 'vfx-big-light';
            // 青白い光の輪
            const ring = document.createElement('div'); ring.className = 'vfx-light-ring';
            el.appendChild(ring);
            // 光の粒子（全方位、24個）
            for (let i = 0; i < 24; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-light-particle';
                particle.style.setProperty('--angle', `${i * 15}deg`);
                particle.style.setProperty('--delay', `${0.4 + i * 0.01}s`);
                el.appendChild(particle);
            }
            // 光の波紋
            const ripple = document.createElement('div'); ripple.className = 'vfx-light-ripple';
            el.appendChild(ripple);
            // 金色のオーラ
            const aura = document.createElement('div'); aura.className = 'vfx-power-aura';
            el.appendChild(aura);
            vfx.appendChild(el);
        } else if (skillId === 'judrajim') { // フリーレン：ジュドラジルム
            const screen = document.getElementById('battle-screen');
            // 紫画面反転（0.9秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 300);
            }, 900);

            const el = document.createElement('div'); el.className = 'vfx-judrajim';
            // 紫の魔法陣
            const circle = document.createElement('div'); circle.className = 'vfx-thunder-circle';
            el.appendChild(circle);
            // 巨大な紫雷（SVGで3本、太く美しく）
            for (let i = 0; i < 3; i++) {
                const bolt = document.createElement('div');
                bolt.className = 'vfx-thunder-bolt';
                bolt.innerHTML = `
                    <svg width="80" height="200" viewBox="0 0 80 200" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="thunderGradient${i}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:#c084fc;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#d946ef;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <polygon points="35,0 45,0 28,60 52,60 20,120 36,120 10,200 45,100 30,100 50,40 38,40"
                                 fill="url(#thunderGradient${i})"
                                 stroke="#fff" stroke-width="1"
                                 class="thunder-shape" />
                        <polygon points="32,70 35,70 18,100" fill="url(#thunderGradient${i})" stroke="#fff" stroke-width="0.5" opacity="0.8" />
                        <polygon points="48,50 51,50 62,75" fill="url(#thunderGradient${i})" stroke="#fff" stroke-width="0.5" opacity="0.8" />
                    </svg>
                `;
                bolt.style.setProperty('--x', `${(i - 1) * 60}px`);
                bolt.style.setProperty('--delay', `${0.5 + i * 0.1}s`);
                el.appendChild(bolt);
            }
            // 放射状の紫電撃（12本）
            for (let i = 0; i < 12; i++) {
                const spark = document.createElement('div');
                spark.className = 'vfx-electric-spark';
                spark.style.setProperty('--angle', `${i * 30}deg`);
                spark.style.setProperty('--delay', `${0.9 + i * 0.02}s`);
                el.appendChild(spark);
            }
            vfx.appendChild(el);
        }

        // === ボス固有技 ===
        else if (skillId === 'baikin_punch') { // ばいきんまん
            const el = document.createElement('div'); el.className = 'vfx-baikin-punch'; vfx.appendChild(el);
        } else if (skillId === 'poison_spray') { // ギギネブラ
            const el = document.createElement('div'); el.className = 'vfx-poison-spray';
            el.innerHTML = '<div class="vfx-poison-cloud"></div><div class="vfx-poison-cloud"></div><div class="vfx-poison-cloud"></div>';
            vfx.appendChild(el);
        } else if (skillId === 'kusanagi_sword') { // 大蛇丸
            const el = document.createElement('div'); el.className = 'vfx-kusanagi';
            el.innerHTML = '<div class="vfx-snake"></div>';
            vfx.appendChild(el);
        } else if (skillId === 'cursed_spirit_manipulation') { // 夏油傑
            const el = document.createElement('div'); el.className = 'vfx-cursed-spirit'; vfx.appendChild(el);
        } else if (skillId === 'stone_edge') { // バンギラス
            [...Array(4)].forEach((_, i) => {
                const rock = document.createElement('div');
                rock.className = 'vfx-rock-pro';
                rock.setAttribute('style', `--x:${(i - 1.5) * 30}px; --d:${i * 0.1}s; --b:${1 - i * 0.1};`);
                vfx.appendChild(rock);
            });
        }
        // 2幕ラスボス
        else if (skillId === 'death_ball') { // フリーザ
            const el = document.createElement('div'); el.className = 'vfx-death-ball'; vfx.appendChild(el);
        } else if (skillId === 'za_warudo') { // ディオ
            const el = document.createElement('div'); el.className = 'vfx-za-warudo'; vfx.appendChild(el);
            document.getElementById('battle-screen').classList.add('void-invert'); // 時止め演出として反転も使う
            setTimeout(() => document.getElementById('battle-screen').classList.remove('void-invert'), 800);
        } else if (skillId === 'kyoka_suigetsu') { // 愛染惣右介
            const el = document.createElement('div'); el.className = 'vfx-kyoka-suigetsu'; vfx.appendChild(el);
        } else if (skillId === 'photon_geyser') { // ウルトラネクロズマ
            const el = document.createElement('div'); el.className = 'vfx-photon-geyser'; vfx.appendChild(el);
        } else if (skillId === 'grand_slam') { // マスターハンド
            const el = document.createElement('div'); el.className = 'vfx-grand-slam'; vfx.appendChild(el);
        } else if (skillId === 'decay') { // 死柄木弔
            const el = document.createElement('div'); el.className = 'vfx-decay';
            [...Array(8)].forEach(() => {
                const crack = document.createElement('div');
                crack.className = 'vfx-crack';
                el.appendChild(crack);
            });
            vfx.appendChild(el);
        } else if (skillId === 'koopa_breath') { // クッパ
            const el = document.createElement('div'); el.className = 'vfx-koopa-breath';
            el.innerHTML = '<div class="vfx-fire-stream"></div>';
            vfx.appendChild(el);
        }

        // === 汎用エフェクト ===
        else if (skillId === 'defense_boost' || skillId === 'iron_wall' || skill && skill.type === 'buff') {
            // 防御・バフ汎用
            const el = document.createElement('div'); el.className = 'shield-aura'; vfx.appendChild(el);
        } else if (!isPhysical) {
            // 汎用・固有魔法：SVG魔方陣
            const circle = document.createElement('div');
            circle.className = 'vfx-magic-circle-pro';
            vfx.appendChild(circle);
        } else {
            // 汎用・固有物理：ダブルプロ斬撃
            const s1 = document.createElement('div'); s1.className = 'vfx-slash-pro'; s1.style.setProperty('--r', '-30deg');
            const s2 = document.createElement('div'); s2.className = 'vfx-slash-pro'; s2.style.setProperty('--r', '60deg');
            vfx.appendChild(s1); vfx.appendChild(s2);
        }

        // 可可の星屑クルージング：5つの星を生成してボリュームアップ
        if (skillId === 'taunt' && actor.id === 'keke') {
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('div');
                star.className = 'vfx-star-particle';
                star.innerText = '★';
                star.style.setProperty('--delay', `${i * 0.1}s`);
                star.style.setProperty('--angle', `${i * 72}deg`);
                vfx.appendChild(star);
            }
        }

        // ダメージ発生タイミング：演出強化に合わせて調整
        const vfxDuration =
            (skillId === 'taunt' && actor.id === 'keke') ? 1300 :
                (skillId === 'ultra_attack' && actor.id === 'sky') ? 1200 :
                    (skillId === 'daten_bind') ? 1500 : // 堕天龍鳳凰縛: 1.5s
                        (skillId === 'heal' && actor.id === 'josuke') ? 1200 : // クレイジーD: 1.2s
                            (skillId === 'aura_sphere') ? 1300 : // はどうだん: 1.3s
                                (skillId === 'scarlet_storm') ? 1200 : // スカーレットストーム: 1.2s
                                    (skillId === 'fusion_crust') ? 1400 : // フュージョンクラスト: 1.4s
                                        (skillId === 'doshatto') ? 1000 : // ドシャット: 1.0s
                                            (skillId === 'delorieran') ? 1100 : // デロリエラン: 1.1s
                                                (skillId === 'ice_wall') ? 1200 : // 穿天氷壁: 1.2s
                                                    (skillId === 'erasure') ? 1200 : // 抹消: 1.2s
                                                        (skillId === 'solitude_rain') ? 1300 : // Solitude Rain: 1.3s
                                                            (skillId === 'raikiri') ? 600 : // 雷切: 0.6s
                                                                (skillId === 'star_platinum') ? 100 : // スタープラチナ: 0.1s
                                                                    (skillId === 'divine_departure') ? 1200 : // 神避: 1.2s
                                                                        (skillId === 'gmax') ? 1600 : // キョダイマックス: 1.6s
                                                                            (skillId === 'koikaze') ? 1100 : // こいかぜ: 1.1s
                                                                                (skillId === 'inhale') ? 1000 : // 吸い込み: 1.0s
                                                                                    (skillId === 'shiny_tornado') ? 1200 : // シャイニートルネード: 1.2s
                                                                                        (skillId === 'burst_stream') ? 1300 : // 滅びの爆裂疾風弾: 1.3s
                                                                                            (skillId === 'pineapple_stake') ? 1100 : // 鳳梨磔: 1.1s
                                                                                                (skillId === 'big_light') ? 1000 : // ビッグライト: 1.0s
                                                                                                    (skillId === 'judrajim') ? 1400 : // ジュドラジルム: 1.4s
                                                                                                        1000;

        // ダメージタイミング：基本50%だが、技によっては微調整
        let damageTiming = vfxDuration * 0.5;
        // 通常攻撃（スキルIDがない場合）は0.3秒
        if (!skillId || skillId === 'normal_attack') damageTiming = 300;

        // Raikiriは1000ms / 0.5 = 500msの標準タイミングを使用するため削除
        if (skillId === 'aura_sphere') damageTiming = 1000; // 発射後
        if (skillId === 'burst_stream') damageTiming = 1000; // 爆発演出に合わせる
        if (skillId === 'heal' && actor.id === 'josuke') damageTiming = 600; // 50%地点で回復
        if (skillId === 'star_platinum') damageTiming = 0; // 即時ダメージ表示

        // エフェクト消去は裏側で行い（500msの余韻を追加）、ダメージ処理には早めに完了を報告する
        setTimeout(() => vfx.remove(), vfxDuration + 500);
        await this.delay(damageTiming);
    }

    getUnitSelector(unit) {
        const isEnemy = this.state.battle.enemies.includes(unit);
        const idx = isEnemy ? this.state.battle.enemies.indexOf(unit) : this.state.party.indexOf(unit);
        return isEnemy ? `[data-enemy-index="${idx}"]` : `[data-ally-index="${idx}"]`;
    }

    // 古い画像エフェクト関数（getDefaultVisualEffect, showImpactEffect）は廃止

    showFlashEffect(target, color) {
        const isEnemy = this.state.battle.enemies.includes(target);
        const index = isEnemy ? this.state.battle.enemies.indexOf(target) : this.state.party.indexOf(target);
        const selector = isEnemy ? `[data-enemy-index="${index}"]` : `[data-ally-index="${index}"]`;
        const unitEl = document.querySelector(selector);
        if (!unitEl) return;
        unitEl.classList.add(`flash-${color}`);
        setTimeout(() => unitEl.classList.remove(`flash-${color}`), 300);
    }

    async showEffectIcon(target, skill, effectType, statusType = null) {
        const unitSelector = this.getUnitSelector(target);
        const unitEl = document.querySelector(unitSelector);
        if (!unitEl) return;

        // 防御・軽減・挑発：洗練されたシールドオーラ演出
        if (effectType === 'shield' || statusType === 'defending' || effectType === 'taunt' || effectType === 'damageReduction') {
            const shield = document.createElement('div');
            shield.className = 'shield-aura';
            unitEl.appendChild(shield);
            setTimeout(() => shield.remove(), 800);
            await this.delay(400);
            return;
        }

        // バフ・回復は「金」、デバフ・異常は「紫」の光のみ（絵文字は一切出さない）
        const flashColor = (effectType === 'buff' || effectType === 'heal' || effectType === 'revive') ? 'gold' : 'purple';
        this.showFlashEffect(target, flashColor);
        await this.delay(300);
    }

    async showCriticalEffect() {
        // 中央の演出は廃止（applyDamage時のポップアップに統合）
        return Promise.resolve();
    }

    // 反撃処理ロジック（全属性対応・指定倍率準拠）
    async processCounter(defender, attacker) {
        // 反撃側・攻撃側が共に生存している必要がある
        if (defender.currentHp <= 0 || attacker.currentHp <= 0) return;

        // カウンター状態の確認
        const counter = defender.statusEffects.find(e => e.type === 'counter');
        if (counter) {
            await this.delay(500);
            this.addLog(`${defender.displayName}の反撃！`);

            // 反撃演出（物理・魔法問わず現在の設定倍率で殴り返す）
            await this.showAttackEffect(defender, attacker, null, 'physical');

            // 倍率計算（counter.power に格納された150%や180%を使用）
            const cDamage = this.calculateDamage(defender, attacker, 'physical', counter.power || 100);
            this.applyDamage(attacker, cDamage);
            this.addLog(`${attacker.displayName}に${cDamage.value}ダメージ！`);

            await this.delay(500);
        }
    }
}

// ゲーム開始
const game = new Game();