import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 7;
let currentGuess = [];
let nextLetter = 0;
let gameid = 0;
let score = 0;

let games = [];
let answers = [];
let keyColors = [];

let WHITE = 0;
let BLACK = 1;
let YELLOW = 2;
let GREEN = 3;

let bgColors = [
    "whitesmoke",
    "dimgrey",
    "goldenrod",
    "olivedrab"
];

function initGame(gid) {
    let thisGame = {
        answer: WORDS.splice(Math.floor(Math.random() * WORDS.length), 1).toString(),
        guessesRemaining: 7,
        num: gid,
    };
    games.push(thisGame);
    answers.push(thisGame.answer);
    initBoard(gid);
}

function initBoard(gid) {
    let container = document.getElementById("game-grid");

    let gamebox = document.createElement("div");
    gamebox.className = "boardbox";
    let board = document.createElement("div");
    board.className = "game-board";
    board.id = "game" + gid;
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
    gamebox.appendChild(board);
    container.appendChild(gamebox);
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            elem.style.backgroundColor = color
            break
        }
    }
}

function deleteLetter() {
    games.forEach(function(g) {
        let gdoc = document.getElementById("game" + g.num);
        let row = gdoc.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - g.guessesRemaining];
        let box = row.children[nextLetter - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
    });
    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess() {
    let gameOver = false;

    for (let g of games) {
        let gdoc = document.getElementById("game" + g.num);
        let row = gdoc.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - g.guessesRemaining]
        let guessString = '';
        let rightGuess = Array.from(g.answer);

        for (const val of currentGuess) {
            guessString += val
        }

        if (guessString.length != 5) {
            toastr.error("Not enough letters!");
            return;
        }

        if (!WORDS.includes(guessString) && !answers.includes(guessString)) {
            toastr.error("Word not in list!");
            return;
        }

        for (let i = 0; i < 5; i++) {
            let letterColor = ''
            let box = row.children[i]
            let letter = currentGuess[i]

            let letterPosition = rightGuess.indexOf(currentGuess[i])
                // is letter in the correct guess
            if (letterPosition === -1) {
                letterColor = 'dimgrey'
            } else {
                // now, letter is definitely in word
                // if letter index and right guess index are the same
                // letter is in the right position 
                if (currentGuess[i] === rightGuess[i]) {
                    // shade olivedrab 
                    letterColor = 'olivedrab'
                } else {
                    // shade box goldenrod
                    letterColor = 'goldenrod'
                }

                rightGuess[letterPosition] = "#"
            }

            let delay = 250 * i
            setTimeout(() => {
                //flip box
                animateCSS(box, 'flipInY')
                    //shade box
                box.style.backgroundColor = letterColor
                updateKeys();
            }, delay)
        }

        if (guessString === g.answer) {
            // TODO: Clear this board after? Award points?
            toastr.success("You guessed right! Game over!");
            setTimeout(() => {
                animateCSS(gdoc, 'zoomOut').then(() => {
                    gdoc.remove();
                    let idx = games.indexOf(g);
                    score += (idx + 1);
                    games.splice(idx, 1);
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
        return;
    } else {
        currentGuess = [];
        nextLetter = 0;
    }
    setTimeout(() => {
        initGame(gameid++);
    }, 1500)
}

function updateScore() {
    document.getElementById("score").textContent = "Score: " + score;
    document.title = "Forevle (" + score + ")";
}

function updateKeys() {
    for (let i = 0; i < 26; i++) {
        keyColors[i] = WHITE;
    }
    for (const box of document.getElementsByClassName("letter-box")) {
        let letter = box.textContent;
        let newColor = WHITE;
        switch (box.style.backgroundColor) {
            case "whitesmoke":
                newColor = WHITE;
                break;
            case "dimgrey":
                newColor = BLACK;
                break;
            case "goldenrod":
                newColor = YELLOW;
                break;
            case "olivedrab":
                newColor = GREEN;
                break;
        }
        keyColors[letter.charCodeAt(0) - 97] = Math.max(keyColors[letter.charCodeAt(0) - 97], newColor);
    }
    for (let i = 0; i < 26; i++) {
        shadeKeyBoard(String.fromCharCode(97 + i), bgColors[keyColors[i]]);
    }
}

function insertLetter(pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();
    games.forEach(function(g) {
        let gdoc = document.getElementById("game" + g.num);

        let row = gdoc.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - g.guessesRemaining];
        let box = row.children[nextLetter];
        animateCSS(box, "pulse");
        box.textContent = pressedKey;
        box.classList.add("filled-box");
    });
    currentGuess.push(pressedKey);
    nextLetter += 1;
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

    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }))
})

initGame(gameid++);