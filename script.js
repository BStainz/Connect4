const player1ColorInput = document.getElementById('player1Color');
const player2ColorInput = document.getElementById('player2Color');
const colorOkayButton = document.getElementById('colorOkay');
const colorSelection = document.getElementById('colorSelection');
const connect4Board = document.getElementById('connect4');
const resetButton = document.getElementById('reset');
const timerElement = document.getElementById('time');
const player1ScoreElement = document.getElementById('player1Score');
const player2ScoreElement = document.getElementById('player2Score');
let currentPlayer = 'player1';
let gameActive = false;
let timer;
let timeElapsed = 0;
let player1Score = 0;
let player2Score = 0;
let isProcessingTurn = false;

//creates game board
function createBoard() {
    connect4Board.innerHTML = ''; 
    for (let i = 0; i < 42; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', placeChip); 
        connect4Board.appendChild(cell);
    }
}

// places chip in column selected
function placeChip(event) {
    console.log("placeChip called"); 
    if (!gameActive || isProcessingTurn) return;

    isProcessingTurn = true; 
    const cell = event.target;
    const index = parseInt(cell.dataset.index);
    const column = index % 7;
    let placed = false;

    for (let i = 5; i >= 0; i--) {
        const targetCell = connect4Board.children[i * 7 + column];
        if (!targetCell.classList.contains('player1') && !targetCell.classList.contains('player2')) {
            targetCell.classList.add(currentPlayer);
            const chip = document.createElement('div');
            chip.classList.add('chip');
            targetCell.appendChild(chip);
            setTimeout(() => {
                chip.style.transform = 'translateY(0)'; // Start the chip drop animation immediately
            }, 10);
                placed = true;
            setTimeout(() => {
                if (gameActive) { // Only proceed if the game is still active
                    checkWin(); // Check for a win based on the current player
                    if (gameActive) { // Only switch players if the game is still active after checking for a win
                        switchPlayer(); // Then switch players
                    }
                }
                isProcessingTurn = false; 
            }, 510); // Wait for the drop animation to complete before checking for a win and switching players
            break; // Break out of the loop after placing the chip
        }
    }

    if (!placed) {
        console.log('Column is full!');
        isProcessingTurn = false; 
    }
}

//switch to next player
function switchPlayer() {
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    console.log(`Switched to Player ${currentPlayer}`); // Debugging message
}

//checks for win
function checkWin() {
    const cells = document.querySelectorAll('.cell');
    const rows = 6;
    const cols = 7;

    function checkDirection(row, col, rowInc, colInc) {
        let count = 0;
        let r = row;
        let c = col;

        while (r >= 0 && r < rows && c >= 0 && c < cols && cells[r * cols + c].classList.contains(currentPlayer)) {
            count++;
            r -= rowInc;
            c -= colInc;
        }

        r = row + rowInc;
        c = col + colInc;

        while (r >= 0 && r < rows && c >= 0 && c < cols && cells[r * cols + c].classList.contains(currentPlayer)) {
            count++;
            r += rowInc;
            c += colInc;
        }

        return count >= 4;
    }
    
    let winnerFound = false;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (checkDirection(row, col, 0, 1) || 
                checkDirection(row, col, 1, 0) || 
                checkDirection(row, col, 1, 1) || 
                checkDirection(row, col, 1, -1)) { 
                    winnerFound = true;
                    break;
            }
        }
        if (winnerFound) break;
    }

    if (winnerFound) {
        updateScore(); 
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.textContent = `${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'} wins!`;
        document.getElementById('winnerPopup').style.display = 'block';
        gameActive = false;
        clearInterval(timer);
        return true; // Return true to indicate a win
    }

    const allCellsFilled = [...cells].every(cell => cell.classList.contains('player1') || cell.classList.contains('player2'));
    if (allCellsFilled) {
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.textContent = "It's a tie!";
        document.getElementById('winnerPopup').style.display = 'block';
        gameActive = false;
        clearInterval(timer);
        return true; // Return true to indicate a tie
    }

    return false; // Return false to indicate no win
}
//updates score
function updateScore() {
    if (currentPlayer === 'player1') {
        player1Score++;
        player1ScoreElement.textContent = player1Score.toString();
    } else {
        player2Score++;
        player2ScoreElement.textContent = player2Score.toString();
    }
}

//Resets game and clears board
function resetGame() {
    createBoard();
    currentPlayer = 'player1'; // Reset to player 1's turn
    gameActive = true; // Ensure the game is active
    resetTimer();
}

//Starts the timer
function startTimer() {
    timer = setInterval(() => {
        timeElapsed++;
        timerElement.textContent = timeElapsed.toString();
    }, 1000);
}

//Resets the timer
function resetTimer() {
    clearInterval(timer);
    timeElapsed = 0;
    timerElement.textContent = timeElapsed.toString();
}

//Updates player colors
function updatePlayerColors() {
    const player1Color = player1ColorInput.value;
    const player2Color = player2ColorInput.value;
    document.documentElement.style.setProperty('--player1-color', player1Color);
    document.documentElement.style.setProperty('--player2-color', player2Color);
}

//Button to start game after players select color
colorOkayButton.addEventListener('click', () => {
    updatePlayerColors();
    colorSelection.style.display = 'none';
    gameActive = true;
    startTimer();
});

//Button if players want to switch colors after games over
document.getElementById('switchColors').addEventListener('click', () => {

    const tempColor = player1ColorInput.value;
    player1ColorInput.value = player2ColorInput.value;
    player2ColorInput.value = tempColor;
    updatePlayerColors();
    resetGame();
    document.getElementById('winnerPopup').style.display = 'none';
    colorSelection.style.display = 'block'; 
    gameActive = false;
});

//Button if players want to keep colors after games over
document.getElementById('keepColors').addEventListener('click', () => {
    resetGame();
    document.getElementById('winnerPopup').style.display = 'none';
    gameActive = true; // Allow the game to continue with the same colors
    startTimer(); // Restart the timer for the new game
});

//Button to reset game
resetButton.addEventListener('click', resetGame);

//Starts game
createBoard();