// map_simulator.js

const LAYERS = 10;
const LANES = 4;

// Mock Config
const MAP_CONFIG = {
    act1: {
        multiplier: { start: 0.9, mid: 1.1, elite: 1.25, boss: 1.4 }
    }
};

// State Mock
const state = {
    currentAct: 1,
    nodeMap: []
};

// Helper: Weighted Random
function weightedRandom(weights) {
    let total = 0;
    Object.values(weights).forEach(w => total += w);
    let random = Math.random() * total;
    for (const type in weights) {
        random -= weights[type];
        if (random <= 0) return type;
    }
    return 'battle';
}

function generateMap() {
    const nodeStore = {};

    // --- 1. Structure Generation (Grid & Lanes) ---

    // Layer 0: Start (3 Nodes: Lanes 0, 1, 3)
    // User requested "3 nodes initially".
    nodeStore[0] = [
        { layer: 0, lane: 0, type: 'battle', nextLanes: [] },
        { layer: 0, lane: 1, type: 'battle', nextLanes: [] },
        { layer: 0, lane: 3, type: 'battle', nextLanes: [] }
    ];

    // Layer 1-3: 4 Lanes
    for (let l = 1; l <= 3; l++) {
        nodeStore[l] = [];
        for (let lane = 0; lane < LANES; lane++) {
            nodeStore[l].push({ layer: l, lane: lane, type: '?', nextLanes: [] });
        }
    }

    // Layer 4: Shop (Convergence) - Single Node Lane 1 (Center-ish)
    nodeStore[4] = [{ layer: 4, lane: 1, type: 'shop', nextLanes: [] }];

    // Layer 5-7: 4 Lanes
    for (let l = 5; l <= 7; l++) {
        nodeStore[l] = [];
        for (let lane = 0; lane < LANES; lane++) {
            nodeStore[l].push({ layer: l, lane: lane, type: '?', nextLanes: [] });
        }
    }

    // Layer 8: Rest (Convergence) - Single Node Lane 1
    nodeStore[8] = [{ layer: 8, lane: 1, type: 'rest', nextLanes: [] }];

    // Layer 9: Boss (Convergence) - Single Node Lane 1
    nodeStore[9] = [{ layer: 9, lane: 1, type: 'boss', nextLanes: [] }];


    // --- 2. Connection Logic (No Crossing) ---
    // Rule: Connect to valid neighbors in next layer.
    // If Next Layer is Convergence (Single Node): Connect ALL to it.
    // If Current Layer is Convergence: Connect to ALL Next nodes? Or spread?
    //   - Convergence -> Divergence (L4 -> L5): Connect the single shop to ALL 4 lanes in L5.

    for (let l = 0; l < LAYERS - 1; l++) {
        const currentNodes = nodeStore[l];
        const nextNodes = nodeStore[l + 1];

        // Case A: Next is Convergence (L3->L4, L7->L8, L8->L9)
        if (nextNodes.length === 1) {
            const targetLane = nextNodes[0].lane;
            currentNodes.forEach(node => {
                node.nextLanes.push(targetLane);
            });
            continue;
        }

        // Case B: Current is Convergence (L4->L5)
        if (currentNodes.length === 1) {
            // Diverge to all accessible lanes (usually all 4)
            const node = currentNodes[0];
            nextNodes.forEach(next => {
                node.nextLanes.push(next.lane);
            });
            continue;
        }

        // Case C: Grid to Grid (L0->L1, L1->L2, L2->L3, L5->L6, L6->L7)
        // Standard approach: Connect to self, left, right.
        // To prevent crossing: Just relying on relative neighbors is safe.
        // L0 is special (Lanes 0, 1, 3).
        // L1 is (0, 1, 2, 3).

        currentNodes.forEach(node => {
            // Potential targets: lane-1, lane, lane+1
            // Randomly pick 1-3 connections to create variety?
            // "Must connect to at least one"

            let potentialLanes = [node.lane - 1, node.lane, node.lane + 1];

            // Filter by existing lanes in next layer
            potentialLanes = potentialLanes.filter(pLane => nextNodes.some(n => n.lane === pLane));

            // To ensure forward progress and connectivity, strictly connect.
            // If we Randomize, we risk dead ends? 
            // "Walker" logic ensured paths.
            // Let's force connect to 'straight' path (lane) if exists, plus random neighbors.

            // Strategy: Always connect to closest lane to keep safe. 
            // Plus 50% chance for other neighbor.

            // Simplified: Connect to ALL valid [L-1, L, L+1].
            // This creates a dense web.
            // User wanted "Diverse choices". Dense web is good.

            potentialLanes.forEach(pLane => {
                if (!node.nextLanes.includes(pLane)) {
                    node.nextLanes.push(pLane);
                }
            });
        });
    }

    // --- 3. Type Assignment (Dynamic Weights) ---
    // Iterate layers 1-7 (excluding fixed L4).

    // Parent Lookup Helper
    const getParentTypes = (layerIdx, currentLane) => {
        if (layerIdx === 0) return [];
        const parents = [];
        nodeStore[layerIdx - 1].forEach(p => {
            if (p.nextLanes.includes(currentLane)) {
                parents.push(p.type);
            }
        });
        return parents;
    };

    const isSafe = (type) => ['shop', 'rest', 'event'].includes(type);

    for (let l = 1; l < LAYERS - 1; l++) {
        if (l === 4 || l === 8) continue; // Fixed

        nodeStore[l].forEach(node => {
            if (l === 7) {
                // Pre-Rest fix: Battle or Elite
                node.type = Math.random() < 0.3 ? 'elite' : 'battle';
                return;
            }
            if (l === 3) {
                // Pre-Shop fix: Battle or Elite (Buffer)
                node.type = Math.random() < 0.2 ? 'elite' : 'battle';
                return;
            }

            const parentTypes = getParentTypes(l, node.lane);
            const anyParentSafe = parentTypes.some(t => isSafe(t));

            let weights = { battle: 0, elite: 0, event: 0, shop: 0, rest: 0 };

            if (anyParentSafe) {
                // Parent Safe -> FORCE Battle/Elite heavily
                // "No pacifist route": Can we force it?
                // Yes, let's zero out safe options if parent was safe.
                weights.battle = 80;
                weights.elite = (l >= 5) ? 20 : 5;
                // Zero others
            } else {
                // Parent Combat -> Relaxed
                weights.battle = 25;
                weights.elite = (l >= 5) ? 10 : 5;
                weights.event = 40;
                weights.shop = 10;
                weights.rest = 10;
            }

            node.type = weightedRandom(weights);
        });
    }

    return nodeStore;
}

// --- Simulation Runner ---

const RESULTS = {
    totalElites: 0,
    minElites: 99,
    maxElites: 0,
    totalShops: 0, // Excluding fixed L4
    totalEvents: 0,
    totalRests: 0, // Excluding fixed L8
    deadEnds: 0,
    crossingChecks: 0 // Simple crossing check?
};

const ITERATIONS = 100;

for (let i = 0; i < ITERATIONS; i++) {
    const map = generateMap();

    // Analyze Map
    let elites = 0;
    let shops = 0;
    let events = 0;
    let rests = 0;

    Object.keys(map).forEach(l => {
        if (l == 4 || l == 8 || l == 9 || l == 0) return; // Skip fixed/start for counting flexible ones?
        // Actually count all
        map[l].forEach(n => {
            if (n.type === 'elite') elites++;
            if (n.type === 'shop' && l != 4) shops++;
            if (n.type === 'event') events++;
            if (n.type === 'rest' && l != 8) rests++;
        });
    });

    // Check Connectivity (reachability from L0 to L9)
    // BFS
    let reachable = new Set();
    map[0].forEach(n => reachable.add(`${n.layer}-${n.lane}`));

    for (let l = 0; l < 9; l++) {
        const nextReachable = new Set();
        map[l].forEach(n => {
            if (reachable.has(`${n.layer}-${n.lane}`)) {
                n.nextLanes.forEach(nextLane => {
                    nextReachable.add(`${l + 1}-${nextLane}`);
                });
            }
        });
        reachable = nextReachable; // Move to next layer
    }

    if (!reachable.has('9-1')) {
        RESULTS.deadEnds++;
    }

    RESULTS.totalElites += elites;
    RESULTS.minElites = Math.min(RESULTS.minElites, elites);
    RESULTS.maxElites = Math.max(RESULTS.maxElites, elites);
    RESULTS.totalShops += shops;
    RESULTS.totalEvents += events;
    RESULTS.totalRests += rests;
}

console.log('--- Simulation Results (100 runs) ---');
console.log(`Avg Elites: ${RESULTS.totalElites / ITERATIONS}`);
console.log(`Range Elites: ${RESULTS.minElites} - ${RESULTS.maxElites}`);
console.log(`Avg Random Shops: ${RESULTS.totalShops / ITERATIONS}`);
console.log(`Avg Events: ${RESULTS.totalEvents / ITERATIONS}`);
console.log(`Avg Random Rests: ${RESULTS.totalRests / ITERATIONS}`);
console.log(`Dead Ends (Broken Maps): ${RESULTS.deadEnds}`);
