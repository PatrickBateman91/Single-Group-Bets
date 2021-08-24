import {db, storage} from '../../../config/firebase';

/**
 * Firebase request that adds new public profile to people document
 * @param {string} uid Expects uid of newly created user
 * @param {string} nickname Expects nickname string
 * @param {string} url Expects image source url string
 * @param {number} order Expects order number
 * @returns {Promise} Returns a promise from API request
 */
export const addPublicProfileToFirebase = (uid, nickname, url, order) => {
  return new Promise((resolve, reject) => {
    db.collection('people').doc(uid).set({
      nickname,
      imageSource: url,
      order
    }).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Deletes existing public profile from Firebase firestore
 * @param {string} id Expects id ov the document to delete (user nickname)
 * @returns {Promise} Returns a Promise from API request
 */
export const deleteExistingPublicProfile = (id) => {
  return new Promise((resolve, reject) => {
    return db.collection('people').doc(id).delete().then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Function that uploads finished bet to Firebase firestore
 * @param {object} bet Expects bet object stripped from BetModel
 * @param {string} ID Expects ID of the bet in firebase firestore
 * @returns {Promise} Returns a Promise from API request
 */
export const finishedBetToFirebase = (bet, ID) => {
  return new Promise((resolve, reject) => {
    db.collection('bets').doc(ID).set(
      bet
    ).then(response => {
      resolve(response);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Function that transformes firebase raw data into presentable structure
 * @param {array} snapshot Expects array of firebase documents
 * @returns {array} Returns transformed array of documents
 */
export const firebaseLooper = (snapshot) => {
  let data = [];
  snapshot.forEach(childSnapshot => {
    data.push({
      ...childSnapshot.data(),
      id: childSnapshot.id
    });
  });
  return data;
};

/**
 * Function that gets public profiles of people from server
 * @returns {Promise} Returns a promise from API request
 */
export const getPeopleFromServer = () => {
  return new Promise((resolve, reject) => {
    db.collection('people').get().then(snapshot => {
      resolve(snapshot);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Function that gets bets from Firebase firestore
 * @returns {Promise} Returns a promise from API Request
 */
export const getBetsFromServer = () => {
  return new Promise((resolve, reject) => {
    db.collection('bets').get().then(snapshot => {
      resolve(snapshot);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Function that uploads profile picture to firebase storage
 * @param {file} file Expects file to upload
 * @param {string} name Expects name string to name file in firebase storage
 * @returns {string} Returns profile picture url string
 */
export const uploadProfilePicture = (file, name) => {
  return new Promise((resolve, reject) => {
    const storageRef = storage.app.storage().ref();
    const fileRef = storageRef.child(name);
    fileRef.put(file).then(() => {
      fileRef.getDownloadURL().then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
};
