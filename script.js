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

    // Adicione as classes aqui
    birdElement1.classList.add('bird');
    birdElement2.classList.add('bird');

    const obstacleImageTop = new Image();
    obstacleImageTop.src = 'assets/canoTop.png'; // Substitua pelo caminho correto da imagem do obstáculo superior
    
    const obstacleImageBottom = new Image();
    obstacleImageBottom.src = 'assets/canoBottom.png'; // Substitua pelo caminho correto da imagem do obstáculo inferior

    const cloudImage = new Image();
    cloudImage.src = 'assets/nuvem.png'; // Substitua pelo caminho correto da imagem da nuvem
    
    let isTwoPlayer = false;
    let isGameRunning = false;
    
    // Ocultar elementos de pontuação no início do jogo
    score1Display.style.display = 'none';
    score2Display.style.display = 'none';
    gameOver.style.display = 'none'; // Inicialmente ocultar a mensagem de game over

    document.getElementById('one-player-btn').addEventListener('click', () => {
        startGame(false);
    });

    document.getElementById('two-player-btn').addEventListener('click', () => {
        startGame(true);
    });

    function startGame(twoPlayer) {
        isTwoPlayer = twoPlayer;
        isGameRunning = true; // Indicar que o jogo está em execução
        startScreen.style.display = 'none';
        birdBg.style.display = 'none';
        mensagem.style.visibility = 'hidden';
        gameOver.style.display = 'none';
        gameCanvas.style.display = 'block';
        score1Display.style.display = 'block';
        score2Display.style.display = twoPlayer ? 'block' : 'none';
        gameCanvas.width = window.innerWidth; // Definir a largura do canvas
        gameCanvas.height = window.innerHeight; // Definir a altura do canvas
    
        // Exibir os pássaros somente se o jogo for iniciado
        birdElement1.style.display = 'block';
        birdElement2.style.display = twoPlayer ? 'block' : 'none';
    
        resetGame();
        gameLoop();
    }       
    
    function showGameOverMessage() {
        isGameRunning = false; // Indicar que o jogo não está mais em execução
        gameOver.style.display = 'block';
        setTimeout(() => {
            gameOver.style.display = 'none';
            startScreen.style.display = 'block';
            mensagem.style.visibility = 'visible'; // Exibir a mensagem quando a tela inicial é exibida novamente
            isGameRunning = false; // Certificar-se de que o jogo não está em execução
        }, 2000); // Mostrar a mensagem por 3 segundos antes de retornar à tela inicial
    }

    let bird1 = {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        gravity: 0.7, // Ajuste para aumentar a gravidade
        lift: -10, // Ajuste para diminuir a força do salto
        velocity: 0,
        velocityX: 0,
        score: 0,
        element: birdElement1
    };

    let bird2 = {
        x: 100,
        y: 50,
        width: 100,
        height: 100,
        gravity: 0.7, // Ajuste para aumentar a gravidade
        lift: -10, // Ajuste para diminuir a força do salto
        velocity: 0,
        velocityX: 0,
        score: 0,
        element: birdElement2
    };

    let obstacles = [];
    let clouds = [];
    let obstacleInterval = 60; // Diminuir o intervalo para gerar obstáculos com mais frequência
    let frameCount = 0;

    function updateBird(bird) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        if (bird.y > gameCanvas.height - bird.height) {
            showGameOverMessage(); // Mostrar mensagem de Game Over
            return; // Interrompe a atualização do pássaro se ele colidir com o solo
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
        // Atualizar a posição horizontal com base na velocidade
        bird.x += bird.velocityX;
        bird.element.style.top = `${bird.y}px`;
        bird.element.style.left = `${bird.x}px`;
    }

    function drawObstacle(obstacle) {
        // Desenha o cano superior
        ctx.drawImage(obstacleImageTop, obstacle.x, 0, obstacle.width, obstacle.top);
        // Desenha o cano inferior
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
            let top = Math.random() * (gameCanvas.height / 3); // Reduzir a altura máxima dos obstáculos
            let bottom = gameCanvas.height - top - 300; // Aumentar a distância vertical entre os obstáculos
            let horizontalGap = 400; // Definir o espaçamento horizontal entre os obstáculos
            obstacles.push({ x: gameCanvas.width + horizontalGap, width: 110, top: top, bottom: bottom, passed: false });
        }

        obstacles.forEach((obstacle, index) => {
            obstacle.x -= 4; // Aumentar a velocidade de movimento dos obstáculos
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
        if (frameCount % 120 === 0) { // Aumentar a frequência das nuvens
            let width = Math.random() * 200 + 50;
            let height = width / 2;
            clouds.push({ x: gameCanvas.width, y: Math.random() * gameCanvas.height / 2, width: width, height: height });
        }

        clouds.forEach((cloud, index) => {
            cloud.x -= 2; // Aumentar a velocidade de movimento das nuvens
            if (cloud.x + cloud.width < 0) {
                clouds.splice(index, 1);
            }
        });
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => drawObstacle(obstacle));
    }

    function drawClouds() {
        clouds.forEach(cloud => drawCloud(cloud));
    }

    function checkCollision(bird, obstacle) {
        if (bird.x < obstacle.x + obstacle.width &&
            bird.x + bird.width > obstacle.x &&
            (bird.y < obstacle.top || bird.y + bird.height > gameCanvas.height - obstacle.bottom)) {
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
            return; // Interrompe o loop se o jogo não estiver em execução
        }
    
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        updateBird(bird1);
        if (isTwoPlayer) {
            updateBird(bird2);
        }
        
        updateObstacles();
        updateClouds(); // Atualiza as nuvens antes de desenhá-las
        
        drawClouds(); // Desenha as nuvens primeiro
        drawObstacles(); // Desenha os obstáculos depois
    
        if (obstacles.some(obstacle => checkCollision(bird1, obstacle)) ||
            (isTwoPlayer && obstacles.some(obstacle => checkCollision(bird2, obstacle)))) {
            showGameOverMessage();
            return; // Interrompe o loop se houver colisão
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