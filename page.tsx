'use client';

import { useState, useEffect } from 'react';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
}

type GameState = 'betting' | 'playing' | 'dealer-turn' | 'finished';

const createDeck = (): Card[] => {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const getCardValue = (card: Card): number => {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank);
};

const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    value += getCardValue(card);
    if (card.rank === 'A') aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export default function Home() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDeck(shuffleDeck(createDeck()));
  }, []);

  const dealCards = () => {
    if (bet > balance || bet <= 0) {
      setMessage('Invalid bet amount');
      return;
    }

    const newDeck = shuffleDeck(createDeck());
    const player = [newDeck[0], newDeck[2]];
    const dealer = [newDeck[1], newDeck[3]];

    setDeck(newDeck.slice(4));
    setPlayerHand(player);
    setDealerHand(dealer);
    setGameState('playing');
    setMessage('');
    setBalance(balance - bet);

    const playerValue = calculateHandValue(player);
    if (playerValue === 21) {
      setGameState('finished');
      setBalance(balance + bet * 2.5);
      setMessage('Blackjack! You win!');
    }
  };

  const hit = () => {
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));

    const value = calculateHandValue(newHand);
    if (value > 21) {
      setGameState('finished');
      setMessage('Bust! Dealer wins');
    } else if (value === 21) {
      stand();
    }
  };

  const stand = () => {
    setGameState('dealer-turn');
    const newDealerHand = [...dealerHand];
    let newDeck = [...deck];

    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck[0]);
      newDeck = newDeck.slice(1);
    }

    setDealerHand(newDealerHand);
    setDeck(newDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(newDealerHand);

    setGameState('finished');

    if (dealerValue > 21) {
      setBalance(balance + bet * 2);
      setMessage('Dealer bust! You win!');
    } else if (playerValue > dealerValue) {
      setBalance(balance + bet * 2);
      setMessage('You win!');
    } else if (playerValue < dealerValue) {
      setMessage('Dealer wins');
    } else {
      setBalance(balance + bet);
      setMessage('Push');
    }
  };

  const doubleDown = () => {
    if (bet > balance) {
      setMessage('Insufficient balance');
      return;
    }

    setBalance(balance - bet);
    const doubleBet = bet * 2;
    setBet(doubleBet);

    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));

    const value = calculateHandValue(newHand);
    if (value > 21) {
      setGameState('finished');
      setMessage('Bust! Dealer wins');
    } else {
      stand();
    }
  };

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  return (
    <div className="min-h-screen bg-[#1a1d3e]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#1f2347] border-b border-[#2a2f54]">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 40 40" fill="none">
              <path d="M20 5C11.7 5 5 11.7 5 20s6.7 15 15 15 15-6.7 15-15S28.3 5 20 5zm0 3c2.8 0 5.4.9 7.5 2.4l-2.8 2.8C23.3 12.4 21.7 12 20 12c-4.4 0-8 3.6-8 8s3.6 8 8 8c3.5 0 6.4-2.2 7.5-5.3l3.2 1.2C29.3 28.7 25 32 20 32c-6.6 0-12-5.4-12-12S13.4 8 20 8z" fill="#84c341"/>
            </svg>
            <div className="text-lg md:text-2xl font-bold text-white tracking-wide">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Rain</span>
              <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">bet</span>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-[#252a4d] rounded-lg border border-[#3a3f64]">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-semibold text-sm md:text-base">${balance.toFixed(2)}</span>
            <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden md:block" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="px-3 md:px-5 py-2 md:py-2.5 bg-[#84c341] hover:bg-[#75b032] text-[#1a1d3e] font-bold rounded-lg transition-all hover:scale-105 shadow-lg text-sm md:text-base">
            Wallet
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#e8a83e] to-[#d89020] flex items-center justify-center hover:scale-105 transition-all shadow-lg">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2a2f54] flex items-center justify-center hover:bg-[#3a3f64] transition-colors hidden md:flex">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Game Title */}
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#4a7db8] flex items-center justify-center text-sm md:text-base">
                ♠
              </div>
              <h1 className="text-lg md:text-xl font-semibold text-white">Blackjack</h1>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-400">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fair Play</span>
            </div>
          </div>

          {/* Game Table */}
          <div className="relative bg-gradient-to-br from-[#252a4d] via-[#1f2347] to-[#1a1d3e] rounded-xl md:rounded-2xl p-4 md:p-8 border border-[#3a3f64] shadow-2xl overflow-hidden">
            {/* Table felt effect */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" />
                <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.3" fill="none" />
              </svg>
            </div>

            {/* Deck Stack */}
            <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
              <div className="relative w-16 h-24 md:w-20 md:h-28">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#4a7db8] to-[#3a6da8] rounded-lg border-2 border-[#5a8dc8] shadow-lg"></div>
                <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-[#4a7db8] to-[#3a6da8] rounded-lg border-2 border-[#5a8dc8] shadow-lg"></div>
                <div className="absolute top-2 left-2 w-full h-full bg-gradient-to-br from-[#4a7db8] to-[#3a6da8] rounded-lg border-2 border-[#5a8dc8] shadow-lg flex items-center justify-center">
                  <div className="text-white text-xs font-bold transform rotate-90">DECK</div>
                </div>
              </div>
            </div>

            {/* Dealer's Hand */}
            <div className="mb-6 md:mb-8 relative">
              <div className="flex justify-center gap-2 md:gap-3 mb-3 md:mb-4 min-h-[100px] md:min-h-[120px]">
                {dealerHand.map((card, index) => (
                  <div
                    key={index}
                    className="w-16 h-24 md:w-20 md:h-28 bg-white rounded-lg shadow-xl flex flex-col items-center justify-center transform transition-all hover:scale-105 border-2 border-gray-200"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className={`text-2xl md:text-3xl font-bold ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.rank}
                    </div>
                    <div className={`text-xl md:text-2xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.suit}
                    </div>
                  </div>
                ))}
              </div>
              {dealerHand.length > 0 && (
                <div className="flex justify-center">
                  <div className="px-4 py-2 md:px-5 md:py-2.5 bg-[#4a5a7d] rounded-xl text-white font-bold text-base md:text-lg shadow-lg">
                    {gameState === 'playing' && dealerHand.length === 2 ? '?' : dealerValue}
                  </div>
                </div>
              )}
            </div>

            {/* Center Info */}
            <div className="text-center mb-6 md:mb-8 relative">
              <div className="text-[10px] md:text-xs text-gray-400 mb-1 font-semibold tracking-wider">BLACKJACK PAYS 3 TO 2</div>
              <div className="text-[10px] md:text-xs text-gray-500 font-semibold tracking-wider">INSURANCE PAYS 2 TO 1</div>
              {gameState !== 'betting' && (
                <div className="mt-4 md:mt-6">
                  {gameState === 'playing' && playerValue < 21 && (
                    <div className="inline-flex gap-2 md:gap-3">
                      <button
                        onClick={hit}
                        className="px-6 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-[#5a6a4d] to-[#4a5a3d] hover:from-[#6a7a5d] hover:to-[#5a6a4d] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                      >
                        Hit
                      </button>
                      <button
                        onClick={stand}
                        className="px-6 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-[#5a4a4d] to-[#4a3a3d] hover:from-[#6a5a5d] hover:to-[#5a4a4d] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                      >
                        Stand
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Player's Hand */}
            <div className="relative">
              <div className="flex justify-center gap-2 md:gap-3 mb-3 md:mb-4 min-h-[100px] md:min-h-[120px]">
                {playerHand.map((card, index) => (
                  <div
                    key={index}
                    className="w-16 h-24 md:w-20 md:h-28 bg-white rounded-lg shadow-xl flex flex-col items-center justify-center transform transition-all hover:scale-105 border-2 border-gray-200"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className={`text-2xl md:text-3xl font-bold ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.rank}
                    </div>
                    <div className={`text-xl md:text-2xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900'}`}>
                      {card.suit}
                    </div>
                  </div>
                ))}
              </div>
              {playerHand.length > 0 && (
                <div className="flex justify-center">
                  <div className="px-4 py-2 md:px-5 md:py-2.5 bg-[#4a5a7d] rounded-xl text-white font-bold text-base md:text-lg shadow-lg">
                    {playerValue}
                  </div>
                </div>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="px-8 py-4 bg-gradient-to-r from-[#1a1d3e] to-[#2a2f54] text-white font-bold text-xl rounded-2xl shadow-2xl border-2 border-[#4a7db8] animate-pulse">
                  {message}
                </div>
              </div>
            )}
          </div>

          {/* Betting Controls */}
          <div className="mt-6">
            {gameState === 'betting' ? (
              <button
                onClick={dealCards}
                className="w-full py-4 bg-gradient-to-r from-[#4a7db8] to-[#5a8dc8] hover:from-[#5a8dc8] hover:to-[#6a9dd8] text-white font-bold rounded-xl transition-all text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Place Bet
              </button>
            ) : gameState === 'finished' ? (
              <button
                onClick={() => {
                  setGameState('betting');
                  setPlayerHand([]);
                  setDealerHand([]);
                  setMessage('');
                }}
                className="w-full py-4 bg-gradient-to-r from-[#4a7db8] to-[#5a8dc8] hover:from-[#5a8dc8] hover:to-[#6a9dd8] text-white font-bold rounded-xl transition-all text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                New Game
              </button>
            ) : null}

            {/* Bet Amount Controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-[#252a4d] border-2 border-[#e63946] rounded-xl shadow-lg">
                  <span className="text-white text-lg md:text-xl font-bold">$</span>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-transparent text-white text-lg md:text-xl font-semibold outline-none"
                    disabled={gameState !== 'betting'}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBet(Math.max(1, bet / 2))}
                  className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-[#2a2f54] hover:bg-[#3a3f64] text-gray-300 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md text-sm md:text-base"
                  disabled={gameState !== 'betting'}
                >
                  1/2
                </button>
                <button
                  onClick={() => setBet(Math.min(balance, bet * 2))}
                  className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-[#2a2f54] hover:bg-[#3a3f64] text-gray-300 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md text-sm md:text-base"
                  disabled={gameState !== 'betting'}
                >
                  2x
                </button>
                <button
                  onClick={() => setBet(balance)}
                  className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-[#2a2f54] hover:bg-[#3a3f64] text-gray-300 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md text-sm md:text-base"
                  disabled={gameState !== 'betting'}
                >
                  Max
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {gameState === 'playing' && playerHand.length === 2 && (
              <div className="mt-4 flex gap-3 md:gap-4">
                <button
                  onClick={doubleDown}
                  className="flex-1 py-2.5 md:py-3 bg-[#2a2f54] hover:bg-[#3a3f64] text-gray-300 font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shadow-md text-sm md:text-base"
                  disabled={bet > balance}
                >
                  <span className="text-[#84c341] text-base md:text-lg font-bold">×2</span> Double
                </button>
                <button
                  className="flex-1 py-2.5 md:py-3 bg-[#2a2f54] text-gray-500 font-semibold rounded-xl opacity-40 cursor-not-allowed shadow-md text-sm md:text-base"
                  disabled
                >
                  <span className="text-gray-600">⚡</span> Split
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
