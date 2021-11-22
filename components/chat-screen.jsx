import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { db, auth} from '../firebase-config';
import { signInAnonymously, onAuthStateChanged} from 'firebase/auth';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';
import NetInfo from "@react-native-community/netinfo";
import { storeLocalUserData, storeLocalMessageData, getLocalMessageData, getLocalUserData, deleteLocalMessages, deleteLocalUser } from '../localStorage';

export default function ChatScreen(props){

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [messages, setMessages] = useState([]);    
  const [user, setUser] = useState(""); 
  const [online, setOnline] = useState(false);  

  //on mount, setup navigation options and store name in state
  useEffect(()=>{    
    const nameProp = props.route.params.name;
    const colorProp = props.route.params.color;
    props.navigation.setOptions({ title: nameProp });

    setName(nameProp);
    setColor(colorProp);

    //try to get locally stored user --- update user state  
    getLocalUserData()
    .then(userId => {
      if(userId !== null){        
        setUser(userId);
      }
    })    
    .catch(error =>{
      console.log(error);
    })

    //try to get locally stored messages --- update messages state
    getLocalMessageData()
    .then(messages => {
      if(messages !== null){        
        setMessages(messages);
      }
    })    
    .catch(error =>{
      console.log(error);
    }) 

    //subscribe to network status updates
    const networkStatusUnsubscribe = NetInfo.addEventListener(state => {
      // console.log("Connection type", state.type);
      // console.log("Is connected?", state.isConnected);
      setOnline(state.isConnected);

      let messagesUnsubscribe = () => {}; 
      
      //if online, subscribe to database updates and authenticate user if there is no user data
      if(state.isConnected){     
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
          }

          //subscribe to message database snapshots
          const q = query(collection(db, "messages"));
          messagesUnsubscribe = onSnapshot(q, (OnMessagesUpdated));
      }
    }); 

    return () => {      
      //clean up subscriptions
      messagesUnsubscribe();      
      networkStatusUnsubscribe();
    }
  }, [])   

  //called automatically when auth status changes
  onAuthStateChanged(auth, (newUser) => {
    if (newUser) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User          
      setUser(newUser.uid);   
      storeLocalUserData(newUser.uid);
    } else {
      // User is signed out  
      setUser("");
      storeLocalUserData("");
    }
  });

  function onSend(newMessages = []){ 
    //add message to database - should only be called while online
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
    //update messages state and store locally
    //only called if subscribed to database snapshots - online only 
    console.log("Messages updated");
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

    //update messages state and update local messages
    setMessages(newMessages);
    storeLocalMessageData(JSON.stringify(newMessages));
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