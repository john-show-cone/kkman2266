/**
 * 敵人系統定義
 * 包括小兵、精英單位和Boss
 */

// ============ 敵人類型定義 ============
const ENEMY_TYPES = {
    // 基礎雜兵
    SOLDIER: {
        id: 'soldier',
        name: '普通士兵',
        icon: '🪖',
        health: 20,
        speed: 80,
        armor: 0,
        reward: 25,
        element: ELEMENTS.EARTH,
        faction: FACTIONS.CAO
    },

    // 精英雜兵
    ELITE_SOLDIER: {
        id: 'elite_soldier',
        name: '精英士兵',
        icon: '⚔️',
        health: 40,
        speed: 90,
        armor: 0.1,
        reward: 50,
        element: ELEMENTS.METAL,
        faction: FACTIONS.CAO
    },

    // 速度型
    SCOUT: {
        id: 'scout',
        name: '斥候',
        icon: '🏃',
        health: 15,
        speed: 150,
        armor: 0,
        reward: 30,
        element: ELEMENTS.FIRE,
        faction: FACTIONS.SUN
    },

    // 防禦型
    HEAVY_ARMOR: {
        id: 'heavy_armor',
        name: '重裝兵',
        icon: '🛡️',
        health: 60,
        speed: 60,
        armor: 0.3,
        reward: 60,
        element: ELEMENTS.EARTH,
        faction: FACTIONS.CAO
    },

    // 隊長級 - 精英隊長
    CAPTAIN: {
        id: 'captain',
        name: '隊長',
        icon: '🎖️',
        health: 80,
        speed: 100,
        armor: 0.15,
        reward: 100,
        element: ELEMENTS.METAL,
        faction: FACTIONS.CAO,
        isBoss: false
    },

    // Boss 級 - 猛將
    ZHANG_LU: {
        id: 'zhang_lu',
        name: '張魯',
        icon: '👹',
        health: 150,
        speed: 70,
        armor: 0.25,
        reward: 200,
        element: ELEMENTS.EARTH,
        faction: FACTIONS.CAO,
        isBoss: true,
        special: '五行護盾'
    },

    // Boss - 董卓
    DONG_ZHUO: {
        id: 'dong_zhuo',
        name: '董卓',
        icon: '😈',
        health: 250,
        speed: 60,
        armor: 0.4,
        reward: 400,
        element: ELEMENTS.FIRE,
        faction: FACTIONS.CAO,
        isBoss: true,
        special: '混亂光環'
    },

    // Boss - 呂布
    LU_BU: {
        id: 'lu_bu',
        name: '呂布',
        icon: '🥷',
        health: 200,
        speed: 120,
        armor: 0.2,
        reward: 350,
        element: ELEMENTS.METAL,
        faction: FACTIONS.CAO,
        isBoss: true,
        special: '無敵斬擊'
    }
};

/**
 * 敵人類
 */
class Enemy {
    constructor(type, pathPoints) {
        this.type = type;
        this.icon = type.icon;
        this.name = type.name;
        this.health = type.health;
        this.maxHealth = type.health;
        this.speed = type.speed;
        this.armor = type.armor;
        this.reward = type.reward;
        this.element = type.element;
        this.faction = type.faction;
        this.isBoss = type.isBoss || false;

        // 路徑相關
        this.pathPoints = pathPoints;
        this.pathIndex = 0;
        this.pathProgress = 0; // 0-1 表示在路徑上的進度
        this.x = pathPoints[0].x;
        this.y = pathPoints[0].y;

        // 特殊效果
        this.slowAmount = 0;
        this.slowTimer = 0;
        this.stunTimer = 0;
        this.burnDamage = 0;
        this.burnTimer = 0;

        // 雜志
        this.particles = [];
        this.radius = 15;
    }

    update(dt) {
        // 更新減速
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
        } else {
            this.slowAmount = 0;
        }

        // 更新眩暈
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return; // 眩暈時不移動
        }

        // 更新燃燒
        if (this.burnTimer > 0) {
            this.burnTimer -= dt;
            if (Math.random() < 0.3) { // 概率造成燃燒傷害
                this.takeDamage(this.burnDamage);
            }
        } else {
            this.burnDamage = 0;
        }

        // 移動沿著路徑
        const moveDistance = this.speed * (1 - this.slowAmount) * dt;
        this.move(moveDistance);

        // 更新粒子
        this.particles = this.particles.filter(p => !p.isDead());
        this.particles.forEach(p => p.update(dt));
    }

    move(moveDistance) {
        while (moveDistance > 0 && this.pathIndex < this.pathPoints.length) {
            const currentPoint = this.pathPoints[this.pathIndex];
            const nextPoint = this.pathPoints[this.pathIndex + 1];

            if (!nextPoint) {
                this.pathIndex = this.pathPoints.length;
                break;
            }

            const segmentDistance = distance(currentPoint, nextPoint);
            const distanceToNextPoint = segmentDistance * (1 - this.pathProgress);

            if (moveDistance >= distanceToNextPoint) {
                moveDistance -= distanceToNextPoint;
                this.pathIndex++;
                this.pathProgress = 0;
            } else {
                this.pathProgress += moveDistance / segmentDistance;
                moveDistance = 0;
            }
        }

        // 更新坐標
        if (this.pathIndex < this.pathPoints.length) {
            const currentPoint = this.pathPoints[this.pathIndex];
            const nextPoint = this.pathPoints[Math.min(this.pathIndex + 1, this.pathPoints.length - 1)];

            this.x = currentPoint.x + (nextPoint.x - currentPoint.x) * this.pathProgress;
            this.y = currentPoint.y + (nextPoint.y - currentPoint.y) * this.pathProgress;
        }
    }

    draw(ctx) {
        // 繪製敵人
        const color = this.isBoss ? '#ff0000' : '#ffaa00';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // 繪製邊框
        ctx.strokeStyle = this.isBoss ? '#ff6b6b' : '#ff6b6b';
        ctx.lineWidth = this.isBoss ? 3 : 2;
        ctx.stroke();

        // 繪製圖標
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.icon, this.x, this.y);

        // 繪製生命值條
        const barWidth = 40;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#f44336';
        ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth * healthPercent, barHeight);

        const healthText = `${Math.max(0, Math.round(this.health))}/${this.maxHealth}`;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(healthText, this.x, this.y - 28);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(healthText, this.x, this.y - 28);

        // 繪製特殊狀態
        if (this.slowTimer > 0) {
            ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
            ctx.fillRect(this.x - 5, this.y + 20, 10, 8);
        }
        if (this.stunTimer > 0) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
            ctx.fillRect(this.x + 10, this.y + 20, 10, 8);
        }
        if (this.burnTimer > 0) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
            ctx.fillRect(this.x - 20, this.y + 20, 10, 8);
        }

        // 繪製粒子
        this.particles.forEach(p => p.draw(ctx));
    }

    applySlowEffect(duration, slowAmount) {
        this.slowTimer = duration;
        this.slowAmount = Math.max(this.slowAmount, slowAmount);
    }

    applyStunEffect(duration) {
        this.stunTimer = duration;
    }

    applyBurnEffect(damage, duration) {
        this.burnDamage = damage;
        this.burnTimer = duration;
    }

    takeDamage(damage) {
        // 計算護甲減傷
        const reducedDamage = damage * (1 - this.armor);
        this.health -= reducedDamage;

        // 創建傷害數字
        this.createDamageParticles(reducedDamage);

        return this.health <= 0;
    }

    createDamageParticles(damage) {
        const damageText = Math.floor(damage);
        // 這裡可以添加浮動傷害數字效果
    }

    isAlive() {
        return this.health > 0 && this.pathIndex < this.pathPoints.length;
    }

    hasReachedEnd() {
        return this.pathIndex >= this.pathPoints.length;
    }

    getReward() {
        return Math.floor(this.reward * (this.maxHealth / ENEMY_TYPES.SOLDIER.health));
    }
}

/**
 * 波次定義
 */
const WAVE_DEFINITIONS = {
    1: [ // 波次1
        { type: ENEMY_TYPES.SOLDIER, count: 8, delay: 0.3 },
        { type: ENEMY_TYPES.ELITE_SOLDIER, count: 3, delay: 0.5 }
    ],
    2: [
        { type: ENEMY_TYPES.SOLDIER, count: 10, delay: 0.2 },
        { type: ENEMY_TYPES.SCOUT, count: 5, delay: 0.4 }
    ],
    3: [
        { type: ENEMY_TYPES.ELITE_SOLDIER, count: 6, delay: 0.3 },
        { type: ENEMY_TYPES.HEAVY_ARMOR, count: 3, delay: 0.6 }
    ],
    4: [
        { type: ENEMY_TYPES.HEAVY_ARMOR, count: 8, delay: 0.2 },
        { type: ENEMY_TYPES.CAPTAIN, count: 2, delay: 1.0 }
    ],
    5: [
        { type: ENEMY_TYPES.CAPTAIN, count: 5, delay: 0.4 },
        { type: ENEMY_TYPES.ZHANG_LU, count: 1, delay: 2.0 }
    ]
};