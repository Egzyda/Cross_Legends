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

    init() {
        this.bindEvents();
        this.showScreen('title');
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
        this.renderPartyFilter();
        this.renderCharacterList();
        this.state.party = [];
        this.state.selectedChar = null;
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
                content.innerHTML = `
                    <img src="${member.image.face}" alt="${member.displayName}"
                         style="width:50px;height:50px;border-radius:50%;background:#555"
                         onerror="this.style.background='#555'">
                    <div>${member.displayName}</div>
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

        // Add item button
        const itemBtn = document.createElement('button');
        itemBtn.id = 'item-btn';
        itemBtn.textContent = 'アイテム';
        itemBtn.onclick = () => this.showItemModal('map');
        bar.appendChild(itemBtn);

        this.state.party.forEach(member => {
            const el = document.createElement('div');
            el.className = 'party-member-status';
            const hpPercent = (member.currentHp / member.stats.hp) * 100;
            const mpPercent = (member.currentMp / member.stats.mp) * 100;

            el.innerHTML = `
                <img src="${member.image.face}" alt="${member.displayName}" onerror="this.style.background='#555'">
                <div class="hp-mp-text">HP: ${member.currentHp}/${member.stats.hp}</div>
                <div class="hp-bar"><div class="fill" style="width: ${hpPercent}%"></div></div>
                <div class="hp-mp-text">MP: ${member.currentMp}/${member.stats.mp}</div>
                <div class="mp-bar"><div class="fill" style="width: ${mpPercent}%"></div></div>
            `;

            // Long press for detail
            this.addLongPressListener(el, () => this.showCharacterDetail(member.id, 'map'));

            bar.appendChild(el);
        });
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
                    activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    mapEl.scrollTop = mapEl.scrollHeight;
                }
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
                break;
            case 'event':
                this.showEventScreen();
                break;
            case 'treasure':
                this.showTreasureScreen();
                break;
        }
    }
}

// ゲーム開始
const game = new Game();


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

            // Long press for detail
            this.addLongPressListener(unit, () => this.showCharacterDetail(ally.id, 'battle'));

            area.appendChild(unit);
        });
    }

    // ステータスエフェクト表示
    renderStatusEffects(unit) {
        const statLabels = {
            physicalAttack: '物攻', magicAttack: '魔攻',
            physicalDefense: '物防', magicDefense: '魔防',
            speed: '速', luck: '運', hp: 'HP', mp: 'MP'
        };
        const statusLabels = { poison: '毒', paralysis: '麻', silence: '沈', stun: 'ス', taunt: '挑' };

        let effects = [];
        unit.buffs.forEach(b => {
            const label = statLabels[b.stat] || b.stat;
            effects.push(`<span class="status-effect buff">${label}↑</span>`);
        });
        unit.debuffs.forEach(d => {
            const label = statLabels[d.stat] || d.stat;
            effects.push(`<span class="status-effect debuff">${label}↓</span>`);
        });
        unit.statusEffects.forEach(s => {
            const label = statusLabels[s.type] || s.type;
            effects.push(`<span class="status-effect special">${label}</span>`);
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

        // 実行ボタンの制御 / Turn Execution Control
        const allSelected = commandsCount === aliveAllies.length;
        const execBtn = document.getElementById('execute-turn-btn');
        execBtn.classList.toggle('hidden', !allSelected);

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
}

// ゲーム開始
const game = new Game();

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
}

// ゲーム開始
const game = new Game();

    // 攻撃実行
    async executeAttack(actor, cmd, actorName) {
        let targets = [];
        let group = [];

        if (cmd.isEnemy) {
            targets = [this.state.party[cmd.target]];
        } else {
            // プレイヤー側の攻撃：対象が死亡していたらターゲット変更
            group = this.state.battle.enemies;
            let target = group[cmd.target];

            if (target && target.currentHp <= 0) {
                target = this.getAliveTarget(group, 'left');
                if (target) {
                    // this.addLog(`${actorName}は攻撃対象を変更した！`);
                }
            }

            targets = target ? [target] : [];
        }

        for (const target of targets) {
            if (target.currentHp <= 0) continue;

            const damage = this.calculateDamage(actor, target, 'physical', 100);
            this.applyDamage(target, damage);
            this.addLog(`${actorName}の攻撃！${target.displayName}に${damage.value}ダメージ${damage.critical ? '（クリティカル！）' : ''}`);
        }
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
            let target = this.state.battle.enemies[cmd.target];
            if (target && target.currentHp <= 0) {
                target = this.getAliveTarget(this.state.battle.enemies, 'left');
            }
            targets = target ? [target] : [];
        } else {
            targets = [this.state.party[cmd.target]];
        }

        // スキル効果適用
        if (skill.type === 'physical_attack' || skill.type === 'magic_attack') {
            const damageType = skill.type === 'physical_attack' ? 'physical' : 'magic';
            const hits = skill.hits || 1;

            // ターゲット再選択用設定
            let nextRetargetStrategy = 'right'; // 最初は左(上記)で選んでいるので、次は右
            const isSingleTarget = (cmd.targetType === 'enemy');
            const targetGroup = cmd.isEnemy ? this.state.party : this.state.battle.enemies;

            for (let i = 0; i < hits; i++) {
                for (let tIdx = 0; tIdx < targets.length; tIdx++) {
                    let target = targets[tIdx];

                    // 単体攻撃かつターゲット死亡時に再ターゲット
                    if (isSingleTarget && target.currentHp <= 0) {
                        const newTarget = this.getAliveTarget(targetGroup, i === 0 ? 'left' : nextRetargetStrategy); // 初回ヒット前なら左優先、途中なら戦略切り替え
                        if (newTarget) {
                            target = newTarget;
                            targets[tIdx] = newTarget; // 以降のヒットのために更新
                            // 戦略反転（右→左→右...）
                            nextRetargetStrategy = (nextRetargetStrategy === 'right') ? 'left' : 'right';
                        }
                    }

                    if (target.currentHp <= 0) continue;

                    const damage = this.calculateDamage(actor, target, damageType, skill.power || skill.basePower || 100, skill.critBonus);
                    this.applyDamage(target, damage);
                    this.addLog(`${target.displayName}に${damage.value}ダメージ${damage.critical ? '（クリティカル！）' : ''}`);

                    if (target.currentHp <= 0) {
                        this.addLog(`${target.displayName}を倒した！`);
                    }
                }

                await this.delay(200); // ヒット間ウェイト
            }
        } else if (skill.type === 'heal') {
            for (const target of targets) {
                const healAmount = Math.floor(target.stats.hp * (skill.healPercent / 100));
                target.currentHp = Math.min(target.stats.hp, target.currentHp + healAmount);
                this.showDamagePopup(target, healAmount, 'heal');
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
                this.showDamagePopup(target, healAmount, 'heal'); // MP heal visualization
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
}

// ゲーム開始
const game = new Game();

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
}

// ゲーム開始
const game = new Game();

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
        this.showDamagePopup(target, damage.value, damage.critical ? 'critical' : 'damage');
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
        document.getElementById('gameover-message').textContent = '全滅してしまった...';
        this.showScreen('gameover');
    }

    // ゲームリセット
    resetGame() {
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

        // HP/MP
        if (context === 'party') {
            statsDiv.innerHTML += `
                <div class="stat-row"><span class="stat-label">HP:</span> <span class="stat-value">${char.stats.hp}</span></div>
                <div class="stat-row"><span class="stat-label">MP:</span> <span class="stat-value">${char.stats.mp}</span></div>
            `;
        } else {
            statsDiv.innerHTML += `
                <div class="stat-row"><span class="stat-label">HP:</span> <span class="stat-value">${char.currentHp}/${char.stats.hp}</span></div>
                <div class="stat-row"><span class="stat-label">MP:</span> <span class="stat-value">${char.currentMp}/${char.stats.mp}</span></div>
            `;
        }

        // Other stats
        const stats = ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense', 'speed', 'luck'];
        const statLabels = {
            physicalAttack: '物攻', magicAttack: '魔攻',
            physicalDefense: '物防', magicDefense: '魔防',
            speed: '速度', luck: '運'
        };

        stats.forEach(stat => {
            const baseValue = char.stats[stat];
            let displayText = `${baseValue}`;

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

            statsDiv.innerHTML += `<div class="stat-row"><span class="stat-label">${statLabels[stat]}:</span> <span class="stat-value">${displayText}</span></div>`;
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
        this.showModal('対象を選択', '', this.state.party.map(member => {
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
        }).filter(Boolean));
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
}

// ゲーム開始
const game = new Game();