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
            battle: null,
            currentTab: 'all',
            selectedChar: null // For 2-step selection
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
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;
        container.appendChild(toast);

        // Remove after animation
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
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
            // Default close button
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
    }

    closeModal() {
        document.getElementById('custom-modal').classList.add('hidden');
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
                    { text: 'キャンセル', onClick: () => this.closeModal(), className: 'btn-primary' },
                    {
                        text: 'はじめる',
                        onClick: () => {
                            this.closeModal();
                            this.clearSaveData();
                            this.showPartyScreen();
                        },
                        className: 'btn-danger' // Style definition needed if not exists, defaulting to primary if not handled in css
                    }
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

        // 休憩ボタン
        document.querySelectorAll('.rest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleRest(e.target.dataset.type);
            });
        });

        // モーダル背景タップで閉じる設定
        const modalOverlays = ['custom-modal', 'character-detail-modal', 'item-modal'];
        modalOverlays.forEach(id => {
            const overlay = document.getElementById(id);
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    // クリックされたのが背景（オーバーレイ自体）である場合のみ閉じる
                    if (e.target === overlay) {
                        if (id === 'custom-modal') this.closeModal();
                        else if (id === 'character-detail-modal') this.closeCharacterDetail();
                        else if (id === 'item-modal') this.closeItemModal();
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
    }

    // パーティ編成画面表示
    showPartyScreen() {
        this.state.party = [];
        this.state.selectedChar = null;
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

        // Create Select Element
        const select = document.createElement('select');
        select.id = 'party-filter';

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
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.state.currentTab = e.target.value;
            this.renderCharacterList(); // Re-render list with filter
        });

        tabsContainer.appendChild(select);
    }

    // キャラクター一覧描画（タブフィルター対応）
    renderCharacterList() {
        const list = document.getElementById('character-list');
        list.innerHTML = '';

        let chars = Object.values(CHARACTERS);

        if (this.state.currentTab !== 'all') {
            chars = chars.filter(c => c.type === this.state.currentTab);
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
        let didLongPress = false;

        const startPress = (e) => {
            didLongPress = false;
            pressTimer = setTimeout(() => {
                didLongPress = true;
                callback();
            }, 500);
        };

        const endPress = () => {
            clearTimeout(pressTimer);
        };

        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', endPress);
        element.addEventListener('mouseleave', endPress);
        element.addEventListener('touchstart', startPress);
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
        this.state.currentAct = 1;
        this.state.currentNode = 0;
        this.state.items = { hp_potion: 0, mp_potion: 0, revive_stone: 0, stat_crystal: 0 };
        this.generateMap();
        this.showMapScreen();
    }

    // マップ生成
    generateMap() {
        const config = this.state.currentAct === 1 ? MAP_CONFIG.act1 : MAP_CONFIG.act2;
        const layers = [];
        const layerCount = 10;

        // 1. 各階層のノード生成
        for (let l = 0; l < layerCount; l++) {
            const layerNodes = [];
            let nodeCount;

            if (l === 0) nodeCount = 3; // 開始地点は3つ
            else if (l === layerCount - 1) nodeCount = 1; // ボスは1つ
            else nodeCount = Math.floor(Math.random() * 2) + 2; // 道中は2-3分岐

            for (let i = 0; i < nodeCount; i++) {
                let type = 'battle';

                if (l === 0) {
                    type = 'battle';
                } else if (l === layerCount - 1) {
                    type = 'boss';
                } else {
                    // 確率に基づくタイプ決定
                    const rand = Math.random();
                    if (l === 4) { // 中盤に休憩/宝箱
                        type = this.state.currentAct === 2 ? 'treasure' : 'rest';
                    } else if (l === 8) { // ボス前は休憩
                        type = 'rest';
                    } else {
                        if (rand < 0.60) type = 'battle';
                        else if (rand < 0.85) type = 'event';
                        else if (rand < 0.95) type = 'elite'; // エリート
                        else type = 'battle'; // 残りはバトル
                    }
                }

                layerNodes.push({
                    id: `${l}-${i}`,
                    layer: l,
                    index: i,
                    type: type,
                    nextNodes: [],
                    completed: false,
                    status: (l === 0) ? 'available' : 'locked'
                });
            }
            layers.push(layerNodes);
        }

        // 2. パス生成（ノード接続）
        for (let l = 0; l < layerCount - 1; l++) {
            const currentLayer = layers[l];
            const nextLayer = layers[l + 1];

            currentLayer.forEach(node => {
                const currentPos = node.index / (currentLayer.length - 1 || 1);

                nextLayer.forEach((nextNode, nextIdx) => {
                    const nextPos = nextIdx / (nextLayer.length - 1 || 1);
                    const diff = Math.abs(currentPos - nextPos);

                    if (diff < 0.6 || nextLayer.length === 1 || currentLayer.length === 1) {
                        if (Math.random() > 0.3 || nextLayer.length === 1) {
                            node.nextNodes.push(nextIdx);
                        }
                    }
                });

                if (node.nextNodes.length === 0) {
                    let closestIdx = 0;
                    let minDiff = 100;
                    nextLayer.forEach((n, idx) => {
                        const nextPos = idx / (nextLayer.length - 1 || 1);
                        const diff = Math.abs(currentPos - nextPos);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestIdx = idx;
                        }
                    });
                    node.nextNodes.push(closestIdx);
                }
            });

            nextLayer.forEach((nextNode, idx) => {
                const hasParent = currentLayer.some(n => n.nextNodes.includes(idx));
                if (!hasParent) {
                    let closestParent = currentLayer[0];
                    let minDiff = 100;
                    const nextPos = idx / (nextLayer.length - 1 || 1);

                    currentLayer.forEach(p => {
                        const pPos = p.index / (currentLayer.length - 1 || 1);
                        const diff = Math.abs(pPos - nextPos);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestParent = p;
                        }
                    });
                    closestParent.nextNodes.push(idx);
                }
            });
        }

        this.state.nodeMap = layers;
        this.state.currentLayer = 0;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
        container.className = 'party-status-bar'; // 既存スタイル流用

        // Members Row
        const membersRow = document.createElement('div');
        membersRow.className = 'members-row';
        membersRow.style.justifyContent = 'center'; // 中央揃え

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

            // 詳細表示
            el.onclick = () => this.showCharacterDetail(member.id, 'map'); // mapモードの詳細表示を流用

            membersRow.appendChild(el);
        });

        container.appendChild(membersRow);
    }

    renderMap() {
        const mapEl = document.getElementById('node-map');
        mapEl.innerHTML = '';
        mapEl.classList.add('branching-map'); // スタイル用クラス追加

        document.getElementById('act-display').textContent = `第${this.state.currentAct}幕`;
        document.getElementById('node-progress').textContent =
            `階層 ${this.state.currentLayer + 1}/10`;

        // layersContainerを基準点として作成し、その中にSVGを配置
        const layersContainer = document.createElement('div');
        layersContainer.className = 'layers-container';
        layersContainer.style.position = 'relative';
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

        // マップを逆順（BOSSが上、STARTが下）で表示するためにflex-direction: column-reverseを使用するか、
        // DOMの追加順序を工夫する。ここではDOMは上から下（Layer 9 -> 0）へ追加し、
        // CSSで見た目を整える。

        // CSS Grid/Flexのためのコンテナ設定はstyle.cssで行うが、
        // ここでは各Layerを行として追加する。

        // 線を描画するために、ノードの座標が必要。
        // 一旦ノードを配置してから、座標を計算して線を描く。



        // 全ノード要素への参照を保持
        const nodeElements = {};

        // Layer 9 (Boss) -> Layer 0 (Start) の順で描画（上から下）
        [...this.state.nodeMap].reverse().forEach((layer, refreshIdx) => {
            const layerIndex = 9 - refreshIdx;

            const row = document.createElement('div');
            row.className = 'map-layer-row';
            row.dataset.layer = layerIndex;

            layer.forEach(node => {
                const nodeEl = document.createElement('div');
                nodeEl.className = `map-node node-type-${node.type}`;
                nodeEl.id = `node-${node.id}`;
                nodeEl.innerHTML = `
                    <div class="node-icon">${NODE_TYPES[node.type].icon}</div>
                `;

                if (node.completed) nodeEl.classList.add('completed');
                // 現在の階層のみ選択可能にする（並列移動・戻り防止）
                // 修正：statusがavailableでも、現在のレイヤーでなければ反応させない（特に見た目）
                if (node.status === 'available' && node.layer === this.state.currentLayer) {
                    nodeEl.classList.add('available');
                    nodeEl.onclick = () => this.enterNode(node);
                }
                if (node.status === 'locked') nodeEl.classList.add('locked');

                // 現在地ハイライト（完了したノード または これから挑むノード）
                // Slay the Spire風なら、次のAvailableが光る。
                // 完了済みはグレーアウトなど。

                row.appendChild(nodeEl);
                nodeElements[node.id] = nodeEl;
            });

            layersContainer.appendChild(row);
        });

        // レイアウト確定後に線を描画し、現在地にスクロール（2段階で確実に）
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.drawMapConnections(svg, nodeElements, layersContainer);
                // 利用可能なノード（現在地）まで自動スクロール
                const activeNode = mapEl.querySelector('.map-node.available');
                if (activeNode) {
                    // scrollIntoViewは画面全体をずらす原因になるため、scrollTop計算に変更
                    // offsetTopは親要素の状況により不安定なため、getBoundingClientRectで確実に計算
                    const nodeRect = activeNode.getBoundingClientRect();
                    const containerRect = mapEl.getBoundingClientRect();
                    const currentScroll = mapEl.scrollTop;
                    const absoluteNodeTop = currentScroll + (nodeRect.top - containerRect.top);
                    const targetScroll = absoluteNodeTop - (mapEl.clientHeight / 2) + (activeNode.offsetHeight / 2);

                    mapEl.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                } else {
                    mapEl.scrollTop = mapEl.scrollHeight;
                }
                // 念のため画面全体のスクロール位置をリセット
                window.scrollTo(0, 0);
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
                        let strokeColor = "rgba(255, 255, 255, 0.1)"; // 未開放
                        let strokeWidth = "1.5";

                        if (node.completed && this.isNodeAvailable(node.layer + 1, nextIdx)) {
                            strokeColor = "rgba(255, 255, 255, 0.9)"; // 攻略ルート（くっきり白）
                            strokeWidth = "3";
                        } else if (node.status === 'available') {
                            strokeColor = "rgba(255, 255, 255, 0.4)"; // 選択可能候補（薄い白）
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
                this.startBattle(this.state.currentAct === 2 ? 'last_boss' : 'boss');
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
            const enemyId = config.bosses[Math.floor(Math.random() * config.bosses.length)];
            enemies.push(this.createEnemy(enemyId, multiplier));
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
            statusEffects: [],
            uniqueSkill: template.uniqueSkill // uniqueSkillをコピー
        };
    }

    // 戦闘描画
    renderBattle() {
        this.renderEnemies();
        this.renderVSDivider();
        this.renderAllies();
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
                <img src="${enemy.image.full}" alt="${enemy.displayName}" onerror="this.style.background='#555'">
                <div class="unit-name">${enemy.displayName}</div>
                <div class="unit-hp-bar">
                    <div class="fill" style="width:${hpPercent}%"></div>
                    <div class="bar-text">${Math.floor(enemy.currentHp)}/${enemy.stats.hp}</div>
                </div>
                <div class="status-ailments">${this.renderStatusAilments(enemy)}</div>
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
                <div class="buff-overlay">${this.renderBuffOverlay(ally)}</div>
                <img src="${ally.image.face}" alt="${ally.displayName}" onerror="this.style.background='#555'">
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

    // 状態異常表示のみ更新（個別）
    updateStatusAilmentsUI(unit) {
        const selector = this.getUnitSelector(unit);
        const unitEl = document.querySelector(selector);
        if (unitEl) {
            const ailmentsContainer = unitEl.querySelector('.status-ailments');
            if (ailmentsContainer) {
                ailmentsContainer.innerHTML = this.renderStatusAilments(unit);
            }
        }
    }

    // バフ/デバフオーバーレイ表示（画像左上に重ねて表示）
    renderBuffOverlay(unit) {
        const statLabels = {
            physicalAttack: '物攻', magicAttack: '魔攻',
            physicalDefense: '物防', magicDefense: '魔防',
            speed: '速', luck: '運', hp: 'HP', mp: 'MP'
        };

        let html = '';

        // バフ（同じstatは統合済みなので全て表示）
        unit.buffs.forEach(b => {
            const label = statLabels[b.stat] || b.stat;
            html += `<span class="buff-item">${label}↑</span>`;
        });

        // デバフ
        unit.debuffs.forEach(d => {
            const label = statLabels[d.stat] || d.stat;
            html += `<span class="debuff-item">${label}↓</span>`;
        });

        return html;
    }

    // 状態異常表示（キャラ下部、漢字一文字）
    renderStatusAilments(unit) {
        const statusLabels = {
            poison: '毒', paralysis: '麻', silence: '沈', stun: 'ス',
            taunt: '挑', burn: '火', regen: '再', defending: '防', damageReduction: '軽', counter: '反'
        };

        return unit.statusEffects.map(s => {
            const label = statusLabels[s.type] || s.type.charAt(0);
            // 配色用のクラスを追加
            return `<span class="status-ailment ${s.type}">${label}</span>`;
        }).join('');
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
                                actionName: (skill.displayName || skill.name) + (targetType === 'all_enemies' ? '' : '→' + enemy.displayName),
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
                            actionName: (skill.displayName || skill.name) + (targetType === 'all_allies' ? '' : '→' + ally.displayName),
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

            // キャラが完全に動作を終えて、HPバーが減るのを待つ余韻
            await this.delay(1200);
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

            // 1. 先にターゲットを決定する
            let targetIdx = this.selectTarget();
            let targetUnit = this.state.party[targetIdx];
            let action = null;

            // ボム兵の特殊処理（固有技のみ使用）
            if (enemy.templateId === 'bombhei') {
                action = { type: 'skill', skillId: enemy.uniqueSkill.id };
            } else {
                const stunned = enemy.statusEffects.find(e => e.type === 'stun');
                const silenced = enemy.statusEffects.find(e => e.type === 'silence');

                if (stunned || silenced) {
                    action = { type: 'attack' };
                } else {
                    // 2. 決定したターゲット(targetUnit)の状態を見てスキル使用を判断
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

            enemy.command = {
                ...action,
                target: targetIdx,
                targetType: 'ally',
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
                    this.updateStatusAilmentsUI(actor);

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
            targets = target && target.currentHp > 0 ? [target] : [];
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
                await this.delay(200);
            }
        } else if (skill.type === 'debuff' || skill.type === 'buff' || skill.type === 'cure') {
            // 攻撃以外のスキル演出実行
            await Promise.all(targets.map(async (target) => {
                if (target.currentHp <= 0 && skill.type !== 'revive') return;

                if (skill.type === 'cure') {
                    const badStatuses = ['poison', 'paralysis', 'silence', 'stun', 'burn'];
                    const beforeCount = target.statusEffects.length;
                    target.statusEffects = target.statusEffects.filter(e => !badStatuses.includes(e.type));

                    if (target.statusEffects.length < beforeCount) {
                        await this.showAttackEffect(actor, target, skill, 'magic');
                        this.addLog(`${target.displayName}の悪い状態が浄化された！`);
                        this.updateStatusAilmentsUI(target);
                    } else {
                        this.addLog(`しかし${target.displayName}には何も起こらなかった。`);
                    }
                } else {
                    await this.showAttackEffect(actor, target, skill, 'magic');
                }
            }));
        } else if (skill.type === 'heal') {
            await Promise.all(targets.map(async (target) => {
                await this.showEffectIcon(target, skill, 'heal');
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
                    const existing = t.buffs.find(b => b.stat === effect.stat);
                    if (existing) {
                        existing.duration = Math.max(existing.duration, effect.duration);
                        if (effect.value > existing.value) existing.value = effect.value;
                    } else {
                        t.buffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
                    }
                }));
                this.renderBattle(); // UI同期（全対象完了後）
                break;
            case 'debuff':
            case 'self_debuff':
                const debuffTargets = effect.type === 'self_debuff' ? [actor] : targets;
                await Promise.all(debuffTargets.map(async (t) => {
                    await this.showEffectIcon(t, skill, 'debuff');
                    const existing = t.debuffs.find(d => d.stat === effect.stat);
                    if (existing) {
                        existing.duration = Math.max(existing.duration, effect.duration);
                        if (Math.abs(effect.value) > Math.abs(existing.value)) existing.value = effect.value;
                    } else {
                        t.debuffs.push({ stat: effect.stat, value: effect.value, duration: effect.duration });
                    }
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
                        this.updateStatusAilmentsUI(t);
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
        let critRate = 5 + (luck / 4) + critBonus;
        // critBoost状態異常を反映
        const critStatus = attacker.statusEffects.find(e => e.type === 'critBoost');
        if (critStatus) critRate += critStatus.value;

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

        // 火傷の実効ステータス低下（物理防御・魔法防御）
        if (statName === 'physicalDefense' || statName === 'magicDefense') {
            if (unit.statusEffects.some(e => e.type === 'burn')) {
                value *= 0.85; // 15%低下
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

        // 状態異常・バフリセット
        this.state.party.forEach(p => {
            p.buffs = [];
            p.debuffs = [];
            p.statusEffects = [];
        });

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
        // パーティ情報表示領域があればそこに描画、なければ作成
        let partyStatusContainer = document.getElementById('reward-party-status');
        if (!partyStatusContainer) {
            partyStatusContainer = document.createElement('div');
            partyStatusContainer.id = 'reward-party-status';
            // reward-character-nameの前に挿入
            const rewardScreen = document.getElementById('reward-screen');
            rewardScreen.insertBefore(partyStatusContainer, document.getElementById('reward-character-name'));
        }
        this.renderPartyIcons(partyStatusContainer);

        document.getElementById('reward-character-name').textContent = `${char.displayName}の獲得フェイズ`;
        document.getElementById('reward-character-name').style.marginTop = '10px';

        const options = document.getElementById('reward-options');
        options.innerHTML = '';

        // 3択ボタンを表示
        const choices = [
            { id: 'stat', text: 'ステータス強化', desc: 'ステータスを上昇させる' },
            { id: 'skill', text: 'スキル習得', desc: '新しいスキルを覚える' },
            { id: 'skip', text: '報酬をスキップ', desc: '何も受け取らずに進む' }
        ];

        choices.forEach(choice => {
            const option = document.createElement('div');
            option.className = 'reward-option';
            option.innerHTML = `
                <div class="reward-title">${choice.text}</div>
                <div class="reward-desc">${choice.desc}</div>
            `;
            option.addEventListener('click', () => {
                this.showDetailReward(charIdx, choice.id);
            });
            options.appendChild(option);
        });
    }

    // 詳細報酬表示
    showDetailReward(charIdx, type) {
        const char = this.state.party[charIdx];
        const options = document.getElementById('reward-options');
        options.innerHTML = ''; // クリア

        const isElite = this.state.battle.rank === 'elite';
        const boostPercent = isElite ? 10 : 8;

        if (type === 'stat') {
            const stats = ['hp', 'mp', 'physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed', 'luck'];
            const statLabels = {
                hp: 'HP', mp: 'MP', physicalAttack: '物理攻撃', magicAttack: '魔法攻撃',
                physicalDefense: '物理防御', magicDefense: '魔法防御', speed: '速度', luck: '運'
            };

            // ランダム3つ
            const shuffledStats = [...stats].sort(() => Math.random() - 0.5).slice(0, 3);

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
        } else if (type === 'skill') {
            if (char.skills.length >= 3) {
                this.showToast('スキル枠がいっぱいです', 'error');
                this.showRewardForCharacter(charIdx); // 戻る
                return;
            }

            // スキル候補生成
            const candidateSkills = [];
            const myPool = SKILL_POOLS[char.type] || SKILL_POOLS.balance;

            // 他のプールのスキルを収集
            let otherPools = [];
            Object.keys(SKILL_POOLS).forEach(key => {
                if (key !== char.type) {
                    otherPools = otherPools.concat(SKILL_POOLS[key]);
                }
            });

            // 3つの候補を生成
            for (let i = 0; i < 3; i++) {
                const isMyRole = Math.random() < 0.7; // 70%
                let pool = isMyRole ? myPool : otherPools;

                // 重複除外 & 下位互換スキル除外
                const available = pool.filter(s =>
                    s !== char.uniqueSkill?.id &&
                    !char.skills.some(cs => cs.id === s) &&
                    !candidateSkills.some(c => c.id === s) &&
                    (!char.excludeSkills || !char.excludeSkills.includes(s))
                );

                if (available.length > 0) {
                    const skillId = available[Math.floor(Math.random() * available.length)];
                    candidateSkills.push(SKILLS[skillId]);
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
                        <div class="reward-title">${skill.name}</div>
                        <div class="reward-desc">${skill.description}</div>
                    `;
                    option.addEventListener('click', () => {
                        char.skills.push({ id: skill.id, displayName: skill.name });
                        this.nextReward(charIdx);
                    });
                    options.appendChild(option);
                });
            }

        } else {
            // Skip
            this.nextReward(charIdx);
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

        // ラスボス撃破チェック
        if (this.state.battle?.rank === 'last_boss') {
            this.clearSaveData(); // Clear save on victory
            this.showScreen('clear');
            return;
        }

        // 中ボス撃破で第2幕へ
        if (this.state.battle?.rank === 'boss' && this.state.currentAct === 1) {
            this.state.currentAct = 2;
            this.state.currentNode = null;
            this.generateMap();
            // generateMapでcurrentLayer=0になるのでOK
        }

        this.saveGame(); // Auto-save on layer progression
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

            // 確率表示ロジック
            let label = opt.text;
            if (opt.effect.type === 'luck_check') {
                const avgLuck = this.state.party.reduce((s, m) => s + m.stats.luck, 0) / 3;
                const chance = Math.floor(Math.min(100, 30 + avgLuck / 3));
                label += `（成功率: ${chance}%）`;
            } else if (opt.effect.type === 'random') {
                // randomの場合、最初のoutcomeを「成功」とみなすか、weightsから計算
                // ここでは単純にweight比率を表示
                const outcomes = opt.effect.outcomes;
                const totalWeight = outcomes.reduce((s, o) => s + o.weight, 0);
                // item または heal_all を当たりとする
                const successOutcome = outcomes.find(o => o.type === 'item' || o.type === 'heal_all');
                if (successOutcome) {
                    const chance = Math.floor((successOutcome.weight / totalWeight) * 100);
                    label += `（成功率: ${chance}%）`;
                }
            }

            btn.textContent = label;
            btn.addEventListener('click', () => this.handleEventOption(opt));
            options.appendChild(btn);
        });
    }

    // イベント選択処理
    handleEventOption(option) {
        const effect = option.effect;
        let message = '';
        const targets = this.state.party; // targets変数を定義

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
            case 'silence':
                targets.forEach(t => {
                    if (!effect.chance || Math.random() * 100 < effect.chance) {
                        t.statusEffects.push({ type: 'silence', duration: effect.duration || 2 });
                        this.addLog(`${t.displayName}は沈黙状態になった！`);
                    }
                });
                break;
            case 'burn':
                targets.forEach(t => {
                    if (!effect.chance || Math.random() * 100 < effect.chance) {
                        t.statusEffects.push({ type: 'burn', duration: effect.duration || 3 });
                        this.addLog(`${t.displayName}は火傷状態になった！`);
                    }
                });
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
            case 'sacrifice_hp':
                this.state.party.forEach(m => {
                    if (m.currentHp > 0) {
                        const damage = Math.floor(m.stats.hp * (effect.percent / 100));
                        m.currentHp = Math.max(1, m.currentHp - damage);
                    }
                });
                if (effect.reward === 'random_skill') {
                    const randomChar = this.state.party[Math.floor(Math.random() * this.state.party.length)];
                    const pool = SKILL_POOLS[randomChar.type] || SKILL_POOLS.physical_attacker;
                    const newSkillId = pool[Math.floor(Math.random() * pool.length)];
                    const newSkill = SKILLS[newSkillId];
                    if (newSkill && !randomChar.skills.some(s => s.id === newSkillId)) {
                        randomChar.skills.push({ id: newSkill.id, displayName: newSkill.name }); // データ構造を統一
                        message = `HPを捧げ、${randomChar.displayName}は${newSkill.name}を習得した！`;
                    } else {
                        message = `HPを捧げたが、何も起こらなかった...`;
                    }
                }
                break;
            case 'sacrifice_mp':
                this.state.party.forEach(m => {
                    if (m.currentHp > 0) {
                        const mpCost = Math.floor(m.stats.mp * (effect.percent / 100));
                        m.currentMp = Math.max(0, m.currentMp - mpCost);
                    }
                });
                if (effect.reward === 'stat_up') {
                    // ランダムステータスUP（ランダムな1名）
                    const randomChar = this.state.party[Math.floor(Math.random() * this.state.party.length)];
                    const stats = ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense'];
                    const stat = stats[Math.floor(Math.random() * stats.length)];
                    const increase = Math.floor(CHARACTERS[randomChar.id].stats[stat] * 0.15);
                    randomChar.stats[stat] += increase;
                    const statLabels = { physicalAttack: '物攻', magicAttack: '魔攻', physicalDefense: '物防', magicDefense: '魔防' };
                    message = `MPを捧げ、${randomChar.displayName}の${statLabels[stat]}が${increase}上がった！`;
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

        this.showModal('イベント結果', message, [
            {
                text: '次へ', onClick: () => {
                    this.closeModal();
                    this.finishNode();
                }
            }
        ]);
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
                    this.showToast(`${item.name}を入手！`, 'success');
                    this.finishNode();
                } else {
                    this.showToast('アイテムがいっぱいだ...', 'error');
                }
            });
            options.appendChild(btn);
        });
    }

    // ゲームオーバー
    gameOver() {
        this.clearSaveData();
        document.getElementById('gameover-message').textContent = '全滅してしまった...';
        this.showScreen('gameover');
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
            items: { hp_potion: 0, mp_potion: 0, revive_stone: 0, stat_crystal: 0 },
            battle: null,
            currentTab: 'all'
        };
        this.showScreen('title');
    }

    // 遅延
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 前のキャラクターに戻る
    backCharacter() {
        // 現在の入力中インデックスより前から、生存しているキャラを逆順に探す
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
        } else {
            char = this.state.party.find(p => p.id === charId);
            if (!char) return;
        }

        nameEl.textContent = char.name;
        bodyEl.innerHTML = '';

        // Content area
        const content = document.createElement('div');
        content.className = 'detail-content';

        // Battle context: no image
        if (context !== 'battle') {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'detail-image';
            imageDiv.innerHTML = `<img src="${char.image.full}" alt="${char.name}" onerror="this.style.background='#555'">`;
            content.appendChild(imageDiv);
        }

        // Stats area
        const statsDiv = document.createElement('div');
        statsDiv.className = 'detail-stats';

        const typeLabel = this.getTypeLabel(char.type);
        statsDiv.innerHTML = `<div class="detail-type">タイプ：${typeLabel}</div>`;

        // 通常攻撃タイプを判定（素のステータスで高い方）
        const basePhys = CHARACTERS[char.id]?.stats.physicalAttack || char.stats.physicalAttack;
        const baseMag = CHARACTERS[char.id]?.stats.magicAttack || char.stats.magicAttack;
        const primaryAttackType = basePhys >= baseMag ? 'physical' : 'magic';

        // HP/MP with colors
        const hpColor = '#4ecdc4'; // 戦闘画面のHPバーと同じ色
        const mpColor = '#4facfe'; // 戦闘画面のMPバーと同じ色

        if (context === 'party') {
            statsDiv.innerHTML += `
                <div class="stat-row"><span class="stat-label" style="color:${hpColor}">HP:</span> <span class="stat-value" style="color:${hpColor}">${char.stats.hp}</span></div>
                <div class="stat-row"><span class="stat-label" style="color:${mpColor}">MP:</span> <span class="stat-value" style="color:${mpColor}">${char.stats.mp}</span></div>
            `;
        } else {
            statsDiv.innerHTML += `
                <div class="stat-row"><span class="stat-label" style="color:${hpColor}">HP:</span> <span class="stat-value" style="color:${hpColor}">${Math.floor(char.currentHp)}/${char.stats.hp}</span></div>
                <div class="stat-row"><span class="stat-label" style="color:${mpColor}">MP:</span> <span class="stat-value" style="color:${mpColor}">${Math.floor(char.currentMp)}/${char.stats.mp}</span></div>
            `;
        }

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

        content.appendChild(statsDiv);
        bodyEl.appendChild(content);

        // Unique Skill
        const uniqueSection = document.createElement('div');
        uniqueSection.className = 'detail-section';
        uniqueSection.innerHTML = '<h4>【固有スキル】</h4>';

        const uniqueSkill = char.uniqueSkill;
        if (uniqueSkill) {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.innerHTML = `
                <div class="skill-item-header">
                    <span class="skill-item-name">${uniqueSkill.displayName || uniqueSkill.id}</span>
                    <span class="skill-item-cost">MP: ${uniqueSkill.mpCost || 0}</span>
                </div>
                <div class="skill-item-desc">${uniqueSkill.description || ''}</div>
            `;
            uniqueSection.appendChild(skillItem);
        }
        bodyEl.appendChild(uniqueSection);

        // Acquired Skills (map/battle only)
        if (context !== 'party' && char.skills && char.skills.length > 0) {
            const skillsSection = document.createElement('div');
            skillsSection.className = 'detail-section';
            skillsSection.innerHTML = '<h4>【獲得スキル】</h4>';

            char.skills.forEach(skill => {
                const skillData = SKILLS[skill.id] || {};
                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item';
                skillItem.innerHTML = `
                    <div class="skill-item-header">
                        <span class="skill-item-name">${skill.displayName || skillData.name || skill.id}</span>
                        <span class="skill-item-cost">MP: ${skillData.mpCost || 0}</span>
                    </div>
                    <div class="skill-item-desc">${skillData.description || ''}</div>
                `;
                skillsSection.appendChild(skillItem);
            });
            bodyEl.appendChild(skillsSection);
        }

        // Status ailments (battle only)
        if (context === 'battle' && char.statusEffects && char.statusEffects.length > 0) {
            const statusSection = document.createElement('div');
            statusSection.className = 'detail-section';
            statusSection.innerHTML = '<h4>【状態異常】</h4><div class="status-list"></div>';

            const statusList = statusSection.querySelector('.status-list');
            char.statusEffects.forEach(effect => {
                const tag = document.createElement('span');
                tag.className = 'status-tag ailment';
                const labels = { poison: '毒', paralysis: '麻痺', silence: '沈黙', stun: 'スタン', taunt: '挑発', defending: '防御' };
                tag.textContent = `${labels[effect.type] || effect.type}(残${effect.duration}T)`;
                statusList.appendChild(tag);
            });
            bodyEl.appendChild(statusSection);
        }

        modal.classList.remove('hidden');
    }

    closeCharacterDetail() {
        document.getElementById('character-detail-modal').classList.add('hidden');
    }

    // アイテムモーダル表示
    showItemModal(context) {
        const modal = document.getElementById('item-modal');
        const listEl = document.getElementById('item-list');
        listEl.innerHTML = '';

        const hasItems = Object.values(this.state.items).some(count => count > 0);

        if (!hasItems) {
            listEl.innerHTML = '<p style="text-align:center;color:var(--text-sub);padding:20px;">アイテムがありません</p>';
            modal.classList.remove('hidden');
            return;
        }

        Object.entries(this.state.items).forEach(([itemId, count]) => {
            if (count === 0) return;

            const item = ITEMS[itemId];
            if (!item) return;

            // Stat crystal can't be used in battle
            const canUse = !(context === 'battle' && itemId === 'stat_crystal');

            const entry = document.createElement('div');
            entry.className = 'item-entry';
            if (!canUse) entry.classList.add('disabled');

            entry.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.description}</div>
                </div>
                <div class="item-count">×${count}</div>
            `;

            if (canUse) {
                entry.onclick = () => this.useItemFromModal(itemId, context);
            }

            listEl.appendChild(entry);
        });

        modal.classList.remove('hidden');
    }

    closeItemModal() {
        document.getElementById('item-modal').classList.add('hidden');
    }

    // アイテム使用
    useItemFromModal(itemId, context) {
        const item = ITEMS[itemId];
        if (!item) return;

        // Close item modal
        this.closeItemModal();

        // Show target selection
        const targets = this.state.party.map(member => {
            const isValidTarget = item.effect.type === 'revive'
                ? member.currentHp <= 0
                : member.currentHp > 0;

            if (!isValidTarget) return null;

            return {
                text: member.displayName,
                className: 'btn-primary',
                onClick: () => {
                    this.applyItemEffect(itemId, member);
                    this.closeModal();
                    if (context === 'map') {
                        this.renderPartyStatusBar();
                    }
                }
            };
        }).filter(Boolean);

        // キャンセルボタン追加
        targets.push({
            text: 'キャンセル',
            className: 'btn-cancel',
            onClick: () => {
                this.closeModal();
                if (context === 'map' || context === 'battle') {
                    this.showItemModal(context); // アイテム一覧に戻る
                }
            }
        });

        this.showModal('対象を選択', '', targets);
    }

    // アイテム効果適用
    applyItemEffect(itemId, target) {
        const item = ITEMS[itemId];
        if (!item) return;

        this.state.items[itemId]--;

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
            case 'revive':
                target.currentHp = Math.floor(target.stats.hp * (item.effect.percent / 100));
                this.showToast(`${target.displayName}が復活した！`, 'success');
                break;
            case 'stat_boost':
                Object.keys(target.stats).forEach(stat => {
                    target.stats[stat] = Math.floor(target.stats[stat] * item.effect.multiplier);
                });
                this.showToast(`${target.displayName}の全ステータスが上昇！`, 'success');
                break;
        }
    }

    async showAttackEffect(actor, target, skill, damageType) {
        const skillId = skill ? skill.id : 'normal_attack';
        const isPhysical = (damageType === 'physical');
        const unitEl = document.querySelector(this.getUnitSelector(target));
        if (!unitEl) return;

        const vfx = document.createElement('div');
        vfx.className = 'vfx-container';
        unitEl.appendChild(vfx);

        // --- プロレベル演出ロジック ---

        // 五条悟：無量空処（明度反転）
        if (skillId === 'muryokushou') {
            document.getElementById('battle-screen').classList.add('void-invert');
            setTimeout(() => document.getElementById('battle-screen').classList.remove('void-invert'), 800);
        }

        // === 味方固有技 ===
        if (skillId === 'taunt') { // 唐可可
            const el = document.createElement('div'); el.className = 'vfx-stardust'; vfx.appendChild(el);
        } else if (skillId === 'iron_wall' || skillId === 'defense_boost' || (skill && skill.type === 'buff')) {
            const el = document.createElement('div'); el.className = 'shield-aura'; vfx.appendChild(el);
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
        } else if (skillId === 'heal' && actor.id === 'josuke') { // 東方仗助
            const el = document.createElement('div'); el.className = 'vfx-crazy-diamond'; vfx.appendChild(el);
        } else if (skillId === 'daten_bind') { // 津島善子
            const el = document.createElement('div'); el.className = 'vfx-fallen-bind';
            el.innerHTML = '<div class="vfx-chain"></div><div class="vfx-chain"></div><div class="vfx-chain"></div>';
            vfx.appendChild(el);
        } else if (skillId === 'aura_sphere') { // ルカリオ
            const el = document.createElement('div'); el.className = 'vfx-aura-sphere'; vfx.appendChild(el);
        } else if (skillId === 'scarlet_storm') { // 優木せつ菜
            const el = document.createElement('div'); el.className = 'vfx-scarlet-storm';
            el.innerHTML = '<div class="vfx-flame"></div><div class="vfx-flame"></div><div class="vfx-flame"></div><div class="vfx-flame"></div><div class="vfx-flame"></div>';
            vfx.appendChild(el);
        } else if (skillId === 'fusion_crust') { // セラス
            const el = document.createElement('div'); el.className = 'vfx-fusion-crust'; vfx.appendChild(el);
        } else if (skillId === 'doshatto') { // 黒尾鉄朗
            const el = document.createElement('div'); el.className = 'vfx-doshatto'; vfx.appendChild(el);
        } else if (skillId === 'delorieran') { // 若菜四季
            const el = document.createElement('div'); el.className = 'vfx-delorieran'; vfx.appendChild(el);
        } else if (skillId === 'ice_wall') { // 轟焦凍
            const el = document.createElement('div'); el.className = 'vfx-ice-wall';
            el.innerHTML = '<div class="vfx-ice-pillar"></div><div class="vfx-ice-pillar"></div><div class="vfx-ice-pillar"></div><div class="vfx-ice-pillar"></div><div class="vfx-ice-pillar"></div>';
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
        } else if (skillId === 'erasure') { // 相澤消太
            const el = document.createElement('div'); el.className = 'vfx-erasure';
            el.innerHTML = '<div class="vfx-erasure-eye"></div><div class="vfx-erasure-eye"></div><div class="vfx-erasure-band"></div>';
            vfx.appendChild(el);
        } else if (skillId === 'solitude_rain') { // 桜坂しずく
            const el = document.createElement('div'); el.className = 'vfx-solitude-rain';
            el.innerHTML = '<div class="vfx-raindrop"></div><div class="vfx-raindrop"></div><div class="vfx-raindrop"></div><div class="vfx-raindrop"></div><div class="vfx-raindrop"></div><div class="vfx-raindrop"></div>';
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
                    (skillId === 'daten_bind') ? 1500 : // 堕天: 1.5s
                        (skillId === 'heal' && actor.id === 'josuke') ? 1600 : // ドラララ: 1.6s
                            (skillId === 'aura_sphere') ? 1300 : // 波動弾: 1.3s
                                (skillId === 'scarlet_storm') ? 1200 : // 竜巻: 1.2s
                                    (skillId === 'ice_wall') ? 1000 : // 氷河: 1.0s
                                        (skillId === 'raikiri') ? 600 : // 雷切（一閃）: 0.6s
                                            1000;

        // ダメージタイミング：基本50%だが、技によっては微調整
        let damageTiming = vfxDuration * 0.5;
        // 通常攻撃（スキルIDがない場合）は0.3秒
        if (!skillId || skillId === 'normal_attack') damageTiming = 300;

        // Raikiriは1000ms / 0.5 = 500msの標準タイミングを使用するため削除
        if (skillId === 'aura_sphere') damageTiming = 1000; // 発射後
        if (skillId === 'heal' && actor.id === 'josuke') damageTiming = 800; // ラッシュ後回復

        // エフェクト消去は裏側で行い、ダメージ処理には早めに完了を報告する
        setTimeout(() => vfx.remove(), vfxDuration);
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