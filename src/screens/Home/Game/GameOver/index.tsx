import React, { useEffect } from 'react';
import { View, Image, Text, TouchableWithoutFeedback, Platform } from 'react-native';
import { styles } from './styles';
import GAME_OVER from '../../../../assets/images/game-over.png';

import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-6842873031676463/8126183207',       // replace with iOS interstitial if needed
  android: 'ca-app-pub-6842873031676463/9954054598',   // replace with Android interstitial
}) || '';

type GameOverProps = {
  handleOnStartGame: () => void;
  score: number;
  highScore: number;
};

let restartCount = 0;

const GameOver = ({ handleOnStartGame, score, highScore }: GameOverProps) => {
  useEffect(() => {
    restartCount++;
  }, []);

  const handlePress = () => {
    if (restartCount % 5 === 0) {
      const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
      });

      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        handleOnStartGame();
      });

      interstitial.load();
    } else {
      handleOnStartGame();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <Image source={GAME_OVER} style={styles.logo} />
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.highScoreText}>High Score: {highScore}</Text>
        <Text style={styles.tapToRestart}>Tap to Restart</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export { GameOver };
