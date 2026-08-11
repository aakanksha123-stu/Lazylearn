import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ToastAndroid,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';

import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

import notifee, {
  TriggerType,
  AndroidImportance,
  RepeatFrequency,
} from '@notifee/react-native';

export default function NotebookScreen({ navigation, route }) {
  const [reminders, setReminders] = useState([]);
  const [task, setTask] = useState('');
  const [importance, setImportance] = useState('Low');
  const [pickedDate, setPickedDate] = useState(null);
  const [pickedTime, setPickedTime] = useState(null);
  const [editingReminder, setEditingReminder] = useState(null);

  const userToken = route.params?.token || '';

  const API_URL = 'http://10.146.254.202:8000/api/reminders/';

  /* ---------------- NOTIFICATION SETUP ---------------- */

  const setupNotifications = async () => {
    await notifee.requestPermission();

    // ✅ Normal reminders
    await notifee.createChannel({
      id: 'reminder-channel',
      name: 'Notebook Reminders',
      importance: AndroidImportance.DEFAULT,
    });

    // 🔥 High priority alarm channel
    await notifee.createChannel({
      id: 'alarm-channel',
      name: 'High Priority Alarm',
      importance: AndroidImportance.HIGH,
      sound: 'alarm', // res/raw/alarm.mp3
    });
  };

  // ADD THIS FUNCTION BELOW setupNotifications()

  const clearUserNotifications = async () => {
    const all = await notifee.getTriggerNotifications();

    for (let n of all) {
      if (n.notification.id.startsWith(userToken)) {
        await notifee.cancelNotification(n.notification.id);
      }
    }
  };

  /* ---------------- TOAST ---------------- */

  const showToast = msg => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      alert(msg);
    }
  };

  /* ---------------- DATE PICKER ---------------- */

  const pickDate = () => {
    DateTimePickerAndroid.open({
      value: pickedDate || new Date(),
      mode: 'date',
      is24Hour: true,
      onChange: (_, d) => {
        if (d) setPickedDate(d);
      },
    });
  };

  /* ---------------- TIME PICKER ---------------- */

  const pickTime = () => {
    DateTimePickerAndroid.open({
      value: pickedTime || new Date(),
      mode: 'time',
      is24Hour: true,
      onChange: (_, t) => {
        if (t) setPickedTime(t);
      },
    });
  };

  /* ---------------- SCHEDULE NOTIFICATION ---------------- */

  const scheduleNotification = async reminder => {
    let finalDate = new Date(reminder.timeISO);

    if (reminder.dateISO) {
      const d = new Date(reminder.dateISO);

      finalDate = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        finalDate.getHours(),
        finalDate.getMinutes(),
        0,
      );
    } else {
      finalDate = new Date();

      finalDate.setHours(
        new Date(reminder.timeISO).getHours(),
        new Date(reminder.timeISO).getMinutes(),
        0,
      );

      if (finalDate <= new Date()) {
        finalDate.setDate(finalDate.getDate() + 1);
      }
    }

    // ✅ UNIQUE ID PER USER
    const notificationId = `${userToken}_${reminder.id}`;

    // 🔥 HIGH PRIORITY
    if (reminder.importance === 'High') {
      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: '🚨',
          body: reminder.text,
          android: {
            channelId: 'alarm-channel',
            importance: AndroidImportance.HIGH,
            sound: 'alarm',
            loopSound: true,
            vibrationPattern: [300, 500, 300, 500],
            pressAction: { id: 'default' },
            fullScreenAction: { id: 'default' },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: finalDate.getTime(),
        },
      );
      return;
    }

    // ⏰ NORMAL
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: '⏰',
        body: reminder.text,
        android: {
          channelId: 'reminder-channel',
          importance: AndroidImportance.DEFAULT,
          pressAction: { id: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: finalDate.getTime(),
        repeatFrequency: reminder.dateISO ? null : RepeatFrequency.DAILY,
      },
    );
  };
  /* ---------------- RESCHEDULE ALL ---------------- */

  const rescheduleAllReminders = async list => {
    for (let r of list) {
      await scheduleNotification(r);
    }
  };

  /* ---------------- FETCH REMINDERS ---------------- */

  const fetchReminders = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: 'Bearer ' + userToken,
        },
      });

      const data = await res.json();

      const reminderList = Array.isArray(data) ? data : data.results || [];

      setReminders(reminderList);

      await rescheduleAllReminders(reminderList);
    } catch {
      showToast('Failed to load reminders');
    }
  };

  /* ---------------- SAVE TASK ---------------- */

  const saveTask = async () => {
    if (!task.trim()) return showToast('Enter task');
    if (!pickedTime) return showToast('Pick time');

    const finalDateTime = pickedDate
      ? new Date(
          pickedDate.getFullYear(),
          pickedDate.getMonth(),
          pickedDate.getDate(),
          pickedTime.getHours(),
          pickedTime.getMinutes(),
        )
      : pickedTime;

    const body = {
      text: task,
      importance,
      dateISO: pickedDate ? pickedDate.toISOString() : null,
      timeISO: finalDateTime.toISOString(),
    };

    try {
      const res = await fetch(
        editingReminder ? `${API_URL}${editingReminder.id}/` : API_URL,
        {
          method: editingReminder ? 'PUT' : 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userToken,
          },

          body: JSON.stringify(body),
        },
      );

      let saved =
        res.status === 204 ? { ...body, id: Date.now() } : await res.json();

      await scheduleNotification(saved);

      fetchReminders();

      showToast('Reminder saved');

      setTask('');
      setPickedDate(null);
      setPickedTime(null);
      setImportance('Low');
      setEditingReminder(null);
    } catch {
      showToast('Save failed');
    }
  };

  /* ---------------- EDIT ---------------- */

  const editReminder = r => {
    setEditingReminder(r);

    setTask(r.text);
    setImportance(r.importance);
    setPickedDate(r.dateISO ? new Date(r.dateISO) : null);
    setPickedTime(new Date(r.timeISO));
  };

  /* ---------------- DELETE ---------------- */

  const deleteReminder = id => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },

      {
        text: 'Delete',
        style: 'destructive',

        onPress: async () => {
          const notificationId = `${userToken}_${id}`;
          await notifee.cancelNotification(notificationId);
          await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: {
              Authorization: 'Bearer ' + userToken,
            },
          });

          fetchReminders();

          showToast('Deleted');
        },
      },
    ]);
  };

  /* ---------------- FORMAT TIME ---------------- */

  const formatWhen = r => {
    const t = new Date(r.timeISO);

    if (r.dateISO) {
      const d = new Date(r.dateISO);

      return `${d.toLocaleDateString()} ${t.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    return `Daily at ${t.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  /* ---------------- USE EFFECT ---------------- */

  useEffect(() => {
    setupNotifications();

    const init = async () => {
      await clearUserNotifications(); // ✅ fix
      await fetchReminders();
    };

    init();
  }, []);
  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Notebook Reminder</Text>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Enter task..."
          value={task}
          onChangeText={setTask}
        />

        <View style={styles.importanceContainer}>
          {['Low', 'High'].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.importanceBtn,
                importance === level && styles.selectedImportance,
              ]}
              onPress={() => setImportance(level)}
            >
              <Text
                style={[
                  styles.importanceText,
                  importance === level && styles.selectedImportanceText,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickersContainer}>
          <TouchableOpacity style={styles.pickerBtn} onPress={pickDate}>
            <Icon name="calendar-outline" size={20} color="#fff" />

            <Text style={styles.pickerText}>
              {pickedDate ? pickedDate.toLocaleDateString() : 'Pick Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerBtn} onPress={pickTime}>
            <Icon name="time-outline" size={20} color="#fff" />

            <Text style={styles.pickerText}>
              {pickedTime
                ? pickedTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Pick Time'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
          <Text style={styles.saveBtnText}>
            {editingReminder ? 'Update Reminder' : 'Save Reminder'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderText}>{item.text}</Text>

              <Text style={styles.reminderTime}>
                {formatWhen(item)} ({item.importance})
              </Text>
            </View>

            <TouchableOpacity onPress={() => editReminder(item)}>
              <Icon name="pencil-outline" size={18} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteReminder(item.id)}>
              <Icon name="trash-outline" size={18} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

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

  inputCard: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },

  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },

  importanceContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },

  importanceBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },

  selectedImportance: {
    backgroundColor: '#FF9800',
  },

  importanceText: {
    fontWeight: 'bold',
  },

  selectedImportanceText: {
    color: '#fff',
  },

  pickersContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },

  pickerBtn: {
    flex: 1,
    backgroundColor: '#F57C00',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickerText: {
    color: '#fff',
    marginLeft: 6,
  },

  saveBtn: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
  },

  reminderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  reminderTime: {
    fontSize: 12,
    color: '#555',
  },
});  