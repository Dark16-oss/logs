import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

interface UserData {
  id: number;
  Name: string;
  LastLogin: string | null;
  LastLogout: string | null;
}

export default function InputScreen() {
  const [input, setInput] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
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

  // Fetch user data based on search input
  const handleFetchUserData = async () => {
    const db = await SQLite.openDatabaseAsync('User.db');
    const result = await db.getAllAsync<UserData>(
      `SELECT * FROM UserData WHERE Name LIKE ? OR id = ?`,
      [`%${input}%`, input]
    );
    console.log(result)

    if (result.length > 0) {
      setUsers(result);
    } else {
      Alert.alert('User Not Found', 'No user matches the search criteria.');
    }
  };

  // Navigate to the "New User" screen
  const handleNavigateToNewUser = () => {
    router.push('/User');
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search User</Text>

      <View style={styles.group}>
        <Text style={styles.search}>Search by Name or ID:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Name or ID"
          onChangeText={setInput}
          value={input}
          keyboardType="default"
        />
        <TouchableOpacity style={styles.button} onPress={handleFetchUserData}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text><Text style={styles.label}>UserID:</Text>{item.id}</Text>
            <Text><Text style={styles.label}>User:</Text> {item.Name}</Text>
            <Text><Text style={styles.label}>Last Login: </Text>{item.LastLogin || 'N/A'}</Text>
            <Text><Text style={styles.label}>Last Logout:</Text> {item.LastLogout || 'N/A'}</Text>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={<Text>No users found.</Text>}
      />

      <TouchableOpacity style={styles.button_1} onPress={handleNavigateToNewUser}>
        <Text style={styles.buttonText1}>New User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingBottom: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#3a63f2',
  },
  group: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  search: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#3a63f2',
    marginBottom: 10,
  },
  input: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    borderWidth: 1,
    borderColor: '#3a63f2',
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#3a63f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button_1: {
    width: 80,
    height: 30,
    backgroundColor: '#3a63f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 70,
    right: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonText1: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  flatListContent: {
    width: 450,
    padding: 10,
    
  },
  label:{
    fontStyle: 'normal',
    fontWeight: 'bold',
  }
});