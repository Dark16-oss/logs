import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

interface UserData {
  id: number;
  Name: string;
  LastLogin: string | null;
  LastLogout: string | null;
}

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');

  // Initialize the database
  const initializeDatabase = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('User.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS UserData (
          id INTEGER PRIMARY KEY,
          Name TEXT NOT NULL,
          LastLogin TEXT,
          LastLogout TEXT
        );
      `);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      Alert.alert('Error', 'Failed to initialize database. Please try again.');
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('User.db');

      // Check if the user exists
      const user = await db.getFirstAsync<UserData>(
        `SELECT * FROM UserData WHERE id = ?`,
        [username]
      );
      if (!user) {
        Alert.alert('Error', 'User not found. Please check the username and try again.');
        return;
      }

      // Update the LastLogin field
      const currentTime = new Date().toISOString();
      await db.runAsync(
        `UPDATE UserData SET LastLogout = NULL, LastLogin = ? WHERE id = ?`,
        [currentTime, user.id]

      );

      Alert.alert('Success', 'Login recorded successfully!');
      router.push('/details'); // Navigate to the details screen
    } catch (error) {
      console.error('Failed to log in:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your ID"
          value={username}
          onChangeText={setUsername} // Update the username state
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
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