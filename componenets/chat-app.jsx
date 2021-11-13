import React from 'react';
import { View } from 'react-native';

//react native nagivation
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//import screens that we want to nagivate
import HomeScreen from './home-screen';
import ChatScreen from './chat-screen';

export default function ChatApp(){

  const Stack = createStackNavigator();

  return (  
    <View style={{flex: 1}}>
      <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>  
    </View>       
  );
}