/**
 * 主遊戲邏輯
 */

// ============ 遊戲狀態 ============
let gameState = {
    currentStage: null,
    level: 1,
    gold: 500,
    health: 100,
    maxHealth: 100,
    currentWave: 1,
    totalWaves: 5,
    isWaveActive: false,
    isPaused: false,
    gameSpeed: 1.0,
    pendingEnemies: 0,
    unlockedStages: 1,
    savedGenerals: {},
    savedSoldiers: {},
    
    // 遊戲對象
    towers: [],
    enemies: [],
    selectedTower: null,
    selectedTowerType: null,
    
    // 地形
    currentTerrain: 'plain',
    
    // 統計
    score: 0,
    killCount: 0,
    moneySpent: 0
};

const STAGES = [
    { name: '赤壁之戰', icon: '🌊', terrain: 'water', description: '火攻加成', level: 1, difficulty: 1 },
    { name: '官渡之戰', icon: '⚔️', terrain: 'plain', description: '平原對陣', level: 2, difficulty: 1.2 },
    { name: '長坂坡之戰', icon: '🏔️', terrain: 'mountain', description: '山地防禦', level: 3, difficulty: 1.4 },
    { name: '夷陵之戰', icon: '🔥', terrain: 'water', description: '火船突襲', level: 4, difficulty: 1.6 },
    { name: '淝水之戰', icon: '💧', terrain: 'water', description: '水戰激戰', level: 5, difficulty: 1.8 }
];

// ============ 遊戲常數 ============
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// 遊戲路徑 (敵人行走的路線)
const gamePaths = {
    plain: [
        { x: 0, y: 150 },
        { x: 150, y: 150 },
        { x: 300, y: 100 },
        { x: 450, y: 150 },
        { x: 600, y: 200 },
        { x: 750, y: 300 },
        { x: 800, y: 300 }
    ],
    water: [
        { x: 0, y: 250 },
        { x: 200, y: 250 },
        { x: 400, y: 100 },
        { x: 600, y: 250 },
        { x: 800, y: 300 }
    ],
    mountain: [
        { x: 0, y: 300 },
        { x: 150, y: 200 },
        { x: 300, y: 150 },
        { x: 450, y: 200 },
        { x: 600, y: 300 },
        { x: 750, y: 400 },
        { x: 800, y: 500 }
    ]
};

let audioContext = null;
let masterGain = null;
let backgroundMusicStarted = false;

function initAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(audioContext.destination);
}

function startBackgroundMusic() {
    if (backgroundMusicStarted) return;
    if (!audioContext) initAudio();
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const notes = [220, 277, 330, 392];
    notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(audioContext.currentTime + index * 0.2);
        osc.stop(audioContext.currentTime + 4 + index * 0.2);
    });

    backgroundMusicStarted = true;
}

function playSound(type) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!audioContext) initAudio();
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    let frequency = 440;
    let duration = 0.08;
    let wave = 'square';

    switch (type) {
        case 'attack':
            frequency = 520;
            duration = 0.06;
            wave = 'square';
            break;
        case 'upgrade':
            frequency = 660;
            duration = 0.16;
            wave = 'triangle';
            break;
        case 'waveStart':
            frequency = 360;
            duration = 0.2;
            wave = 'sine';
            break;
        default:
            frequency = 440;
            duration = 0.08;
            wave = 'sine';
    }

    osc.type = wave;
    osc.frequency.value = frequency;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
}

// ============ 初始化 ============
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    
    // 初始化塔選擇面板
    initTowerPanel();

    // 初始化側邊欄標籤
    initSidebarTabs();

    // 初始化關卡選擇
    initStageSelect();
    initUpgradeTab();

    // 開始遊戲循環
    runGameLoop();
}

function initTowerPanel() {
    const generalTowersDiv = document.getElementById('general-towers');
    const soldierTowersDiv = document.getElementById('soldier-towers');

    // 添加武將塔
    Object.values(GENERAL_TOWERS).forEach(tower => {
        const card = createTowerCard(tower);
        generalTowersDiv.appendChild(card);
    });

    // 添加士兵塔
    Object.values(SOLDIER_TOWERS).forEach(tower => {
        const card = createTowerCard(tower);
        soldierTowersDiv.appendChild(card);
    });
}

function createTowerCard(towerDef) {
    const card = document.createElement('div');
    card.className = 'tower-card';
    card.innerHTML = `
        <div class="tower-icon">${towerDef.icon}</div>
        <div class="tower-name">${towerDef.name}</div>
        <div class="tower-cost">💰${towerDef.cost}</div>
        <div class="tower-info-hint" style="font-size: 0.75em; color: #aaa;">點擊放置</div>
    `;
    
    card.addEventListener('click', () => {
        gameState.selectedTower = null;
        if (gameState.selectedTowerType === towerDef.id) {
            gameState.selectedTowerType = null;
            card.classList.remove('selected');
        } else {
            // 移除其他卡的選中狀態
            document.querySelectorAll('.tower-card.selected').forEach(c => c.classList.remove('selected'));
            gameState.selectedTowerType = towerDef.id;
            card.classList.add('selected');
        }
        updateSelectedTowerInfo();
    });

    return card;
}

function initSidebarTabs() {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));

            const tab = button.getAttribute('data-tab');
            button.classList.add('active');
            const activeContent = document.getElementById(`tab-${tab}`);
            if (activeContent) activeContent.classList.add('active');
            if (tab === 'upgrade') {
                updateUpgradeTab();
            }
        });
    });
}

function initStageSelect() {
    const stageGrid = document.getElementById('stage-grid');
    if (!stageGrid) return;
    stageGrid.innerHTML = '';

    STAGES.forEach(stage => {
        const card = document.createElement('div');
        card.className = 'stage-card';
        card.innerHTML = `
            <div class="stage-icon">${stage.icon}</div>
            <div class="stage-name">${stage.name}</div>
            <div class="stage-info">${stage.description}</div>
        `;

        if (stage.level <= gameState.unlockedStages) {
            card.addEventListener('click', () => startStage(stage));
        } else {
            card.classList.add('locked');
            card.title = '請先完成上一關以解鎖此關卡';
            card.addEventListener('click', () => alert('請先完成上一關以解鎖此關卡'));
        }

        stageGrid.appendChild(card);
    });
}


function initUpgradeTab() {
    updateUpgradeTab();
}

function updateUpgradeTab() {
    const upgradeGrid = document.getElementById('upgrade-grid');
    if (!upgradeGrid) return;

    upgradeGrid.innerHTML = '';
    if (!gameState.towers.length) {
        upgradeGrid.innerHTML = '<p style="padding: 12px; color: #ccc;">尚未放置任何塔。請先在畫布上放置武將塔或士兵塔。</p>';
        return;
    }

    gameState.towers.forEach((tower, index) => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="tower-icon">${tower.definition.icon}</div>
            <div class="tower-name">${tower.displayName || tower.definition.name}</div>
            <div class="tower-cost">等級 ${tower.level}</div>
            <div class="tower-cost">升級費用 💰${tower.upgradeCost}</div>
            <button class="btn upgrade-tower-btn">升級</button>
        `;

        const btn = card.querySelector('.upgrade-tower-btn');
        if (gameState.gold < tower.upgradeCost) {
            btn.disabled = true;
        }
        btn.addEventListener('click', () => {
            upgradeTower(tower);
            updateUpgradeTab();
        });

        upgradeGrid.appendChild(card);
    });
}

function startStage(stage) {
    const preserveGenerals = gameState.currentStage && stage.level === gameState.currentStage.level + 1;
    if (preserveGenerals) {
        gameState.savedGenerals = gameState.savedGenerals || {};
        gameState.savedSoldiers = gameState.savedSoldiers || {};
        gameState.towers.forEach(tower => {
            if (tower.definition.type === 'general') {
                gameState.savedGenerals[tower.definition.id] = {
                    level: tower.level,
                    stats: { ...tower.stats },
                    upgradeCost: tower.upgradeCost,
                    displayName: tower.displayName,
                    health: tower.health,
                    maxHealth: tower.maxHealth
                };
            }
            if (tower.definition.type === 'soldier') {
                gameState.savedSoldiers[tower.definition.id] = {
                    level: tower.level,
                    stats: { ...tower.stats },
                    upgradeCost: tower.upgradeCost,
                    displayName: tower.displayName,
                    health: tower.health,
                    maxHealth: tower.maxHealth
                };
            }
        });
    }

    gameState.currentStage = stage;
    gameState.currentTerrain = stage.terrain;
    gameState.level = stage.level;
    // 黃金保留到下一關
    gameState.gold = typeof gameState.gold === 'number' ? gameState.gold : 500;
    gameState.health = 100;
    gameState.maxHealth = 100;
    gameState.currentWave = 1;
    gameState.towers = [];
    gameState.enemies = [];
    gameState.selectedTower = null;
    gameState.selectedTowerType = null;
    gameState.score = 0;
    gameState.killCount = 0;
    gameState.isWaveActive = false;
    gameState.pendingEnemies = 0;

    updateUI();
    updateSelectedTowerInfo();
    updateUpgradeTab();
    
    // 隱藏關卡選擇（若存在）
    const stageSelector = document.querySelector('.stage-selector');
    if (stageSelector) {
        stageSelector.style.display = 'none';
    }
}

function handleStartWave() {
    if (gameState.isWaveActive) {
        console.log('波次已經激活，忽略請求');
        return;
    }
    if (gameState.currentWave > gameState.totalWaves) {
        console.log('所有波次已完成');
        alert('關卡完成！');
        return;
    }

    const waveNumber = gameState.currentWave;
    const waveConfig = WAVE_DEFINITIONS[waveNumber];
    if (!waveConfig) {
        console.error('找不到波次配置:', waveNumber);
        return;
    }

    const path = gamePaths[gameState.currentTerrain];
    if (!path) {
        console.error('找不到地形路徑:', gameState.currentTerrain);
        return;
    }

    const stageDifficulty = gameState.currentStage?.difficulty || 1;
    gameState.isWaveActive = true;
    gameState.pendingEnemies = waveConfig.reduce((sum, group) => sum + Math.ceil(group.count * stageDifficulty), 0);
    console.log('開始波次:', waveNumber, '預計生成敵人數:', gameState.pendingEnemies);

    initAudio();
    startBackgroundMusic();
    playSound('waveStart');

    spawnWave(waveNumber);

    const statusDiv = document.getElementById('wave-status');
    if (statusDiv) {
        statusDiv.textContent = `🛡️ 第 ${waveNumber} 波開始！`;
        statusDiv.style.color = '#fff';
    }
}

function spawnWave(waveNumber) {
    const waveConfig = WAVE_DEFINITIONS[waveNumber];
    if (!waveConfig) {
        console.error('找不到波次配置:', waveNumber);
        return;
    }

    const path = gamePaths[gameState.currentTerrain];
    if (!path) {
        console.error('找不到地形路徑:', gameState.currentTerrain);
        return;
    }

    let currentDelay = 0;
    const difficulty = gameState.currentStage?.difficulty || 1;
    const healthMultiplier = Math.pow(2, Math.max(0, (gameState.currentStage?.level || 1) - 1));

    for (let groupIndex = 0; groupIndex < waveConfig.length; groupIndex++) {
        const group = waveConfig[groupIndex];
        const groupCount = Math.ceil(group.count * difficulty);
        const groupDelay = Math.max(0.15, group.delay / difficulty);
        console.log('生成敵人組:', groupIndex, '類型:', group.type.name, '數量:', groupCount);

        for (let i = 0; i < groupCount; i++) {
            const spawnDelay = currentDelay + i * groupDelay * 1000;
            setTimeout(() => {
                if (!gameState.isWaveActive) {
                    gameState.pendingEnemies = Math.max(0, gameState.pendingEnemies - 1);
                    return;
                }

                const enemy = new Enemy(group.type, path);
                if (healthMultiplier !== 1) {
                    enemy.health = enemy.maxHealth = Math.ceil(enemy.maxHealth * healthMultiplier);
                }
                gameState.enemies.push(enemy);
                console.log('敵人生成:', enemy.name, '當前存活:', gameState.enemies.length, '剩餘待生成:', Math.max(0, gameState.pendingEnemies - 1));
                gameState.pendingEnemies = Math.max(0, gameState.pendingEnemies - 1);
            }, spawnDelay);
        }

        currentDelay += groupCount * groupDelay * 1000 + 500;
    }
}

function updateUI() {
    document.getElementById('level-display').textContent = gameState.level;
    document.getElementById('gold-display').textContent = formatNumber(gameState.gold);
    document.getElementById('health-display').textContent = gameState.health;
    document.getElementById('wave-display').textContent = `${gameState.currentWave}/${gameState.totalWaves}`;
    
    if (gameState.currentStage) {
        const terrainKey = gameState.currentTerrain.toUpperCase();
        document.getElementById('current-terrain').textContent = TERRAIN[terrainKey]?.name || '普通';
        document.getElementById('current-stage-name').textContent = gameState.currentStage.name;
    } else {
        document.getElementById('current-stage-name').textContent = '請選擇歷史戰役';
    }
}

function getTowerDefinitionInfo(towerDef) {
    return {
        name: towerDef.name,
        level: 1,
        damage: towerDef.stats.damage,
        range: towerDef.stats.range,
        attackSpeed: towerDef.stats.attackSpeed,
        cost: towerDef.cost,
        upgradeCost: Math.floor(towerDef.cost * 1.5),
        description: towerDef.description_full || towerDef.description,
        element: towerDef.element,
        faction: towerDef.faction
    };
}

function findTowerDefinitionById(id) {
    return Object.values(GENERAL_TOWERS).find(t => t.id === id)
        || Object.values(SOLDIER_TOWERS).find(t => t.id === id);
}

function updateSelectedTowerInfo() {
    const infoDiv = document.getElementById('tower-info');
    const elementalName = {
        'wood': '木🌿',
        'fire': '火🔥',
        'earth': '土🌍',
        'metal': '金⚔️',
        'water': '水💧'
    };

    let info = null;
    if (gameState.selectedTower) {
        info = gameState.selectedTower.getInfo();
    } else if (gameState.selectedTowerType) {
        const towerDef = findTowerDefinitionById(gameState.selectedTowerType);
        if (towerDef) {
            info = getTowerDefinitionInfo(towerDef);
        }
    }

    if (info) {
        const content = `
            <p><strong>${info.name}</strong> 等級 ${info.level}</p>
            <p>元素: ${elementalName[info.element]}</p>
            <p>陣營: ${info.faction === FACTIONS.LIU ? '蜀漢' : info.faction === FACTIONS.SUN ? '東吳' : '曹魏'}</p>
            <p>傷害: ${info.damage}</p>
            <p>範圍: ${info.range}</p>
            <p>攻速: ${info.attackSpeed.toFixed(1)}/秒</p>
            <p style="font-size: 0.85em; color: #aaa; margin-top: 10px; border-top: 1px solid #d4af37; padding-top: 10px;">
                ${info.description}
            </p>
            ${gameState.selectedTower ? `<button id="upgrade-tower-btn" class="btn btn-secondary" style="width: 100%; margin-top: 10px;">升級 (💰${gameState.selectedTower.upgradeCost})</button>` : ''}
        `;

        infoDiv.innerHTML = content;

        if (gameState.selectedTower) {
            const upgradeBtn = infoDiv.querySelector('#upgrade-tower-btn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', upgradeTower);
            }
        }
    } else {
        infoDiv.innerHTML = '<p>👆 點擊塔查看詳細信息</p>';
    }
}

function upgradeTower(tower = gameState.selectedTower) {
    if (!tower) return;
    if (gameState.gold < tower.upgradeCost) {
        alert('黃金不足！');
        return;
    }

    gameState.gold -= tower.upgradeCost;
    tower.upgrade();
    tower.upgradeCost = Math.floor(tower.upgradeCost * 1.5);

    if (tower.definition.type === 'soldier') {
        gameState.towers.forEach(other => {
            if (other.definition.type === 'soldier' && other !== tower) {
                other.upgrade();
                other.upgradeCost = Math.floor(other.upgradeCost * 1.5);
            }
        });
    }

    playSound('upgrade');
    
    updateUI();
    updateSelectedTowerInfo();
    updateUpgradeTab();
}

function gameOver(won) {
    gameState.isWaveActive = false;
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const text = document.getElementById('game-over-text');
    const finalScore = document.getElementById('final-score');

    const nextStageBtn = document.getElementById('next-stage-btn');
    const finalCredit = document.getElementById('final-credit');
    if (won) {
        const isFinalStage = gameState.currentStage && gameState.currentStage.name === '淝水之戰';
        if (isFinalStage) {
            title.textContent = '恭喜玩家 一統三國';
            if (nextStageBtn) {
                nextStageBtn.style.display = 'none';
            }
            if (finalCredit) {
                finalCredit.style.display = 'block';
            }
        } else {
            title.textContent = '關卡勝利！';
            if (gameState.currentStage && gameState.currentStage.level < STAGES.length) {
                gameState.unlockedStages = Math.max(gameState.unlockedStages, gameState.currentStage.level + 1);
                initStageSelect();
            }
            if (nextStageBtn) {
                nextStageBtn.style.display = 'inline-block';
                nextStageBtn.textContent = '進入下一關卡';
                nextStageBtn.onclick = goToNextStage;
            }
            if (finalCredit) {
                finalCredit.style.display = 'none';
            }
        }
        text.innerHTML = `你的得分: <span style="color: #FFD700;">${gameState.score}</span><br>
                          擊殺數: ${gameState.killCount}<br>
                          金幣消耗: ${gameState.moneySpent}`;
    } else {
        title.textContent = '基地被攻陷！';
        if (nextStageBtn) {
            nextStageBtn.style.display = 'inline-block';
            nextStageBtn.textContent = '選擇關卡';
            nextStageBtn.onclick = goToStageSelect;
        }
        if (finalCredit) {
            finalCredit.style.display = 'none';
        }
        title.textContent = '基地被攻陷！';
        text.innerHTML = `你的得分: <span style="color: #FF6B6B;">${gameState.score}</span><br>
                          波次: ${gameState.currentWave}/${gameState.totalWaves}<br>
                          擊殺數: ${gameState.killCount}`;
    }

    modal.classList.remove('hidden');
}

function goToStageSelect() {
    document.getElementById('game-over-modal').classList.add('hidden');
    const stageSelector = document.querySelector('.stage-selector');
    if (stageSelector) {
        stageSelector.style.display = 'block';
    }
    
    // 重置遊戲狀態
    gameState.currentStage = null;
    gameState.selectedTower = null;
    gameState.selectedTowerType = null;
    gameState.towers = [];
    gameState.enemies = [];
    gameState.currentWave = 1;
    gameState.gameSpeed = 1.0;
    gameState.isPaused = false;
    
    // 重置按鈕狀態
    const pauseBtn = document.getElementById('pause-btn');
    const speedBtn = document.getElementById('speed-btn');
    pauseBtn.textContent = '⏸ 暫停';
    speedBtn.textContent = '2x 速度';

    updateUI();
    updateSelectedTowerInfo();
}

function goToNextStage() {
    const currentLevel = gameState.currentStage ? gameState.currentStage.level : 0;
    const nextStage = STAGES.find(stage => stage.level === currentLevel + 1);
    document.getElementById('game-over-modal').classList.add('hidden');
    if (nextStage) {
        startStage(nextStage);
    } else {
        goToStageSelect();
    }
}

// ============ 遊戲循環 ============
let lastTime = Date.now();

function runGameLoop() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const now = Date.now();
    const dt = Math.min((now - lastTime) / 1000, 0.016) * gameState.gameSpeed;
    lastTime = now;

    if (!gameState.isPaused) {
        // 更新塔
        gameState.towers.forEach(tower => {
            tower.update(dt, gameState.enemies);
        });

        // 處理光環效果（曹操提升附近塔）
        gameState.towers.forEach(sourceTower => {
            if (sourceTower.definition.stats.auraRadius) {
                gameState.towers.forEach(targetTower => {
                    if (sourceTower !== targetTower) {
                        const dist = distance(
                            { x: sourceTower.x, y: sourceTower.y },
                            { x: targetTower.x, y: targetTower.y }
                        );
                        if (dist <= sourceTower.definition.stats.auraRadius) {
                            // 適用光環加成
                            // 這會通過在計算傷害時應用乘數來實現
                        }
                    }
                });
            }
        });

        // 更新敵人
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            enemy.update(dt);

            // 檢查敵人是否到達終點
            if (enemy.hasReachedEnd()) {
                gameState.enemies.splice(i, 1);
                gameState.health -= 10;
                
                if (gameState.health <= 0) {
                    gameOver(false);
                }
            } else if (enemy.health <= 0) {
                gameState.enemies.splice(i, 1);
                gameState.gold += enemy.getReward();
                gameState.score += enemy.getReward();
                gameState.killCount++;
            }
        }

        // 檢查波次是否結束（等待所有敵人生成並被消滅）
        if (gameState.isWaveActive && gameState.pendingEnemies === 0 && gameState.enemies.length === 0) {
            gameState.isWaveActive = false;
            
            const statusDiv = document.getElementById('wave-status');
            if (statusDiv) {
                statusDiv.textContent = `✅ 第 ${gameState.currentWave} 波完成！`;
                statusDiv.style.color = '#4CAF50';
            }

            gameState.currentWave++;

            if (gameState.currentWave > gameState.totalWaves) {
                gameOver(true);
            }
        }

        updateUI();
    }

    // 繪製
    drawGame(ctx, canvas);

    requestAnimationFrame(runGameLoop);
}

function drawGame(ctx, canvas) {
    // 清空畫布
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#2a3a4a');
    gradient.addColorStop(1, '#1a2a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製地形
    drawTerrain(ctx);

    // 繪製路徑
    drawPath(ctx);

    // 繪製塔
    gameState.towers.forEach(tower => tower.draw(ctx));

    // 繪製敵人
    gameState.enemies.forEach(enemy => enemy.draw(ctx));

    // 繪製遊戲信息
    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⏸ 已暫停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
}

function drawTerrain(ctx) {
    if (gameState.currentTerrain === 'water') {
        const isYiling = gameState.currentStage && gameState.currentStage.name === '夷陵之戰';

        if (isYiling) {
            // 特殊背景：夷陵之戰火船水面
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, '#3b0d0d');
            gradient.addColorStop(0.4, '#8b2e1a');
            gradient.addColorStop(1, '#1a2a3a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.strokeStyle = 'rgba(255, 170, 90, 0.25)';
            ctx.lineWidth = 2;
            for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
                ctx.beginPath();
                for (let j = 0; j < CANVAS_WIDTH; j += 25) {
                    const waveY = Math.sin(j * 0.04 + Date.now() * 0.0015) * 5;
                    if (j === 0) {
                        ctx.moveTo(j, i + waveY);
                    } else {
                        ctx.lineTo(j, i + waveY);
                    }
                }
                ctx.stroke();
            }

            // 火焰反射
            for (let i = 0; i < 8; i++) {
                const x = 120 + i * 90;
                const flameHeight = 40 + Math.sin(Date.now() * 0.003 + i) * 12;
                const alpha = 0.2 + Math.sin(Date.now() * 0.002 + i * 0.6) * 0.1;
                ctx.fillStyle = `rgba(255, 140, 0, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(x, 460);
                ctx.bezierCurveTo(x + 15, 460 - flameHeight, x - 20, 460 - flameHeight * 0.6, x, 480);
                ctx.fill();
            }

            // 火船
            ctx.fillStyle = '#48220a';
            ctx.fillRect(520, 320, 90, 18);
            ctx.fillStyle = '#ffbd69';
            ctx.beginPath();
            ctx.moveTo(540, 320);
            ctx.lineTo(560, 300);
            ctx.lineTo(600, 320);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff8c00';
            ctx.fillRect(545, 330, 20, 8);
            ctx.fillRect(580, 330, 20, 8);
        } else {
            // 繪製水面效果
            ctx.fillStyle = 'rgba(80, 130, 210, 0.22)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // 繪製波浪
            ctx.strokeStyle = 'rgba(180, 220, 255, 0.35)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < CANVAS_HEIGHT; i += 35) {
                ctx.beginPath();
                for (let j = 0; j < CANVAS_WIDTH; j += 30) {
                    const waveY = Math.sin(j * 0.03 + Date.now() * 0.0012) * 4;
                    if (j === 0) {
                        ctx.moveTo(j, i + waveY);
                    } else {
                        ctx.lineTo(j, i + waveY);
                    }
                }
                ctx.stroke();
            }

            // 小船與蘆葦
            ctx.fillStyle = '#6c4a2d';
            ctx.fillRect(520, 320, 80, 14);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(560, 320);
            ctx.lineTo(580, 300);
            ctx.lineTo(600, 320);
            ctx.fill();

            ctx.fillStyle = '#2c7f65';
            for (let i = 0; i < 6; i++) {
                const x = 80 + i * 80;
                ctx.fillRect(x, 430, 4, 30);
                ctx.beginPath();
                ctx.moveTo(x + 2, 430);
                ctx.quadraticCurveTo(x - 8, 420, x + 2, 410);
                ctx.quadraticCurveTo(x + 12, 420, x + 2, 430);
                ctx.fill();
            }
        }
    } else if (gameState.currentTerrain === 'mountain') {
        // 繪製山地效果
        ctx.fillStyle = 'rgba(110, 85, 45, 0.18)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // 繪製山峰
        ctx.strokeStyle = 'rgba(130, 90, 50, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-50 + i * 220, CANVAS_HEIGHT - 60 - i * 20);
            ctx.lineTo(180 + i * 120, CANVAS_HEIGHT / 2 - i * 40);
            ctx.lineTo(420 + i * 120, CANVAS_HEIGHT - 60 - i * 20);
            ctx.closePath();
            ctx.fillStyle = 'rgba(120, 90, 55, 0.25)';
            ctx.fill();
            ctx.stroke();
        }

        // 繪製松樹
        for (let i = 0; i < 5; i++) {
            const x = 80 + i * 130;
            const y = 360 + (i % 2) * 30;
            ctx.fillStyle = '#5a6f39';
            ctx.beginPath();
            ctx.moveTo(x, y - 40);
            ctx.lineTo(x - 18, y + 10);
            ctx.lineTo(x + 18, y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#4a3a1a';
            ctx.fillRect(x - 4, y + 10, 8, 20);
        }
    } else {
        // 平原背景
        ctx.fillStyle = 'rgba(170, 215, 130, 0.13)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 草地樹木與丘陵
        for (let i = 0; i < 6; i++) {
            const x = 80 + i * 120;
            const y = 420 + (i % 2) * 20;
            ctx.fillStyle = '#4a7a3e';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6b4a2b';
            ctx.fillRect(x - 4, y, 8, 24);
        }

        ctx.fillStyle = 'rgba(160, 190, 120, 0.2)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(140 + i * 190, 500, 120, Math.PI, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawPath(ctx) {
    const path = gamePaths[gameState.currentTerrain];
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
}

// ============ UI 事件監聽器 ============
document.addEventListener('DOMContentLoaded', () => {
    const startWaveBtn = document.getElementById('start-wave-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const speedBtn = document.getElementById('speed-btn');

    startWaveBtn.addEventListener('click', handleStartWave);

    pauseBtn.addEventListener('click', () => {
        gameState.isPaused = !gameState.isPaused;
        pauseBtn.textContent = gameState.isPaused ? '▶ 繼續' : '⏸ 暫停';
    });

    speedBtn.addEventListener('click', () => {
        // 速度循環: 1x → 2x → 5x → 1x
        if (gameState.gameSpeed === 1.0) {
            gameState.gameSpeed = 2.0;
            speedBtn.textContent = '5x 速度';
        } else if (gameState.gameSpeed === 2.0) {
            gameState.gameSpeed = 5.0;
            speedBtn.textContent = '1x 速度';
        } else {
            gameState.gameSpeed = 1.0;
            speedBtn.textContent = '2x 速度';
        }
    });

    // 在Canvas下方添加提示和波次信息
    const gameInfo = document.querySelector('.game-info');
    const waveStatus = document.createElement('div');
    waveStatus.id = 'wave-status';
    waveStatus.style.cssText = `
        text-align: center;
        color: #d4af37;
        font-weight: bold;
        margin-top: 10px;
        min-height: 20px;
    `;
    if (!document.getElementById('wave-status')) {
        gameInfo.appendChild(waveStatus);
    }

    // Canvas 點擊事件 - 放置塔或選擇塔
    document.getElementById('gameCanvas').addEventListener('click', (e) => {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 首先嘗試選擇已放置的塔
        let clicked = false;
        gameState.selectedTower = null;
        for (let tower of gameState.towers) {
            if (distance({ x, y }, { x: tower.x, y: tower.y }) < 35) {
                gameState.selectedTower = tower;
                clicked = true;
                gameState.selectedTowerType = null;
                document.querySelectorAll('.tower-card.selected').forEach(c => c.classList.remove('selected'));
                updateSelectedTowerInfo();
                break;
            }
        }

        // 如果沒有點擊到塔，嘗試放置塔
        if (!clicked && gameState.selectedTowerType && !gameState.isWaveActive) {
            let towerDef = Object.values(GENERAL_TOWERS).find(t => t.id === gameState.selectedTowerType);
            if (!towerDef) {
                towerDef = Object.values(SOLDIER_TOWERS).find(t => t.id === gameState.selectedTowerType);
            }

            if (towerDef) {
                // 檢查是否有足夠的黃金
                if (gameState.gold < towerDef.cost) {
                    alert('黃金不足！');
                    return;
                }

                // 檢查是否已經放置同一個武將塔
                if (towerDef.type === 'general' && gameState.towers.some(t => t.definition.id === towerDef.id)) {
                    alert('同一位武將只能放置一次！');
                    return;
                }

                // 檢查塔之間的距離（不能距離太近）
                const minDistance = 50;
                for (let tower of gameState.towers) {
                    if (distance({ x, y }, { x: tower.x, y: tower.y }) < minDistance) {
                        alert('塔位置過近！');
                        return;
                    }
                }

                // 放置塔
                const newTower = new Tower(x, y, towerDef);
                if (towerDef.type === 'general') {
                    const saved = gameState.savedGenerals?.[towerDef.id];
                    if (saved) {
                        newTower.level = saved.level;
                        newTower.stats = { ...saved.stats };
                        newTower.upgradeCost = saved.upgradeCost;
                        newTower.displayName = saved.displayName;
                        newTower.health = saved.health;
                        newTower.maxHealth = saved.maxHealth;
                        delete gameState.savedGenerals[towerDef.id];
                    }
                }
                if (towerDef.type === 'soldier') {
                    const saved = gameState.savedSoldiers?.[towerDef.id];
                    if (saved) {
                        newTower.level = saved.level;
                        newTower.stats = { ...saved.stats };
                        newTower.upgradeCost = saved.upgradeCost;
                        newTower.displayName = saved.displayName;
                        newTower.health = saved.health;
                        newTower.maxHealth = saved.maxHealth;
                    }
                    const sameTypeCount = gameState.towers.filter(t => t.definition.type === 'soldier' && t.definition.id === towerDef.id).length + 1;
                    newTower.displayName = `${towerDef.name}${sameTypeCount}`;
                }
                gameState.towers.push(newTower);
                gameState.gold -= towerDef.cost;
                gameState.moneySpent += towerDef.cost;

                updateUI();
                updateUpgradeTab();
            }
        }
    });

    initGame();
});