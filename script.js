document.addEventListener("DOMContentLoaded", function() {
document.getElementById("return-to-menu-btn").addEventListener("click", resetGame);
document.getElementById("return-to-menu-btn").addEventListener("click", function() {
    resetGame(); 
});


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
    let markedNumbers = {}; // Objeto para almacenar los números marcados en cada cartón

    setupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const playerNames = players.map(player => document.getElementById(player).value);
        if (new Set(playerNames).size !== players.length) {
            showMessage("Los nombres de los jugadores no pueden ser iguales.");
            return;
        }

        const cardSize = parseInt(cardSizeInput.value);

        if (isNaN(cardSize) || cardSize < 3 || cardSize > 5) {
            showMessage("El tamaño del cartón debe ser un número entre 3 y 5.");
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
        if (turnCounter >= 25) {
            resetGame();
            document.getElementById("game-screen").style.display = "none";
            document.getElementById("start-screen").style.display = "block";
            return;
        }

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

    let scores = {}; // Objeto para mantener el registro de los puntajes de los jugadores

    function calculateScore(player) {
        const currentPlayerCard = bingoCards[player];
        let score = 0;

        for (let i = 0; i < currentPlayerCard.length; i++) {
            let horizontalLine = true;
            let verticalLine = true;

            for (let j = 0; j < currentPlayerCard[i].length; j++) {
                if (!markedNumbers[player].includes(currentPlayerCard[i][j])) {
                    horizontalLine = false;
                }
                if (!markedNumbers[player].includes(currentPlayerCard[j][i])) {
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
            if (!markedNumbers[player].includes(currentPlayerCard[i][i])) {
                diagonal1 = false;
            }
            if (!markedNumbers[player].includes(currentPlayerCard[i][currentPlayerCard.length - 1 - i])) {
                diagonal2 = false;
            }
        }

        if (diagonal1 || diagonal2) {
            score += 1;
        }

        scores[player] = score; // Actualizar el puntaje del jugador

        return score;
    }

    function checkWinConditions() {
        players.forEach(player => {
            const score = calculateScore(player);
            if (score === 5) { // Si el jugador completa su cartón
                declareWinner(player);
            } else if (scores[player] !== score) { // Si el puntaje ha cambiado
                scores[player] = score; // Actualizar el puntaje
                showMessage(`${player} tiene un puntaje de ${score}`);
            }
        });

        if (!winner && turnCounter == 25) {
            declareDraw();
        }
    }

    function declareWinner(player) {
        fireworks();
        gameEnded = true;
        winner = player; // Establecer el ganador
        updateVictories(player);
        updateVictoriesTable();
        showMessage(`¡${player} ha ganado!`);
        setTimeout(() => {
            resetGame();
        }, 5000);
    }

    function declareDraw() {
        let noPoints = true;
        players.forEach(player => {
            if (scores[player] > 0) {
                noPoints = false;
            }
        });
    
        if (noPoints) {
            showMessage("¡Es un empate!");
        }
    
        gameEnded = true;
        updateVictoriesTable();
        
        setTimeout(() => {
            resetGame();
        }, 1500);
    }
    

    function showMessage(message) {
        clearMessages(); // Limpiar mensajes anteriores
        const messageContainer = document.createElement("div");
        messageContainer.textContent = message;
        messageContainer.classList.add("message");
        document.getElementById("menu-messages").appendChild(messageContainer);
    }
    
    function clearMessages() {
        const menuMessages = document.getElementById("menu-messages");
        while (menuMessages.firstChild) {
            menuMessages.removeChild(menuMessages.firstChild);
        }
    }

    function resetGame() {
        turnCounter = 0;
        gameEnded = false;
        winner = null;
        calledNumbers.clear();
    
        bingoBoard.innerHTML = "";
        turnCounterElement.textContent = "Turno: 0";
        calledNumbersElement.textContent = "Números llamados:"; // Limpiar los números llamados
    
        setupForm.reset(); // Reiniciar el formulario
        setupForm.style.display = "block"; // Mostrar el formulario de inicio
        gameScreen.style.display = "none";  // Ocultar la pantalla de juego
    
        bingoCards = {};
        markedNumbers = {}; // Restablecer la lista de números marcados
    
        // Mostrar el mensaje de "Otra partida? coloquen sus nombres!" solo si no está presente
        if (!document.getElementById("restart-message")) {
            showMessage("Otra partida? Coloquen sus nombres!");
        }
    
        setTimeout(() => {
            document.getElementById("start-screen").style.display = "block";
            document.getElementById("game-screen").style.display = "none";
        }, 0); // Esperar 0 milisegundos para cambiar la visualización inmediatamente
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
