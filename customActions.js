import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

//to do: individual permissions
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default class CustomActions extends React.Component {
  imagePicker = async () => {
    // get permission
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    try {
      if (status === 'granted') {
        // pick image
        const result = await ImagePicker.launchImageLibraryAsync({
          //only get images
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          this.props.onSelectImage(result.uri);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  takePhoto = async () => {
    //get permission
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.MEDIA_LIBRARY
    );
    try {
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          //image types only
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          this.props.onSelectImage(result.uri);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  getLocation = async () => {
    try {
      //get permission
      const { status } = await Permissions.askAsync(
        Permissions.LOCATION_FOREGROUND
      );
      if (status === 'granted') {
        const result = await Location.getCurrentPositionAsync({}).catch(
          (error) => console.log(error)
        );
        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //convert image to blob
  loadXHR = async (uri) => {
    return new Promise(function (resolve, reject) {
      try {
        var xhr = new XMLHttpRequest();

        //define on success
        xhr.onload = function () {
          resolve(xhr.response);
        };
        //define on error
        xhr.onerror = function () {
          reject('Load XHR failed');
        };
        //start request
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      } catch (err) {
        reject(err.message);
      }
    });
  };

  //to do: select image function
  //to do: upload image function
  //used to get local user id

  // uploadImage = async (uri) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //       //convert uri to blob
  //       this.loadXHR(uri)
  //       .then((blob) => {
  //         const storage = getStorage();
  //         const storageRef = ref(storage, 'testFileName');

  //         //upload
  //         uploadBytes(storageRef, blob).then((snapshot) => {
  //           getDownloadURL(snapshot.ref).then((url) => {
  //             console.log('Upload success. File available at: ' + url);

  //             //to do: no not call onSend. Instead set the state
  //             this.props.onImageUploaded({ image: url });
  //             return resolve(url);
  //           });
  //         });
  //       })
  //       .catch((e) => {
  //         return reject(e);
  //       });

  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // };

  onActionPress = () => {
    const options = [
      'Choose From Library',
      'Take Picture',
      'Send Location',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log('user wants to pick an image');
            return this.imagePicker();
          case 1:
            console.log('user wants to take a photo');
            return this.takePhoto();
          case 2:
            console.log('user wants to get their location');
            return this.getLocation();
        }
      }
    );
  };

  //render function
  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="More messaging options"
        accessibilityHint="Send an image or share your location."
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
  onImageUploaded: PropTypes.func,
};
