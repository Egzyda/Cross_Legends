class SkillEffectManager {
    constructor(game) {
        this.game = game;
    }

    async playEffect(actor, target, skill, damageType, hitIndex = 0) {
        const skillId = skill ? skill.id : 'normal_attack';
        const isPhysical = (damageType === 'physical');

        // 自身対象のバフ技は画面中央に表示
        const centerScreenSkills = ['delorieran'];
        let vfxParent, unitEl;

        if (centerScreenSkills.includes(skillId)) {
            vfxParent = document.getElementById('battle-screen');
            if (!vfxParent) return;
        } else {
            unitEl = document.querySelector(this.game.getUnitSelector(target));
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
            // チャージ（短縮）
            const actorEl = document.querySelector(this.game.getUnitSelector(actor));
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
                setTimeout(() => chargeVfx.remove(), 400); // 700 -> 400
            }

            const el = document.createElement('div'); el.className = 'vfx-aura-sphere';
            // 弾道計算：ターゲット要素の中心からの相対座標を算出
            const actorUnitEl = document.querySelector(this.game.getUnitSelector(actor));
            const actorImg = actorUnitEl ? actorUnitEl.querySelector('img') : null;
            const actorRect = (actorImg || actorUnitEl)?.getBoundingClientRect();

            const targetUnitEl = document.querySelector(this.game.getUnitSelector(target));
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
                el.classList.add('vfx-projectile-dynamic-fast'); // fastクラスに変更（CSSで0.4sなどを定義している前提、またはJSで制御）
                // JSで直接スタイル注入して速度制御
                el.style.animationDuration = '0.4s';
            } else {
                // フォールバック
                if (this.game.state.battle.enemies.includes(actor)) {
                    el.classList.add('vfx-projectile-down');
                } else {
                    el.classList.add('vfx-projectile-up');
                }
                el.style.animationDuration = '0.4s';
            }
            // 波動球本体
            const sphere = document.createElement('div'); sphere.className = 'vfx-aura-sphere-core';
            el.appendChild(sphere);
            // 回転するエネルギーリング
            for (let i = 0; i < 3; i++) {
                const ring = document.createElement('div');
                ring.className = 'vfx-aura-ring';
                ring.style.setProperty('--delay', `${i * 0.1}s`);
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

            // Dissipation / Explosion logic for Aura Sphere (Original)
            setTimeout(() => {
                // Hide sphere parts
                const sphere = el.querySelector('.vfx-aura-sphere-core');
                const ripple = el.querySelector('.vfx-aura-ripple');
                if (sphere) sphere.style.opacity = '0';
                if (ripple) ripple.style.opacity = '0';

                // Create impact burst (Centered)
                const burst = document.createElement('div');
                burst.className = 'vfx-aura-impact';
                burst.style.transform = 'translate(-50%, -50%) scale(2)'; // Ensure centered
                burst.style.opacity = '1';
                burst.style.left = '50%'; // Force center relative to parent
                burst.style.top = '50%';
                el.appendChild(burst);

                // Add extra burst particles
                for (let i = 0; i < 8; i++) {
                    const p = document.createElement('div');
                    p.className = 'vfx-beam-particle';
                    p.style.setProperty('--angle', `${i * 45}deg`);
                    p.style.left = '50%'; p.style.top = '50%';
                    p.style.transform = 'translate(-50%, -50%)'; // Center origin
                    el.appendChild(p);
                }

                setTimeout(() => burst.style.opacity = '0', 300);
            }, 500); // 1000 -> 500 (Impact timing)
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
            this._playStorm(vfx, 'gold', 'tornado');
        } else if (skillId === 'burst_stream') { // 青眼の白龍：滅びの爆裂疾風弾
            const screen = document.getElementById('battle-screen');
            // 青白画面反転（0.8秒後）
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 300);
            }, 800);

            // チャージエフェクト（actor側）
            const actorEl = document.querySelector(this.game.getUnitSelector(actor));
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
            const actorUnitEl = document.querySelector(this.game.getUnitSelector(actor));
            const actorImg = actorUnitEl ? actorUnitEl.querySelector('img') : null;
            const actorRect = (actorImg || actorUnitEl)?.getBoundingClientRect();

            const targetUnitEl = document.querySelector(this.game.getUnitSelector(target));
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
        } else if (skillId === 'judrajim') { // フリーレン：ジュドラジルム (Refactored to Raikiri variant)
            this._playRaikiri(vfx, 'purple');
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

        // === Phase 3 & 4: Phase 3 Mappings & Phase 4 Enhancements ===
        else if (skillId === 'dark_slash') { this._playSlash(vfx, 'purple'); }
        else if (skillId === 'mentan_ken') { this._playSlash(vfx, 'silver'); }
        else if (skillId === 'teppen_strike') { this._playSkyPunch(vfx, 'orange'); }
        else if (skillId === 'zukyuun_bazooka') { this._playBeam(vfx, actor, target, 'pink', 'burst'); }
        else if (skillId === 'rasengan') { this._playBeam(vfx, actor, target, 'cyan', 'sphere'); }
        else if (skillId === 'saijin_serve') { this._playBeam(vfx, actor, target, 'teal', 'sphere'); }
        else if (skillId === 'flame_alchemy') { this._playStorm(vfx, 'red', 'explosion'); }
        else if (skillId === 'electric_tower') { this._playRaikiri(vfx, 'gold'); }
        else if (skillId === 'freeze_ray') { this._playIce(vfx, 'blue'); }
        else if (skillId === 'sand_coffin') { this._playBind(vfx, 'sand'); }
        else if (skillId === 'shadow_possession') { this._playBind(vfx, 'black'); }
        else if (skillId === 'edelstein') { this._playStorm(vfx, 'purple', 'tornado'); }

        // Phase 4 Enhancements
        else if (skillId === 'thou_shalt_not_die') { this._playButterflies(vfx, 'gold'); } // Akiko
        else if (skillId === 'ouka_ranman') { this._playKoikaze(vfx, 'pink'); }
        else if (skillId === 'love_bonapetit') { this._playHearts(vfx, 'pink'); } // Chiyuki
        else if (skillId === 'flying_raijin') { this._playRaikiri(vfx, 'yellow'); }
        else if (skillId === 'mind_reading') { this._playSparkles(vfx, 'pink', 'star'); } // Anya
        else if (skillId === 'karasuno_no_dodai') { this._playDoshatto(vfx, 'orange'); }
        else if (skillId === 'dateko_no_tetteki') { this._playDoshatto(vfx, 'green'); }
        else if (skillId === 'saikyou_no_omo') { this._playBeam(vfx, actor, target, 'orange', 'sphere'); }
        else if (skillId === 'starburst_stream') { this._playStarburstStream(vfx, hitIndex); }
        // New Mappings
        else if (skillId === 'spy_technique') { this._playScan(vfx, 'green'); } // Loid
        else if (skillId === 'nyammy_shield') { this._playBarrier(vfx, 'pink', 'cat'); } // Nyammy
        else if (skillId === 'future_zura') { this._playSparkles(vfx, 'yellow', 'star'); } // Hanamaru
        else if (skillId === 'onigiri_miya') { this._playSparkles(vfx, 'white', 'circle'); } // Osamu
        else if (skillId === 'don_pishhari') { this._playSparkles(vfx, 'gold', 'twin'); } // Atsumu
        else if (skillId === 'assassination') { this._playCritSlash(vfx, 'crimson'); } // Yor
        else if (skillId === 'fireball') { this._playStorm(vfx, 'red', 'explosion'); } // Mario
        else if (skillId === 'just_woo') { this._playGalaxySpotlight(vfx); } // Sumire

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
        // ダメージ発生タイミング：演出強化に合わせて調整
        const DURATION_MAP = {
            'taunt': (actor.id === 'keke') ? 1300 : 1000,
            'ultra_attack': (actor.id === 'sky') ? 1200 : 1000,
            'daten_bind': 1500,
            'heal': (actor.id === 'josuke') ? 1200 : 1000,
            'aura_sphere': 800,
            'scarlet_storm': 1200,
            'fusion_crust': 1400,
            'doshatto': 1000,
            'delorieran': 1100,
            'ice_wall': 1200,
            'erasure': 1200,
            'solitude_rain': 1300,
            'raikiri': 600,
            'star_platinum': 100,
            'divine_departure': 1200,
            'gmax': 1600,
            'koikaze': 1100,
            'inhale': 1000,
            'shiny_tornado': 1200,
            'burst_stream': 1800,
            'just_woo': 1400, // Just woo!!: 1.4s
            'pineapple_stake': 1100,
            'big_light': 1000,
            'judrajim': 800,
            'zukyuun_bazooka': 1800,
            'rasengan': 800,
            'saijin_serve': 800,
            'saikyou_no_omo': 800,
            'teppen_strike': 1200,
            'edelstein': 1200,
            'flame_alchemy': 1200,
            'fireball': 1200,
            'dark_slash': 1200,
            'mentan_ken': 1200,
            'sand_coffin': 1500,
            'shadow_possession': 1500,
            'starburst_stream': 400
        };

        const vfxDuration = DURATION_MAP[skillId] || 1000;

        // ダメージタイミング：基本50%だが、技によっては微調整
        let damageTiming = vfxDuration * 0.5;
        // 通常攻撃（スキルIDがない場合）は0.3秒
        if (!skillId || skillId === 'normal_attack') damageTiming = 300;

        if (skillId === 'burst_stream') damageTiming = 1500;
        if (skillId === 'zukyuun_bazooka') damageTiming = 1500; // Match Burst Stream timing
        if (skillId === 'heal' && actor.id === 'josuke') damageTiming = 600; // 50%地点で回復
        if (skillId === 'star_platinum') damageTiming = 0; // 即時ダメージ表示
        if (skillId === 'starburst_stream') damageTiming = 0; // Synchronize damage with hit appearance
        if (skillId === 'just_woo') damageTiming = 1200; // Synchronize with screen flash

        // エフェクト消去は裏側で行い（500msの余韻を追加）、ダメージ処理には早めに完了を報告する
        // Fade out before removal
        setTimeout(() => {
            if (vfx) {
                vfx.style.transition = 'opacity 0.5s ease-out';
                vfx.style.opacity = '0';
            }
        }, vfxDuration);
        setTimeout(() => vfx.remove(), vfxDuration + 500);
        await this.game.delay(damageTiming);
    }

    showFlashEffect(target, color) {
        const isEnemy = this.game.state.battle.enemies.includes(target);
        const index = isEnemy ? this.game.state.battle.enemies.indexOf(target) : this.game.state.party.indexOf(target);
        const selector = isEnemy ? `[data-enemy-index="${index}"]` : `[data-ally-index="${index}"]`;
        const unitEl = document.querySelector(selector);
        if (!unitEl) return;
        unitEl.classList.add(`flash-${color}`);
        setTimeout(() => unitEl.classList.remove(`flash-${color}`), 300);
    }

    // === Helper Methods for Reusable Effects ===

    _playSlash(vfx, color, type = 'cross') {
        const screen = document.getElementById('battle-screen');
        // Screen Flash/Shake
        setTimeout(() => {
            screen.classList.add('void-invert');
            setTimeout(() => screen.classList.remove('void-invert'), 200);
        }, 800);
        setTimeout(() => {
            screen.classList.add('void-invert');
            setTimeout(() => screen.classList.remove('void-invert'), 200);
        }, 1100);
        screen.classList.add('screen-shake');
        setTimeout(() => screen.classList.remove('screen-shake'), 500);

        const el = document.createElement('div'); el.className = 'vfx-divine-departure'; // Base class
        // Aura
        const aura = document.createElement('div'); aura.className = 'vfx-haki-aura';
        aura.style.setProperty('--color', color); // CSS logic needed for color? Or just filter?
        // Simple color override via filter for now or custom class
        el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        el.appendChild(aura);

        if (type === 'cross') {
            const slash1 = document.createElement('div'); slash1.className = 'vfx-haki-slash slash1';
            const slash2 = document.createElement('div'); slash2.className = 'vfx-haki-slash slash2';
            el.appendChild(slash1);
            el.appendChild(slash2);
        }

        // Bolts
        for (let i = 0; i < 6; i++) {
            const bolt = document.createElement('div');
            bolt.className = 'vfx-haki-bolt';
            bolt.style.setProperty('--angle', `${i * 60}deg`);
            bolt.style.setProperty('--delay', `${0.7 + i * 0.02}s`);
            el.appendChild(bolt);
        }
        vfx.appendChild(el);
    }

    _playBeam(vfx, actor, target, color, type = 'sphere') {
        // Shared logic with aura_sphere/burst_stream
        const screen = document.getElementById('battle-screen');
        if (type === 'burst') { // Burst Stream Style
            // Color tinting via filter
            const filter = `hue-rotate(${this._getHueRotate(color)})`;

            // Screen Flash
            setTimeout(() => {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 300);
            }, 800);

            const actorEl = document.querySelector(this.game.getUnitSelector(actor));
            if (actorEl) {
                const chargeVfx = document.createElement('div');
                chargeVfx.className = 'vfx-container';
                chargeVfx.style.filter = filter;
                actorEl.appendChild(chargeVfx);
                const charge = document.createElement('div');
                charge.className = 'vfx-burst-charge';
                chargeVfx.appendChild(charge);
                setTimeout(() => chargeVfx.remove(), 1000);
            }

            const actorUnitEl = document.querySelector(this.game.getUnitSelector(actor));
            const actorRect = actorUnitEl?.getBoundingClientRect();
            const targetUnitEl = document.querySelector(this.game.getUnitSelector(target));
            const targetRect = targetUnitEl?.getBoundingClientRect();

            if (actorRect && targetRect) {
                const screenRect = screen.getBoundingClientRect();
                const x1 = actorRect.left + actorRect.width / 2 - screenRect.left;
                const y1 = actorRect.top + actorRect.height / 2 - screenRect.top;
                const x2 = targetRect.left + targetRect.width / 2 - screenRect.left;
                const y2 = targetRect.top + targetRect.height / 2 - screenRect.top;
                const dx = x2 - x1; const dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                const beamLine = document.createElement('div');
                beamLine.className = 'vfx-burst-beam-line';
                beamLine.style.setProperty('--x1', `${x1}px`);
                beamLine.style.setProperty('--y1', `${y1}px`);
                beamLine.style.setProperty('--length', `${length}px`);
                beamLine.style.setProperty('--angle', `${angle}deg`);
                beamLine.style.filter = filter;

                screen.appendChild(beamLine);
                setTimeout(() => beamLine.remove(), 1300);

                const globalVfx = document.createElement('div');
                globalVfx.className = 'vfx-burst-stream-global';
                globalVfx.style.setProperty('--x', `${x2}px`);
                globalVfx.style.setProperty('--y', `${y2}px`);
                globalVfx.style.filter = filter;
                screen.appendChild(globalVfx);
                setTimeout(() => globalVfx.remove(), 2000);

                const explosion = document.createElement('div'); explosion.className = 'vfx-burst-explosion';
                globalVfx.appendChild(explosion);
                const cross = document.createElement('div'); cross.className = 'vfx-burst-cross';
                globalVfx.appendChild(cross);
            }
        } else { // Aura Sphere Style
            // Implementation simplified for reuse
            const el = document.createElement('div'); el.className = 'vfx-aura-sphere';

            // Fix Color Logic: Assume Base is Blue (~210deg).
            // If color is 'blue', rotation should be 0.
            // If color is 'cyan' (Rasengan), rotation should be small (-30deg).
            let rotation = '0deg';
            if (color === 'cyan' || color === 'teal') rotation = '-30deg';
            else if (color === 'orange') rotation = '150deg'; // Blue to Orange
            else if (color === 'red') rotation = '150deg';
            else if (color === 'green') rotation = '120deg'; // Blue to Green
            else if (color === 'white') { el.style.filter = 'grayscale(1) brightness(2)'; }
            else { rotation = this._getHueRotate(color); } // Fallback

            if (color !== 'white') el.style.filter = `hue-rotate(${rotation})`;

            // Simple projectile logic (fallback to up/down for safety)
            if (this.game.state.battle.enemies.includes(actor)) {
                el.classList.add('vfx-projectile-down');
            } else {
                el.classList.add('vfx-projectile-up');
            }

            const sphere = document.createElement('div'); sphere.className = 'vfx-aura-sphere-core';
            if (color === 'orange') sphere.style.background = 'radial-gradient(circle, #fbbf24, #d97706)';
            if (color === 'cyan') sphere.style.boxShadow = '0 0 20px #22d3ee, 0 0 40px #06b6d4'; // Rasengan glow
            el.appendChild(sphere);

            const ripple = document.createElement('div'); ripple.className = 'vfx-aura-ripple';
            el.appendChild(ripple);
            vfx.appendChild(el);

            // Faster Animation CSS Override
            el.style.animationDuration = '0.4s';

            // Dissipation / Explosion at the end (approx 0.8s impact)
            setTimeout(() => {
                // Hide sphere
                sphere.style.opacity = '0';
                ripple.style.opacity = '0';

                // Create impact burst
                const impact = document.createElement('div');
                impact.className = 'vfx-aura-impact'; // Reusing existing class
                impact.style.transform = 'translate(-50%, -50%) scale(2)'; // Fix alignment
                impact.style.opacity = '1';
                impact.style.left = '50%';
                impact.style.top = '50%';
                el.appendChild(impact);

                // Add extra burst particles
                for (let i = 0; i < 8; i++) {
                    const p = document.createElement('div');
                    p.className = 'vfx-beam-particle'; // Reuse
                    p.style.setProperty('--angle', `${i * 45}deg`);
                    p.style.left = '50%'; p.style.top = '50%';
                    p.style.transform = 'translate(-50%, -50%)'; // Fix alignment
                    el.appendChild(p);
                }

                setTimeout(() => impact.style.opacity = '0', 300);
            }, 500); // 800 -> 500
        }
    }

    _playStorm(vfx, color, type = 'tornado') {
        // Tornado or Explosion
        const screen = document.getElementById('battle-screen');
        if (type !== 'tornado') { // Explosion (Scarlet Storm style) has shake
            screen.classList.add('screen-shake');
            setTimeout(() => screen.classList.remove('screen-shake'), 500);
        }

        const el = document.createElement('div');
        el.className = 'vfx-storm-container';
        el.style.position = 'absolute';
        el.style.width = '100%';
        el.style.height = '100%';

        // Define colors
        let strokeColor = '#ffffff';
        if (color === 'red') strokeColor = '#ef4444';
        if (color === 'purple') strokeColor = '#a855f7';
        if (color === 'gold') strokeColor = '#fbbf24';

        if (type === 'tornado') {
            // SVG Tornado (High Speed, Centered Vortex)
            el.innerHTML = `<svg width="200%" height="200%" viewBox="0 0 200 200" style="position:absolute; top:-50%; left:-50%; overflow:visible;">
                <defs>
                    <linearGradient id="grad-${color}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0" />
                        <stop offset="50%" stop-color="${strokeColor}" stop-opacity="0.8" />
                        <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0" />
                    </linearGradient>
                    <filter id="glow-${color}">
                         <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${strokeColor}" flood-opacity="0.6"/>
                    </filter>
                </defs>
                <g class="vfx-tornado-group" style="transform-origin: 100px 100px;">
                    <!-- Multiple Wind Streams (Thinner, layered for volume) -->
                    <!-- Inner Core -->
                    <path d="M100,160 Q130,130 100,100 Q70,70 100,40" 
                          fill="none" stroke="url(#grad-${color})" stroke-width="6" stroke-linecap="round" filter="url(#glow-${color})" opacity="0.9" />
                    <path d="M100,160 Q70,130 100,100 Q130,70 100,40" 
                          fill="none" stroke="url(#grad-${color})" stroke-width="6" stroke-linecap="round" filter="url(#glow-${color})" opacity="0.9" style="transform: rotate(90deg); transform-origin: 100px 100px;" />

                    <!-- Outer Layers -->
                    <path d="M100,170 Q150,135 100,100 Q50,65 100,30" 
                          fill="none" stroke="url(#grad-${color})" stroke-width="4" opacity="0.6" style="transform: rotate(45deg); transform-origin: 100px 100px;" />
                    <path d="M100,170 Q50,135 100,100 Q150,65 100,30" 
                          fill="none" stroke="url(#grad-${color})" stroke-width="4" opacity="0.6" style="transform: rotate(-45deg); transform-origin: 100px 100px;" />
                    
                    <!-- Debris/Particles lines -->
                    <circle cx="100" cy="100" r="40" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="10 30" opacity="0.6">
                         <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="0.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="100" cy="100" r="60" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="20 40" opacity="0.4">
                         <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="0.7s" repeatCount="indefinite"/>
                    </circle>
                </g>
            </svg>`;

            // Inject Animation (High Speed)
            if (!document.getElementById('tornado-anim')) {
                const s = document.createElement('style');
                s.id = 'tornado-anim';
                s.innerHTML = `
                    .vfx-tornado-group { animation: tornado-spin 1.2s ease-out forwards; }
                    @keyframes tornado-spin {
                        0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
                        15% { opacity: 1; transform: scale(1.2) rotate(180deg); } /* Quick appearance */
                        80% { opacity: 1; transform: scale(1.5) rotate(1440deg); } /* High speed spin (4 rotations) */
                        100% { transform: scale(1.8) rotate(1600deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(s);
            }

        } else {
            // Explosion (Original Logic)
            el.className = 'vfx-scarlet-storm';
            el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
            let layers = '<div class="vfx-explosion-layer outer"></div>';
            el.innerHTML = layers;
        }
        vfx.appendChild(el);
    }

    _playRaikiri(vfx, color) {
        const screen = document.getElementById('battle-screen');
        // Flash
        screen.classList.add('void-invert');
        setTimeout(() => screen.classList.remove('void-invert'), 100);

        const el = document.createElement('div'); el.className = 'vfx-raikiri-arc';
        el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        if (color === 'gold' || color === 'yellow') el.style.filter = 'hue-rotate(45deg) brightness(1.5)';
        if (color === 'purple') el.style.filter = 'hue-rotate(270deg)';

        el.innerHTML = `
            <svg width="150" height="350" viewBox="0 0 150 350" style="overflow:visible;">
                <!-- Main Polygon -->
                <polygon points="70,350 80,350 60,300 100,250 50,180 90,100 65,50 75,0 75,0 65,50 82,100 42,180 92,250 52,300" class="raikiri-shape" style="fill:white; stroke:${color}"/>
                
                <!-- Branch Polygons (Restored) -->
                <polygon points="55,300 58,300 30,280" class="raikiri-shape branch" style="fill:white; stroke:${color}"/>
                <polygon points="45,180 48,180 20,150" class="raikiri-shape branch" style="fill:white; stroke:${color}"/>
                <polygon points="85,100 88,100 115,70" class="raikiri-shape branch" style="fill:white; stroke:${color}"/>
            </svg>
        `;

        const impact = document.createElement('div');
        impact.className = 'vfx-raikiri-impact';
        // Impact Alignment Fix (Minato)
        impact.style.left = '50%';
        impact.style.top = '50%';
        impact.style.transform = 'translate(-50%, -50%) scale(1.5)'; // Scale up for visibility
        if (color === 'yellow') impact.style.background = 'radial-gradient(circle, rgba(255,255,0,0.8), transparent 70%)'; // Ensure visibility
        el.appendChild(impact);

        vfx.appendChild(el);
        setTimeout(() => el.classList.add('fade-out'), 500);
    }

    _playBind(vfx, color) {
        const screen = document.getElementById('battle-screen');
        // Flash
        if (color !== 'black') { // Shikamaru's shadow binding shouldn't invert screen
            screen.classList.add('void-invert');
            setTimeout(() => screen.classList.remove('void-invert'), 300);
        }

        const el = document.createElement('div'); el.className = 'vfx-fallen-bind';
        el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        if (color === 'sand') el.style.filter = 'sepia(1) saturate(2)';
        if (color === 'black') el.style.filter = 'grayscale(1) brightness(0.2)';

        const aura = document.createElement('div'); aura.className = 'vfx-dark-aura';
        el.appendChild(aura);
        for (let i = 0; i < 6; i++) {
            const chain = document.createElement('div');
            chain.className = 'vfx-chain';
            chain.style.setProperty('--angle', `${i * 60}deg`);
            el.appendChild(chain);
        }
        vfx.appendChild(el);
    }

    _playIce(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-ice-wall';
        // Dave's freeze_ray (blue) was appearing yellow. Ensure correct hue rotation.
        // Base ice might be cyan/white. If color is blue, standard rotation might be off.
        if (color === 'blue') {
            el.style.filter = 'hue-rotate(0deg) saturate(1.5) brightness(1.2)'; // Force natural icy blue
        } else {
            el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        }

        // Growth (Base)
        const growth = document.createElement('div'); growth.className = 'vfx-ice-growth';
        el.appendChild(growth);

        // Pillars (Enhancement for Dave - Increased count for full screen coverage)
        for (let i = 0; i < 9; i++) {
            const pillar = document.createElement('div');
            pillar.className = 'vfx-ice-pillar';
            // Override style to ensure distribution
            pillar.style.position = 'absolute';
            pillar.style.left = `${(i / 8) * 100}%`;
            pillar.style.bottom = '0';
            pillar.style.setProperty('--delay', `${i * 0.05}s`);
            el.appendChild(pillar);
        }

        // Shards
        for (let i = 0; i < 8; i++) {
            const shard = document.createElement('div');
            shard.className = 'vfx-ice-shard';
            const angle = (i / 8) * Math.PI * 2;
            shard.style.setProperty('--angle', `${angle}rad`);
            shard.style.setProperty('--delay', `${0.6 + i * 0.03}s`);
            el.appendChild(shard);
        }

        vfx.appendChild(el);
    }

    _playKoikaze(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-koikaze';
        if (color !== 'green') el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;

        // Wind Waves
        for (let i = 0; i < 5; i++) {
            const wind = document.createElement('div');
            wind.className = 'vfx-wind-wave';
            wind.style.setProperty('--delay', `${i * 0.08}s`);
            wind.style.setProperty('--height', `${20 + i * 15}px`);
            el.appendChild(wind);
        }
        // Petals
        for (let i = 0; i < 20; i++) {
            const petal = document.createElement('div');
            petal.className = 'vfx-sakura-petal';
            petal.style.setProperty('--delay', `${0.4 + i * 0.03}s`);
            petal.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
            petal.style.setProperty('--rotation', `${Math.random() * 360}deg`);
            el.appendChild(petal);
        }
        // Heal Glow
        const heal = document.createElement('div'); heal.className = 'vfx-heal-glow';
        el.appendChild(heal);
        vfx.appendChild(el);
    }

    _playDoshatto(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-doshatto';
        const wall = document.createElement('div'); wall.className = 'vfx-metal-wall';
        // Apply filter to the container to colorize the wall fully
        if (color === 'orange') {
            wall.style.filter = 'sepia(1) saturate(5) hue-rotate(-30deg) brightness(1.2)';
        } else if (color === 'green') {
            wall.style.filter = 'sepia(1) saturate(3) hue-rotate(60deg) brightness(0.8)';
        } else {
            el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        }

        el.appendChild(wall);

        // Hex patterns (Doshatto original quality)
        for (let i = 0; i < 7; i++) {
            const hex = document.createElement('div');
            hex.className = 'vfx-hex-barrier';
            hex.style.setProperty('--index', i);
            hex.style.setProperty('--delay', `${i * 0.08}s`);
            // Apply color filter to hexes too if needed, or let parent filter handle it
            if (color === 'orange') hex.style.borderColor = '#fbbf24';
            if (color === 'green') hex.style.borderColor = '#22c55e';
            el.appendChild(hex);
        }

        vfx.appendChild(el);
    }

    _playScan(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-scan-wave';

        // CSS Animation Injection if missing
        if (!document.getElementById('scan-anim-style')) {
            const style = document.createElement('style');
            style.id = 'scan-anim-style';
            style.innerHTML = `@keyframes scan-down { 0% { top: -20%; opacity:0; } 20% { opacity:1; } 80% { opacity:1; } 100% { top: 120%; opacity:0; } }`;
            document.head.appendChild(style);
        }

        const scanColor = color === 'green' ? '#4ade80' : '#ffffff';
        // SVG Grid Background
        el.innerHTML = `<svg width="100%" height="100%" style="position:absolute;top:0;left:0;opacity:0.3;">
            <defs>
                <pattern id="grid-${color}" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${scanColor}" stroke-width="0.5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-${color})" />
        </svg>`;

        const line = document.createElement('div');
        line.className = 'vfx-scan-line';
        line.style.background = `linear-gradient(to bottom, transparent, ${scanColor}, transparent)`;
        line.style.height = '10%';
        line.style.width = '100%';
        line.style.position = 'absolute';
        line.style.top = '-10%';
        line.style.animation = 'scan-down 1.2s ease-in-out forwards';

        el.appendChild(line);
        vfx.appendChild(el);
    }

    _playBarrier(vfx, color, type = 'hex') {
        const el = document.createElement('div'); el.className = 'vfx-barrier-container';
        if (type === 'cat') {
            const cat = document.createElement('div');
            cat.className = 'vfx-cat-barrier';
            const strokeColor = color === 'pink' ? '#f472b6' : '#ffffff';
            // SVG Cat Shield
            cat.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 100 100" style="overflow:visible; filter: drop-shadow(0 0 5px ${strokeColor});">
                <path d="M50 10 Q 80 10 90 30 L 90 70 Q 50 100 10 70 L 10 30 Q 20 10 50 10 Z" fill="rgba(255,255,255,0.1)" stroke="${strokeColor}" stroke-width="2"/>
                <path d="M20 30 L 30 15 L 40 30" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="round"/> <!-- Left Ear -->
                <path d="M80 30 L 70 15 L 60 30" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="round"/> <!-- Right Ear -->
            </svg>`;
            el.appendChild(cat);
        } else {
            const hex = document.createElement('div'); hex.className = 'vfx-hex-barrier-large';
            el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
            el.appendChild(hex);
        }
        vfx.appendChild(el);
    }

    _playSparkles(vfx, color, shape = 'star') {
        const el = document.createElement('div'); el.className = 'vfx-sparkle-container';
        const num = shape === 'twin' ? 2 : 12; // Twin for Atsumu

        const svgContent = shape === 'circle' ?
            `<circle cx="10" cy="10" r="8" fill="currentColor"/>` :
            `<polygon points="10,2 12,8 19,8 13,12 15,19 10,15 5,19 7,12 1,8 8,8" fill="currentColor"/>`; // star

        for (let i = 0; i < num; i++) {
            const p = document.createElement('div');
            p.className = `vfx-sparkle-${shape}`;
            p.style.position = 'absolute'; // Force absolute
            p.style.width = '20px';
            p.style.height = '20px';
            p.style.setProperty('--delay', `${i * 0.1}s`);

            // Add SVG for visibility
            p.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" style="overflow:visible;">${svgContent}</svg>`;

            if (shape === 'twin') {
                p.style.left = i === 0 ? '30%' : '70%';
                p.style.top = '50%';
                // Explicit animation for Twins
                p.style.animation = 'vfx-flash-anim 0.5s infinite alternate';
            } else {
                p.style.left = `${Math.random() * 90}%`;
                p.style.top = `${Math.random() * 90}%`;
                // Explicit animation for others if class fails
                p.style.animation = 'vfx-sparkle-anim 1s ease-out forwards';
            }

            // Color override
            if (color === 'pink') p.style.color = '#f472b6';
            if (color === 'gold') p.style.color = '#fbbf24';
            if (color === 'yellow') p.style.color = '#facc15';
            if (color === 'white') p.style.color = '#ffffff';

            el.appendChild(p);
        }

        // Inject Animations if missing
        if (!document.getElementById('sparkle-anim-style')) {
            const s = document.createElement('style');
            s.id = 'sparkle-anim-style';
            s.innerHTML = `
            @keyframes vfx-flash-anim { 0% { opacity:0.2; transform:scale(0.8); } 100% { opacity:1; transform:scale(1.5); } }
            @keyframes vfx-sparkle-anim { 0% { transform:scale(0); opacity:0; } 50% { opacity:1; } 100% { transform:scale(1.5); opacity:0; } }
        `;
            document.head.appendChild(s);
        }
        vfx.appendChild(el);
    }

    _playHearts(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-heart-storm';
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div'); heart.className = 'vfx-heart-particle';
            // Use SVG Heart
            heart.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="overflow:visible; filter:drop-shadow(0 0 5px currentColor);">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>`;

            heart.style.position = 'absolute';
            heart.style.left = '50%';
            heart.style.top = '50%';

            heart.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
            heart.style.setProperty('--y', `${(Math.random() - 0.5) * 200}px`); // Add Y spread
            heart.style.setProperty('--delay', `${i * 0.05}s`);

            // Inline animation assurance
            heart.style.animation = 'vfx-heart-pop 1s ease-out forwards';

            if (color === 'pink') heart.style.color = '#f472b6';
            el.appendChild(heart);
        }

        if (!document.getElementById('heart-anim-style')) {
            const s = document.createElement('style');
            s.id = 'heart-anim-style';
            s.innerHTML = `@keyframes vfx-heart-pop { 0% { transform:translate(0,0) scale(0); opacity:0; } 20% { opacity:1; } 100% { transform:translate(var(--x), var(--y)) scale(1.5); opacity:0; } }`;
            document.head.appendChild(s);
        }
        vfx.appendChild(el);
    }

    _playButterflies(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-butterfly-swarm';
        for (let i = 0; i < 10; i++) {
            const b = document.createElement('div'); b.className = 'vfx-butterfly';
            // SVG Butterfly (Better filled butterfly)
            b.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 11 3 11 5V14C11 16 12 17 12 17C12 17 13 16 13 14V5C13 3 12 2 12 2M7.5 5C5 5 3 7.5 3 10C3 13 5.5 14 7 14C5 15.5 4 18 5 19.5C6 21 8.5 20.5 10 18.5V13C9 13 8 12.5 8 12C8 11.5 9 11 10 11V6C9.5 5.5 8.5 5 7.5 5M16.5 5C15.5 5 14.5 5.5 14 6V11C15 11 16 11.5 16 12C16 12.5 15 13 14 13V18.5C15.5 20.5 18 21 19 19.5C20 18 19 15.5 17 14C18.5 14 21 13 21 10C21 7.5 19 5 16.5 5Z"/>
            </svg>`;

            b.style.setProperty('--x', `${(Math.random() - 0.5) * 150}px`);
            b.style.setProperty('--delay', `${i * 0.1}s`);
            if (color === 'gold') b.style.color = '#fbbf24';
            el.appendChild(b);
        }
        vfx.appendChild(el);
    }

    _playCritSlash(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-crit-slash';

        // SVG Slash
        const slash = document.createElement('div');
        slash.className = 'vfx-slash-pro-svg';
        const slashColor = color === 'crimson' ? '#dc2626' : '#ffffff';

        slash.innerHTML = `<svg width="200" height="200" viewBox="0 0 100 100" style="position:absolute; top:-50%; left:-50%; width:200%; height:200%;">
             <path d="M10 90 Q 50 50 90 10" stroke="${slashColor}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="120" stroke-dashoffset="120">
                <animate attributeName="stroke-dashoffset" from="120" to="0" dur="0.15s" fill="freeze" />
                <animate attributeName="opacity" values="1;0" dur="0.3s" begin="0.15s" fill="freeze" />
             </path>
             <path d="M20 95 Q 50 55 95 20" stroke="${slashColor}" stroke-width="1" fill="none" stroke-linecap="round" stroke-dasharray="120" stroke-dashoffset="120" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="120" to="0" dur="0.15s" begin="0.05s" fill="freeze" />
                <animate attributeName="opacity" values="0.6;0" dur="0.3s" begin="0.2s" fill="freeze" />
             </path>
        </svg>`;

        const flash = document.createElement('div'); flash.className = 'vfx-impact-flash';
        el.appendChild(slash);
        el.appendChild(flash);
        vfx.appendChild(el);
    }

    _playSkyPunch(vfx, color) {
        // Based on ultra_attack (Cure Sky)
        // Screen Shake & Invert
        const screen = document.getElementById('battle-screen');
        screen.classList.add('void-invert', 'screen-shake');
        setTimeout(() => screen.classList.remove('void-invert', 'screen-shake'), 600);

        // Burst & Cross
        const burst = document.createElement('div'); burst.className = 'vfx-sky-burst';
        const cross = document.createElement('div'); cross.className = 'vfx-sky-cross';

        // Color customization
        if (color === 'orange') {
            burst.style.filter = 'hue-rotate(-30deg) sepia(1) saturate(3)';
            cross.style.filter = 'hue-rotate(-30deg) sepia(1) saturate(3)';
            burst.style.background = 'radial-gradient(circle, #fff, #f59e0b, transparent)';
        }

        vfx.appendChild(burst);
        vfx.appendChild(cross);
    }

    _playInhale(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-inhale';
        el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        for (let i = 0; i < 3; i++) {
            const spiral = document.createElement('div');
            spiral.className = 'vfx-inhale-spiral';
            spiral.style.setProperty('--delay', `${i * 0.1}s`);
            el.appendChild(spiral);
        }
        vfx.appendChild(el);
    }

    _getHueRotate(color) {
        // Approximate hue rotation degrees based on standard colors (assuming Red/Purple base usually)
        // This is a naive implementation, meant for visual tweaking
        if (!color) return '0deg';
        const map = {
            'red': '0deg', 'orange': '30deg', 'gold': '45deg', 'yellow': '60deg',
            'green': '120deg', 'teal': '150deg', 'cyan': '180deg', 'blue': '240deg',
            'purple': '270deg', 'pink': '300deg', 'white': '0deg', 'black': '0deg',
            'silver': '0deg'
        };
        return map[color] || '0deg';
    }

    _playStarburstStream(vfx, hitIndex) {
        const el = document.createElement('div'); el.className = 'vfx-starburst-stream';

        if (hitIndex < 15) {
            // 1-15Hits: Single Slash per call
            const slash = document.createElement('div');
            slash.className = 'vfx-slash-pro-svg';
            const color = hitIndex % 2 === 0 ? '#60a5fa' : '#111827';
            const angle = Math.random() * 360;
            const scale = 1.0 + Math.random() * 0.5;

            slash.innerHTML = `<svg width="200" height="200" viewBox="0 0 200 200" style="overflow:visible;">
                 <path d="M 20 20 Q 100 100 180 180 L 170 190 Q 100 120 30 30 Z" fill="${color}" opacity="0.9" style="mix-blend-mode: screen;">
                    <animate attributeName="opacity" values="0.9;0" dur="0.15s" begin="0.05s" fill="freeze" />
                    <animateTransform attributeName="transform" type="scale" from="0.5 0.5" to="1.2 1.2" dur="0.15s" fill="freeze" />
                 </path>
                 <path d="M 25 25 Q 100 100 175 175" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8">
                     <animate attributeName="opacity" values="0.8;0" dur="0.2s" fill="freeze" />
                 </path>
            </svg>`;

            slash.style.position = 'absolute';
            slash.style.left = '50%';
            slash.style.top = '50%';
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            slash.style.transform = `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg) scale(${scale})`;
            el.appendChild(slash);
        } else {
            // Final Heavy Hit (16th)
            const finalSlash = document.createElement('div');
            finalSlash.className = 'vfx-crit-slash';

            const slash1 = document.createElement('div');
            slash1.className = 'vfx-slash-cross';
            slash1.style.setProperty('--r', '-45deg');
            slash1.style.background = 'linear-gradient(to right, transparent, white, #3b82f6)';
            slash1.style.height = '8px';
            slash1.style.boxShadow = '0 0 10px #3b82f6';

            const slash2 = document.createElement('div');
            slash2.className = 'vfx-slash-cross';
            slash2.style.setProperty('--r', '45deg');
            slash2.style.background = 'linear-gradient(to right, transparent, white, #000)';
            slash2.style.height = '8px';
            slash2.style.boxShadow = '0 0 10px #000';

            const impact = document.createElement('div');
            impact.className = 'vfx-impact-flash';
            impact.style.background = 'radial-gradient(circle, #93c5fd, transparent)';
            impact.style.transform = 'translate(-50%, -50%) scale(2)';

            finalSlash.appendChild(slash1);
            finalSlash.appendChild(slash2);
            finalSlash.appendChild(impact);
            el.appendChild(finalSlash);

            const screen = document.getElementById('battle-screen');
            screen.classList.add('void-invert');
            setTimeout(() => screen.classList.remove('void-invert'), 200);
            screen.classList.add('screen-shake');
            setTimeout(() => screen.classList.remove('screen-shake'), 300);
        }

        vfx.appendChild(el);
    }

    _playGalaxySpotlight(vfx) {
        const el = document.createElement('div'); el.className = 'vfx-galaxy-spotlight';

        // 1. Spotlight Beam (Targeting - Pale Green)
        const spotlight = document.createElement('div');
        spotlight.className = 'vfx-spotlight-beam';
        el.appendChild(spotlight);

        // 2. Galaxy Spiral (Charge)
        const spiral = document.createElement('div');
        spiral.className = 'vfx-galaxy-spiral';
        el.appendChild(spiral);

        // 3. Galaxy Stars (Particles - Increased count & variety)
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = 'vfx-galaxy-star';
            const size = 3 + Math.random() * 8;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // Random delay for burst effect
            const delay = 0.8 + Math.random() * 0.4;
            star.style.setProperty('--delay', `${delay}s`);

            // Spread further
            star.style.setProperty('--x', `${(Math.random() - 0.5) * 600}px`);
            star.style.setProperty('--y', `${(Math.random() - 0.5) * 600}px`);

            // Rotation for dynamic movement
            star.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);

            // Sumire Colors: Pale Green, Purple, White
            const colorType = Math.random();
            if (colorType > 0.6) {
                star.style.backgroundColor = '#86efac'; // Pale Green
                star.style.boxShadow = '0 0 6px #86efac';
            } else if (colorType > 0.3) {
                star.style.backgroundColor = '#a855f7'; // Purple
                star.style.boxShadow = '0 0 6px #a855f7';
            } else {
                star.style.backgroundColor = '#ffffff'; // White
                star.style.boxShadow = '0 0 8px #ffffff';
            }

            el.appendChild(star);
        }

        // 4. Shockwave (Attack Impact)
        const shockwave = document.createElement('div');
        shockwave.className = 'vfx-galaxy-shockwave';
        el.appendChild(shockwave);

        // 5. Screen Flash (Finish)
        setTimeout(() => {
            const screen = document.getElementById('battle-screen');
            if (screen) {
                screen.classList.add('void-invert');
                setTimeout(() => screen.classList.remove('void-invert'), 200);
            }
        }, 1200); // Sychronized with shockwave impact

        vfx.appendChild(el);
    }
}
