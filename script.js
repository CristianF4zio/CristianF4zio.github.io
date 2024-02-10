document.addEventListener("DOMContentLoaded", function() {
    let turnCounter = 0;
    let currentPlayer = "player1";
    let winner = null;
    let gameEnded = false;

    const setupForm = document.getElementById("setup-form");
    const gameScreen = document.getElementById("game-screen");
    const bingoContainer = document.getElementById("bingo-container");
    const bingoBoard = document.getElementById("bingo-board");
    const turnCounterElement = document.getElementById("turn-counter");
    const calledNumbersElement = document.getElementById("called-numbers");
    const callNumberBtn = document.getElementById("call-number-btn");
    const cardSizeInput = document.getElementById("card-size");
    const players = ["player1", "player2", "player3", "player4"];
    let bingoCards = {};
    const calledNumbers = new Set();
    const markedNumbers = {}; // Objeto para almacenar los números marcados en cada cartón

    setupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const playerNames = players.map(player => document.getElementById(player).value);
        if (new Set(playerNames).size !== players.length) {
            alert("Los nombres de los jugadores no pueden ser iguales.");
            return;
        }

        const cardSize = parseInt(cardSizeInput.value);

        if (isNaN(cardSize) || cardSize < 3 || cardSize > 5) {
            alert("El tamaño del cartón debe ser un número entre 3 y 5.");
            return;
        }

        if (Object.keys(bingoCards).length === 0) {
            players.forEach((player, index) => {
                bingoCards[player] = generateBingoCard(cardSize);
                bingoCards[player].playerName = playerNames[index];
                markedNumbers[player] = []; // Inicializar la lista de números marcados para cada jugador
            });
        }

        setupForm.style.display = "none";
        gameScreen.style.display = "block";

        initializeGame();
    });

    function generateBingoCard(size) {
        const card = [];
        const numbers = Array.from({ length: 50 }, (_, i) => i + 1);

        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const index = Math.floor(Math.random() * numbers.length);
                row.push(numbers.splice(index, 1)[0]);
            }
            card.push(row);
        }

        return card;
    }

    function initializeGame() {
        displayPlayerCard(currentPlayer);
    
        callNumberBtn.addEventListener("click", callNumber);
    
        const prevButton = document.getElementById("prev-button");
        const nextButton = document.getElementById("next-button");
    
        prevButton.addEventListener("click", showPrevCard);
        nextButton.addEventListener("click", showNextCard);
    
        updateVictoriesTable();
    }
    

    function displayPlayerCard(player) {
        bingoBoard.innerHTML = "";

        const playerCard = bingoCards[player];
        const cardContainer = document.createElement("div");
        cardContainer.classList.add(player, "bingo-card");
        
        const cardTitle = document.createElement("h2");
        cardTitle.textContent = `${playerCard.playerName}'s Bingo Card`;
        cardContainer.appendChild(cardTitle);

        const cardTable = document.createElement("table");
        for (let i = 0; i < playerCard.length; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < playerCard[i].length; j++) {
                const cell = document.createElement("td");
                cell.textContent = playerCard[i][j];
                // Comprobar si el número está marcado y aplicar un estilo
                if (markedNumbers[player].includes(playerCard[i][j])) {
                    cell.style.backgroundColor = "#34495e"; // Color azul oscuro
                }
                row.appendChild(cell);
            }
            cardTable.appendChild(row);
        }
        cardContainer.appendChild(cardTable);

        bingoBoard.appendChild(cardContainer);
    }

    function showPrevCard() {
        let currentIndex = players.indexOf(currentPlayer);
        currentIndex = (currentIndex - 1 + players.length) % players.length;
        currentPlayer = players[currentIndex];
        displayPlayerCard(currentPlayer);
    }

    function showNextCard() {
        let currentIndex = players.indexOf(currentPlayer);
        currentIndex = (currentIndex + 1) % players.length;
        currentPlayer = players[currentIndex];
        displayPlayerCard(currentPlayer);
    }

    function callNumber() {
        let number;
        do {
            number = Math.floor(Math.random() * 50) + 1;
        } while (calledNumbers.has(number));
    
        calledNumbers.add(number);
        calledNumber = number;
    
        calledNumbersElement.textContent = `Números llamados: ${[...calledNumbers].join(", ")}`;
    
        if (turnCounter < 25) {
            updateTurnCounter();
            markCalledNumberInAllCards();
            checkWinConditions();
        } else if (turnCounter === 25) {
            updateTurnCounter();
            markCalledNumberInAllCards();
            checkWinConditions();
            resetGame(); // Llama a resetGame() cuando el turno llegue a 25
        }
    }
    
    
    
    function updateTurnCounter() {
        turnCounter++;
        if (turnCounter <= 25) {
            turnCounterElement.textContent = `Turno: ${turnCounter}`;
        }
    }
    

    function markCalledNumberInAllCards() {
        for (const player in bingoCards) {
            if (bingoCards.hasOwnProperty(player)) {
                markCalledNumberInCard(player);
            }
        }
    }

    function markCalledNumberInCard(player) {
        const currentPlayerCard = bingoCards[player];
        // Almacenar el número marcado en la lista correspondiente al jugador
        markedNumbers[player].push(calledNumber);
        const playerCardContainer = bingoBoard.querySelector(`.${player}.bingo-card`);
        for (let i = 0; i < currentPlayerCard.length; i++) {
            for (let j = 0; j < currentPlayerCard[i].length; j++) {
                if (currentPlayerCard[i][j] === calledNumber) {
                    const cell = playerCardContainer.querySelector(`table tr:nth-child(${i + 1}) td:nth-child(${j + 1})`);
                    cell.style.backgroundColor = "#34495e"; // Color azul oscuro
                }
            }
        }
    }

    function calculateScore(player) {
        const currentPlayerCard = bingoCards[player];
        let score = 0;

        for (let i = 0; i < currentPlayerCard.length; i++) {
            let horizontalLine = true;
            let verticalLine = true;

            for (let j = 0; j < currentPlayerCard[i].length; j++) {
                if (currentPlayerCard[i][j] !== "X") {
                    horizontalLine = false;
                }
                if (currentPlayerCard[j][i] !== "X") {
                    verticalLine = false;
                }
            }

            if (horizontalLine) {
                score += 1;
            }
            if (verticalLine) {
                score += 1;
            }
        }

        let diagonal1 = true;
        let diagonal2 = true;
        for (let i = 0; i < currentPlayerCard.length; i++) {
            if (currentPlayerCard[i][i] !== "X") {
                diagonal1 = false;
            }
            if (currentPlayerCard[i][currentPlayerCard.length - 1 - i] !== "X") {
                diagonal2 = false;
            }
        }

        if (diagonal1 || diagonal2) {
            score += 3;
        }

        if (currentPlayerCard.every(row => row.every(cell => cell === "X"))) {
            score += 5;
        }

        return score;
    }

    function checkWinConditions() {
        players.forEach(player => {
            const currentPlayerCard = bingoCards[player];
            if (currentPlayerCard.every(row => row.every(cell => cell === "X"))) {
                declareWinner(player);
            } else {
                const score = calculateScore(player);
                console.log(`${player} tiene un puntaje de ${score}`);
            }
        });

        if (!winner && turnCounter == 25) {
            declareDraw();
        }
    }

    function declareWinner(player) {
        fireworks();
        gameEnded = true;
        updateVictories(player);
        setTimeout(() => {
            location.reload();
        }, 5000);
    }

    function declareDraw() {
        gameEnded = true;
        setTimeout(() => {
            location.reload();
        }, 1500);
    }

    function updateTurnCounter() {
        turnCounter++;
        turnCounterElement.textContent = `Turno: ${turnCounter}`;
    }

    function nextTurn() {
        if (gameEnded) return;
        updateTurnCounter();
    }

    function resetGame() {
        turnCounter = 0;
        gameEnded = false;
        winner = null;
        calledNumbers.clear();
    
        bingoBoard.innerHTML = "";
        turnCounterElement.textContent = "Turno: 0";
    
        setupForm.style.display = "block"; // Mostrar el formulario de inicio
        gameScreen.style.display = "none";  // Ocultar la pantalla de juego
    
        bingoCards = {};
        markedNumbers = {}; // Restablecer la lista de números marcados
    
        // Esperar 1.7 segundos antes de recargar la página
        setTimeout(() => {
            location.reload();
        }, 1700);
    }

    function fireworks() {
        console.log("¡Fuegos artificiales!");
    }

    function updateVictories(player) {
        let victoriesData = JSON.parse(localStorage.getItem("victories")) || {};
        victoriesData[player] = (victoriesData[player] || 0) + 1;
        localStorage.setItem("victories", JSON.stringify(victoriesData));
    }

    function updateVictoriesTable() {
        const victoriesData = JSON.parse(localStorage.getItem("victories")) || {};
        const tableContent = document.getElementById("victories-table-content");

        tableContent.innerHTML = "";

        for (const player in victoriesData) {
            const row = document.createElement("tr");
            const playerNameCell = document.createElement("td");
            const victoriesCell = document.createElement("td");

            playerNameCell.textContent = player;
            victoriesCell.textContent = victoriesData[player];

            row.appendChild(playerNameCell);
            row.appendChild(victoriesCell);

            tableContent.appendChild(row);
        }
    }

});
