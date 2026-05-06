        let gameState = {
            score: 0,
            clickLvl: 1,
            passiveLvl: 0,
            lastSaveTime: Date.now()
        };

        function loadGame() {
            const savedData = localStorage.getItem('clickerGameSave');
            if (savedData) {
                gameState = JSON.parse(savedData);
                calculateOfflineProgress(); 
            }
            updateUI();
        }

        function saveGame() {
            gameState.lastSaveTime = Date.now();
            localStorage.setItem('clickerGameSave', JSON.stringify(gameState));
        }

        function calculateOfflineProgress() {
            const now = Date.now();
            const diffInSeconds = Math.floor((now - gameState.lastSaveTime) / 1000);
            
            if (diffInSeconds > 0 && gameState.passiveLvl > 0) {
                const gainedPoints = diffInSeconds * gameState.passiveLvl;
                gameState.score += gainedPoints;
                alert(`Witaj z powrotem! Podczas Twojej nieobecności zarobiłeś ${gainedPoints} punktów.`);
            }
        }

        function clickAction() {
            gameState.score += gameState.clickLvl;
            updateUI();
            saveGame();
        }

        function buyClickUpgrade() {
            const cost = gameState.clickLvl * 10;
            if (gameState.score >= cost) {
                gameState.score -= cost;
                gameState.clickLvl++;
                updateUI();
                saveGame();
            }
        }

        function buyPassiveUpgrade() {
            const cost = (gameState.passiveLvl + 1) * 20;
            if (gameState.score >= cost) {
                gameState.score -= cost;
                gameState.passiveLvl++;
                updateUI();
                saveGame();
            }
        }

        function updateUI() {
            document.getElementById('score-display').innerText = Math.floor(gameState.score);
            document.getElementById('click-power-lvl').innerText = gameState.clickLvl;
            document.getElementById('passive-lvl').innerText = gameState.passiveLvl;
            
            document.getElementById('upgrade-click-btn').innerText = `Ulepsz moc kliknięcia (${gameState.clickLvl * 10})`;
            document.getElementById('upgrade-passive-btn').innerText = `Ulepsz pasywne kliknięcia (${(gameState.passiveLvl + 1) * 20})`;
        }

        setInterval(() => {
            if (gameState.passiveLvl > 0) {
                gameState.score += gameState.passiveLvl;
                updateUI();
                saveGame(); 
            }
        }, 1000);

        loadGame();