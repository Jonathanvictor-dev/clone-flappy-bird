document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameCanvas = document.getElementById('gameCanvas');
    const score1Display = document.getElementById('score1');
    const birdBg = document.querySelector('.bg-container');
    const solo = document.querySelector('.solo-container');
    const mensagem = document.querySelector('#mensagem');
    const gameOver = document.querySelector('.game-over');
    const ctx = gameCanvas.getContext('2d');
    
    const birdElement1 = document.getElementById('bird1');
    const historyScore = document.querySelector('.score-history');
    const difficultySelect = document.getElementById('difficulty-select');
    const easyScoreDisplay = document.getElementById('easy-score');
    const mediumScoreDisplay = document.getElementById('medium-score');
    const hardScoreDisplay = document.getElementById('hard-score');

    const obstacleImageTop = new Image();
    obstacleImageTop.src = 'assets/canoTop.png';
    
    const obstacleImageBottom = new Image();
    obstacleImageBottom.src = 'assets/canoBottom.png';

    const cloudImage = new Image();
    cloudImage.src = 'assets/nuvem.png';
    
    let isGameRunning = false;
    let difficulty = 'easy';
    let obstacleSpeed = 4;  // Increased speed for easy level
    let obstacleInterval = 70;  // Decreased interval for easy level
    
    score1Display.style.display = 'none';
    gameOver.style.display = 'none';

    document.getElementById('one-player-btn').addEventListener('click', () => {
        difficulty = difficultySelect.value;
        startGame(difficulty);
    });

    function startGame(selectedDifficulty) {
        difficulty = selectedDifficulty;
        switch (difficulty) {
            case 'easy':
                obstacleSpeed = 4;  // Increased speed for easy level
                obstacleInterval = 70;  // Decreased interval for easy level
                break;
            case 'medium':
                obstacleSpeed = 6;
                obstacleInterval = 60;
                break;
            case 'hard':
                obstacleSpeed = 8;
                obstacleInterval = 40;
                break;
        }
        isGameRunning = true;

        historyScore.style.display = 'none';
        startScreen.style.display = 'none';
        birdBg.style.display = 'none';
        mensagem.style.visibility = 'hidden';
        gameOver.style.display = 'none';
        gameCanvas.style.display = 'block';
        score1Display.style.display = 'block';
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    
        birdElement1.style.display = 'block';
    
        resetGame();
        gameLoop();
    }       
    
    function showGameOverMessage() {
        isGameRunning = false;
        saveScore();
        gameOver.style.display = 'block';
        setTimeout(() => {
            gameOver.style.display = 'none';
            historyScore.style.display = 'block';
            startScreen.style.display = 'block';
            mensagem.style.visibility = 'visible';
            updateScoreHistory();
            isGameRunning = false;
        }, 2000);
    }

    function saveScore() {
        let scores = JSON.parse(localStorage.getItem('scores')) || { easy: [], medium: [], hard: [] };
        scores[difficulty].push(bird1.score);
        localStorage.setItem('scores', JSON.stringify(scores));
    }

    function updateScoreHistory() {
        let scores = JSON.parse(localStorage.getItem('scores')) || { easy: [], medium: [], hard: [] };
        easyScoreDisplay.textContent = scores.easy.length > 0 ? Math.max(...scores.easy) : 0;
        mediumScoreDisplay.textContent = scores.medium.length > 0 ? Math.max(...scores.medium) : 0;
        hardScoreDisplay.textContent = scores.hard.length > 0 ? Math.max(...scores.hard) : 0;
    }

    let bird1 = {
        x: 50,
        y: 50,
        width: 100,
        height: 85,
        gravity: 0.3,
        lift: -7,
        velocity: 0.5,
        velocityX: 0,
        score: 0,
        element: birdElement1
    };

    let obstacles = [];
    let clouds = [];
    let frameCount = 0;

    function updateBird(bird) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        if (bird.y > gameCanvas.height - bird.height) {
            showGameOverMessage();
            return;
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
        bird.x += bird.velocityX;
        bird.element.style.top = `${bird.y}px`;
        bird.element.style.left = `${bird.x}px`;
    }    

    function drawObstacle(obstacle) {
        ctx.drawImage(obstacleImageTop, obstacle.x, 0, obstacle.width, obstacle.top);
        ctx.drawImage(obstacleImageBottom, obstacle.x, gameCanvas.height - obstacle.bottom, obstacle.width, obstacle.bottom);
    }

    function drawCloud(cloud) {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
    }
    
    function drawObstacles() {
        obstacles.forEach(obstacle => drawObstacle(obstacle));
    }
    
    function drawClouds() {
        clouds.forEach(cloud => drawCloud(cloud));
    }

    function updateObstacles() {
        if (frameCount % obstacleInterval === 0) {
            let top = Math.random() * (gameCanvas.height / 3);
            let bottom = gameCanvas.height - top - 300;
            let horizontalGap = 400;
            obstacles.push({ x: gameCanvas.width + horizontalGap, width: 110, top: top, bottom: bottom, passed: false });
        }

        obstacles.forEach((obstacle, index) => {
            obstacle.x -= obstacleSpeed;
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(index, 1);
            }

            if (!obstacle.passed && obstacle.x < bird1.x) {
                bird1.score++;
                obstacle.passed = true;
            }
        });
    }

    function updateClouds() {
        if (frameCount % 120 === 0) {
            let width = Math.random() * 200 + 50;
            let height = width / 2;
            clouds.push({ x: gameCanvas.width, y: Math.random() * gameCanvas.height / 2, width: width, height: height });
        }

        clouds.forEach((cloud, index) => {
            cloud.x -= 2;
            if (cloud.x + cloud.width < 0) {
                clouds.splice(index, 1);
            }
        });
    }

    function checkCollision(bird, obstacle) {
        let birdTop = bird.y + bird.height * 0.25; // Increased to 25%
        let birdBottom = bird.y + bird.height * 0.75; // Increased to 25%
        let birdLeft = bird.x + bird.width * 0.25; // Increased to 25%
        let birdRight = bird.x + bird.width * 0.75; // Increased to 25%
    
        if (
            birdRight > obstacle.x &&
            birdLeft < obstacle.x + obstacle.width &&
            (birdTop < obstacle.top || birdBottom > gameCanvas.height - obstacle.bottom)
        ) {
            return true;
        }
        return false;
    }    

    function resetGame() {
        bird1.y = 50;
        bird1.velocity = 0;
        bird1.score = 0;
        obstacles = [];
        clouds = [];
        frameCount = 0;
    }

    function gameLoop() {
        if (!isGameRunning) {
            return;
        }
    
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        updateBird(bird1);
        
        updateObstacles();
        updateClouds();
        
        drawClouds();
        drawObstacles();
    
        if (obstacles.some(obstacle => checkCollision(bird1, obstacle))) {
            showGameOverMessage();
            return;
        }
    
        score1Display.textContent = `Score atual: ${bird1.score}`;
    
        frameCount++;
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            bird1.velocity = bird1.lift;
        }
    });

    document.addEventListener('touchstart', () => {
        bird1.velocity = bird1.lift;
    });

    // Update score history on page load
    updateScoreHistory();
});
