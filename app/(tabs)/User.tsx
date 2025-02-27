import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

export default function InputScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const router = useRouter();

  // Initialize the database
  const initializeDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('User.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS UserData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        LastLogin TEXT,
        LastLogout TEXT
      );
    `);
  };

  const saveUserData = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter both first name and last name.');
      return;
    }

    const db = await SQLite.openDatabaseAsync('User.db');
    const currentTime = new Date().toISOString(); 

    await db.runAsync(
      `INSERT INTO UserData (Name, LastLogin, LastLogout) VALUES (?, ?, ?)`,
      [`${firstName} ${lastName}`, currentTime, null]
    );

    Alert.alert('Success', 'User created and logged in successfully!');
    setFirstName('');
    setLastName('');
    router.push('/details'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create User</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          onChangeText={setFirstName}
          value={firstName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          onChangeText={setLastName}
          value={lastName}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={saveUserData}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#3a63f2',
    marginBottom: 40,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a63f2',
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    color: 'black',
    borderWidth: 1,
    borderColor: '#3a63f2',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  button: {
    width: 250,
    height: 55,
    backgroundColor: '#3a63f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
});