import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { nanoid } from 'nanoid/non-secure';

//convert image to blob
const loadXHR = async (uri) => {
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

export const uploadImage = async (uri, userName) => {
  return new Promise(async (resolve, reject) => {
    try {
      //convert uri to blob
      loadXHR(uri)
        .then((blob) => {
          const fileName = userName + nanoid();
          console.log('uploading as: ' + fileName);
          const storage = getStorage();
          const storageRef = ref(storage, 'fileName');

          //upload
          uploadBytes(storageRef, blob).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
              console.log('Upload success. File available at: ' + url);
              //to do: no not call onSend. Instead set the state
              //this.props.onImageUploaded({ image: url });
              return resolve(url);
            });
          });
        })
        .catch((e) => {
          return reject(e);
        });
    } catch (e) {
      return reject(e);
    }
  });
};
