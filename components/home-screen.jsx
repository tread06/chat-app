import React from 'react';
import { StyleSheet, View, Text, TextInput, ImageBackground, Image, TouchableHighlight, KeyboardAvoidingView} from 'react-native';
import { useState } from 'react/cjs/react.development';

export default function HomeScreen(props){

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [color, setColor] = useState(0);

  const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];  

  //update name state and clear errors when input changes
  const onNameUpdate = (input = [] ) =>{  
    setError("");
    setName(input);    
  }

  //validate the name input and navigate to chat if the name is valid.
  const onEnterChat = (input = [] ) =>{
    if(name === "" || name === undefined) {
      setError("Please Enter a valid name.");
      return;
    }       
    props.navigation.navigate('Chat', {name: name, color: colors[color]});
  }

  //select color
  const onColorUpdate = (number) =>{  
    setColor(number);
  }

  return (
    <View style={styles.mainContainer}>
      <ImageBackground source={require('../assets/background.png')} resizeMode="cover" style={styles.background}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Chat App</Text>
        </View> 
        
        <View style={styles.inputContainer}> 
          <View style={styles.inputContent}>
            <View style={styles.nameInputContainer}>
              <Image
                style={styles.nameIcon}
                source={require('../assets/nameIconAsPNG.png')}
              />
              <TextInput    
                accessible={true}
                accessibilityLabel="Name input"
                accessibilityHint="Enter your name."                
                style={styles.nameInput}          
                onChangeText={(text) => onNameUpdate(text)}
                value={name}
                placeholder='Your Name'  
              />      
              {/* avoid keyboard on android devices */}
              { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }      
            </View> 
            <Text style={styles.errorText}>{error}</Text> 
          </View> 

          <View style={styles.colorContainer}>
            <Text style={{color: 'gray'}}>Choose Background Color</Text> 
            <View style={styles.colorButtonContainer}>
              <TouchableHighlight
                  accessible={true}
                  accessibilityLabel="Color select 1"
                  accessibilityHint="Selects color 1."
                  accessibilityRole="button"
                  onPress={() => {onColorUpdate(0);}}  
                  style={ color === 0 ? styles.colorButtonSelected : styles.colorButton} 
                  underlayColor="#090C08"                     
                  > 
                  <View style={[styles.color0, styles.colorButtonChild]} ></View>                 
                </TouchableHighlight>
                <TouchableHighlight
                  accessible={true}
                  accessibilityLabel="Color select 2"
                  accessibilityHint="Selects color 2."
                  accessibilityRole="button"
                  onPress={() => {onColorUpdate(1);}} 
                  style={ color === 1 ? styles.colorButtonSelected : styles.colorButton}   
                  underlayColor="#474056"                   
                  > 
                  <View style={[styles.color1, styles.colorButtonChild]}></View>                 
                </TouchableHighlight>
                <TouchableHighlight
                  accessible={true}
                  accessibilityLabel="Color select 3"
                  accessibilityHint="Selects color 3."
                  accessibilityRole="button"
                  onPress={() => {onColorUpdate(2);}} 
                  style={ color === 2 ? styles.colorButtonSelected : styles.colorButton}    
                  underlayColor="#8A95A5"                  
                  > 
                  <View style={[styles.color2, styles.colorButtonChild]}></View>                 
                </TouchableHighlight>
                <TouchableHighlight
                  accessible={true}
                  accessibilityLabel="Color select 4"
                  accessibilityHint="Selects color 4."
                  accessibilityRole="button"
                  onPress={() => {onColorUpdate(3);}} 
                  style={ color === 3 ? styles.colorButtonSelected : styles.colorButton}    
                  underlayColor="#B9C6AE"               
                  > 
                  <View style={[styles.color3, styles.colorButtonChild]}></View>
                </TouchableHighlight>
            </View>
          </View>

          <View style={styles.inputContent}> 
              <TouchableHighlight
                accessible={true}
                accessibilityLabel="Enter chat button"
                accessibilityHint="Enters the chat."
                accessibilityRole="button"
                onPress={() => {onEnterChat({name: name});}} 
                style={styles.button}                 
                > 
                <Text style={styles.buttonText}>Start Chatting</Text>                 
              </TouchableHighlight>
          </View>  
        </View>      
        <View style={{flex: 12}}></View>       
      </ImageBackground> 
    </View>
  );  
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',    
    alignItems: 'center' 
  },
  titleContainer: {
    flex: 44,
    flexDirection: 'column',   
    alignContent: 'center',
    alignItems: 'center'
  },
  titleText:{
    fontSize: 45,
    fontWeight: '600',    
    color: '#FFFFFF',
    textAlign: 'center',    
    marginTop: '20%'
  },
  inputContainer: {
    flex: 44,
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '88%', 
    backgroundColor: 'white',
    borderRadius: 5
  },
  inputContent:{     
    height: 60,    
    width: '90%',
    textAlign: 'center',
  },
  colorContainer:{     
    height: 90,    
    width: '90%',
    textAlign: 'center',
  },
  
  nameInputContainer: {
    flexDirection: 'row',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
  },  
  nameIcon:{
    width: 30,
    height: 30,
  },
  inputPlaceholder:{       
    fontWeight: '300', 
    fontSize: 16,
    color: '#757083',
    opacity: 50
  },
  nameInput:{
    marginLeft: 10
  },
  errorText:{   
    height: 30, 
    fontSize: 15,    
    textAlign: 'center',
    color: 'red',    
  },
  button:{    
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757083', 
    borderRadius: 5
  },
  buttonText:{   
    color: '#FFFFFF', 
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  },
  chooseBackgroundColorText:{   
    fontWeight: '300', 
    fontSize: 16,
    color: '#757083',
    opacity: 100
  },
  colorButtonContainer:{ 
    flex: 1,    
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 60,    
    width: '90%',
    textAlign: 'center',
    marginTop: 20
  },
  colorButton:{      
    height: 60,
    width: 60,
    borderRadius: 60/2,    
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center'
  },
  colorButtonSelected:{  
    height: 60,
    width: 60,
    borderRadius: 60/2,    
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 3,
    borderColor: '#757083',
  },
  color0:{
    backgroundColor: '#090C08', 
  },
  color1:{
    backgroundColor: '#474056', 
  },
  color2:{
    backgroundColor: '#8A95A5', 
  },
  color3:{
    backgroundColor: '#B9C6AE', 
  },
  colorButtonChild:{
    padding: 0,
    margin: 'auto',      
    borderRadius: 45/2,
    height: 45,
    width: 45  
  },  
});