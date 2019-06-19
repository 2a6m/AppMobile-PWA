# AppMobile-PWA : Retro Shooter

This project was realized by Bourguignon Maxime and Simon Christophe.\
We both use a Debian based Linux environment.

## Introduction

For the mobile applications course (AM4L), we had to make a retro shooter. Two choices were possible:

- A native Android App;
- A Progressive Web App.

For challenge and discovery, we opted for the PWA.

## Game

The link to play to our funniest and most enjoyable retro shooter game is:\
https://retro-shooter-am4l-v2.firebaseapp.com/

### How to play

Tux follows your finger or your mouse (if you play on a computer).\
To shoot, you must keep your finger (or mouse) down. You earn 10 points for each enemy you eliminate.

After you died (hit by a droppings or feline), you can save your score and hope to be in the player's top five by setting your trigram on the displayed letters.

### Application principles

The game has four states: init, menu, startGame and endGame.

<p align="center">
<img src="./diagrams/StateMachine.png">
</p>
<p align="center">State diagram UML</p>

#### init state

This state is a preview page to receive an immersive introduction to the game.
When you click on it, you go to the next state, the menu.

#### menu state

This state shows the high scores. We load the five highest scores in the game's database.
When you're ready, you can click on the page to play, the startGame state.

#### startGame state

This state is the playable state.
Enemies pop recursively and have a shooting rate depending on your current score.

When you hit an enemy or enemy's droppings, you die and go to the endGame state.

#### endGame state

This state is the end state.
You can see the score of your game. You need to set your trigram to save your score in the database.

You can click on restart and back to the menu state or quit the application.

## Development

According to the request, we had to write a service worker to register the interesting files in the cache and a manifest to be able to download the application on a smartphone.

### Libraries and dependencies

To develop our PWA retro shooter, we configured Firebase and we used a framework called Wade.

#### Firebase

We use Firebase services for two parts of our project:

- To host our web app;
- To save the users data (trigram and high score).

##### The hosting

We configured a project named retro-shooter-am4l-v2 as a single web page app.
The useful scripts are included in the 'index.html' page.
The script 'app.js' (which is responsible for Wade) is called from this page.

##### The database

In the Firebase project, we configured a "real time" database. The "real time" notion is not useful in our case but it was a successful investigation. The app saves the id of the player as the number of players in the database plus one. Inside this id, the name and the high score is registered.\

If the user is not in the database, he is created with is trigram and his high score.\

If the user is yet saved in the database, his high score is updated only if his recent score is greater than the previous high score.

#### Wade

Wade is a framework to develop games in JavaScript. It has a library to create sprites and to manipulate them easily.

### Credits

The images come from wikipedia, imgur, pngtree, pixabay.\
The sounds come from soundbible.\
The documentation and the tutorials for wade come from clockworkchilli.
