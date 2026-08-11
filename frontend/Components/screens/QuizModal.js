import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { getQuizQuestion } from '../services/QuizService';

const QuizModal = ({ visible, onComplete, onSkip }) => {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userHistory, setUserHistory] = useState({ correct: 0, total: 0 }); // For AI adjustment

  useEffect(() => {
    if (visible) {
      loadHistory();
      fetchQuiz();
    }
  }, [visible]);

  const loadHistory = async () => {
    const history = await AsyncStorage.getItem('quizHistory');
    setUserHistory(history ? JSON.parse(history) : { correct: 0, total: 0 });
  };

  const fetchQuiz = async () => {
    const difficulty = getDifficulty(userHistory); // AI adjustment
    const quiz = await getQuizQuestion(difficulty);
    setQuestion(quiz);
    setSelectedOption(null);
  };

  const getDifficulty = (history) => {
    const accuracy = history.total > 0 ? history.correct / history.total : 0;
    if (accuracy > 0.8) return 'hard';
    if (accuracy > 0.5) return 'medium';
    return 'easy';
    // In production, call backend AI for more sophisticated adjustment
  };

  const handleOptionSelect = (option, isCorrect) => {
    setSelectedOption(option);
    const newHistory = { ...userHistory, total: userHistory.total + 1 };
    if (isCorrect) newHistory.correct += 1;
    AsyncStorage.setItem('quizHistory', JSON.stringify(newHistory));
    setUserHistory(newHistory);
    onComplete(isCorrect);
  };

  const handleSkip = () => onSkip();

  if (!question) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.question}>{question.question}</Text>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.option, selectedOption === option && styles.selected]}
              onPress={() => handleOptionSelect(option, option === question.answer)}
              disabled={!!selectedOption}
            >
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Skip (Lose Points)" onPress={handleSkip} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  question: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  option: { padding: 10, borderWidth: 1, borderColor: '#ccc', marginVertical: 5, borderRadius: 5 },
  selected: { backgroundColor: '#e0e0e0' },
});

export default QuizModal;