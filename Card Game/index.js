const gridContainer = document.querySelector('.grid-container');
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let timerInterval;
let level = 1;
let pairs = 2;
let matchedPairs = 0;
let seconds = 0;

document.querySelector('.timer').textContent = '00:00';

fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
        cards = data;
        startGame();
    });

function startGame() {
    matchedPairs = 0;
    seconds = 0;
    clearInterval(timerInterval); // Clear any existing timers
    document.querySelector('.timer').textContent = '00:00'; // Reset timer display
    const levelCards = cards.slice(0, pairs);
    const gameCards = [...levelCards, ...levelCards];
    shuffleCards(gameCards);
    generateCards(gameCards);
    document.querySelector('.next-level').style.display = 'none'; // Hide the Next Level button at the start
}

function shuffleCards(cardArray) {
    let currentIndex = cardArray.length,
        randomIndex,
        temp;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = cardArray[currentIndex];
        cardArray[currentIndex] = cardArray[randomIndex];
        cardArray[randomIndex] = temp;
    }
}

function generateCards(cardArray) {
    gridContainer.innerHTML = ''; // Clear the existing cards

    // Set number of columns and rows based on pairs
    let columns, rows;
    switch (pairs) {
        case 2:
            columns = 2;
            rows = 2;
            break;
        case 4:
            columns = 4;
            rows = 2;
            break;
        case 6:
            columns = 4;
            rows = 3;
            break;
        case 9:
            columns = 6;
            rows = 3;
            break;
        default:
            columns = Math.min(Math.floor(Math.sqrt(cardArray.length)), 6);
            rows = Math.ceil(cardArray.length / columns);
    }
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, 140px)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, calc(140px * 1.5))`;

    for(let card of cardArray) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute("data-name", card.name);
        cardElement.innerHTML = `
            <div class="front">
                <img class="front-image" src=${card.image}>
            </div>
            <div class="back"></div>
        `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener('click', flipCard);
    }
}

function flipCard() {
    if(lockBoard) return;
    if(this === firstCard) return;

    this.classList.add("flipped");
    if(!firstCard) {
        startTimer(); // Start timer on first card click
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;

    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;

    resetBoard();

    if (matchedPairs === pairs) {
        stopTimer(); // Stop timer when all pairs are matched
        document.querySelector('.next-level').style.display = 'block'; // Show Next Level button
    }
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');

        resetBoard();
    }, 1000);
}

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        const display = `${minutes < 10 ? '0' : ''}${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
        document.querySelector('.timer').textContent = display;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function restart() {
    resetBoard();
    seconds = 0;
    document.querySelector('.timer').textContent = '00:00';
    level = 1;
    pairs = 2;
    startGame();
}

function nextLevel() {
    resetBoard();
    stopTimer();
    switch (level) {
        case 1:
            pairs = 4;
            break;
        case 2:
            pairs = 6;
            break;
        case 3:
            pairs = 9;
            break;
        default:
            pairs = 2; // Restart at the initial level or handle as needed
    }
    level++;
    startGame();
}
