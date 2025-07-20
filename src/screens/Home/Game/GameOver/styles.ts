import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Optional: dramatic effect
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 230,
    height: 60,
    resizeMode: 'contain',
  },
  scoreText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
  },
  highScoreText: {
    fontSize: 20,
    color: '#aaa',
    marginTop: 8,
  },
  tapToRestart: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  playButton: {
    marginTop: 32,
    width: 120,
    height: 74,
  },
});
