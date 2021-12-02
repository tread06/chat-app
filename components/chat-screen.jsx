import React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, Text, Image, TouchableOpacity } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, MessageImage } from 'react-native-gifted-chat'
import { db, auth} from '../firebase-config';
import { signInAnonymously, onAuthStateChanged} from 'firebase/auth';
import { collection, onSnapshot, doc, query, setDoc } from 'firebase/firestore';
import NetInfo from "@react-native-community/netinfo";
import { storeLocalUserData, storeLocalMessageData, getLocalMessageData, getLocalUserData, deleteLocalMessages, deleteLocalUser } from '../localStorage';
import CustomActions from '../customActions';
import KeyboardAvoider from './keyboard-avoider';
import { uploadImage } from '../imageUploader';
import { nanoid } from 'nanoid/non-secure';
import { Timestamp } from '@firebase/firestore';
import MapView from 'react-native-maps';

export default function ChatScreen(props){

  const [name, setName] = useState('');
  const [color, setColor] = useState('');  
  const [messages, setMessages] = useState([]);    
  const [user, setUser] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setselectedImage] = useState(""); //path to image file that will be sent 

  // called on mount, sets navigation options and stores name in state
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
    let messagesUnsubscribe = () => {}; 
    const networkStatusUnsubscribe = NetInfo.addEventListener(state => {
      
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
  // called when auth status changes, updates user state
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

  const OnMessagesUpdated =(snapshot) =>{
    //update messages state and store locally
    //only called if subscribed to database snapshots - online only     
    const newMessages = [];    
    snapshot.forEach((doc) => {      
      let data = doc.data();         
      newMessages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image,
        location: (data.location) ? data.location : null
      });
    });

    //sort messages --- most recent on the bottom
    newMessages.sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });

    //update messages state and update local messages
    setMessages(newMessages);
    storeLocalMessageData(JSON.stringify(newMessages));
  };
  const customtInputToolbar = props => {
    return (
      <InputToolbar
          {...props}
          containerStyle={{
            //put the image preview on top
            flexDirection: 'column-reverse',   
          }}      
          textInputStyle={{  
            //text
            marginTop: 5,
          }}  
          textStyle={{  
            //button
            height: '80%',
            lineHeight: 30,
            width: 70,
            backgroundColor: '#ab3113',
            borderRadius: 5,
            textAlign: 'center',
            color: 'white'
            
          }}  
          label={'Send'}
        />       
    );
  };
  const selectImage = (image) => {
    setselectedImage(image);
  };
  const imageAccessory = () => {
    return (     
      <View style={styles.container}>
        <TouchableOpacity
        accessible={true}
        accessibilityLabel="Remove Image"
        accessibilityHint="Remove selected image."
        style={ isSending ? styles.sendingButton : styles.removeImageButton}
        onPress={removeImage}
        disabled = {isSending}
        >
          <Text style={styles.removeImageText}>
            {isSending ? "Sending..." : "Cancel Image"}
          </Text>
      </TouchableOpacity>
        <Image
          style={styles.imageSelected}
          source={{
          uri: selectedImage,
        }}
      /> 
      </View> 
      
    );
  };
  const removeImage = () =>{
    setselectedImage("");
  };
  const renderBubble = (props) =>{
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {  
            marginBottom: 15,         
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: '#5d8599',
            overflow: 'hidden'  
          },
          left: {                  
            marginBottom: 15,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10, 
            overflow: 'hidden'                 
          }
        }}
      />
    )
  };
  const renderMessageImage =(props) => {
    return (
      <MessageImage
        {...props}
        imageStyle={{
          margin:0,
          width: 275,
          height: 275,
          resizeMode: 'cover',
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        }}
      />
    )
  };
  const sendLocation = (location) =>{    

    const id = user + name + nanoid();  
    setDoc(doc(db, "messages", id), {
      _id: id,
      text: "",
      createdAt: Timestamp.now(),
      image: "",
      location: {
        longitude: location.location.longitude, 
        latitude: location.location.latitude
      },
      user: {
        _id: user,
        name: name
      }
    }); 

  };
  const renderCustomActions = (props) =>{
    return <CustomActions {...props} onSelectImage = {selectImage} onSendLocation = {sendLocation}/>;
  };  
  const customSendPress = (location, text, onSend) => {
    if (selectedImage === "" && text && onSend) {           
      onCustomSend({text: text.trim(), image: ""}, true);
    } else if (selectedImage !== "" && !text && onSend) {      
      onCustomSend({text: "" , image: selectedImage}, true);
    } else if (selectedImage !== "" && text && onSend) {      
      onCustomSend({text: text.trim(), image: selectedImage}, true);
    } else{      
      return false;
    }    
  };
  const onCustomSend = (message) =>{    
    const id = user + name + nanoid();     

    //to do: reset gifted chat text
    setIsSending(true);

    if(message.image !== ""){
      //send with image 
      console.log("Image found");
      uploadImage(message.image, user)
        .then(url => {          
          setDoc(doc(db, "messages", id), {
            _id: id,
            text: message.text,
            createdAt: Timestamp.now(),
            image: url,
            user: {
              _id: user,
              name: name
            }
          });          
          setselectedImage("");
          setIsSending(false); 
        })    
        .catch(error =>{
          setselectedImage(""); 
          setIsSending(false); 
          console.log(error);
        })          
      } else {
        //send with no image
        setDoc(doc(db, "messages", id), {
          _id: id,
          text: message.text,
          createdAt: Timestamp.now(),
          image: "",
          user: {
            _id: user,
            name: name
          }
        }); 
        setIsSending(false); 
      }       
  };  
  const customSend = ({onSend, text, location, sendButtonProps, ...sendProps}) => { 
    return ( <Send 
      {...sendProps} 
      textStyle={styles.sendButton}      
      sendButtonProps={{ 
        ...sendButtonProps,         
        onPress: () => customSendPress(location, text, onSend), }} /> 
    );
  };
  const CustomView =(props) => {    
    const { currentMessage} = props;   
    //if the is a location, render it. Otherwise, return null -- default behavior  
    if (currentMessage.location) {      
      return (
          <MapView
            style={{width: 275,
              height: 275,
              borderRadius: 10,
              margin: 0,     
              padding: 0,                      
            }}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
      );
    }    
    return null;
  };
  const renderChat = () =>{
    return <View style={[{backgroundColor: color}, styles.container]}>
      <GiftedChat 
        style={styles.chatContainer}        
        alwaysShowSend={true}
        renderCustomView={CustomView}
        renderActions={renderCustomActions}         
        renderBubble={renderBubble}
        renderInputToolbar={props => customtInputToolbar(props)}
        renderAccessory={selectedImage !== "" ? imageAccessory:null}
        accessoryStyle={selectedImage !== "" ? styles.imageSelected:styles.imageNull}
        messages={messages}
        renderSend={customSend} 
        renderMessageImage={renderMessageImage}
        user={{
          _id: user,
          name: name
        }}
    />  
    </View>
  };

  return (    
    <KeyboardAvoider 
    //offset keyboard by a different amount depending on platform
      offset = {Platform.select({ios: 0, android: 44})} 
    >
      {renderChat()} 
    </KeyboardAvoider >
  );
}

const styles = StyleSheet.create({  
  container:{
    flex: 1, 
  },  
  removeImageButton:{
    flex: .2, 
    backgroundColor: "#ab3113",
    color: "#FFFFFF",
    borderRadius: 10,
    margin: 5,
  }, 
  sendingButton:{
    flex: .2, 
    backgroundColor: "green",
    color: "#FFFFFF",
    borderRadius: 10,
    margin: 5,
  }, 
  removeImageText:{
    color: "#FFFFFF",
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 15,    
  }, 
  chatContainer:{     
    flex: 1, 
  }, 
  imageSelected:{
    flex: 1,
    height: 300, 
    padding: 5,
    justifyContent: 'center',
    borderRadius: 10,
    margin: 5,
  },  
  imageNull:{
    flex: 1,
    height: 0,    
  },  
  sendButton:{
    
  }, 
});