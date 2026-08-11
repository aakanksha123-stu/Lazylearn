import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';

import { PanGestureHandler } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkMatches } from '../services/BrainCandyService';
import {
  createBoard,
  playMove,
  getAIFact,
} from '../services/BrainCandyService';

import FactModal from './FactModal';

// ============================
// ✅ GLOBAL CONSTANTS (FIXED)
// ============================
const TILE_SIZE = 50;
const GAP = 6;
const GRID_SIZE = 6;
const BOARD_SIZE = GRID_SIZE * TILE_SIZE + (GRID_SIZE - 1) * GAP;

const GameScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('Science');
  const [board, setBoard] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const [score, setScore] = useState(0);
  const [facts, setFacts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(0);

  const [factVisible, setFactVisible] = useState(false);
  const [currentFact, setCurrentFact] = useState('');
  const [loadingFact, setLoadingFact] = useState(false);

  // 🎬 Animations
  const scaleAnim = useRef(
    Array(36)
      .fill(0)
      .map(() => new Animated.Value(1)),
  ).current;

  const translateY = useRef(
    Array(36)
      .fill(0)
      .map(() => new Animated.Value(0)),
  ).current;

  // ============================
  // INIT
  // ============================
  useEffect(() => {
    let newBoard;
    do {
      newBoard = createBoard();
    } while (checkMatches(newBoard).matches.length > 0);

    setBoard(newBoard);
  }, []);

  useEffect(() => {
    const loadSubject = async () => {
      const stored = await AsyncStorage.getItem('selectedSubject');
      if (stored) setSubject(stored);
    };
    loadSubject();
  }, []);

  // TIMER
  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ============================
  // 🎬 ANIMATIONS
  // ============================

  const animateSwap = (i, j) => {
    Animated.sequence([
      Animated.timing(scaleAnim[i], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim[j], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scaleAnim[i], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim[j], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateMatch = indices => {
    const animations = indices.map(i =>
      Animated.sequence([
        Animated.timing(scaleAnim[i], {
          toValue: 1.5,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim[i], {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel(animations).start();
  };

  const animateDrop = drops => {
    drops.forEach(({ index }) => {
      translateY[index].setValue(-40);
      Animated.spring(translateY[index], {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });
  };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  // ============================
  // 🎮 SWIPE
  // ============================

  const getDirection = (dx, dy) => {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 20 ? 'RIGHT' : dx < -20 ? 'LEFT' : null;
    } else {
      return dy > 20 ? 'DOWN' : dy < -20 ? 'UP' : null;
    }
  };

  const handleSwipe = async (index, direction) => {
    if (isAnimating) return;

    if (direction === 'RIGHT' && index % 6 === 5) return;
    if (direction === 'LEFT' && index % 6 === 0) return;

    let target = null;
    if (direction === 'RIGHT') target = index + 1;
    if (direction === 'LEFT') target = index - 1;
    if (direction === 'DOWN') target = index + 6;
    if (direction === 'UP') target = index - 6;

    if (target < 0 || target >= 36) return;

    const result = await playMove(board, index, target);
    if (!result.valid) return;

    setIsAnimating(true);

    for (let step of result.steps) {
      if (step.type === 'swap') animateSwap(...step.indices);
      if (step.type === 'match') animateMatch(step.indices);
      if (step.type === 'drop') animateDrop(step.drops);

      await delay(250);
    }

    setBoard(result.board);
    // 🔥 reset animations (CRITICAL)
    scaleAnim.forEach(anim => anim.setValue(1));
    translateY.forEach(anim => anim.setValue(0));
    setScore(prev => prev + result.score * 10);
    setStreak(prev => prev + 1);

    if (result.bigMatch) {
      setFacts(f => f + 1);
      setFactVisible(true);
      setLoadingFact(true);

      const fact = await getAIFact(subject);
      setCurrentFact(fact);
      setLoadingFact(false);
    }

    setIsAnimating(false);
  };

  // ============================
  // UI
  // ============================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={26}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>BrainCandy</Text>
      </View>

      <View style={styles.topBar}>
        <Text style={styles.topText}>Score: {score}</Text>
        <Text style={styles.topText}>Time: {formatTime()}</Text>
        <Text style={styles.topText}>Facts: {facts}</Text>
        <Text style={styles.topText}>Streak: {streak}</Text>
      </View>

      <View style={styles.grid}>
        {board.map((candy, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;

          return (
            <PanGestureHandler
              key={`${index}-${candy}`}
              onEnded={e => {
                const { translationX, translationY } = e.nativeEvent;
                const dir = getDirection(translationX, translationY);
                if (dir) handleSwipe(index, dir);
              }}
            >
              <Animated.View
                style={[
                  styles.tile,
                  {
                    top: row * (TILE_SIZE + GAP),
                    left: col * (TILE_SIZE + GAP),
                    transform: [
                      { scale: scaleAnim[index] },
                      { translateY: translateY[index] },
                    ],
                    opacity: 1, // 👈 FIX
                  },
                ]}
              >
                <Text style={styles.candy}>
                  {candy} {/* 👈 FIX */}
                </Text>
              </Animated.View>
            </PanGestureHandler>
          );
        })}
      </View>

      <Text style={styles.info}>💡 Match 4 to unlock a fact!</Text>

      <View style={styles.finish}>
        <Text
          style={styles.finishText}
          onPress={() =>
            navigation.navigate('GameSummary', { score, facts, streak })
          }
        >
          Finish Game
        </Text>
      </View>

      <FactModal
        visible={factVisible}
        fact={currentFact}
        subject={subject}
        loading={loadingFact}
        close={() => setFactVisible(false)}
      />
    </SafeAreaView>
  );
};

export default GameScreen;

// ============================
// 🎨 STYLES
// ============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 16,
  },

  headerText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 10,
  },

  topText: {
    fontSize: 16,
    fontWeight: '600',
  },

  grid: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    alignSelf: 'center',
    marginTop: 40,
    position: 'relative',
    // backgroundColor: '#f5d7a1', // 👈 subtle grid bg
    borderRadius: 12,
  },

  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    position: 'absolute',
  },

  candy: {
    fontSize: 26,
  },

  info: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },

  finish: {
    marginTop: 20,
    backgroundColor: '#FF9800',
    padding: 14,
    borderRadius: 10,
    alignSelf: 'center',
  },

  finishText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
