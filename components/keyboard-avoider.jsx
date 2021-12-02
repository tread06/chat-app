import React, {useEffect, useRef, useState} from 'react';
import { StyleSheet, Animated, Platform, Keyboard, KeyboardEvent, TextInput, findNodeHandle, AnimatedView } from 'react-native';
import { Easing } from 'react-native-reanimated';


//props: number offset, children
//to do: prop types

const KeyboardAvoider = (props) => {

  const ref = useRef(null);
  const keyboardOffsetAnimation = useRef(new Animated.Value(0)).current;

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    //create listeners for when the keyboard is shown and hidden depending on device type
    const keyboardShow = Keyboard.addListener(
      Platform.select({ios: "keyboardWillShow", android: "keyboardDidShow"}),
      onKeyboardShow,
    );
    const keyboardHide = Keyboard.addListener(
      Platform.select({ios: "keyboardWillHide", android: "keyboardDidHide"}),
      onKeyboardHide,
    );

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  const onKeyboardShow = (keyboardEvent) =>{

    console.log("On Keyboard show");
    const textRef = TextInput.State.currentlyFocusedInput();
    if(textRef){
      measureTextInput(textRef, keyboardEvent);
    }
  }

  const onKeyboardHide = (keyboardEvent) =>{
    updateOffset(0);
  }

  const measureTextInput = (textRef, keyboardEvent) =>{
    // get the y position of the top of the keyboard
    const topY = keyboardEvent.endCoordinates.screenY;

    textRef.measureLayout(findNodeHandle(ref.current),
      (x, y) =>{
        const pageY = y;

        textRef.measure((x, y, width, height) =>{
          // get the y position of the bottom of the text input
          const textInputY = pageY - keyboardOffset  + height + props.offset;
          const finalOffset = (textInputY > topY) ? (textInputY - topY) : 0;

          console.log('keyboardY: '+topY);
          console.log('textInputY: '+textInputY);
          console.log('customOffset: '+props.offset);
          console.log('finalOffset: '+finalOffset);

          if(Platform.OS === 'ios') updateOffset(finalOffset);
          else updateOffset(Math.min(finalOffset, props.offset));

        });
      }, () =>{}
    )
  }

  const updateOffset = (toValue) =>{
    setKeyboardOffset(toValue);

    Animated.timing(keyboardOffsetAnimation, {
      toValue: -toValue,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }

  return (
    <Animated.View
      ref={ref}
      style={[styles.container, {transform: [{translateY: keyboardOffsetAnimation}]}]}
    >
      { props.children }
    </Animated.View>
  );
}

export default KeyboardAvoider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})