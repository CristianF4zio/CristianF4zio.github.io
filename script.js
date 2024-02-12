document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("return-to-menu-btn").addEventListener("click", function() {
        resetGame();
        resetForm(); // Restablecer el formulario al menú principal
        document.getElementById("game-screen").style.display = "none";
        document.getElementById("start-screen").style.display = "block";
        document.getElementById("puntos").style.display = "none"; // Ocultar la tabla de puntos al volver al menú principal
        document.getElementById("setup-form").style.display = "block";
    });

    let turnCounter = 0;
    let currentPlayer = "player1";
    let gameEnded = false;

    const setupForm = document.getElementById("setup-form");
    const gameScreen = document.getElementById("game-screen");
    const bingoBoard = document.getElementById("bingo-board");
    const turnCounterElement = document.getElementById("turn-counter");
    const calledNumbersElement = document.getElementById("called-numbers");
    const callNumberBtn = document.getElementById("call-number-btn");
    const cardSizeInput = document.getElementById("card-size");
    const players = ["player1", "player2", "player3", "player4"];
    let bingoCards = {};
    const calledNumbers = new Set();
    let markedNumbers = {}; // Object to store marked numbers in each card

    setupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const playerNames = players.map(player => document.getElementById(player).value);
        if (new Set(playerNames).size !== players.length) {
            showMessage("Player names cannot be the same.");
            return;
        }

        const cardSize = parseInt(cardSizeInput.value);

        if (isNaN(cardSize) || cardSize < 3 || cardSize > 5) {
            showMessage("Card size must be a number between 3 and 5.");
            return;
        }

        if (Object.keys(bingoCards).length === 0) {
            players.forEach((player, index) => {
                bingoCards[player] = generateBingoCard(cardSize);
                bingoCards[player].playerName = playerNames[index];
                markedNumbers[player] = []; // Initialize the list of marked numbers for each player
            });
        }

        setupForm.style.display = "none";
        gameScreen.style.display = "block";

        initializeGame();
    });

    // Función para restablecer el formulario al menú principal
    function resetForm() {
        players.forEach(player => {
            document.getElementById(player).value = ""; // Restablecer valores de los campos de nombre de jugador
        });
        cardSizeInput.value = ""; // Restablecer el tamaño de la tarjeta
    }

    function showWinnerMessage(message) {
        const winnerMessageElement = document.createElement("div");
        winnerMessageElement.textContent = message;
        winnerMessageElement.classList.add("winner-message");
    
        // Agregar el mensaje al cuerpo del documento
        document.body.appendChild(winnerMessageElement);
    
        // Ocultar el mensaje después de unos segundos
        setTimeout(function() {
            winnerMessageElement.style.display = "none";
        }, 5000); // Ocultar después de 5 segundos (5000 milisegundos)
    }
    
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

    // Function to start the game

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
                // Check if the number is marked and apply a style
                if (markedNumbers[player].includes(playerCard[i][j])) {
                    cell.style.backgroundColor = "#34495e"; // Dark blue color
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
        if (gameEnded || turnCounter >= 25) {
            document.getElementById("call-number-btn").style.display = "none"; // Oculta el botón "Sacar número" al alcanzar 25 turnos
            return; // Si el juego ha terminado o se alcanzó el límite de turnos, salir de la función
        }
    
        let number;
        do {
            number = Math.floor(Math.random() * 50) + 1;
        } while (calledNumbers.has(number));
    
        calledNumbers.add(number);
        calledNumber = number;
    
        calledNumbersElement.textContent = `Called Numbers: ${[...calledNumbers].join(", ")}`;
    
        updateTurnCounter();
        markCalledNumberInAllCards();
        markCards(number); // Llamar a la función para marcar las tarjetas
        checkWinConditions(); // Comprobar las condiciones de victoria después de marcar el número
    
        if (turnCounter >= 25) {
            gameEnded = true;
            document.getElementById("call-number-btn").style.display = "none"; // Oculta el botón "Sacar número" al alcanzar 25 turnos
        }
    }
    
    
    // Función para iniciar una nueva partida
    function startNewGame() {
        resetGame(); // Reiniciar el juego
        resetForm(); // Restablecer el formulario
        document.getElementById("game-screen").style.display = "none"; // Ocultar la pantalla de juego
        document.getElementById("start-screen").style.display = "block"; // Mostrar la pantalla de inicio
        document.getElementById("puntos").style.display = "none"; // Ocultar la tabla de puntos al volver al menú principal
        document.getElementById("setup-form").style.display = "block"; // Mostrar el formulario de configuración
        document.getElementById("call-number-btn").style.display = "block"; // Mostrar el botón "Sacar número"
    }
    
    // Agregar evento al botón "Iniciar juego"
    document.getElementById("start-game-btn").addEventListener("click", startNewGame);
    
    // Iniciar la partida
    startNewGame();
    
    
    
    function updateTurnCounter() {
        turnCounter++;
        if (turnCounter <= 25) {
            turnCounterElement.textContent = `Turn: ${turnCounter}`;
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
        // Store the marked number in the corresponding player's list
        markedNumbers[player].push(calledNumber);
        const playerCardContainer = bingoBoard.querySelector(`.${player}.bingo-card`);
        for (let i = 0; i < currentPlayerCard.length; i++) {
            for (let j = 0; j < currentPlayerCard[i].length; j++) {
                if (currentPlayerCard[i][j] === calledNumber) {
                    const cell = playerCardContainer.querySelector(`table tr:nth-child(${i + 1}) td:nth-child(${j + 1})`);
                    cell.style.backgroundColor = "#34495e"; // Dark blue color
                    break;
                }
            }
        }
    }

    function markCards(number) {
        for (const player in bingoCards) {
            if (bingoCards.hasOwnProperty(player)) {
                const currentPlayerCard = bingoCards[player];
                for (let i = 0; i < currentPlayerCard.length; i++) {
                    for (let j = 0; j < currentPlayerCard[i].length; j++) {
                        if (currentPlayerCard[i][j] === number) {
                            markedNumbers[player].push(number);
                            break;
                        }
                    }
                }
            }
        }
    }

    function checkWinConditions() {
        // Objeto para almacenar los puntajes de cada jugador
        const scores = {};
        // Variable para almacenar el nombre del jugador ganador
        let winner = null;
    
        // Calcular puntajes para cada jugador
        for (const player in bingoCards) {
            if (bingoCards.hasOwnProperty(player)) {
                const currentPlayerCard = bingoCards[player];
                let score = 0;
    
                // Verificar cartón lleno
                if (currentPlayerCard.every(row => row.every(number => markedNumbers[player].includes(number)))) {
                    score += 5;
                }
    
                // Verificar líneas horizontales
                for (let i = 0; i < currentPlayerCard.length; i++) {
                    if (currentPlayerCard[i].every(number => markedNumbers[player].includes(number))) {
                        score += 1;
                        break; // Solo se otorga un punto por línea horizontal
                    }
                }
    
                // Verificar líneas verticales
                for (let i = 0; i < currentPlayerCard.length; i++) {
                    const column = [];
                    for (let j = 0; j < currentPlayerCard[i].length; j++) {
                        column.push(currentPlayerCard[j][i]);
                    }
                    if (column.every(number => markedNumbers[player].includes(number))) {
                        score += 1;
                        break; // Solo se otorga un punto por línea vertical
                    }
                }
    
                // Verificar líneas diagonales
                const diagonal1 = [];
                const diagonal2 = [];
                for (let i = 0; i < currentPlayerCard.length; i++) {
                    diagonal1.push(currentPlayerCard[i][i]);
                    diagonal2.push(currentPlayerCard[i][currentPlayerCard.length - 1 - i]);
                }
                if (diagonal1.every(number => markedNumbers[player].includes(number)) ||
                    diagonal2.every(number => markedNumbers[player].includes(number))) {
                    score += 3;
                }
    
                // Almacenar el puntaje del jugador
                scores[player] = score;
            }
        }
    
        // Encontrar el puntaje máximo y al ganador
        let maxScore = 0;
        for (const player in scores) {
            if (scores[player] > maxScore) {
                maxScore = scores[player];
                winner = player;
            }
        }
    
        // Incrementar el número de victorias acumuladas del ganador
        if (winner) {
            let victories = JSON.parse(localStorage.getItem('victories')) || {};
            victories[winner] = (victories[winner] || 0) + 1;
            localStorage.setItem('victories', JSON.stringify(victories));
        }
    
        // Actualizar la tabla de victorias en el HTML
        updateVictoriesTable();
    
        // Mostrar el mensaje de quién va ganando o si hay un empate
        if (winner) {
            showWinnerMessage(`¡El ganador es ${bingoCards[winner].playerName} con ${maxScore} puntos!`);
        } else {
            // Si no hay ganador, encontrar quién va ganando o si hay empate
            const scoresArray = Object.values(scores);
            const maxScore = Math.max(...scoresArray);
            const winners = Object.keys(scores).filter(player => scores[player] === maxScore);
            let message = "";
            if (winners.length === 1) {
                message = `¡${bingoCards[winners[0]].playerName} va ganando con ${scores[winners[0]]} puntos!`;
            } else {
                message = "¡Hay un empate entre los siguientes jugadores:";
                winners.forEach(winner => {
                    message += ` ${bingoCards[winner].playerName}`;
                });
                message += ` con ${maxScore} puntos!`;
            }
            showWinnerMessage(message);
        }
    }
    
    
    
    function resetGame() {
        turnCounter = 0;
        currentPlayer = players[0];
        winner = null;
        gameEnded = false;
        calledNumbers.clear();
        for (const player in bingoCards) {
            if (bingoCards.hasOwnProperty(player)) {
                markedNumbers[player] = [];
            }
        }
        turnCounterElement.textContent = "Turno: 0";
        calledNumbersElement.textContent = "Números llamados:";
        bingoBoard.innerHTML = "";
        // Mostrar el botón "Sacar número"
        document.getElementById("call-number-btn").style.display = "block";
        // Ocultar cualquier mensaje visible
        document.querySelectorAll(".winner-message").forEach(element => element.style.display = "none");
    }
    
    
    function showMessage(message) {
        const winnerMessageElement = document.createElement("div");
        winnerMessageElement.textContent = message;
        winnerMessageElement.classList.add("winner-message");
    
        // Agregar el mensaje al cuerpo del documento
        document.body.appendChild(winnerMessageElement);
    
        // Ocultar el mensaje después de unos segundos
        setTimeout(function() {
            winnerMessageElement.style.display = "none";
        }, 5000); // Ocultar después de 5 segundos (5000 milisegundos)
    }
    function showWinnerMessage(message) {
        const winnerMessageContainer = document.getElementById("winner-message-container");
        winnerMessageContainer.textContent = message;
        winnerMessageContainer.classList.add("winner-message");
        winnerMessageContainer.style.display = "block"; // Asegura que el contenedor esté visible
    
        // Ocultar el mensaje después de unos segundos
        setTimeout(function() {
            winnerMessageContainer.style.display = "none";
        }, 100000000); // Ocultar después de 10 segundos (10000 milisegundos)
    }
    
    function updateVictoriesTable() {
        // Leer las victorias acumuladas del localStorage
        const victories = JSON.parse(localStorage.getItem('victories')) || {};
    
        // Actualizar la tabla de victorias en el HTML
        const tableContent = document.getElementById('victories-table-content');
        tableContent.innerHTML = ''; // Limpiar el contenido anterior
    
        for (const player in victories) {
            if (victories.hasOwnProperty(player)) {
                const row = document.createElement('tr');
                const playerNameCell = document.createElement('td');
                playerNameCell.textContent = player;
                row.appendChild(playerNameCell);
                const victoriesCell = document.createElement('td');
                victoriesCell.textContent = victories[player];
                row.appendChild(victoriesCell);
                tableContent.appendChild(row);
            }
        }
    }
});