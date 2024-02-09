document.addEventListener("DOMContentLoaded", function() {
    let turnCounter = 0; // Inicializamos el contador de turnos
    let currentPlayer = "player1"; // Inicializamos el jugador actual
    let winner = null; // Inicializamos el ganador
    let gameEnded = false; // Variable para controlar si el juego ha terminado

    const setupForm = document.getElementById("setup-form");
    const gameScreen = document.getElementById("game-screen");
    const bingoBoard = document.getElementById("bingo-board");
    const turnCounterElement = document.getElementById("turn-counter");
    const calledNumbersElement = document.getElementById("called-numbers");
    const callNumberBtn = document.getElementById("call-number-btn");
    const cardSizeInput = document.getElementById("card-size");
    const players = ["player1", "player2", "player3", "player4"];
    let bingoCards = {}; // Objeto para almacenar los cartones de bingo de cada jugador
    const calledNumbers = new Set(); // Conjunto para almacenar los números ya llamados

    setupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // Validar que los nombres de los jugadores no sean iguales
        const playerNames = players.map(player => document.getElementById(player).value);
        if (new Set(playerNames).size !== players.length) {
            alert("Los nombres de los jugadores no pueden ser iguales.");
            return;
        }

        // Obtener el tamaño del cartón
        const cardSize = parseInt(cardSizeInput.value);

        // Validar el tamaño del cartón
        if (isNaN(cardSize) || cardSize < 3 || cardSize > 5) {
            alert("El tamaño del cartón debe ser un número entre 3 y 5.");
            return;
        }

        // Generar cartón de bingo solo si no existe previamente
        if (Object.keys(bingoCards).length === 0) {
            players.forEach((player, index) => {
                bingoCards[player] = generateBingoCard(cardSize);
                bingoCards[player].playerName = playerNames[index]; // Asignar el nombre del jugador al cartón
            });
        }

        // Ocultar pantalla de configuración
        setupForm.style.display = "none";
        // Mostrar pantalla de juego
        gameScreen.style.display = "block";

        // Inicializar el juego
        initializeGame();
    });

    function generateBingoCard(size) {
        const card = [];
        const numbers = Array.from({ length: 50 }, (_, i) => i + 1);

        // Obtener números aleatorios únicos para el cartón
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
        // Mostrar todos los cartones de los jugadores
        displayAllPlayerCards();
        // Actualizar el contador de turnos
        updateTurnCounter();
        // Agregar evento al botón para sacar un número
        callNumberBtn.addEventListener("click", callNumber);
    }

    function displayAllPlayerCards() {
        for (let player in bingoCards) {
            displayPlayerCard(player);
        }
    }

    function displayPlayerCard(player) {
        const playerCard = bingoCards[player];
        const cardContainer = document.createElement("div");
        cardContainer.classList.add(player, "bingo-card"); // Añadir clase para identificar el jugador
        
        // Crear el título del cartón con el nombre del jugador
        const cardTitle = document.createElement("h2");
        cardTitle.textContent = `${playerCard.playerName}'s Bingo Card`;
        cardContainer.appendChild(cardTitle);

        // Crear la tabla del cartón de bingo
        const cardTable = document.createElement("table");
        for (let i = 0; i < playerCard.length; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < playerCard[i].length; j++) {
                const cell = document.createElement("td");
                cell.textContent = playerCard[i][j];
                // Resaltar las casillas marcadas
                if (playerCard[i][j] === "X") {
                    cell.style.backgroundColor = "#00ff00"; // Verde
                }
                row.appendChild(cell);
            }
            cardTable.appendChild(row);
        }
        cardContainer.appendChild(cardTable);

        // Agregar el cartón al contenedor principal
        bingoBoard.appendChild(cardContainer);
    }

    function updateTurnCounter() {
        turnCounter++; // Incrementamos el contador de turnos
        turnCounterElement.textContent = `Turno: ${turnCounter}`;
    }

    function callNumber() {
        if (gameEnded) return; // Salir si el juego ha terminado

        // Obtener un número de bingo aleatorio que no haya sido llamado
        let number;
        do {
            number = Math.floor(Math.random() * 50) + 1;
        } while (calledNumbers.has(number));

        // Actualizar el conjunto de números llamados
        calledNumbers.add(number);

        // Actualizar la lista de números llamados en la interfaz
        calledNumbersElement.textContent = `Números llamados: ${[...calledNumbers].join(", ")}`;

        // Marcar el número en los cartones de bingo de todos los jugadores
        players.forEach(player => {
            const currentPlayerCard = bingoCards[player];
            const playerCardContainer = bingoBoard.querySelector(`.${player}.bingo-card`);
            for (let i = 0; i < currentPlayerCard.length; i++) {
                for (let j = 0; j < currentPlayerCard[i].length; j++) {
                    if (currentPlayerCard[i][j] === number) {
                        currentPlayerCard[i][j] = "X"; // Marcar el número como llamado
                        // Actualizar el cartón del jugador en la interfaz
                        updatePlayerCard(player, playerCardContainer);
                    }
                }
            }
        });

        // Comprobar si algún jugador ha completado su cartón
        checkWinConditions();

        // Pasar al siguiente turno
        nextTurn();
    }

    function updatePlayerCard(player, cardContainer) {
        // Limpiar el contenedor del cartón del jugador
        cardContainer.innerHTML = "";

        // Mostrar el cartón actualizado del jugador
        displayPlayerCard(player);
    }

    function checkWinConditions() {
        // Comprobar si algún jugador ha completado su cartón
        players.forEach(player => {
            const currentPlayerCard = bingoCards[player];
            if (currentPlayerCard.every(row => row.every(cell => cell === "X"))) {
                declareWinner(player);
            }
        });

        // Comprobar si se ha alcanzado el máximo de turnos sin ganador
        if (!winner && turnCounter >= 25) {
            declareDraw();
        }
    }

    function declareWinner(player) {
        // Mostrar efectos de fuegos artificiales
        fireworks();
    
        // Marcar el juego como terminado
        gameEnded = true;
        // Reiniciar la página después de mostrar los fuegos artificiales
        setTimeout(() => {
            location.reload();
        }, 5000); // Reiniciar después de 5 segundos
    }
    
    function declareDraw() {
        // Marcar el juego como terminado
        gameEnded = true;
        // Reiniciar la página después de mostrar el mensaje
        setTimeout(() => {
            location.reload();
        }, 3000); // Reiniciar después de 3 segundos
    }
    
    

    function updateLocalStorage(player) {
        const victories = localStorage.getItem(`${player}-victories`) || 0;
        localStorage.setItem(`${player}-victories`, parseInt(victories) + 1);
    }

    function nextTurn() {
        // Verificar si el juego ha terminado antes de pasar al siguiente turno
        if (gameEnded) return;

        // Actualizar el contador de turnos
        updateTurnCounter();
    }

    function resetGame() {
        // Reiniciar variables del juego
        turnCounter = 0;
        gameEnded = false;
        winner = null;
        calledNumbers.clear();

        // Limpiar el tablero de bingo y el contador de turnos en la interfaz
        bingoBoard.innerHTML = "";
        turnCounterElement.textContent = "Turno: 0";

        // Mostrar pantalla de configuración
        setupForm.style.display = "block";
        gameScreen.style.display = "none";

        // Restablecer los cartones de bingo
        bingoCards = {};
    }
});
