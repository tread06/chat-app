import AsyncStorage from '@react-native-async-storage/async-storage';

//used to store user id locally
export const storeLocalUserData = async (value) => {
  try {
    await AsyncStorage.setItem('user', value);
  } catch (e) {
    console.log(e);
  }
};
//used to store messages locally
export const storeLocalMessageData = async (value) => {
  try {
    await AsyncStorage.setItem('messages', value);
  } catch (e) {
    console.log(e);
  }
};
//used to get local user id
export const getLocalUserData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const value = await AsyncStorage.getItem('user');
      return resolve(value);
    } catch (e) {
      return reject(e);
    }
  });
};

//used to get local messages
export const getLocalMessageData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const value = await AsyncStorage.getItem('messages');
      if (value !== null) {
        const localMessages = JSON.parse(value);
        return resolve(localMessages);
      }
    } catch (e) {
      return reject(e);
    }
  });
};

//used to delete local messages
export const deleteLocalMessages = async () => {
  try {
    await AsyncStorage.removeItem('messages');
  } catch (e) {
    console.log(e);
  }
  console.log('local messages deleted');
};

//used to delete local user
export const deleteLocalUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (e) {
    console.log(e);
  }
  console.log('local user deleted');
};
