class SkillEffectManager {
    constructor(game) {
        this.game = game;
    }

    async playEffect(actor, target, skill, damageType) {
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
            // チャージエフェクト（actor側）
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
                setTimeout(() => chargeVfx.remove(), 700);
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
                el.classList.add('vfx-projectile-dynamic');
            } else {
                // フォールバック
                if (this.game.state.battle.enemies.includes(actor)) {
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
            }, 1000); // Trigger at damage timing (approx)
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
        // New Mappings
        else if (skillId === 'spy_technique') { this._playScan(vfx, 'green'); } // Loid
        else if (skillId === 'nyammy_shield') { this._playBarrier(vfx, 'pink', 'cat'); } // Nyammy
        else if (skillId === 'future_zura') { this._playSparkles(vfx, 'yellow', 'star'); } // Hanamaru
        else if (skillId === 'onigiri_miya') { this._playSparkles(vfx, 'white', 'circle'); } // Osamu
        else if (skillId === 'don_pishhari') { this._playSparkles(vfx, 'gold', 'twin'); } // Atsumu
        else if (skillId === 'assassination') { this._playCritSlash(vfx, 'crimson'); } // Yor

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
                                                                                        (skillId === 'burst_stream') ? 1800 : // 滅びの爆裂疾風弾: 1.8s
                                                                                            (skillId === 'pineapple_stake') ? 1100 : // 鳳梨磔: 1.1s
                                                                                                (skillId === 'big_light') ? 1000 : // ビッグライト: 1.0s
                                                                                                    (skillId === 'judrajim') ? 800 : // ジュドラジルム (Raikiri base): 0.8s
                                                                                                        (skillId === 'zukyuun_bazooka') ? 1800 :
                                                                                                            (skillId === 'rasengan' || skillId === 'saijin_serve' || skillId === 'saikyou_no_omo') ? 1300 :
                                                                                                                (skillId === 'teppen_strike' || skillId === 'edelstein' || skillId === 'flame_alchemy') ? 1200 :
                                                                                                                    (skillId === 'dark_slash' || skillId === 'mentan_ken') ? 1200 :
                                                                                                                        (skillId === 'sand_coffin' || skillId === 'shadow_possession') ? 1500 :
                                                                                                                            1000;
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
            }, 800);
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
        el.className = type === 'tornado' ? 'vfx-shiny-tornado' : 'vfx-scarlet-storm';
        el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;

        if (type === 'tornado') {
            const tornado = document.createElement('div'); tornado.className = 'vfx-tornado-core';
            el.appendChild(tornado);
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-tornado-particle';
                const height = (i / 15) * 180;
                particle.style.setProperty('--y', `${-height}px`);
                particle.style.setProperty('--angle', `${i * 2}rad`);
                particle.style.setProperty('--delay', `${i * 0.05}s`);
                el.appendChild(particle);
            }
        } else {
            // Explosion
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
        screen.classList.add('void-invert');
        setTimeout(() => screen.classList.remove('void-invert'), 300);

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

        // Pillars (Enhancement for Dave)
        for (let i = 0; i < 5; i++) {
            const pillar = document.createElement('div');
            pillar.className = 'vfx-ice-pillar';
            pillar.style.setProperty('--index', i);
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
        el.style.filter = `hue-rotate(${this._getHueRotate(color)})`;
        if (color === 'green') el.style.filter = 'hue-rotate(120deg) brightness(1.5)';

        const grid = document.createElement('div'); grid.className = 'vfx-scan-grid';
        el.appendChild(grid);
        const line = document.createElement('div'); line.className = 'vfx-scan-line';
        el.appendChild(line);
        vfx.appendChild(el);
    }

    _playBarrier(vfx, color, type = 'hex') {
        const el = document.createElement('div'); el.className = 'vfx-barrier-container';
        if (type === 'cat') {
            const cat = document.createElement('div'); cat.className = 'vfx-cat-barrier';
            if (color === 'pink') cat.style.borderColor = '#f472b6';
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

        for (let i = 0; i < num; i++) {
            const p = document.createElement('div');
            p.className = `vfx-sparkle-${shape}`;
            p.style.setProperty('--delay', `${i * 0.1}s`);
            if (shape === 'twin') {
                p.style.left = i === 0 ? '30%' : '70%';
                p.style.top = '50%';
                p.style.animationName = 'vfx-flash';
            } else {
                p.style.left = `${Math.random() * 100}%`;
                p.style.top = `${Math.random() * 100}%`;
            }
            // Color override
            if (color === 'pink') p.style.color = '#f472b6';
            if (color === 'gold') p.style.color = '#fbbf24';
            if (color === 'yellow') p.style.color = '#facc15';

            el.appendChild(p);
        }
        vfx.appendChild(el);
    }

    _playHearts(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-heart-storm';
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div'); heart.className = 'vfx-heart-particle';
            heart.textContent = '❤';
            heart.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
            heart.style.setProperty('--delay', `${i * 0.05}s`);
            if (color === 'pink') heart.style.color = '#f472b6';
            el.appendChild(heart);
        }
        vfx.appendChild(el);
    }

    _playButterflies(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-butterfly-swarm';
        for (let i = 0; i < 10; i++) {
            const b = document.createElement('div'); b.className = 'vfx-butterfly';
            b.style.setProperty('--x', `${(Math.random() - 0.5) * 150}px`);
            b.style.setProperty('--delay', `${i * 0.1}s`);
            if (color === 'gold') b.style.filter = 'sepia(1) saturate(5) hue-rotate(45deg)';
            el.appendChild(b);
        }
        vfx.appendChild(el);
    }

    _playCritSlash(vfx, color) {
        const el = document.createElement('div'); el.className = 'vfx-crit-slash';
        const slash = document.createElement('div'); slash.className = 'vfx-slash-pro red';
        if (color === 'crimson') slash.style.filter = 'hue-rotate(-20deg) saturate(2) brightness(0.8)';

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
}
