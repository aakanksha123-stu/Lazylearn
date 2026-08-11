// 🎯 CANDIES
const candies = ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'];

// ==============================
// 🎮 CREATE BOARD (NO AUTO MATCH)
// ==============================
export const createBoard = () => {
  let board = [];

  for (let i = 0; i < 36; i++) {
    let randomCandy;

    do {
      randomCandy = candies[Math.floor(Math.random() * candies.length)];

      const isHorizontalMatch =
        i % 6 >= 2 &&
        board[i - 1] === randomCandy &&
        board[i - 2] === randomCandy;

      const isVerticalMatch =
        i >= 12 &&
        board[i - 6] === randomCandy &&
        board[i - 12] === randomCandy;

      if (!isHorizontalMatch && !isVerticalMatch) break;
    } while (true);

    board.push(randomCandy);
  }

  return board;
};

// ==============================
// 🔄 SWAP
// ==============================
export const swap = (board, i, j) => {
  let newBoard = [...board];
  [newBoard[i], newBoard[j]] = [newBoard[j], newBoard[i]];
  return newBoard;
};

// ==============================
// ✅ CHECK ADJACENT
// ==============================
export const isAdjacent = (i, j) => {
  const row1 = Math.floor(i / 6);
  const col1 = i % 6;

  const row2 = Math.floor(j / 6);
  const col2 = j % 6;

  return (
    (row1 === row2 && Math.abs(col1 - col2) === 1) ||
    (col1 === col2 && Math.abs(row1 - row2) === 1)
  );
};

// ==============================
// 🧠 CHECK MATCHES (SAFE)
// ==============================
export const checkMatches = board => {
  let matches = new Set();
  let bigMatch = false;

  // 🔹 HORIZONTAL
  for (let row = 0; row < 6; row++) {
    let count = 1;

    for (let col = 0; col < 5; col++) {
      let i = row * 6 + col;

      if (board[i] && board[i] === board[i + 1]) {
        count++;
      } else {
        if (count >= 3) {
          for (let k = 0; k < count; k++) {
            matches.add(i - k);
          }
          if (count >= 4) bigMatch = true;
        }
        count = 1;
      }
    }

    if (count >= 3) {
      for (let k = 0; k < count; k++) {
        matches.add(row * 6 + 5 - k);
      }
      if (count >= 4) bigMatch = true;
    }
  }

  // 🔹 VERTICAL
  for (let col = 0; col < 6; col++) {
    let count = 1;

    for (let row = 0; row < 5; row++) {
      let i = row * 6 + col;

      if (board[i] && board[i] === board[i + 6]) {
        count++;
      } else {
        if (count >= 3) {
          for (let k = 0; k < count; k++) {
            matches.add(i - k * 6);
          }
          if (count >= 4) bigMatch = true;
        }
        count = 1;
      }
    }

    if (count >= 3) {
      for (let k = 0; k < count; k++) {
        matches.add((5 - k) * 6 + col);
      }
      if (count >= 4) bigMatch = true;
    }
  }

  return {
    matches: Array.from(matches),
    bigMatch,
  };
};

// ==============================
// ❌ REMOVE MATCHES
// ==============================
export const removeMatches = (board, matches) => {
  let newBoard = [...board];
  matches.forEach(i => (newBoard[i] = null));
  return newBoard;
};

// ==============================
// ⬇️ DROP CANDIES (FIXED)
// ==============================
export const dropCandies = board => {
  let newBoard = [...board];
  let drops = [];

  for (let col = 0; col < 6; col++) {
    let stack = [];

    // collect non-null (bottom → top)
    for (let row = 5; row >= 0; row--) {
      let idx = row * 6 + col;
      if (newBoard[idx] !== null) {
        stack.push({
          value: newBoard[idx],
          fromRow: row,
        });
      }
    }

    // fill missing with new candies
    while (stack.length < 6) {
      stack.push({
        value: candies[Math.floor(Math.random() * candies.length)],
        fromRow: -1,
      });
    }

    // place back correctly (bottom → top)
    for (let row = 5; row >= 0; row--) {
      let idx = row * 6 + col;
      let item = stack[5 - row];

      newBoard[idx] = item.value;

      drops.push({
        index: idx,
        from: item.fromRow,
        to: row,
      });
    }
  }

  return { newBoard, drops };
};
// ==============================
// 🔁 CASCADE ENGINE (REQUIRED)
// ==============================
export const resolveBoard = board => {
  let current = [...board];
  let totalMatches = 0;
  let bigMatch = false;
  let steps = [];

  while (true) {
    const result = checkMatches(current);

    if (result.matches.length === 0) break;

    totalMatches += result.matches.length;
    if (result.bigMatch) bigMatch = true;

    // match step
    steps.push({
      type: 'match',
      indices: result.matches,
    });

    // remove
    current = removeMatches(current, result.matches);

    // drop
    const { newBoard, drops } = dropCandies(current);

    steps.push({
      type: 'drop',
      drops,
    });

    current = newBoard;
  }

  return {
    board: current,
    totalMatches,
    bigMatch,
    steps,
  };
};

// ==============================
// 🎮 VALIDATE SWAP
// ==============================
export const isValidMove = (board, i, j) => {
  if (!isAdjacent(i, j)) return false;

  let temp = swap(board, i, j);
  const { matches } = checkMatches(temp);

  // ✅ Only allow if swapped tiles are part of match
  return matches.includes(i) || matches.includes(j);
};

// ==============================
// 🎬 PLAY MOVE (FINAL)
// ==============================
export const playMove = (board, i, j) => {
  if (!isValidMove(board, i, j)) {
    return { valid: false };
  }

  let swapped = swap(board, i, j);

  let steps = [
    {
      type: 'swap',
      indices: [i, j],
    },
  ];

  const result = resolveBoard(swapped);
  return {
    valid: true,
    board: result.board,
    steps: [...steps, ...result.steps],
    bigMatch: result.bigMatch,
    score: result.totalMatches,
  };
};

// ==============================
// 🤖 AI FACT (NO CHANGE)
// ==============================
const BASE_URL = 'http://10.146.254.202:8000';

export const getAIFact = async subject => {
  try {
    const res = await fetch(
      `${BASE_URL}/fact/generate-fact/?subject=${encodeURIComponent(subject)}`,
    );

    const text = await res.text();

    if (!res.ok) return 'Server error';

    const data = JSON.parse(text);
    return data.fact || 'No fact available';
  } catch (error) {
    return 'Failed to load fact';
  }
};
