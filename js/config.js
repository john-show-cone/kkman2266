/**
 * 遊戲配置文件
 * 可在此調整遊戲難度、平衡性等參數
 */

const GAME_CONFIG = {
    // 遊戲難度設置
    difficulty: {
        easy: {
            name: '簡單',
            goldMultiplier: 1.2,
            damageMultiplier: 0.8,
            enemyHealthMultiplier: 0.8
        },
        normal: {
            name: '標準',
            goldMultiplier: 1.0,
            damageMultiplier: 1.0,
            enemyHealthMultiplier: 1.0
        },
        hard: {
            name: '困難',
            goldMultiplier: 0.8,
            damageMultiplier: 1.2,
            enemyHealthMultiplier: 1.2
        }
    },

    // 初始遊戲參數
    gameStart: {
        initialGold: 500,
        initialHealth: 100,
        totalWaves: 5
    },

    // 塔的平衡參數
    towers: {
        costMultiplier: 1.0,
        damageMultiplier: 1.0,
        rangeMultiplier: 1.0,
        upgradeBaseCost: 1.5
    },

    // 敵人的平衡參數
    enemies: {
        healthMultiplier: 1.0,
        speedMultiplier: 1.0,
        rewardMultiplier: 1.0
    },

    // 遊戲物理參數
    physics: {
        towerPlacementMinDistance: 50,
        towerAttackUpdateFrequency: 0.016, // 以秒為單位
        gameLoopFPS: 60
    },

    // 視覺效果
    visuals: {
        showDamageNumbers: true,
        showAttackRange: true,
        particleEffectsEnabled: true
    },

    // 遊戲平衡數據（用於調整遊戲難度）
    balancing: {
        // 每波敵人等級倍增（難度 × 波次）
        waveScaling: 1.15,
        
        // 地形加成
        terrainBonus: {
            water: 0.3,    // 火系 +30%
            mountain: -0.3 // 射程 -30%
        },

        // 五行相克基礎倍數
        elementalDamage: {
            strong: 1.3,
            weak: 0.7,
            neutral: 1.0
        }
    }
};

// 當前活躍配置
let ACTIVE_CONFIG = GAME_CONFIG.difficulty.normal;

/**
 * 設定遊戲難度
 */
function setGameDifficulty(difficultyLevel) {
    if (GAME_CONFIG.difficulty[difficultyLevel]) {
        ACTIVE_CONFIG = GAME_CONFIG.difficulty[difficultyLevel];
        console.log(`遊戲難度已設定為: ${ACTIVE_CONFIG.name}`);
    }
}