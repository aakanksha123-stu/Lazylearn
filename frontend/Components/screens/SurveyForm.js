// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';

// const { width } = Dimensions.get('window');

// const SurveyForm = ({
//   navigation,
//   route,
//   setIsSurveyDone,
//   setQuizQuestion,
// }) => {
//   const initialData = route.params?.initialData || {};

//   const [name, setName] = useState(initialData.name || '');
//   const [selectedClass, setSelectedClass] = useState(
//     initialData.selectedClass || '',
//   );
//   const [branch, setBranch] = useState(initialData.branch || '');
//   const [subject, setSubject] = useState(initialData.subject || '');
//   const [subjects, setSubjects] = useState([]);
//   const [loadingQuiz, setLoadingQuiz] = useState(false);

//   const classes = ['7', '8', '9', '10', '11', '12', 'Diploma'];
//   const branches = ['CSE', 'Civil', 'Electrical', 'Mechanical', 'Electronics'];

//   const subjectMapping = {
//     school: ['Hindi', 'English', 'Math', 'Science', 'Social Science'],
//     higher: ['Hindi', 'English', 'Math', 'Physics', 'Chemistry', 'Biology'],
//     diploma: {
//       CSE: [
//         'Programming in Python',
//         'Programming in C',
//         'Data Structures and Algorithms',
//         'Operating Systems',
//         'Computer Hardware & Peripherals',
//         'Database Management System (DBMS)',
//         'Fundamental of IT Systems',
//         'Communication Skills',
//         'Computer Architecture',
//         'Web Technologies',
//         'Software Engineering',
//         'Computer Networks',
//         'OOPs through Java',
//       ],
//       Civil: [
//         'Engineering Mechanics',
//         'Concrete Technology',
//         'Strength of Material for Civil Engineering',
//         'Water Resource Engineering',
//         'Theory of Structure',
//         'Soil Mechanics and Foundation',
//         'Transportation Engineering',
//         'Hydraulics',
//         'RCC Structure',
//         'Environmental Engineering',
//         'Steel Structure',
//       ],
//       Electrical: [
//         'Fundamental of Electronics Engineering',
//         'Electrical Circuit and Networks',
//         'Electrical Measurement & Instrumentation',
//         'DC Machines and Transformers',
//         'Electrical Power Generation, Transmission and Distribution',
//         'Power Electronics',
//         'Microprocessors and Microcontrollers',
//         'AC Machines',
//         'Control System and PLC',
//         'Solar and Wind Power Technology',
//         'Energy Conservation and Audit',
//         'Utilization of Electrical Energy',
//       ],
//       Electronics: [
//         'Analog Electronics',
//         'Measuring Instruments and Sensors',
//         'Digital Electronics',
//         'Principle of Electronic Communication',
//         'Linear Integrated Circuit',
//         'Microcontroller & its Applications',
//         'Digital Communication',
//         'Industrial Engineering and Management',
//         'Antennas and Microwave Engineering',
//       ],
//       Mechanical: [
//         'Manufacturing Engineering',
//         'Material Science and Engineering',
//         'Strength of Materials for Mechanical Engineering',
//         'Basic Thermodynamics',
//         'Engineering Metrology & Instrumentation',
//         'Fluid Mechanics and Hydraulic Machinery',
//         'Theory of Machines',
//         'Industrial Engineering & Management',
//         'Industrial Automation',
//         'Hybrid Automobile Engineering',
//         'Maintenance & Safety of Mechanical & Solar Appliances',
//       ],
//     },
//   };

//   useEffect(() => {
//     if (['7', '8', '9', '10'].includes(selectedClass))
//       setSubjects(subjectMapping.school);
//     else if (['11', '12'].includes(selectedClass))
//       setSubjects(subjectMapping.higher);
//     else if (selectedClass === 'Diploma' && branch)
//       setSubjects(subjectMapping.diploma[branch] || []);
//     else setSubjects([]);

//     if (!subjects.includes(subject)) setSubject('');
//   }, [selectedClass, branch]);

//   const fetchQuizQuestion = async topic => {
//     setLoadingQuiz(true);
//     try {
//       const res = await fetch(
//         `http://10.0.13.85:8000/api/random-quiz/?topic=${encodeURIComponent(
//           topic,
//         )}`,
//       );
//       const data = await res.json();
//       setQuizQuestion?.(data);
//     } catch {
//       Alert.alert('Error', 'Failed to fetch quiz question');
//     } finally {
//       setLoadingQuiz(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!name || !selectedClass || !subject) {
//       Alert.alert('Incomplete', 'Please fill all required fields.');
//       return;
//     }

//     const data = {
//       name,
//       selectedClass,
//       branch: selectedClass === 'Diploma' ? branch : null,
//       subject,
//     };

//     try {
//       await AsyncStorage.multiSet([
//         ['userSurvey', JSON.stringify(data)],
//         ['isSurveyDone', 'true'],
//         ['selectedSubject', subject],
//         ['userPoints', '0'],
//       ]);

//       setIsSurveyDone?.(true);
//       await fetchQuizQuestion(subject);

//       initialData.name ? navigation.goBack() : navigation.replace('Dashboard');
//     } catch {
//       Alert.alert('Error', 'Failed to save survey data.');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.card}>
//         <Text style={styles.header}>Student Survey</Text>

//         <TextInput
//           placeholder="Your Name"
//           style={styles.input}
//           value={name}
//           onChangeText={setName}
//         />

//         <Text style={styles.label}>Class</Text>
//         <View style={styles.pickerBox}>
//           <Picker
//             selectedValue={selectedClass}
//             onValueChange={setSelectedClass}
//           >
//             <Picker.Item label="Select Class" value="" />
//             {classes.map(c => (
//               <Picker.Item key={c} label={c} value={c} />
//             ))}
//           </Picker>
//         </View>

//         {selectedClass === 'Diploma' && (
//           <>
//             <Text style={styles.label}>Branch</Text>
//             <View style={styles.pickerBox}>
//               <Picker selectedValue={branch} onValueChange={setBranch}>
//                 <Picker.Item label="Select Branch" value="" />
//                 {branches.map(b => (
//                   <Picker.Item key={b} label={b} value={b} />
//                 ))}
//               </Picker>
//             </View>
//           </>
//         )}

//         {subjects.length > 0 && (
//           <>
//             <Text style={styles.label}>Subject</Text>
//             <View style={styles.pickerBox}>
//               <Picker selectedValue={subject} onValueChange={setSubject}>
//                 <Picker.Item label="Select Subject" value="" />
//                 {subjects.map(s => (
//                   <Picker.Item key={s} label={s} value={s} />
//                 ))}
//               </Picker>
//             </View>
//           </>
//         )}

//         <TouchableOpacity
//           style={[
//             styles.submitBtn,
//             (!name || !selectedClass || !subject) && styles.disabledBtn,
//           ]}
//           onPress={handleSubmit}
//           disabled={loadingQuiz}
//         >
//           {loadingQuiz ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.btnText}>Continue</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: width > 400 ? 30 : 16,
//     backgroundColor: '#f5f6fa',
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     elevation: 4,
//   },
//   header: {
//     fontSize: width > 400 ? 26 : 22,
//     fontWeight: 'bold',
//     color: '#ff9d00',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 14,
//   },
//   label: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   pickerBox: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     marginBottom: 14,
//     overflow: 'hidden',
//   },
//   submitBtn: {
//     backgroundColor: '#ff9d00',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   disabledBtn: {
//     opacity: 0.7,
//   },
//   btnText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default SurveyForm;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const SurveyForm = ({ navigation, route, setIsSurveyDone }) => {
  const initialData = route.params?.initialData || {};

  const [name, setName] = useState(initialData.name || '');
  const [selectedClass, setSelectedClass] = useState(initialData.selectedClass || '');
  const [branch, setBranch] = useState(initialData.branch || '');
  const [subject, setSubject] = useState(initialData.subject || '');
  const [subjects, setSubjects] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const classes = ['7', '8', '9', '10', '11', '12', 'Diploma'];
  const branches = ['CSE', 'Civil', 'Electrical', 'Mechanical', 'Electronics'];

  const subjectMapping = {
    school: ['Hindi', 'English', 'Math', 'Science', 'Social Science'],
    higher: ['Hindi', 'English', 'Math', 'Physics', 'Chemistry', 'Biology'],
    diploma: {
      CSE: [
        'Programming in Python',
        'Programming in C',
        'Data Structures and Algorithms',
        'Operating Systems',
        'Computer Networks',
      ],
      Civil: ['Engineering Mechanics', 'Hydraulics'],
      Electrical: ['Electrical Circuit and Networks'],
      Electronics: ['Digital Electronics'],
      Mechanical: ['Thermodynamics'],
    },
  };

  // 🔄 Update subjects list
  useEffect(() => {
    if (['7', '8', '9', '10'].includes(selectedClass)) {
      setSubjects(subjectMapping.school);
    } else if (['11', '12'].includes(selectedClass)) {
      setSubjects(subjectMapping.higher);
    } else if (selectedClass === 'Diploma' && branch) {
      setSubjects(subjectMapping.diploma[branch] || []);
    } else {
      setSubjects([]);
    }

    setSubject('');
  }, [selectedClass, branch]);

  // 🔥 FINAL SUBMIT FUNCTION (UPDATED)
  const handleSubmit = async () => {
    if (!name || !selectedClass || !subject) {
      Alert.alert('Incomplete', 'Please fill all required fields.');
      return;
    }

    setLoadingQuiz(true);

    // try {
      const userData = {
        name,
        selectedClass,
        branch: selectedClass === 'Diploma' ? branch : null,
        subject,
      };

      // ✅ Save user data
      await AsyncStorage.multiSet([
        ['userSurvey', JSON.stringify(userData)],
        ['isSurveyDone', 'true'],
        ['selectedSubject', subject],
        ['userPoints', '0'],
      ]);

      setIsSurveyDone?.(true);

    //   // 🔥 FETCH QUIZ FROM API
      const res = await fetch(
        `http://10.146.254.202:8000/api/random-quiz/?topic=${encodeURIComponent(subject)}`
      );

    //   const quizData = await res.json();

    //   // ✅ SAVE QUIZ
    //   await AsyncStorage.setItem('quizData', JSON.stringify(quizData));

    //   // 🚀 NAVIGATE TO QUIZ
       navigation.replace('Profile');

    // } catch (error) {
    //   console.error("❌ Error:", error);
    //   Alert.alert('Error', 'Failed to generate quiz');
    // } finally {
    //   setLoadingQuiz(false);
    // }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Student Survey</Text>

        <TextInput
          placeholder="Your Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Class</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={selectedClass} onValueChange={setSelectedClass}>
            <Picker.Item label="Select Class" value="" />
            {classes.map(c => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        {selectedClass === 'Diploma' && (
          <>
            <Text style={styles.label}>Branch</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={branch} onValueChange={setBranch}>
                <Picker.Item label="Select Branch" value="" />
                {branches.map(b => (
                  <Picker.Item key={b} label={b} value={b} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {subjects.length > 0 && (
          <>
            <Text style={styles.label}>Subject</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={subject} onValueChange={setSubject}>
                <Picker.Item label="Select Subject" value="" />
                {subjects.map(s => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!name || !selectedClass || !subject) && styles.disabledBtn,
          ]}
          onPress={handleSubmit}
          // disabled={loadingQuiz}
        >
          {loadingQuiz ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SurveyForm;

const styles = StyleSheet.create({
  container: {
    padding: width > 400 ? 30 : 16,
    backgroundColor: '#f5f6fa',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  header: {
    fontSize: width > 400 ? 26 : 22,
    fontWeight: 'bold',
    color: '#ff9d00',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  submitBtn: {
    backgroundColor: '#ff9d00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});