import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateWordSearch, PlacedWord } from '../utils/wordSearchUtils';
import { alphabetData } from '../data/alphabet';
import { WORD_SEARCH_CONSTANTS } from '../constants/wordSearchConstants';
import '../styles/WordSearch.scss';
import { useTranslation } from 'react-i18next';
import SuccessModal from './SuccessModal';
import { speakText, playCorrectSound, stopSpeech, stopAllTones } from '../utils/soundUtils';
import { useSparkleBurst } from '../hooks/useSparkleBurst';
import { wordToEmoji } from '../data/iconMapping';
import { formatElapsedTime } from '../utils/timeUtils';

type CellCoord = [number, number];

function getRandomWordsFromAlphabet(count = 5): string[] {
  const allWords = alphabetData
    .flatMap((a) => a.words)
    .map((w) => w.replace(/\s+/g, '').toUpperCase())
    .filter((w) => w.length >= 3 && w.length <= 6);
  const unique = Array.from(new Set(allWords));
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  return unique.slice(0, count);
}

interface WordSearchCellProps {
  rowIdx: number;
  colIdx: number;
  letter: string;
  isHighlighted: boolean;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onCellMouseUp: () => void;
}

const WordSearchCell = memo(function WordSearchCell({
  rowIdx,
  colIdx,
  letter,
  isHighlighted,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
}: WordSearchCellProps) {
  return (
    <td
      className={`text-center align-middle p-0 wordsearch-cell ${isHighlighted ? 'highlight-from-list' : ''}`}
      onMouseDown={() => onCellMouseDown(rowIdx, colIdx)}
      onMouseEnter={() => onCellMouseEnter(rowIdx, colIdx)}
      onMouseUp={onCellMouseUp}
    >
      {letter}
    </td>
  );
});

interface WordListItemProps {
  word: string;
  isFound: boolean;
  onSelectWord: (word: string) => void;
}

const WordListItem = memo(function WordListItem({ word, isFound, onSelectWord }: WordListItemProps) {
  return (
    <li className="wordsearch-word-list-item">
      <span
        className={`wordsearch-word ${isFound ? 'found' : ''}`}
        onClick={() => onSelectWord(word)}
      >
        {word}
      </span>
    </li>
  );
});

const WordSearch: React.FC = () => {
  const { t } = useTranslation();
  const { difficulty } = useParams<{ difficulty: string }>();
  const navigate = useNavigate();
  const { triggerSparkleBurst, SparkleRenderer } = useSparkleBurst();

  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<CellCoord[]>([]);
  const [permanentlyFoundWords, setPermanentlyFoundWords] = useState<CellCoord[][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [win, setWin] = useState(false);
  const [gridSize, setGridSize] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStartedTime, setGameStartedTime] = useState<number | null>(null);
  const [highlightedGridWordCells, setHighlightedGridWordCells] = useState<CellCoord[]>([]);
  const [matchedEmoji, setMatchedEmoji] = useState<string | null>(null);

  const gridRef = useRef<HTMLTableElement | null>(null);
  const timerRafRef = useRef<number | null>(null);
  const matchedEmojiRafRef = useRef<number | null>(null);
  const colorPalette = WORD_SEARCH_CONSTANTS.COLOR_PALETTE;

  const startGame = useCallback(
    (diffKey?: string) => {
      const upper = (diffKey || 'easy').toUpperCase() as keyof typeof WORD_SEARCH_CONSTANTS.DIFFICULTY_LEVELS;
      const difficultySettings = WORD_SEARCH_CONSTANTS.DIFFICULTY_LEVELS[upper];
      if (!difficultySettings) {
        navigate('/wordsearch');
        return;
      }

      setGridSize(difficultySettings.GRID_SIZE);
      setGameStartedTime(Date.now());
      setTimer(0);
      const pickedWords = getRandomWordsFromAlphabet(difficultySettings.NUM_WORDS);
      const { grid, placedWords } = generateWordSearch(difficultySettings.GRID_SIZE, pickedWords);
      setGrid(grid);
      setPlacedWords(placedWords);
      setFoundWords([]);
      setSelectedCells([]);
      setPermanentlyFoundWords([]);
      setIsSelecting(false);
      setWin(false);
    },
    [navigate],
  );

  useEffect(() => {
    startGame(difficulty);
  }, [difficulty, startGame]);

  const restartGame = () => {
    setHighlightedGridWordCells([]);
    startGame(difficulty);
  };

  useEffect(() => {
    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    if (!gameStartedTime || win) return undefined;

    const tick = () => {
      const nextTimer = Math.floor((Date.now() - gameStartedTime) / 1000);
      setTimer((prev) => (prev === nextTimer ? prev : nextTimer));
      timerRafRef.current = requestAnimationFrame(tick);
    };

    timerRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
      timerRafRef.current = null;
    };
  }, [gameStartedTime, win]);

  useEffect(() => {
    if (matchedEmojiRafRef.current) cancelAnimationFrame(matchedEmojiRafRef.current);
    if (!matchedEmoji) return undefined;

    const startedAt = performance.now();
    const tick = (now: number) => {
      if (now - startedAt >= 1000) {
        setMatchedEmoji(null);
        matchedEmojiRafRef.current = null;
        return;
      }
      matchedEmojiRafRef.current = requestAnimationFrame(tick);
    };

    matchedEmojiRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (matchedEmojiRafRef.current) cancelAnimationFrame(matchedEmojiRafRef.current);
      matchedEmojiRafRef.current = null;
    };
  }, [matchedEmoji]);

  const handleCellMouseDown = useCallback((row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([[row, col]]);
  }, []);

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isSelecting) return;
      setSelectedCells((prev) => {
        if (prev.length === 0) return [[row, col]];
        const [startRow, startCol] = prev[0];
        const dr = row - startRow;
        const dc = col - startCol;
        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
          const length = Math.max(Math.abs(dr), Math.abs(dc));
          const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
          const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
          const cells: CellCoord[] = [];
          for (let i = 0; i <= length; i++) {
            cells.push([startRow + i * stepR, startCol + i * stepC]);
          }
          return cells;
        }
        return prev;
      });
    },
    [isSelecting],
  );

  function arraysEqual(a: CellCoord[], b: CellCoord[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
    }
    return true;
  }

  const getSVGLineProps = useCallback(
    (cells: CellCoord[]) => {
      if (!cells || cells.length < 2) return null;
      const table = gridRef.current;
      if (!table) return null;
      const wrapper = table.closest('.wordsearch-table-wrapper') || table.parentElement;
      if (!wrapper) return null;

      const wrapperRect = wrapper.getBoundingClientRect();
      const [startRow, startCol] = cells[0];
      const [endRow, endCol] = cells[cells.length - 1];

      const startCell = table.rows?.[startRow]?.cells?.[startCol];
      const endCell = table.rows?.[endRow]?.cells?.[endCol];

      let x1: number, y1: number, x2: number, y2: number, cellHeight: number;

      if (startCell && endCell) {
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        x1 = startRect.left + startRect.width / 2 - wrapperRect.left;
        y1 = startRect.top + startRect.height / 2 - wrapperRect.top;
        x2 = endRect.left + endRect.width / 2 - wrapperRect.left;
        y2 = endRect.top + endRect.height / 2 - wrapperRect.top;
        cellHeight = startRect.height;
      } else {
        const tableRect = table.getBoundingClientRect();
        const offsetX = tableRect.left - wrapperRect.left;
        const offsetY = tableRect.top - wrapperRect.top;
        const cellWidth = tableRect.width / (gridSize || 1);
        cellHeight = tableRect.height / (gridSize || 1);

        x1 = offsetX + startCol * cellWidth + cellWidth / 2;
        y1 = offsetY + startRow * cellHeight + cellHeight / 2;
        x2 = offsetX + endCol * cellWidth + cellWidth / 2;
        y2 = offsetY + endRow * cellHeight + cellHeight / 2;
      }

      return { x1, y1, x2, y2, width: wrapperRect.width, height: wrapperRect.height, cellHeight };
    },
    [gridSize],
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || selectedCells.length === 0) {
      setIsSelecting(false);
      setSelectedCells([]);
      return;
    }
    const word = selectedCells.map(([r, c]) => grid[r]?.[c] || '').join('');
    const reversed = word.split('').reverse().join('');
    const found = placedWords.find(
      (pw) =>
        !foundWords.includes(pw.word) &&
        (word === pw.word || reversed === pw.word) &&
        arraysEqual(pw.positions, selectedCells),
    );
    if (found) {
      setFoundWords((prev) => [...prev, found.word]);
      setPermanentlyFoundWords((prev) => [...prev, selectedCells]);

      const emoji = wordToEmoji[found.word.toUpperCase()];
      if (emoji) {
        setMatchedEmoji(emoji);
        speakText(found.word);
      }

      const props = getSVGLineProps(selectedCells);
      if (props) {
        const centerX = (props.x1 + props.x2) / 2;
        const centerY = (props.y1 + props.y2) / 2;
        triggerSparkleBurst(centerX, centerY, { count: 30, range: 200 });
        playCorrectSound();
      }
    }
    setSelectedCells([]);
    setIsSelecting(false);
  }, [isSelecting, selectedCells, grid, placedWords, foundWords, triggerSparkleBurst, getSVGLineProps]);

  useEffect(() => {
    if (foundWords.length === placedWords.length && placedWords.length > 0 && !win) {
      setWin(true);
    }
  }, [foundWords, placedWords, win]);

  const handleWinModalClose = () => {
    restartGame();
  };

  const [resizeTick, setResizeTick] = useState(0);

  useEffect(() => {
    const handleResize = () => setResizeTick((t) => t + 1);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      stopSpeech();
      stopAllTones();
    };
  }, []);

  const getCellFromTouch = (touch: React.Touch, tableRef: React.RefObject<HTMLTableElement | null>): CellCoord | null => {
    const table = tableRef.current;
    if (!table) return null;

    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elem) {
      const td = elem.closest('td');
      if (td && table.contains(td)) {
        const tr = td.parentElement;
        const row = tr && tr.parentElement ? Array.from(tr.parentElement.children).indexOf(tr) : -1;
        const col = Array.from(td.parentElement?.children || []).indexOf(td);
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          return [row, col];
        }
      }
    }

    const rect = table.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const cellWidth = rect.width / (gridSize || 1);
    const cellHeight = rect.height / (gridSize || 1);
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      return [row, col];
    }
    return null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLTableElement>) => {
    if (e.touches.length !== 1) return;
    const cell = getCellFromTouch(e.touches[0], gridRef);
    if (cell) {
      setIsSelecting(true);
      setSelectedCells([cell]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLTableElement>) => {
    if (!isSelecting || e.touches.length !== 1) return;
    const cell = getCellFromTouch(e.touches[0], gridRef);
    if (!cell) return;
    setSelectedCells((prev) => {
      if (prev.length === 0) return [cell];
      const [startRow, startCol] = prev[0];
      const [row, col] = cell;
      const dr = row - startRow;
      const dc = col - startCol;
      if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
        const length = Math.max(Math.abs(dr), Math.abs(dc));
        const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
        const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
        const cells: CellCoord[] = [];
        for (let i = 0; i <= length; i++) {
          cells.push([startRow + i * stepR, startCol + i * stepC]);
        }
        return cells;
      }
      return prev;
    });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const isCellHighlighted = useCallback(
    (row: number, col: number) => {
      return highlightedGridWordCells.some((cell) => cell[0] === row && cell[1] === col);
    },
    [highlightedGridWordCells],
  );

  const handleWordListItemClick = useCallback(
    (word: string) => {
      speakText(word);
      const wordToHighlight = placedWords.find((pw) => pw.word === word);

      if (wordToHighlight) {
        const isCurrentlyHighlighted =
          highlightedGridWordCells.length > 0 &&
          arraysEqual(highlightedGridWordCells, wordToHighlight.positions);

        if (isCurrentlyHighlighted) {
          setHighlightedGridWordCells([]);
        } else {
          setHighlightedGridWordCells(wordToHighlight.positions);
        }
      }
    },
    [placedWords, highlightedGridWordCells],
  );

  const selectedLineProps = getSVGLineProps(selectedCells);
  const permanentlyFoundLines = useMemo(() => {
    void resizeTick;
    return permanentlyFoundWords
      .map((cells, index) => {
        const props = getSVGLineProps(cells);
        if (!props) return null;
        return (
          <line
            key={index}
            x1={props.x1}
            y1={props.y1}
            x2={props.x2}
            y2={props.y2}
            stroke={colorPalette[index % colorPalette.length]}
            strokeWidth={props.cellHeight * 0.7}
            strokeLinecap="round"
            opacity="0.7"
          />
        );
      })
      .filter(Boolean);
  }, [permanentlyFoundWords, colorPalette, getSVGLineProps, resizeTick]);

  const renderedGrid = useMemo(
    () =>
      grid.map((rowArr, rowIdx) => (
        <tr key={rowIdx}>
          {rowArr.map((letter, colIdx) => (
            <WordSearchCell
              key={colIdx}
              rowIdx={rowIdx}
              colIdx={colIdx}
              letter={letter}
              isHighlighted={isCellHighlighted(rowIdx, colIdx)}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseEnter={handleCellMouseEnter}
              onCellMouseUp={handleMouseUp}
            />
          ))}
        </tr>
      )),
    [grid, isCellHighlighted, handleCellMouseDown, handleCellMouseEnter, handleMouseUp],
  );

  const renderedWordList = useMemo(
    () =>
      placedWords.map((pw) => (
        <WordListItem
          key={pw.word}
          word={pw.word}
          isFound={foundWords.includes(pw.word)}
          onSelectWord={handleWordListItemClick}
        />
      )),
    [placedWords, foundWords, handleWordListItemClick],
  );

  return (
    <div className="py-md-4 vertical-center wordsearch-container">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-10 col-lg-8">
          {win && <SuccessModal handleClose={handleWinModalClose} message="" starsWon={4} />}
          <div className="black-bg-card">
            <div className="card-body">
              <div className="d-flex flex-wrap align-items-center justify-content-between portrait-padding">
                <div className="d-flex w-100 align-items-center justify-around">
                  <div className="btn btn-info fs-5 wordsearch-minw-70 py-1">
                    {formatElapsedTime(timer)}
                  </div>

                  <button className="btn btn-primary" onClick={restartGame}>
                    {t('common.newGame')}
                  </button>
                </div>
              </div>

              <div className="row align-items-center">
                <div className="col-sm-7 col-md-8 mb-2 mb-sm-0">
                  <div
                    className="table-responsive wordsearch-table-wrapper"
                    onMouseLeave={() => {
                      setIsSelecting(false);
                      setSelectedCells([]);
                    }}
                  >
                    <SparkleRenderer />
                    <svg
                      className="wordsearch-svg-overlay"
                      role="img"
                      aria-label={t('wordSearch.selectionOverlay')}
                    >
                      {selectedCells.length > 1 &&
                        (() => {
                          if (!selectedLineProps) return null;

                          return (
                            <line
                              x1={selectedLineProps.x1}
                              y1={selectedLineProps.y1}
                              x2={selectedLineProps.x2}
                              y2={selectedLineProps.y2}
                              stroke={
                                colorPalette[permanentlyFoundWords.length % colorPalette.length]
                              }
                              strokeWidth={selectedLineProps.cellHeight * 0.7}
                              strokeLinecap="round"
                              opacity="0.7"
                            />
                          );
                        })()}

                      {permanentlyFoundLines}
                    </svg>

                    {matchedEmoji && (
                      <div className="wordsearch-matched-emoji-overlay">
                        <span className="matched-emoji">{matchedEmoji}</span>
                      </div>
                    )}

                    <table
                      className="table table-bordered wordsearch-table user-select-none"
                      ref={gridRef}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <tbody>{renderedGrid}</tbody>
                    </table>
                  </div>
                </div>

                <div className="col-sm-5 col-md-4">
                  <div className="white-bg-card bg-light mb-2">
                    <div className="card-body p-2">
                      <ul className="list-unstyled mb-0 d-flex flex-wrap align-items-center justify-content-around wordsearch-word-list">
                        {renderedWordList}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearch;
