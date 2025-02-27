import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

// Define the structure of the UserData table
interface UserData {
  id: number;
  Name: string;
  LastLogin: string | null;
  LastLogout: string | null;
}

export default function InputScreen() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [IDNumber, setIDNumber] = useState<string>('');
  const router = useRouter();

  // Initialize the database
  const initializeDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('User.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS UserData (
        id INTEGER PRIMARY KEY,
        Name TEXT NOT NULL,
        LastLogin TEXT,
        LastLogout TEXT
      );
    `);
  };

  const saveUserData = async () => {
    if (!firstName.trim() || !lastName.trim() || !IDNumber.trim()) {
      Alert.alert('Error', 'Please enter all fields: first name, last name, and ID number.');
      return;
    }

    const db = await SQLite.openDatabaseAsync('User.db');
    const currentTime = new Date().toISOString();

    // Check if the ID number already exists
    const result = await db.getAllSync<UserData>(
      `SELECT id FROM UserData WHERE id = ?`,
      parseInt(IDNumber) 
    );
    console.log(result)
    if (result == []) {
      Alert.alert('Error', 'ID number is already taken.');
      return;
    }

    // Insert the new user data
    await db.runAsync(
      `INSERT INTO UserData (id, Name, LastLogin, LastLogout) VALUES (?, ?, ?, ?)`,
      [parseInt(IDNumber, 10), `${firstName} ${lastName}`, currentTime, null]
    );

    Alert.alert('Success', 'User created and logged in successfully!');
    setFirstName('');
    setLastName('');
    setIDNumber('');
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your ID Number"
          onChangeText={setIDNumber}
          value={IDNumber}
          keyboardType="numeric"
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