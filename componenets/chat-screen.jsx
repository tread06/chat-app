import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function ChatScreen(props){

  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  //on mount, setup navigation options and store name in state
  useEffect(()=>{    
    const nameProp = props.route.params.name;
    const colorProp = props.route.params.color;
    props.navigation.setOptions({ title: nameProp });
    setName(nameProp);
    setColor(colorProp);
  }, [])  

  return (
    <View style={{backgroundColor: color}}>
      <Text style={styles.titleText}>Welcome to the chat, {name}.</Text>
    </View>
  );
}

const styles = StyleSheet.create({  
  titleText:{
    fontSize: 40,
    margin: 50,
    color: 'white'
  }
});