import './App.css';
import React from 'react';
import LetterBox from './LetterBox';
import SingleLetterSearchbar from './SingleLetterSearchBar';

const pics = ['noose.png', 'upperBody.png', 'upperandlowerbody.png', '1arm.png', 'botharms.png', '1leg.png', 'Dead.png'];
const words = ["Morehouse", "Spelman", "Basketball", "Table", "Museum", "Excellent", "Fun", "React"];

class HangmanGame extends React.Component {
  state = {
    playerName: '',
    curWord: Math.floor(Math.random() * words.length),
    lifeLeft: 0,
    usedLetters: [],
    wordList: words,
    gameOver: false,
    gameWon: false,
    winPercentage: null,
    loadingWinPercentage: false,
  };

  handleGuess = (letter) => {
    const { usedLetters, gameOver } = this.state;
    if (gameOver || usedLetters.includes(letter)) return;

    this.setState(
      (prevState) => ({
        usedLetters: [...prevState.usedLetters, letter.toLowerCase()],
      }),
      this.updateGameState
    );
  };

  updateGameState = () => {
    const { usedLetters, curWord } = this.state;
    const word = words[curWord].toLowerCase();
    const wordLetters = word.split('');

    const allCorrect = wordLetters.every((letter) => usedLetters.includes(letter));
    const incorrectLetters = usedLetters.filter((l) => !wordLetters.includes(l));
    const newLives = incorrectLetters.length;

    if (allCorrect) {
      this.endGame(true);
    } else if (newLives >= pics.length - 1) {
      this.endGame(false);
    } else {
      this.setState({ lifeLeft: newLives });
    }
  };

  endGame = async (won) => {
    this.setState({ gameOver: true, gameWon: won });
    const { playerName } = this.state;
    if (!playerName) return;
  
    try {
      await fetch("http://localhost:3001/api/record-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isWin: won, playerName })
      });
  
      const res = await fetch(`http://localhost:3001/api/win-percentage?playerName=${playerName}`);
      const data = await res.json();
      const percentage = isNaN(data.winPercentage) ? 0 : data.winPercentage;
  
      this.setState({ winPercentage: percentage });
    } catch (err) {
      console.error('Error updating stats:', err);
    }
  };
  

  async componentDidMount() {
    // await this.getWinPercentage();
  }

  startNewGame = () => {
    this.setState({
      curWord: Math.floor(Math.random() * this.state.wordList.length),
      lifeLeft: 0,
      usedLetters: [],
      gameOver: false,
      gameWon: false,
    });
  };

  handleNameChange = (e) => {
    const newName = e.target.value;
    this.setState({ playerName: newName }, () => {
      if (newName) this.fetchWinPercentage(newName);
    });
  };

  fetchWinPercentage = async (name) => {
    try {
      this.setState({ loadingWinPercentage: true });
      const res = await fetch(`http://localhost:3001/api/win-percentage?playerName=${name}`);
      const data = await res.json();
      const percentage = isNaN(data.winPercentage) ? 0 : data.winPercentage;

      this.setState({ winPercentage: percentage, loadingWinPercentage: false });
    } catch (err) {
      console.error('Error fetching win %:', err);
      this.setState({ loadingWinPercentage: false });
    }
  };

  render() {
    const { usedLetters, lifeLeft, gameOver, winPercentage, loadingWinPercentage } = this.state;
    const word = this.state.wordList[this.state.curWord];
    const displayWord = word
      .split('')
      .map((letter) => (usedLetters.includes(letter.toLowerCase()) ? letter : '_'))
      .join(' ');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={pics[this.state.lifeLeft]}
            alt='Hangman stage'
            style={{ width: '250px', height: 'auto', display: 'block', margin: '5px auto' }}
          />

          <button
            onClick={this.startNewGame}
            style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            New Game
          </button>

          <input
            type="text"
            placeholder="Enter your name"
            value={this.state.playerName}
            onChange={this.handleNameChange}
            style={{ padding: '10px', marginBottom: '20px', fontSize: '16px', borderRadius: '8px', border: '2px solid #ccc' }}
          />

          <p data-testid="word-display" style={{ fontSize: '24px', letterSpacing: '5px' }}>{displayWord}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px', fontSize: '18px' }}>
            <p>Lives Left: {pics.length - 1 - lifeLeft}</p>
            <p>Win Percentage: {loadingWinPercentage ? 'Loading...' : `${winPercentage || 0}%`}</p>
          </div>

          {!gameOver ? (
            <SingleLetterSearchbar onSearch={this.handleGuess} />
          ) : (
            <div>
              {this.state.gameWon ? (
                <p data-testid="win-message" style={{ color: 'green', fontWeight: 'bold' }}>You won!</p>
              ) : (
                <p data-testid="lose-message" style={{ color: 'red', fontWeight: 'bold' }}>You lost! The word was: {word}</p>
              )}

              <button
                onClick={this.startNewGame}
                style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Play Again
              </button>
            </div>
          )}

          <div className="letter-boxes" style={{ marginTop: '20px' }}>
            <p style={{ fontWeight: 'bold' }}>Used Letters:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
              {usedLetters.map((letter, index) => (
                <LetterBox
                  key={index}
                  letter={letter}
                  isVisible={true}
                  boxStyle={{ backgroundColor: '#4CAF50', borderRadius: '8px', padding: '10px' }}
                  letterStyle={{ color: 'white', fontSize: '20px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HangmanGame;
