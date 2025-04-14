import { render, screen } from '@testing-library/react';
import HangmanGame from './HangmanGame';

test('Renders the hangman', () => {
  render(<HangmanGame />);
  const linkElement = screen.getByText(/hangman/i);
  expect(linkElement).toBeInTheDocument();
});

test('updates display after correct guess', () => {
  render(<HangmanGame />);
  const gameInstance = screen.getByTestId('word-display').textContent;

  const letterToGuess = gameInstance.replace(/[^A-Z]/gi, '').charAt(0).toLowerCase();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: letterToGuess } });
  fireEvent.click(screen.getByText('Guess'));

  expect(screen.getByTestId('word-display').textContent).toContain(letterToGuess.toUpperCase());
});
