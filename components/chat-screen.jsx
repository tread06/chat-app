import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { db, auth} from '../firebase-config';
import { signInAnonymously, onAuthStateChanged} from 'firebase/auth';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';

export default function ChatScreen(props){

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [messages, setMessages] = useState([]);    
  const [user, setUser] = useState(""); 

  //on mount, setup navigation options and store name in state
  useEffect(()=>{    
    const nameProp = props.route.params.name;
    const colorProp = props.route.params.color;
    props.navigation.setOptions({ title: nameProp });

    setName(nameProp);
    setColor(colorProp);

    let messagesUnsubscribe = () => {};

    if(user === ""){
      //if no user is signed in, sign in anonymously
      const signIn = async () =>{        
        try{
          await signInAnonymously(auth);          
        }
        catch (error) {
          console.log(error);
        }
      }      
      signIn();

      const q = query(collection(db, "messages"));
      messagesUnsubscribe = onSnapshot(q, (OnMessagesUpdated));
    }

    return () => {      
      messagesUnsubscribe();
    }
  }, [])   

  onAuthStateChanged(auth, (newUser) => {
    if (newUser) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User          
      setUser(newUser.uid);   
    } else {
      // User is signed out  
      setUser("");
    }
  });

  function onSend(newMessages = []){ 

    //add message to database
    newMessages.forEach((message) => {            
      setDoc(doc(db, "messages", message._id), {
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        user: {
          _id: user,
          name: name
        }
      });
    });
  }

  function OnMessagesUpdated(snapshot){

    //update messages state
    const newMessages = [];    
    snapshot.forEach((doc) => {      
      let data = doc.data();         
      newMessages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user
      });
    });

    //sort messages --- most recent on the bottom
    newMessages.sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
    setMessages(newMessages);
  }

  const renderBubble = (props) =>{
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {            
            //backgroundColor: 'color' 
            marginTop: 15          
          },
          left: {            
            //backgroundColor: 'color' 
            marginTop: 15          
          }
        }}
      />
    )
  }

  return (    
    <View style={[{backgroundColor: color}, styles.container]}>
      <GiftedChat
        // loadEarlier={true}
        renderBubble={renderBubble.bind(this)}
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: user,
          name: name
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