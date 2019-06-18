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

function writeUserData(userId, name, email, score) {
  firebase.database().ref('/players/' + userId).set({
    name: name,
    email: email,
    highScore : Number(score)
  });
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
      window.text = window.text + '{ "name":"' + childData["name"] + '", "email":"' +
      childData["email"] + '", "highScore":"' + childData["highScore"] + '" }';
      window.i++;
      if (window.i < window.max) {
        window.text = window.text + ', ';
      }
    })
    window.text = window.text + ' ]}';
    var result = JSON.parse(text);

    // Test display
    console.log(result);

    //return result;
  })
}

function getUserData(userId){
  firebase.database().ref("/players/" + userId).once("value", function(snapshot) {
    var Key = snapshot.key;
    var Data = snapshot.val();

    // Convert to JSON
    var text = '{ "user" : [' +
    '{ "name":"' + Data["name"] + '", "email":"' + Data["email"] + '", "highScore":"' + Data["highScore"] + '" }' +
    ' ]}';
    var result = JSON.parse(text);

    // Test display
    console.log(result);

    //return result;
  })
}

function getHighScore(){
  // Get the fives best
  firebase.database().ref("/players").orderByChild("highScore").limitToLast(5).on("value", function(snapshot) {
    window.i = 0;
    window.max = 5;
    window.text = '{ "users" : ['
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      window.text = window.text + '{ "name":"' + childData["name"] + '", "email":"' +
      childData["email"] + '", "highScore":"' + childData["highScore"] + '" }';
      window.i++;
      if (window.i < window.max) {
        window.text = window.text + ', ';
      }
    })
    window.text = window.text + ' ]}';
    var result = JSON.parse(text);

    // Test display
    console.log(result);

    //return result;
  })
}

function updateUserHighScore(userId, score) {
  firebase.database().ref("/players/" + userId).once("value", function(snapshot) {
    var Key = snapshot.key;
    var Data = snapshot.val();
    window.highScore = Data["highScore"];

    // Test if the score is the high score
    if (score > window.highScore) {
      firebase.database().ref('/players/' + userId).update({
        highScore: score
      });
    }
  })
}

function removeUserData(userId) {
  firebase.database().ref('/players/' + userId).remove();
}
