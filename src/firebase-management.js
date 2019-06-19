// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAoL2Yay2yWUC4QipHhsoX5CCfMMXsqkbY",
  authDomain: "retro-shooter-am4l-v2.firebaseapp.com",
  databaseURL: "https://retro-shooter-am4l-v2.firebaseio.com",
  projectId: "retro-shooter-am4l-v2",
  storageBucket: "retro-shooter-am4l-v2.appspot.com",
  messagingSenderId: "238955078830",
  appId: "1:238955078830:web:b534872d8edbc45f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var database = firebase.database();

function writeUserData(name, score) {
  firebase.database().ref("/players").once("value", function(snapshot) {
    window.max = snapshot.numChildren() + 1;
    firebase.database().ref('/players/' + window.max).set({
      name: name,
      highScore : Number(score)
    });
  })
}

function getData(){
  firebase.database().ref("/players").once("value", function(snapshot) {
    // Convert to JSON
    window.i = 0;
    window.max = snapshot.numChildren();
    window.text = '{ "users" : ['
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      window.text = window.text + '{ "name":"' + childData["name"] +
      '", "highScore":"' + childData["highScore"] + '" }';
      window.i++;
      if (window.i < window.max) {
        window.text = window.text + ', ';
      }
    })
    window.text = window.text + ' ]}';
    var result = JSON.parse(window.text);

    // Test display
    // console.log(result);
    return result; //  KO: return undefined outside of the function
  })
}

function getUserData(name){
  firebase.database().ref("/players").once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var Key = childSnapshot.key;
      var Data = childSnapshot.val();

      if (name === Data["name"]) {
        // Convert to JSON
        window.text = '{ "user" : [' +
        '{ "name":"' + Data["name"] + '", "highScore":"' + Data["highScore"] + '" }' +
        ' ]}';
      }
    })
    var result = JSON.parse(window.text);

    // Test display
    // console.log(result);
    return result; // KO: return undefined outside of the function
  })
}

function getHighScore(){
  // Get the five best
  firebase.database().ref("/players").orderByChild("highScore").limitToLast(5).on("value", function(snapshot) {
    window.i = 0;
    window.max = 5;
    window.text = '{ "users" : ['
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      window.text = window.text + '{ "name":"' + childData["name"] +
      '", "highScore":"' + childData["highScore"] + '" }';
      window.i++;
      if (window.i < window.max) {
        window.text = window.text + ', ';
      }
    })
    window.text = window.text + ' ]}';
    var result = JSON.parse(window.text);

    // Test display
    // console.log(result);
    return result; //  KO: return undefined outside of the function
  })
}

function updateUserHighScore(name, score) {
  firebase.database().ref("/players").once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var Key = childSnapshot.key;
      var Data = childSnapshot.val();
      if (name === Data["name"]) {
        window.highScore = Data["highScore"];
        window.userId = Key;

        // Test if the score is the high score
        if (score > window.highScore) {
          firebase.database().ref('/players/' + window.userId).update({
            highScore: score
          });
        }
      }
    })
  })
}

function removeUserData(name) {
  firebase.database().ref("/players").once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var Key = childSnapshot.key;
      var Data = childSnapshot.val();

      if (name === Data["name"]) {
        window.userId = Key;
        firebase.database().ref('/players/' + window.userId).remove();
      }
    })
  })
}
