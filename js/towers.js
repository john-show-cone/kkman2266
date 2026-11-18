/**
 * 塔的定義系統
 * 包括武將塔和士兵塔
 */

// ============ 武將塔定義 ============
const GENERAL_TOWERS = {
    // 諸葛亮 - 法術減速型
    ZHUGE_LIANG: {
        id: 'zhuge_liang',
        name: '諸葛亮',
        icon: '🧙',
        description: '遠程法術師，能減速敵人',
        cost: 200,
        element: ELEMENTS.WOOD,
        faction: FACTIONS.LIU,
        type: 'general',
        stats: {
            damage: 15,
            attackSpeed: 1.0,
            range: 250,
            slowDuration: 2,
            slowAmount: 0.5
        },
        description_full: '諸葛亮運用八卦陣施放法術，可減速敵人50%移動速度，持續2秒。適合控制敵人步伐。'
    },

    // 關羽 - 近戰群攻型
    GUAN_YU: {
        id: 'guan_yu',
        name: '關羽',
        icon: '🗡️',
        description: '近距離單位，群體傷害',
        cost: 180,
        element: ELEMENTS.FIRE,
        faction: FACTIONS.LIU,
        type: 'general',
        stats: {
            damage: 25,
            attackSpeed: 1.5,
            range: 120,
            areaRadius: 80
        },
        description_full: '關羽揮舞青龍偃月刀，能對80範圍內的所有敵人造成傷害。'
    },

    // 黃忠 - 遠程狙擊型
    HUANG_ZHONG: {
        id: 'huang_zhong',
        name: '黃忠',
        icon: '🏹',
        description: '超遠程狙擊，致命一擊',
        cost: 250,
        element: ELEMENTS.METAL,
        faction: FACTIONS.LIU,
        type: 'general',
        stats: {
            damage: 40,
            attackSpeed: 0.8,
            range: 400,
            criticalChance: 0.3,
            criticalDamage: 2.0
        },
        description_full: '黃忠的箭術無人能敵，30%機會造成2倍傷害的致命一擊。'
    },

    // 呂蒙 - 智將控制型
    LU_MENG: {
        id: 'lu_meng',
        name: '劉備',
        icon: '🎖️',
        description: '控制型將領，騷擾敵人',
        cost: 200,
        element: ELEMENTS.WATER,
        faction: FACTIONS.SUN,
        type: 'general',
        stats: {
            damage: 12,
            attackSpeed: 1.2,
            range: 200,
            stunDuration: 1.5,
            stunChance: 0.25
        },
        description_full: '呂蒙運出奇謀，25%機率眩暈敵人1.5秒。'
    },

    // 張飛 - 高防禦型
    ZHANG_FEI: {
        id: 'zhang_fei',
        name: '張飛',
        icon: '🛡️',
        description: '防禦型將領，吸收傷害',
        cost: 220,
        element: ELEMENTS.EARTH,
        faction: FACTIONS.LIU,
        type: 'general',
        stats: {
            damage: 18,
            attackSpeed: 1.0,
            range: 150,
            defense: 0.6,
            healthPool: 250
        },
        description_full: '張飛能減少60%受到的傷害，生命值250。'
    },

    // 曹操 - 策略型加成
    CAO_CAO: {
        id: 'cao_cao',
        name: '趙雲',
        icon: '👑',
        description: '戰略家，提升附近塔',
        cost: 300,
        element: ELEMENTS.METAL,
        faction: FACTIONS.CAO,
        type: 'general',
        stats: {
            damage: 10,
            attackSpeed: 1.0,
            range: 180,
            auraRadius: 250,
            auraBonus: 1.2
        },
        description_full: '曹操統率天下，為250範圍內的友方塔提升20%傷害。'
    }
};

// ============ 士兵塔定義 ============
const SOLDIER_TOWERS = {
    // 步兵 - 基礎防禦
    INFANTRY: {
        id: 'infantry',
        name: '步兵',
        icon: '🪖',
        description: '基礎防禦單位',
        cost: 50,
        element: ELEMENTS.EARTH,
        faction: FACTIONS.CAO,
        type: 'soldier',
        stats: {
            damage: 8,
            attackSpeed: 2.0,
            range: 80,
            healthPool: 60
        },
        description_full: '普通步兵，便宜耐用，可用作基礎防線。'
    },

    // 弩兵 - 單體傷害
    ARCHER: {
        id: 'archer',
        name: '弩兵',
        icon: '🏹',
        description: '單體精準傷害',
        cost: 80,
        element: ELEMENTS.METAL,
        faction: FACTIONS.CAO,
        type: 'soldier',
        stats: {
            damage: 16,
            attackSpeed: 1.5,
            range: 200,
            piercing: 0
        },
        description_full: '精準的弩箭能對單個敵人造成高傷害。'
    },

    // 投石車 - 範圍傷害
    CATAPULT: {
        id: 'catapult',
        name: '投石車',
        icon: '🎯',
        description: '範圍爆炸傷害',
        cost: 120,
        element: ELEMENTS.FIRE,
        faction: FACTIONS.CAO,
        type: 'soldier',
        stats: {
            damage: 20,
            attackSpeed: 1.0,
            range: 250,
            areaRadius: 100
        },
        description_full: '投石車發射石塊造成範圍爆炸，可對100半徑內的敵人造成傷害。'
    },

    // 騎兵 - 快速移動
    CAVALRY: {
        id: 'cavalry',
        name: '騎兵',
        icon: '🐴',
        description: '移動快速防線',
        cost: 100,
        element: ELEMENTS.FIRE,
        faction: FACTIONS.LIU,
        type: 'soldier',
        stats: {
            damage: 12,
            attackSpeed: 1.8,
            range: 150,
            moveSpeed: 1.5
        },
        description_full: '騎兵機動靈活，能快速阻擋敵人。'
    },

    // 法師塔 - 法術傷害
    MAGE_TOWER: {
        id: 'mage',
        name: '法師塔',
        icon: '✨',
        description: '法術傷害與增益',
        cost: 110,
        element: ELEMENTS.WATER,
        faction: FACTIONS.SUN,
        type: 'soldier',
        stats: {
            damage: 18,
            attackSpeed: 1.3,
            range: 220,
            magicResistance: 0.3
        },
        description_full: '法師塔施放魔法傷害，對魔法抗性有加成。'
    },

    // 火砲塔 - 持續火焰
    BOMBARD_TOWER: {
        id: 'bombard',
        name: '火砲塔',
        icon: '🔥',
        description: '持續燃燒傷害',
        cost: 140,
        element: ELEMENTS.FIRE,
        faction: FACTIONS.CAO,
        type: 'soldier',
        stats: {
            damage: 12,
            attackSpeed: 0.9,
            range: 280,
            burnDamage: 5,
            burnDuration: 3
        },
        description_full: '持續3秒的燃燒效果，每秒造成5點傷害。'
    }
};

/**
 * 塔類定義
 */
class Tower {
    constructor(x, y, towerDef) {
        this.x = x;
        this.y = y;
        this.definition = towerDef;
        this.stats = { ...towerDef.stats };
        this.level = 1;
        this.health = this.stats.healthPool || 100;
        this.maxHealth = this.stats.healthPool || 100;
        this.lastAttackTime = 0;
        this.target = null;
        this.particles = [];
        this.upgradeCost = Math.floor(towerDef.cost * 1.5);
    }

    update(dt, enemies) {
        this.lastAttackTime += dt;
        
        // 更新粒子效果
        this.particles = this.particles.filter(p => !p.isDead());
        this.particles.forEach(p => p.update(dt));

        // 尋找目標
        const range = this.stats.range;
        const potentialTargets = enemies.filter(e => 
            distance({ x: this.x, y: this.y }, { x: e.x, y: e.y }) <= range && e.health > 0
        );

        if (potentialTargets.length > 0) {
            // 優先攻擊最前面的敵人（走得最遠的）
            this.target = potentialTargets.reduce((closest, enemy) => {
                return enemy.pathProgress > closest.pathProgress ? enemy : closest;
            });

            // 檢查是否可以攻擊
            const attackCooldown = 1 / this.stats.attackSpeed;
            if (this.lastAttackTime >= attackCooldown) {
                this.attack(this.target);
                this.lastAttackTime = 0;
            }
        } else {
            this.target = null;
        }
    }

    attack(target) {
        if (!target || target.health <= 0) return;

        let damage = this.stats.damage * this.level;
        
        // 計算元素傷害加成
        const elementalMultiplier = calculateElementalDamage(
            this.definition.element,
            target.element || ELEMENTS.EARTH
        );
        damage *= elementalMultiplier;

        // 特殊效果根據塔類型
        if (this.stats.criticalChance) {
            if (Math.random() < this.stats.criticalChance) {
                damage *= this.stats.criticalDamage;
            }
        }

        // 範圍傷害
        if (this.stats.areaRadius) {
            this.dealAreaDamage(target, damage);
        } else {
            target.takeDamage(damage);
        }

        // 減速效果
        if (this.stats.slowAmount) {
            target.applySlowEffect(
                this.stats.slowDuration,
                this.stats.slowAmount
            );
        }

        // 眩暈效果
        if (this.stats.stunChance && Math.random() < this.stats.stunChance) {
            target.applyStunEffect(this.stats.stunDuration);
        }

        // 燃燒效果
        if (this.stats.burnDamage) {
            target.applyBurnEffect(
                this.stats.burnDamage,
                this.stats.burnDuration
            );
        }

        // 創建攻擊粒子效果
        this.createAttackParticles();
        if (typeof playSound === 'function') {
            playSound('attack');
        }
    }

    dealAreaDamage(centerTarget, damage) {
        const radius = this.stats.areaRadius;
        // 範圍傷害敵人會在遊戲邏輯中處理
        centerTarget.takeDamage(damage);
    }

    createAttackParticles() {
        const particleCount = 6;
        const colors = {
            [ELEMENTS.FIRE]: '#ff9e80',
            [ELEMENTS.WATER]: '#80d6ff',
            [ELEMENTS.METAL]: '#cfd8dc',
            [ELEMENTS.WOOD]: '#b9f6ca',
            [ELEMENTS.EARTH]: '#ffd54f'
        };
        const color = colors[this.definition.element] || '#f5f5f5';
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 120;
            this.particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                4,
                color,
                0.4
            ));
        }
    }

    draw(ctx) {
        // 特殊處理步兵塔圖案與名稱
        if (this.definition.id === 'infantry') {
            ctx.fillStyle = '#4a6b4b';
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - 22, this.y + 10);
            ctx.lineTo(this.x - 14, this.y - 20);
            ctx.lineTo(this.x + 14, this.y - 20);
            ctx.lineTo(this.x + 22, this.y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#fff';
            ctx.fillText(this.displayName || this.definition.name, this.x, this.y - 26);

            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(this.definition.icon, this.x, this.y - 4);
        } else {
            // 繪製塔
            ctx.fillStyle = this.definition.element === ELEMENTS.FIRE ? '#ff6b6b' : '#d4af37';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
            ctx.fill();

            if (this.definition.type === 'general' || this.definition.type === 'soldier') {
                ctx.save();
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(this.displayName || this.definition.name, this.x, this.y - 26);
                ctx.restore();
            }

            // 繪製圖標
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.definition.icon, this.x, this.y);
        }

        // 繪製攻擊範圍 (當選中時)
        if (gameState && gameState.selectedTower === this) {
            ctx.strokeStyle = 'rgba(255, 106, 106, 0.35)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.range * 1.15, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 繪製攻擊連線
        if (this.target && this.target.health > 0) {
            ctx.strokeStyle = 'rgba(255, 230, 120, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
        }

        // 繪製生命值條
        if (this.health < this.maxHealth) {
            const barWidth = 50;
            const barHeight = 5;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barWidth/2, this.y - 35, barWidth, barHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x - barWidth/2, this.y - 35, barWidth * (this.health / this.maxHealth), barHeight);
        }

        // 繪製粒子效果
        this.particles.forEach(p => p.draw(ctx));
    }

    upgrade() {
        this.level++;
        this.maxHealth += 25;
        this.health = this.maxHealth;
        this.stats.damage = Math.max(1, Math.round(this.stats.damage * 1.15));
        if (this.stats.range) this.stats.range = Math.round(this.stats.range * 1.1);
        if (this.stats.areaRadius) this.stats.areaRadius = Math.round(this.stats.areaRadius * 1.1);
        if (this.stats.burnDamage) this.stats.burnDamage = Math.ceil(this.stats.burnDamage * 1.1);
        if (this.stats.slowAmount) this.stats.slowAmount = Math.min(0.85, this.stats.slowAmount + 0.05);
        if (this.stats.criticalChance) this.stats.criticalChance = Math.min(0.5, this.stats.criticalChance + 0.05);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
    }

    getInfo() {
        return {
            name: this.definition.name,
            level: this.level,
            damage: (this.stats.damage * this.level).toFixed(1),
            range: this.stats.range,
            attackSpeed: this.stats.attackSpeed,
            cost: this.definition.cost,
            upgradeCost: this.upgradeCost,
            description: this.definition.description_full,
            element: this.definition.element,
            faction: this.definition.faction
        };
    }
}