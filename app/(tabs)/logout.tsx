import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

interface UserData {
  id: number;
  Name: string;
  LastLogin: string | null;
  LastLogout: string | null;
}

const initializeDatabase = async (): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync('User.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS UserData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL,
        LastLogin TEXT,
        LastLogout TEXT
      );
    `);
    console.log('Database and table initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    Alert.alert('Error', 'Failed to initialize database.');
  }
};

const showRecords = async (): Promise<UserData[]> => {
  try {
    const db = await SQLite.openDatabaseAsync('User.db');
    const result = await db.getAllAsync<UserData>(
      `SELECT * FROM UserData`
    );
    console.log('All records', result);
    return result;
  } catch (error) {
    console.error('Error fetching online users:', error);
    Alert.alert('Error', 'Failed to fetch online users.');
    return [];
  }
};

const fetchOnlineUsers = async (): Promise<UserData[]> => {
  showRecords()
  try {
    const db = await SQLite.openDatabaseAsync('User.db');
    const result = await db.getAllAsync<UserData>(
      `SELECT * FROM UserData WHERE LastLogin IS NOT NULL AND LastLogout IS NULL`
    );
    console.log('Online Users:', result);
    return result;
  } catch (error) {
    console.error('Error fetching online users:', error);
    Alert.alert('Error', 'Failed to fetch online users.');
    return [];
  }
};

const handleUserLogout = async (userId: number): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync('User.db');
    const currentTime = new Date().toISOString();
    await db.runAsync(
      `UPDATE UserData SET LastLogout = ? WHERE id = ?`,
      [currentTime, userId]
    );
    console.log('User logged out:', userId);
    Alert.alert('Success', 'User logged out successfully!');
  } catch (error) {
      console.error('Error logging out user:', error);
      Alert.alert('Error', 'Failed to log out user.');
  }
};

export default function LogoutScreen() {
  const [onlineUsers, setOnlineUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch online users on component mount
  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      const users = await fetchOnlineUsers();
      setOnlineUsers(users);
      setLoading(false);
    };
    init();
  }, []);

  // Handle user logout
  const handleLogout = async (userId: number): Promise<void> => {
    await handleUserLogout(userId);
    const users = await fetchOnlineUsers(); // Refresh the list after logout
    setOnlineUsers(users);
  };

  // Refresh the list of online users
  const refreshOnlineUsers = async (): Promise<void> => {
    setLoading(true); // Show loading indicator
    const users = await fetchOnlineUsers(); // Fetch updated online users
    setOnlineUsers(users); // Update the state with the new list
    setLoading(false); // Hide loading indicator
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Users</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3a63f2" />
      ) : (
        <FlatList
          data={onlineUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.userContainer}>
              <Text style={styles.userName}>{item.Name}</Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => handleLogout(item.id)}
              >
                <Text style={styles.buttonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={<Text>No online users found.</Text>}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={refreshOnlineUsers}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 60,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#3a63f2',
    marginBottom: 20,
  },
  flatListContent: {
    width: '100%',
    paddingHorizontal: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a63f2',
  },
  logoutButton: {
    backgroundColor: '#3a63f2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    width: 80,
    height: 30,
    backgroundColor: '#3a63f2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 70,
    left: 20,
  },
  refreshButton: {
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
});