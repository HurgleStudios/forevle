import { VALIDGUESSES, WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 7;
let currentGuess = [];
let nextLetter = 0;
let gameid = 0;
let score = 0;

let eggflag = false;
let eggonce = false;

let games = [];
let answers = [];
let keyColors = [];

let WHITE = 0;
let BLACK = 1;
let YELLOW = 2;
let GREEN = 3;

let gameInProgress = false;

function resetGame() {
    let container = document.getElementById("game-grid");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    eggflag = false;
    currentGuess = [];
    nextLetter = 0;
    gameid = 0;
    score = 0;
    games = [];
    answers = [];
    keyColors = [];
    gameInProgress = false;

    initGame();
    updateScore();
    updateKeys();
}

function newgame(e) {
    e.preventDefault();
    document.activeElement.blur();
    if (gameInProgress) {
        if (!confirm("Are you sure you want to start a new game?")) {
            return;
        }
    }
    resetGame();
}

function initGame() {
    let thisGame = {
        answer: WORDS.splice(Math.floor(Math.random() * WORDS.length), 1).toString(),
        guessesRemaining: 7,
        num: gameid,
    };
    games.push(thisGame);
    answers.push(thisGame.answer);
    initBoard();
    gameid++;
}

function initBoard() {
    let container = document.getElementById("game-grid");

    let board = document.createElement("div");
    board.className = "game-board";
    board.id = "game" + gameid;
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
    container.appendChild(board);
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            elem.style.backgroundColor = "grey";
            elem.classList.remove("green");
            elem.classList.remove("yellow");
            switch (color) {
                case BLACK:
                    elem.style.backgroundColor = "#110011";
                    break;
                case WHITE:
                    elem.style.backgroundColor = "grey";
                    break;
                case GREEN:
                    elem.style.backgroundColor = "#444444";
                    elem.classList.add("green");
                    break;
                case YELLOW:
                    elem.style.backgroundColor = "#444444";
                    elem.classList.add("yellow");
                    break;
            }
        }
    }
}

function deleteLetter() {
    games.forEach(function(g) {
        let gdoc = document.getElementById(`game${g.num}`);
        let row = gdoc.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - g.guessesRemaining];
        let box = row.children[nextLetter - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
    });
    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess() {
    gameInProgress = true;
    let gameOver = false;
    eggonce = false;
    let addNewGame = true;

    for (let g of games) {
        let gdoc = document.getElementById(`game${g.num}`);
        let row = gdoc.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - g.guessesRemaining]
        let guessString = '';
        let rightGuess = Array.from(g.answer);

        for (const val of currentGuess) {
            guessString += val
        }

        if (!eggonce) {
            eggonce = true;
            if (eggflag) {
                if (guessString.toLowerCase() === 'artis') {
                    toastr.success(`You found the easter egg! Opening my portfolio...`);
                    setTimeout(() => {
                        window.open("https://jartis.dev");
                    }, 3000);
                }
            } else if (guessString.toLowerCase() === 'jason') {
                eggflag = true;
            } else {
                eggflag = false;
            }
        }

        if (guessString.length != 5) {
            toastr.error("Not enough letters!");
            return;
        }

        if (!WORDS.includes(guessString) && !answers.includes(guessString) && !VALIDGUESSES.includes(guessString)) {
            toastr.error("Word not in list!");
            return;
        }

        let checked = [false, false, false, false, false];
        // First, check for right letter in right place
        for (let i = 0; i < 5; i++) {
            let box = row.children[i]
            let letter = currentGuess[i]

            if (currentGuess[i] === rightGuess[i]) {
                checked[i] = true;
                let delay = 250 * i;
                setTimeout(() => {
                    //flip box
                    animateCSS(box, 'flipInY');
                    //shade box
                    box.style.backgroundColor = "dimgrey";
                    box.classList.add("green");
                }, delay);
                rightGuess[i] = '#';
            }
        }

        // Then check what's left for wrong-place
        for (let i = 0; i < 5; i++) {
            if (checked[i]) { continue; }
            let box = row.children[i]
            let letter = currentGuess[i]
            if (rightGuess.indexOf(currentGuess[i]) > -1) {
                checked[i] = true;
                rightGuess[rightGuess.indexOf(currentGuess[i])] = '#';
                let delay = 250 * i;
                setTimeout(() => {
                    //flip box
                    animateCSS(box, 'flipInY');
                    //shade box
                    box.style.backgroundColor = "dimgrey";
                    box.classList.add("yellow");
                }, delay);
            }
        }

        // Then grey out the last ones
        for (let i = 0; i < 5; i++) {
            if (checked[i]) { continue; }
            let box = row.children[i]
            let letter = currentGuess[i]
            let delay = 250 * i;
            setTimeout(() => {
                //flip box
                animateCSS(box, 'flipInY');
                //shade box
                box.style.backgroundColor = "dimgrey";
            }, delay);
        }
        setTimeout(() => {
            updateKeys();
        }, 1250);

        if (guessString === g.answer) {
            // TODO: Clear this board after? Award points?
            addNewGame = false;
            let idx = games.indexOf(g);
            toastr.success(`You guessed right! ${g.guessesRemaining} points!`);
            setTimeout(() => {
                animateCSS(gdoc, 'zoomOut').then(() => {
                    gdoc.remove();
                    score += g.guessesRemaining;
                    games.splice(idx, 1);
                    if (games.length == 0) {
                        addNewGame = true;
                    }
                    updateKeys();
                    updateScore();
                });
            }, 1500);
        } else {
            g.guessesRemaining -= 1;
        }

        if (g.guessesRemaining === 0) {
            gameOver = true;
        }
    }
    if (gameOver) {
        toastr.error("You've run out of guesses! Game over!");
        showWords();
        gameInProgress = false;
        return;
    } else {
        currentGuess = [];
        nextLetter = 0;
    }
    if (addNewGame) {
        setTimeout(() => {
            initGame(gameid++);
        }, 1500);
    }
}

function showWords() {
    for (let g of games) {
        let gdoc = document.getElementById(`game${g.num}`);
        let finalWord = document.createElement("h2");
        finalWord.style.textAlign = "center";
        finalWord.textContent = g.answer.toUpperCase();
        //gdoc.insertBefore(finalWord, gdoc.firstChild);
        gdoc.style.textAlign = "center";
        gdoc.appendChild(finalWord);
    }
}

function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
    document.title = `Forevle: ${score}`;
}

function updateKeys() {
    let oldKeyColors = keyColors.slice();
    for (let i = 0; i < 26; i++) {
        keyColors[i] = WHITE;
    }
    for (const box of document.getElementsByClassName("letter-box")) {
        let letter = box.textContent;
        let newColor = BLACK;
        if (box.classList.contains("green")) {
            newColor = GREEN;
        } else if (box.classList.contains("yellow")) {
            newColor = YELLOW;
        }
        keyColors[letter.charCodeAt(0) - 97] = Math.max(keyColors[letter.charCodeAt(0) - 97], newColor);
    }
    for (let i = 0; i < 26; i++) {
        shadeKeyBoard(String.fromCharCode(97 + i), keyColors[i]);
    }
}

function insertLetter(pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();
    for (const g of games) {
        let gdoc = document.getElementById(`game${g.num}`);

        let row = gdoc.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - g.guessesRemaining];
        let box = row.children[nextLetter];
        animateCSS(box, "pulse");
        box.textContent = pressedKey;
        box.classList.add("filled-box");
    }
    nextLetter += 1;
    currentGuess.push(pressedKey);
}

const animateCSS = (element, animation, prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element
        node.style.setProperty('--animate-duration', '0.3s');

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });

document.addEventListener("keyup", (e) => {

    games.forEach(function(g) {
        if (g.guessesRemaining === 0) {
            return;
        }
    });

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    if (pressedKey >= "a" && pressedKey <= "z") {
        insertLetter(pressedKey);
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    e.preventDefault();
    document.activeElement.blur();

    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }))
})

window.onload = function() {
    document.getElementById("newgamebtn").addEventListener("click", newgame);
    let modal = document.getElementById("infomodal");
    let btn = document.getElementById("infobtn");
    let span = document.getElementsByClassName("infoclose")[0];
    btn.addEventListener("click", function() {
        modal.style.display = "block";
    });
    span.addEventListener("click", function() {
        modal.style.display = "none";
    });
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    let cmodal = document.getElementById("changelogmodal");
    let cbtn = document.getElementById("changelogbtn");
    let cspan = document.getElementsByClassName("changelogclose")[0];
    cbtn.addEventListener("click", function() {
        cmodal.style.display = "block";
    });
    cspan.addEventListener("click", function() {
        cmodal.style.display = "none";
    });
    window.addEventListener("click", function(event) {
        if (event.target == cmodal) {
            cmodal.style.display = "none";
        }
    });

    resetGame();
};