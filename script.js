const size = 3;  // 가로 및 세로로 3개의 조각으로 나누기

window.onload = () => {
    showIntroAnimation(() => {
        document.querySelectorAll('.puzzle-set').forEach((puzzleContainer) => {
            const imageUrl = puzzleContainer.dataset.image;
            const targetHtml = puzzleContainer.dataset.html; // 열릴 HTML 파일 지정
            setupPuzzle(puzzleContainer, imageUrl, targetHtml);
        });
    });
};

function showIntroAnimation(callback) {
    const introContainer = document.createElement('div');
    introContainer.classList.add('intro-puzzle-container');
    document.body.appendChild(introContainer);

    for (let i = 0; i < size * size; i++) {
        const piece = document.createElement('div');
        piece.classList.add('intro-piece');
        introContainer.appendChild(piece);

        // 애니메이션 딜레이를 각 조각마다 추가
        piece.style.animationDelay = `${i * 0.2}s`;

        // 마지막 조각이 나타난 후 전체 애니메이션이 끝나고 콜백 호출
        if (i === size * size - 1) {
            piece.addEventListener('animationend', () => {
                introContainer.classList.add('intro-hide');
                document.querySelector('.background-overlay').style.opacity = '0'; // 배경 오버레이 사라지게 설정
                setTimeout(() => {
                    introContainer.remove();
                    document.querySelector('.background-overlay').remove(); // 배경 오버레이 제거
                    if (callback) callback();
                }, 2000); // 애니메이션 종료 후 2초 후 제거
            });
        }
    }
}

function setupPuzzle(puzzleContainer, imageSrc, targetHtml) {
    const pieces = [];
    let isCompleted = false;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        const maxSize = 300;
        const aspectRatio = img.width / img.height;
        const puzzleWidth = aspectRatio >= 1 ? maxSize : maxSize * aspectRatio;
        const puzzleHeight = aspectRatio >= 1 ? maxSize / aspectRatio : maxSize;
        const pieceWidth = puzzleWidth / size;
        const pieceHeight = puzzleHeight / size;

        puzzleContainer.style.width = `${puzzleWidth}px`;
        puzzleContainer.style.height = `${puzzleHeight}px`;

        const background = document.createElement('div');
        background.classList.add('puzzle-background');
        background.style.backgroundImage = `url(${imageSrc})`;
        puzzleContainer.appendChild(background);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.backgroundImage = `url(${imageSrc})`;
                piece.style.backgroundSize = `${puzzleWidth}px ${puzzleHeight}px`;
                piece.style.backgroundPosition = `${-x * pieceWidth}px ${-y * pieceHeight}px`;
                piece.dataset.index = `${y * size + x}`;

                // 랜덤 위치에 퍼즐 조각 배치
                piece.style.left = `${Math.random() * (puzzleWidth - pieceWidth)}px`;
                piece.style.top = `${Math.random() * (puzzleHeight - pieceHeight)}px`;

                puzzleContainer.appendChild(piece);
                pieces.push(piece);

                let isMouseDown = false;
                piece.addEventListener('mousedown', (e) => {
                    isMouseDown = true;
                    let offsetX = e.clientX - piece.offsetLeft;
                    let offsetY = e.clientY - piece.offsetTop;

                    function onMouseMove(e) {
                        if (!isMouseDown) return;
                        piece.style.left = `${e.clientX - offsetX}px`;
                        piece.style.top = `${e.clientY - offsetY}px`;
                    }

                    function onMouseUp() {
                        isMouseDown = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        checkPieceConnection(piece, pieces, pieceWidth, pieceHeight);
                    }

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            }
        }

        function checkPieceConnection(draggedPiece, pieces, pieceWidth, pieceHeight) {
            const draggedIndex = parseInt(draggedPiece.dataset.index);
            const draggedX = parseInt(draggedPiece.style.left);
            const draggedY = parseInt(draggedPiece.style.top);

            const correctX = (draggedIndex % size) * pieceWidth;
            const correctY = Math.floor(draggedIndex / size) * pieceHeight;

            if (Math.abs(draggedX - correctX) < 10 && Math.abs(draggedY - correctY) < 10) {
                draggedPiece.style.left = `${correctX}px`;
                draggedPiece.style.top = `${correctY}px`;
                draggedPiece.classList.add('fixed');
                draggedPiece.setAttribute('draggable', 'false');
            }

            checkGroupCompletion();
        }

        function checkGroupCompletion() {
            const fixedPieces = pieces.filter(piece => piece.classList.contains('fixed'));
            if (fixedPieces.length === pieces.length && !isCompleted) {
                puzzleContainer.classList.add('completed');

                // 원본 이미지를 잠시 후에 추가
                const originalImage = document.createElement('img');
                originalImage.src = imageSrc;
                originalImage.classList.add('original-image');
                puzzleContainer.appendChild(originalImage);

                // 퍼즐 조각 서서히 사라지기
                pieces.forEach(piece => {
                    piece.style.transition = 'opacity 1s ease';
                    piece.style.opacity = '0'; // 퍼즐 조각 서서히 사라지기
                });

                // 원본 이미지가 나타나도록 추가
                originalImage.style.opacity = '1';
                originalImage.style.transition = 'opacity 1s ease';
                setTimeout(() => {
                    originalImage.style.opacity = '1'; // 원본 이미지 서서히 나타나기
                }, 0); // 즉시 원본 이미지 나타나기 (기존 설정 유지)

                // 3x3 흰색 네모 애니메이션 시작
                puzzleContainer.addEventListener('dblclick', () => {
                    showWhiteBlocksAnimation(targetHtml);
                });

                isCompleted = true;
            }
        }
    };
}

function showWhiteBlocksAnimation(targetHtml) {
    // 애니메이션을 위한 overlay 생성
    const overlay = document.createElement('div');
    overlay.classList.add('animation-overlay');
    document.body.appendChild(overlay);

    // 3x3 블록 생성
    for (let i = 0; i < 9; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        block.style.animationDelay = `${i * 0.2}s`;  // 각 칸이 순차적으로 나타나도록
        overlay.appendChild(block);
    }

    // 애니메이션이 끝난 후 3초 뒤에 새 창으로 넘어가고 overlay는 사라짐
    setTimeout(() => {
        // 애니메이션이 끝난 후 1초 뒤에 새 창 열기
        const newWindow = window.open(targetHtml, '_blank'); // 애니메이션이 끝난 후 새 창 열기

        // 애니메이션이 끝난 후 overlay 제거
        overlay.classList.add('fade-out'); // fade-out 애니메이션을 추가하여 사라지게 함
        setTimeout(() => {
            overlay.remove(); // fade-out 애니메이션이 끝난 후 overlay 제거
        }, 1000); // fade-out 애니메이션 시간 (1초)
    }, 2100); // 애니메이션 끝난 후 3초 뒤에 새 창으로 넘어감
}

particlesJS('particles-js', {
    "particles": {
      "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
      "color": { "value": "#ffffff" },
      "shape": { "type": "circle" },
      "opacity": { "value": 0.5 },
      "size": { "value": 3, "random": true },
      "line_linked": { "enable": true, "distance": 150, "color": "#ffffff" },
      "move": { "enable": true, "speed": 6 }
    },
    "retina_detect": true
  });
  

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("bubbleCanvas");
    const ctx = canvas.getContext("2d");

    // 캔버스 크기 초기화
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    const bubbles = []; // 방울 데이터를 저장할 배열

    // 방울 클래스 정의
    class Bubble {
        constructor(x, y) {
            this.x = x; // 초기 x 좌표
            this.y = y; // 초기 y 좌표
            this.radius = Math.random() * 10 + 5; // 크기
            this.opacity = 0.1; // 투명도
            this.dx = (Math.random() - 0.5) * 2; // x 축 속도
            this.dy = Math.random() * -2 - 1; // y 축 속도 (위로 이동)
            this.lifetime = 100; // 생명주기 (프레임 수)
        }

        // 방울 그리기
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }

        // 방울 업데이트
        update() {
            this.x += this.dx; // x 이동
            this.y += this.dy; // y 이동
            this.opacity -= 0.001; // 점점 사라짐
            this.lifetime--; // 생명주기 감소
        }
    }

    // 방울 애니메이션 처리
    function animateBubbles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            bubble.update();
            bubble.draw();

            // 생명주기가 끝난 방울 제거
            if (bubble.lifetime <= 0 || bubble.opacity <= 0) {
                bubbles.splice(i, 1);
            }
        }

        requestAnimationFrame(animateBubbles); // 다음 프레임 요청
    }

    // 마우스 이동 이벤트
    window.addEventListener("mousemove", (e) => {
        for (let i = 0; i < 3; i++) { // 방울 3개씩 생성
            bubbles.push(new Bubble(e.clientX, e.clientY));
        }
    });

    // 창 크기 변경 시 캔버스 크기 재설정
    window.addEventListener("resize", resizeCanvas);

    animateBubbles(); // 애니메이션 시작
});

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // 초기 다크 모드 상태 설정
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.classList.add('dark-mode-active');
        console.log('Initial state: dark mode enabled');
    } else {
        darkModeToggle.classList.remove('dark-mode-active');
        console.log('Initial state: dark mode disabled');
    }

    // 버튼 클릭 이벤트
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.classList.add('dark-mode-active');
            console.log('Dark mode activated');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.classList.remove('dark-mode-active');
            console.log('Dark mode deactivated');
        }
    });
});

