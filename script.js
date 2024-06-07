document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameCanvas = document.getElementById('gameCanvas');
    const score1Display = document.getElementById('score1');
    const score2Display = document.getElementById('score2');
    const birdBg = document.querySelector('.bg-container');
    const solo = document.querySelector('.solo-container');
    const mensagem = document.querySelector('#mensagem');
    const gameOver = document.querySelector('.game-over');
    const ctx = gameCanvas.getContext('2d');
    
    const birdElement1 = document.getElementById('bird1');
    const birdElement2 = document.getElementById('bird2');

    const obstacleImageTop = new Image();
    obstacleImageTop.src = 'assets/canoTop.png';
    
    const obstacleImageBottom = new Image();
    obstacleImageBottom.src = 'assets/canoBottom.png';

    const cloudImage = new Image();
    cloudImage.src = 'assets/nuvem.png';
    
    let isTwoPlayer = false;
    let isGameRunning = false;
    
    score1Display.style.display = 'none';
    score2Display.style.display = 'none';
    gameOver.style.display = 'none';

    document.getElementById('one-player-btn').addEventListener('click', () => {
        startGame(false);
    });

    document.getElementById('two-player-btn').addEventListener('click', () => {
        startGame(true);
    });

    function startGame(twoPlayer) {
        isTwoPlayer = twoPlayer;
        isGameRunning = true;
        startScreen.style.display = 'none';
        birdBg.style.display = 'none';
        mensagem.style.visibility = 'hidden';
        gameOver.style.display = 'none';
        gameCanvas.style.display = 'block';
        score1Display.style.display = 'block';
        score2Display.style.display = twoPlayer ? 'block' : 'none';
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    
        birdElement1.style.display = 'block';
        birdElement2.style.display = twoPlayer ? 'block' : 'none';
    
        resetGame();
        gameLoop();
    }       
    
    function showGameOverMessage() {
        isGameRunning = false;
        gameOver.style.display = 'block';
        setTimeout(() => {
            gameOver.style.display = 'none';
            startScreen.style.display = 'block';
            mensagem.style.visibility = 'visible';
            isGameRunning = false;
        }, 2000);
    }

    let bird1 = {
        x: 50,
        y: 50,
        width: 90,
        height: 75,
        gravity: 0.3, // Diminuir o valor da gravidade para tornar a queda mais suave
        lift: -7,
        velocity: 0.5, // Ajustar a velocidade inicial de queda
        velocityX: 0,
        score: 0,
        element: birdElement1
    };
    
    let bird2 = {
        x: 100,
        y: 50,
        width: 105,
        height: 50,
        gravity: 0.2, // Diminuir o valor da gravidade para tornar a queda mais suave
        lift: -5,
        velocity: 0.9, // Ajustar a velocidade inicial de queda
        velocityX: 0,
        score: 0,
        element: birdElement2
    };

    let obstacles = [];
    let clouds = [];
    let obstacleInterval = 80;
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
            obstacle.x -= 4;
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(index, 1);
            }

            if (!obstacle.passed && obstacle.x < bird1.x) {
                bird1.score++;
                obstacle.passed = true;
            }
            if (isTwoPlayer && !obstacle.passed && obstacle.x < bird2.x) {
                bird2.score++;
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
        // Calcular as posições ajustadas considerando o border radius
        let birdTop = bird.y + bird.height * 0.15; // 15% da altura do bird
        let birdBottom = bird.y + bird.height * 0.85; // 85% da altura do bird
        let birdLeft = bird.x + bird.width * 0.15; // 15% da largura do bird
        let birdRight = bird.x + bird.width * 0.85; // 85% da largura do bird
    
        // Verificar se o bird está dentro da área segura entre os obstáculos
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
        bird2.y = 50;
        bird2.velocity = 0;
        bird2.score = 0;
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
        if (isTwoPlayer) {
            updateBird(bird2);
        }
        
        updateObstacles();
        updateClouds();
        
        drawClouds();
        drawObstacles();
    
        if (obstacles.some(obstacle => checkCollision(bird1, obstacle)) ||
            (isTwoPlayer && obstacles.some(obstacle => checkCollision(bird2, obstacle)))) {
            showGameOverMessage();
            return;
        }
    
        score1Display.textContent = `Jogador 1: ${bird1.score}`;
        if (isTwoPlayer) {
            score2Display.textContent = `Jogador 2: ${bird2.score}`;
        }
    
        frameCount++;
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            bird1.velocity = bird1.lift;
        }
        if (event.code === 'Enter' && isTwoPlayer) {
            bird2.velocity = bird2.lift;
        }
    });
});
