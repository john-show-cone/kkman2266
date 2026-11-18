/**
 * 工具函數集合
 */

// 五行系統 (相剋機制)
const ELEMENTS = {
    WOOD: 'wood',      // 木 - 蜀
    FIRE: 'fire',      // 火 - 火系
    EARTH: 'earth',    // 土 - 通用
    METAL: 'metal',    // 金 - 魏
    WATER: 'water'     // 水 - 吳
};

// 陣營系統
const FACTIONS = {
    CAO: 'cao',        // 曹魏
    LIU: 'liu',        // 劉蜀
    SUN: 'sun'         // 孫吳
};

// 地形系統
const TERRAIN = {
    PLAIN: { name: '平原', fireBonus: 0, shootBonus: 0 },
    WATER: { name: '水域', fireBonus: 0.3, shootBonus: -0.2 },
    MOUNTAIN: { name: '山地', fireBonus: 0, shootBonus: -0.3 }
};

/**
 * 計算相剋傷害加成
 * @param {string} attackerElement - 攻擊方元素
 * @param {string} targetElement - 防禦方元素
 * @returns {number} 傷害倍數
 */
function calculateElementalDamage(attackerElement, targetElement) {
    const chart = {
        [ELEMENTS.WOOD]: { [ELEMENTS.EARTH]: 1.3, [ELEMENTS.WATER]: 1.0, [ELEMENTS.FIRE]: 0.8, [ELEMENTS.METAL]: 0.7 },
        [ELEMENTS.FIRE]: { [ELEMENTS.METAL]: 1.3, [ELEMENTS.WOOD]: 1.0, [ELEMENTS.WATER]: 0.7, [ELEMENTS.EARTH]: 0.9 },
        [ELEMENTS.EARTH]: { [ELEMENTS.WATER]: 1.3, [ELEMENTS.FIRE]: 1.0, [ELEMENTS.METAL]: 0.8, [ELEMENTS.WOOD]: 0.7 },
        [ELEMENTS.METAL]: { [ELEMENTS.WOOD]: 1.3, [ELEMENTS.EARTH]: 1.0, [ELEMENTS.FIRE]: 0.8, [ELEMENTS.WATER]: 0.7 },
        [ELEMENTS.WATER]: { [ELEMENTS.FIRE]: 1.3, [ELEMENTS.METAL]: 1.0, [ELEMENTS.EARTH]: 0.8, [ELEMENTS.WOOD]: 0.7 }
    };
    
    return chart[attackerElement] && chart[attackerElement][targetElement] ? 
        chart[attackerElement][targetElement] : 1.0;
}

/**
 * 計算距離
 * @param {object} p1 - 點1 {x, y}
 * @param {object} p2 - 點2 {x, y}
 * @returns {number} 距離
 */
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 獲取角度
 * @param {object} from - 起點
 * @param {object} to - 終點
 * @returns {number} 角度 (弧度)
 */
function getAngle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * 獲取方向向量
 */
function getDirection(from, to) {
    const angle = getAngle(from, to);
    return {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };
}

/**
 * 檢查圓形碰撞
 */
function checkCircleCollision(c1, c2) {
    const dist = distance(c1, c2);
    return dist < (c1.radius || 0) + (c2.radius || 0);
}

/**
 * 獲取範圍內的對象
 */
function getObjectsInRange(pos, range, objects) {
    return objects.filter(obj => distance(pos, obj) <= range);
}

/**
 * 隨機數函數
 */
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 隨機浮點數
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 格式化數字 (添加千位分隔符)
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 暫停執行(延時)
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 擁有淡出效果的粒子效果
 */
class Particle {
    constructor(x, y, vx, vy, size, color, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
    }

    update(dt) {
        this.age += dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        const progress = this.age / this.lifetime;
        const opacity = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.age >= this.lifetime;
    }
}

/**
 * 取得地形加成
 */
function getTerrainBonus(terrain, towerType) {
    const bonuses = {
        'archer': { [Object.keys(TERRAIN)[0]]: 1 },
        'mage': { [Object.keys(TERRAIN)[1]]: 1.3 }, // 水域法術加成
        'cavalry': { [Object.keys(TERRAIN)[0]]: 1.2 }
    };
    
    return bonuses[towerType] ? (bonuses[towerType][terrain] || 1) : 1;
}