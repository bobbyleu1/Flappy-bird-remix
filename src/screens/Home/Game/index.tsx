import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { View, Platform } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { styles } from './styles';
import { Start } from './Start';
import { GameOver } from './GameOver';
import { Physics, resetCollisionFlag } from '../../../utils/physics';
import entities from '../../../entities';

import wingSound from '../../../../sounds/wing.mp3';
import gameOverSoundFile from '../../../../sounds/GameOver.mp3';

type GameEngineWithDispatch = GameEngine & { dispatch: (event: any) => void };
const HIGH_SCORE_KEY = 'highScore';

// Replace with real IDs
const BANNER_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-6842873031676463/4997456984',
  android: 'ca-app-pub-6842873031676463/3065428212',
}) ?? TestIds.BANNER;

export const Game = () => {
  const gameEngineRef = useRef<GameEngineWithDispatch | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameEntities, setGameEntities] = useState(() => entities(() => {}));

  const [flapSound, setFlapSound] = useState<Audio.Sound | null>(null);
  const [gameOverSound, setGameOverSound] = useState<Audio.Sound | null>(null);

  // 🔊 Load sounds on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { sound: wing } = await Audio.Sound.createAsync(wingSound);
        const { sound: over } = await Audio.Sound.createAsync(gameOverSoundFile);
        if (mounted) {
          setFlapSound(wing);
          setGameOverSound(over);
        }
      } catch (e) {
        console.warn('❌ Error loading sounds:', e);
      }
    })();

    return () => {
      mounted = false;
      flapSound?.unloadAsync();
      gameOverSound?.unloadAsync();
    };
  }, []);

  // 🧠 Load high score from storage
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const stored = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          setHighScore(parsed);
          console.log(`📈 Loaded high score: ${parsed}`);
        }
      } catch (e) {
        console.warn('❌ Failed to load high score:', e);
      }
    };
    fetchHighScore();
  }, []);

  const playFlapSound = useCallback(async () => {
    try {
      if (flapSound) await flapSound.replayAsync();
    } catch (e) {
      console.warn('❌ Flap sound error:', e);
    }
  }, [flapSound]);

  const playGameOverSound = useCallback(async () => {
    try {
      if (gameOverSound) await gameOverSound.replayAsync();
    } catch (e) {
      console.warn('❌ Game over sound error:', e);
    }
  }, [gameOverSound]);

  const handleOnGameOver = useCallback(() => {
    setIsRunning(false);
    setIsGameOver(true);
    playGameOverSound();
  }, [playGameOverSound]);

  const handleOnEvent = useCallback(
    (event: any) => {
      switch (event.type) {
        case 'game_over':
          handleOnGameOver();
          break;
        case 'flap':
          playFlapSound();
          break;
        case 'score':
          setScore(prevScore => {
            const newScore = prevScore + 1;

            setHighScore(prevHigh => {
              if (newScore > prevHigh) {
                AsyncStorage.setItem(HIGH_SCORE_KEY, String(newScore));
                console.log(`🏆 New high score saved: ${newScore}`);
                return newScore;
              }
              return prevHigh;
            });

            return newScore;
          });
          break;

        default:
          console.log('📢 Unknown event:', event.type);
      }
    },
    [handleOnGameOver, playFlapSound]
  );

  const handleOnStartGame = useCallback(() => {
    resetCollisionFlag();
    setIsGameOver(false);
    setScore(0);
    setGameEntities(entities(() => {}));
    setIsRunning(true);

    setTimeout(() => {
      if (gameEngineRef.current?.dispatch) {
        const dispatch = gameEngineRef.current.dispatch;
        setGameEntities(entities(dispatch));
      }
    }, 50);
  }, []);

  // 🎬 Conditional rendering
  const renderGameContent = () => {
    if (!isRunning && !isGameOver) {
      return <Start handleOnStartGame={handleOnStartGame} />;
    }

    if (!isRunning && isGameOver) {
      return (
        <GameOver
          handleOnStartGame={handleOnStartGame}
          score={score}
          highScore={highScore}
        />
      );
    }

    return (
      <GameEngine
        key={`game-${isRunning}-${score}`}
        ref={gameEngineRef}
        systems={[Physics]}
        running={isRunning}
        entities={gameEntities}
        onEvent={handleOnEvent}
        style={styles.engineContainer}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderGameContent()}

      {/* AdMob Banner at bottom */}
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};
