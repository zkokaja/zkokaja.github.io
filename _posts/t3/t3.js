var Q    = {};
var turn = 'X';
var score = {
  'X': 0,
  'O': 0
};
var gridValue = 0;
var gameOn = true;

function fnLoad() {
  var select = document.getElementById("grid");
  for (var i = 3; i <= 100; i += 1) {
    var option = document.createElement('option');
    select.options[select.options.length] = new Option(i + ' X ' + i, i);
  }

  addEvent(document.getElementById("game"), "click", onUserMove);

  loadJSON('/assets/t3-optimal-policy.json', function(response) {
    Q = JSON.parse(response);
  });

  fnNewGame();
}

function addEvent(element, eventName, callback) {
  if (element.addEventListener) {
    element.addEventListener(eventName, callback, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + eventName, callback);
  }
}

function onUserMove(e) {
  if (gameOn) {
    if (e.target && e.target.nodeName == "TD") {
      var targetElement = document.getElementById(e.target.id);
      if ((targetElement.className).indexOf("disabled") == -1) {
        makeMove(targetElement);

        // Sleep?
        aiMove(chooseMove());
      }
    }

  }
}

function makeMove(targetElement) {
  if (!gameOn) return;

  var prevTurn;
  if ((targetElement.className).indexOf("disabled") == -1) {
    console.log((targetElement.className).indexOf("disabled"));
    targetElement.innerHTML = turn;
    targetElement.classList.add('disabled');
    targetElement.classList.add(turn);
    score[turn] += 1;
    prevTurn = turn;
    turn = turn === "X" ? "O" : "X";
    if (fndecide(targetElement, prevTurn)) {
      gameOn = false;
      document.getElementById('status').innerHTML = prevTurn + ' Won!';
    } else if ((score['X'] + score['O']) == (gridValue * gridValue)) {
      gameOn = false;
      document.getElementById('status').innerHTML = 'Draw!';
    }
  }
}

function fndecide(targetElement, prevTurn) {
  //console.log('decide')
  var UL = document.getElementById('game');
  var elements, i, j, cnt;
  if (score[prevTurn] >= gridValue) {
    var classes = targetElement.className.split(/\s+/);
    for (i = 0; i < classes.length; i += 1) {
      cnt = 0;
      if (classes[i].indexOf('row') !== -1 || classes[i].indexOf('col') !== -1 || classes[i].indexOf('dia') !== -1) {
        elements = UL.getElementsByClassName(classes[i]);
        for (j = 0; j < elements.length; j += 1) {
          if (elements[j].innerHTML == prevTurn) {
            cnt += 1;
          }
        }
        if (cnt == gridValue) {
          return true;
        }
      }
    }
  }
  return false;
}

function fnNewGame() {
  gameOn = true;
  document.getElementById('status').innerHTML = 'Game On!';
  var gameUL = document.getElementById("game");
  if (gameUL.innerHTML !== '') {
    gameUL.innerHTML = null;
    score = {
      'X': 0,
      'O': 0
    };
    turn = 'X';
    gridValue = 0;
  }
  var select = document.getElementById("grid");
  gridValue = select.options[select.selectedIndex].value;
  var i, j, li, k = 0,
    classLists;
  var gridAdd = +gridValue + 1;

  for (i = 1; i <= gridValue; i += 1) {
    tr = document.createElement('tr');
    for (j = 1; j <= gridValue; j += 1) {
      k += 1;
      li = document.createElement('td');
      li.setAttribute("id", 'li' + k);

      classLists = 'td row' + i + ' col' + j;

      if (i === j) {
        classLists = 'td row' + i + ' col' + j + ' dia0';
      }

      if ((i + j) === gridAdd) {
        classLists = 'td row' + i + ' col' + j + ' dia1';
      }

      if (!isEven(gridValue) && (Math.round(gridValue / 2) === i && Math.round(gridValue / 2) === j))
        classLists = 'td row' + i + ' col' + j + ' dia0 dia1';

      li.className = classLists;
      tr.appendChild(li);

    }
    gameUL.appendChild(tr);
  }

  t = document.querySelector('input[name="turn"]:checked').value;
  if (t == "O") aiMove(chooseMove());
}


function isEven(value) {
  if (value % 2 == 0)
    return true;
  else
    return false;
}


// ----

function gameToArray() {
  var arr = [[0,0,0],[0,0,0],[0,0,0]];
  var game = document.getElementById('game');
  cells = game.getElementsByTagName('td');
  n = Math.sqrt(cells.length);

  for (var i=0; i<n; i++) {
    for (var j=0; j<n; j++) {
      cell = cells[i*n+j].innerText;
      if (cell == 'X') arr[i][j] = 1;
      else if (cell == 'O') arr[i][j] = -1;
    }
  }

  return arr;
}

function getMoves(arr) {
  var moves = [];
  n = arr.length; // Assume square

  for (var i=0; i<n; i++) {
    for (var j=0; j<n; j++) {
      if (arr[i][j] == 0)
        moves.push([i,j]);
    }
  }

  return moves;
}

function encode(arr, move) {
  var board = '';

  n = arr.length; // Assume square

  for (var i=0; i<n; i++) {
    for (var j=0; j<n; j++) {
      if (arr[i][j] == 1) board += 'x';
      else if (arr[i][j] == -1) board += 'o';
      else board += ' ';
    }
  }

  board += '-' + move[0] + ',' + move[1];

  return board;
}

function chooseMove() {
  var action = null;
  var board = gameToArray();
  var moves = getMoves(board);
  var maximize = (turn === 'X') ? true : false;
  var best_q = (maximize) ? -1e6 : 1e6;

  for (var i=0; i<moves.length; i++) {
    move  = moves[i];
    state = encode(board, move);
    q = Q[state];

    if (maximize && q > best_q) {
      best_q = q;
      action = move;
    }

    if (!maximize && q < best_q) {
      best_q = q;
      action = move;
    }
  }

  return action;
}

function aiMove(move) {
  var game = document.getElementById('game');
  var cells = game.getElementsByTagName('td');
  var n = Math.sqrt(cells.length);

  var x = move[0];
  var y = move[1];
  var td = cells[x*n + y];

  makeMove(td);
}


function loadJSON(filename, callback) {   

  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', filename, true);
  xobj.onreadystatechange = function () {
	if (xobj.readyState == 4 && xobj.status == "200") {
	  callback(xobj.responseText);
	}
  };
  xobj.send(null);  
}

