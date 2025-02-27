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
  const [input, setInput] = useState('');
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

  // Fetch user data 
  const handleFetchUserData = async ({ data }: { data: string }) => {
    const db = await SQLite.openDatabaseAsync('User.db');
    const result = await db.getAllAsync<UserData>(
      `SELECT * FROM UserData WHERE Name LIKE ?`,
      [`%${data}%`] 
    );

    if (result.length > 0) {
      setUsers(result); 
    } else {
      Alert.alert('User Not Found', 'No user matches the search criteria.'); 
    }
  };

  // Handle user login
  const handleLogin = async (userId: number) => {
    const db = await SQLite.openDatabaseAsync('User.db');
    const currentTime = new Date().toISOString(); 
    await db.runAsync(
      `UPDATE UserData SET LastLogin = ? WHERE id = ?`,
      [currentTime, userId]
    );
    // Refresh the user list
    handleFetchUserData({ data: input });
  };

  // Handle user logout
  const handleLogout = async (userId: number) => {
    const db = await SQLite.openDatabaseAsync('User.db');
    const currentTime = new Date().toISOString(); 
    await db.runAsync(
      `UPDATE UserData SET LastLogout = ? WHERE id = ?`,
      [currentTime, userId]
    );
    // Refresh the user list
    handleFetchUserData({ data: input });
  };

  // Navigate to the "New User"
  const handleNavigateToNewUser = () => {
    router.push('/(tabs)/User');
  };


  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <View style={styles.group}>
        <Text style={styles.search}>Search:</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name, Last Name"
          onChangeText={setInput}
          value={input}
        />
        <TouchableOpacity style={styles.button} onPress={() => handleFetchUserData({ data: input })}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text>User: {item.Name}</Text>
            <Text>Last Login: {item.LastLogin || 'N/A'}</Text>
            <Text>Last Logout: {item.LastLogout || 'N/A'}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button_1} onPress={handleNavigateToNewUser}>
        <Text style={styles.buttonText}>New User</Text>
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
    fontSize: 35,
    fontWeight: 'bold',
    color: 'black',
    width: '100%',
    paddingHorizontal: 20,
    top: 20,
  },
  search: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#3a63f2',
    marginBottom: 20,
    top: 10,
  },
  input: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    borderWidth: 1,
    borderColor: '#3a63f2',
    borderRadius: 10,
    width: 375,
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
  },
  button: {
    width: 375,
    height: 55,
    backgroundColor: '#3a63f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  button_1: {
    width: 100,
    height: 40,
    backgroundColor: '#3a63f2',
    position: 'absolute',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    top: 50,
    right: 10,
    margin: 10,
  },

  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: 375,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  loginButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  logoutButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#F44336',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
});