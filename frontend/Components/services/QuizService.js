import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

let firebaseInitialized = false;

export const initializeFirebase = () => {
  if (!firebaseInitialized) {
    // Your Firebase config here
    // firebase.initializeApp(config);
    firebaseInitialized = true;
  }
};

export const getQuizQuestion = async (difficulty = 'medium') => {
  try {
    const snapshot = await firestore().collection('quizzes').where('difficulty', '==', difficulty).limit(1).get();
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    // Fallback local quizzes
    return getLocalQuiz(difficulty);
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return getLocalQuiz(difficulty);
  }
};

const getLocalQuiz = (difficulty) => {
  const localQuizzes = {
    easy: { question: "What’s Newton’s Second Law?", options: ["F=ma", "E=mc²", "Gravity"], answer: "F=ma" },
    medium: { question: "Capital of France?", options: ["Berlin", "Paris", "London"], answer: "Paris" },
    hard: { question: "What is quantum entanglement?", options: ["Particles linked instantly", "Wave collapse", "Black hole"], answer: "Particles linked instantly" },
  };
  return localQuizzes[difficulty] || localQuizzes.easy;
};

// Store performance (e.g., for AI/backend)
export const storePerformance = async (userId, score, difficulty) => {
  await firestore().collection('userPerformance').add({ userId, score, difficulty, timestamp: firestore.FieldValue.serverTimestamp() });
};