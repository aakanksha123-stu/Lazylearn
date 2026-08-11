import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOTAL_QUESTIONS = 25;

const InterruptQuiz = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [points, setPoints] = useState(0);
  const [index, setIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  /* ---------------- FETCH QUIZ ---------------- */
  const fetchQuiz = async (subjectName, append = false) => {
    try {
      const res = await fetch(
        `http://10.146.254.202:8000/quiz/interrupt-quiz/?topic=${encodeURIComponent(
          subjectName,
        )}`,
      );

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.log('❌ API did not return array', data);
        return;
      }

      const formatted = data.map(q => ({
        question: q.question || '',
        options: [
          q.option_a || '',
          q.option_b || '',
          q.option_c || '',
          q.option_d || '',
        ],
        correct: q[`option_${(q.answer || 'A').toLowerCase()}`],
        level: q.level || 'Medium',
        explanation: q.explanation || 'No explanation available',
      }));

      setQuestions(prev => (append ? [...prev, ...formatted] : formatted));
    } catch (err) {
      console.log('Quiz Load Error:', err);
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);

        const storedSubject = await AsyncStorage.getItem('selectedSubject');
        const storedPoints = await AsyncStorage.getItem('userPoints');

        const subjectName = storedSubject || 'Operating System';
        const userPoints = storedPoints ? parseInt(storedPoints) : 0;

        setSubject(subjectName);
        setPoints(userPoints);

        await fetchQuiz(subjectName);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, []);

  const current = questions[index];

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#F57C00" />
        <Text>Generating Quiz...</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- NO DATA ---------------- */
  if (!current) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No Questions</Text>
      </SafeAreaView>
    );
  }

  const isCorrect = selected === current.correct;

  /* ---------------- ATTEMPT ---------------- */
  const handleAttempt = option => {
    setSelected(option);
    setAttempted(true);
    setShowExplanation(true);

    if (option === current.correct) {
      setPoints(p => {
        const updated = p + 5;
        AsyncStorage.setItem('userPoints', updated.toString());
        return updated;
      });
    } else {
      setPoints(p => {
        const updated = Math.max(0, p - 1);
        AsyncStorage.setItem('userPoints', updated.toString());
        return updated;
      });
    }
  };

  /* ---------------- NEXT ---------------- */
  const nextQuestion = async () => {
    const nextIndex = index + 1;

    if (nextIndex >= TOTAL_QUESTIONS) {
      finishQuiz();
      return;
    }

    if (nextIndex >= questions.length - 2) {
      await fetchQuiz(subject, true);
    }

    setIndex(nextIndex);
    setAttempted(false);
    setSelected(null);
    setShowExplanation(false);
  };

  /* ---------------- SKIP ---------------- */
  const skipQuestion = async () => {
    const nextIndex = index + 1;

    if (nextIndex >= TOTAL_QUESTIONS) {
      finishQuiz();
      return;
    }

    if (nextIndex >= questions.length - 2) {
      await fetchQuiz(subject, true);
    }

    setIndex(nextIndex);
    setAttempted(false);
    setSelected(null);
    setShowExplanation(false);
  };

  /* ---------------- FINISH ---------------- */
  const finishQuiz = () => {
    Alert.alert('🎉 Quiz Finished!', `Your Score: ${points}`, [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Dashboard'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Interrupt Quiz ⚡</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>
          {subject} • {current.level} ({index + 1}/{TOTAL_QUESTIONS})
        </Text>

        <Text style={styles.points}>Points: {points}♦️</Text>

        <Text style={styles.question}>{current.question}</Text>

        {/* OPTIONS */}
        {current.options.map((opt, i) => {
          const correct = opt === current.correct;
          const selectedOpt = selected === opt;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.option,
                attempted && correct && { backgroundColor: '#4CAF50' },
                selectedOpt && !correct && { backgroundColor: '#E53935' },
              ]}
              onPress={() => !attempted && handleAttempt(opt)}
              disabled={attempted}
            >
              <Text
                style={[
                  styles.optionText,
                  attempted && (correct || selectedOpt) && { color: '#fff' },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* EXPLANATION */}
        {showExplanation && (
          <View style={styles.explanationBox}>
            <Text style={styles.resultText}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            </Text>

            {!isCorrect && (
              <Text style={styles.correctAnswer}>👉 {current.correct}</Text>
            )}

            <Text style={styles.explanationTitle}>🧠 Explanation</Text>
            <Text>{current.explanation}</Text>
          </View>
        )}

        {/* BUTTONS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={skipQuestion}>
            <Text style={styles.btnText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextBtn, !attempted && { opacity: 0.5 }]}
            onPress={nextQuestion}
            disabled={!attempted}
          >
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.finishBtn} onPress={finishQuiz}>
          <Text style={styles.btnText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InterruptQuiz;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 16,
  },

  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  card: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 18,
    borderRadius: 16,
  },

  subHeader: { fontSize: 16, color: '#555' },

  points: {
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
  },

  question: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
  },

  option: {
    backgroundColor: '#FFE0B2',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },

  optionText: { textAlign: 'center', fontSize: 15 },

  explanationBox: {
    marginTop: 15,
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 10,
  },

  resultText: { fontWeight: 'bold', fontSize: 16 },

  correctAnswer: { color: '#D32F2F' },

  explanationTitle: { fontWeight: 'bold', marginTop: 5 },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  skipBtn: {
    backgroundColor: '#757575',
    padding: 12,
    borderRadius: 10,
    width: '47%',
  },

  nextBtn: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 10,
    width: '47%',
  },

  finishBtn: {
    backgroundColor: '#F57C00',
    padding: 12,
    marginTop: 10,

    borderRadius: 10,
  },

  btnText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});
