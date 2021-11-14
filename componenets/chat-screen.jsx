import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'


export default function ChatScreen(props){

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [messages, setMessages] = useState([]);  

  //on mount, setup navigation options and store name in state
  useEffect(()=>{    
    const nameProp = props.route.params.name;
    const colorProp = props.route.params.color;
    props.navigation.setOptions({ title: nameProp });
    setName(nameProp);
    setColor(colorProp);

    //add messages
    setMessages([
      {
        _id: 1,
        text: nameProp + ' has entered the chat!',
        createdAt: new Date(),
        system: true,
      },
      {
        _id: 2,
        text: 'Welcome, ' + nameProp,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      }
    ]);
  }, [])   

  const onSend = (newMessages = []) => {    
    setMessages(GiftedChat.append(messages, newMessages));
  }

  const renderBubble = (props) =>{
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: color
          }
        }}
      />
    )
  }

  return (    
    <View style={[{backgroundColor: 'white'}, styles.container]}>
      <GiftedChat
        renderBubble={renderBubble.bind(this)}
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
      />

      {/* avoid keyboard on android devices */}
      { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
    </View>
  );
}

const styles = StyleSheet.create({  
  container:{
    flex: 1
  },
});