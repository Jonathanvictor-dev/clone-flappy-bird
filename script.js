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
    
    let isTwoPlayer = false;
    let isGameRunning = false;
    
    // Ocultar elementos de pontuação no início do jogo
    score1Display.style.display = 'none';
    score2Display.style.display = 'none';
    gameOver.style.display = 'none'; // Inicialmente ocultar a mensagem de game over

    const birdImage1 = new Image();
    birdImage1.src = '/assets/bird1.gif'; // Substitua pelo caminho da imagem do jogador 1

    const birdImage2 = new Image();
    birdImage2.src = '/assets/bird2.gif'; // Substitua pelo caminho da imagem do jogador 2

    const cloudImage = new Image();
    cloudImage.src = '/assets/nuvem.png'; // Substitua pelo caminho da imagem da nuvem

    const obstacleImageTop = new Image();
    obstacleImageTop.src = '/assets/canoTop.png'; // Substitua pelo caminho da imagem do topo do obstáculo
    obstacleImageTop.style.objectFit = 'contain'; // Adiciona a propriedade cover para cobrir o tamanho do obstáculo

    const obstacleImageBottom = new Image();
    obstacleImageBottom.src = '/assets/canoBottom.png'; // Substitua pelo caminho da imagem da parte inferior do obstáculo
    obstacleImageBottom.style.objectFit = 'contain'; // Adiciona a propriedade cover para cobrir o tamanho do obstáculo

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
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
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
        width: 120,
        height: 80,
        gravity: 0.7, // Ajuste para aumentar a gravidade
        lift: -10, // Ajuste para diminuir a força do salto
        velocity: 0,
        velocityX: 0,
        score: 0
    };

    let bird2 = {
        x: 100,
        y: 50,
        width: 120,
        height: 80,
        gravity: 0.7, // Ajuste para aumentar a gravidade
        lift: -10, // Ajuste para diminuir a força do salto
        velocity: 0,
        velocityX: 0,
        score: 0
    };

    let obstacles = [];
    let clouds = [];
    let obstacleInterval = 60; // Diminuir o intervalo para gerar obstáculos com mais frequência
    let frameCount = 0;

    let currentFrame = 0;

    function drawBird(bird, image) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(image, bird.x, bird.y, bird.width, bird.height);
        currentFrame = (currentFrame + 1) % image.currentSrc.length; // Incrementa o frame e volta ao início se necessário
    }

    function updateBird(bird) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        if (bird.y > gameCanvas.height - bird.height) {
            bird.y = gameCanvas.height - bird.height;
            bird.velocity = 0;
        }
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
        // Atualizar a posição horizontal com base na velocidade
        bird.x += bird.velocityX;
    }

    function drawObstacle(obstacle) {
        // Draw top pipe
        ctx.drawImage(obstacleImageTop, obstacle.x, 0, obstacle.width, obstacle.top);
        // Draw bottom pipe
        ctx.drawImage(obstacleImageBottom, obstacle.x, gameCanvas.height - obstacle.bottom, obstacle.width, obstacle.bottom);
    }

    function drawCloud(cloud) {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
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
            return;
        }
    
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        updateClouds();
        drawClouds();
    
        obstacles.forEach(obstacle => {
            // Verificar colisão com obstáculos
            if (checkCollision(bird1, obstacle) || (isTwoPlayer && checkCollision(bird2, obstacle))) {
                showGameOverMessage();
                isGameRunning = false; // Indicar que o jogo não está mais em execução
                return; // Sair do loop imediatamente após a colisão
            }
        });
    
        // Verificar colisão com o solo
        if (bird1.y >= gameCanvas.height - bird1.height || (isTwoPlayer && bird2.y >= gameCanvas.height - bird2.height)) {
            showGameOverMessage();
            isGameRunning = false; // Indicar que o jogo não está mais em execução
            return; // Sair do loop se o pássaro atingir o solo
        }
    
        updateBird(bird1);
        updateBird(bird2);
    
        drawBird(bird1, birdImage1);
        if (isTwoPlayer) {
            drawBird(bird2, birdImage2);
        }
    
        updateObstacles();
        drawObstacles();
    
        score1Display.textContent = `Jogador 1: ${bird1.score}`;
        if (isTwoPlayer) {
            score2Display.textContent = `Jogador 2: ${bird2.score}`;
        }
    
        frameCount++;
        if (isGameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            bird1.velocity = bird1.lift;
        }
        if (isTwoPlayer && event.key === 'ArrowUp') {
            bird2.velocity = bird2.lift;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            bird1.velocityX = 2; // Define a velocidade horizontal do bird1 para a direita
        } else if (event.key === 'ArrowLeft') {
            bird1.velocityX = -2; // Define a velocidade horizontal do bird1 para a esquerda
        }

        if (isTwoPlayer) {
            if (event.key === 'd') {
                bird2.velocityX = 2; // Define a velocidade horizontal do bird2 para a direita
            } else if (event.key === 'a') {
                bird2.velocityX = -2; // Define a velocidade horizontal do bird2 para a esquerda
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            bird1.velocityX = 0; // Para o movimento horizontal do bird1
        }

        if (isTwoPlayer && (event.key === 'd' || event.key === 'a')) {
            bird2.velocityX = 0; // Para o movimento horizontal do bird2
        }
    });
});
