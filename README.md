# AppMobile-PWA : Retro Shooter

This project was realized by Bourguignon Maxime and Simon Christophe.

## Introduction

For the mobile applications course (AM4L), we had to make a retro shooter. Two choices were possible:

- A native Android App;
- A Progressive Web App.

For challenge and discovery, we opted for the PWA.

## Game

The link to play to our funniest and our most enjoyable retro shooter game: https://retro-shooter-am4l-v2.firebaseapp.com/

### How to play

Tux follow your finger or your mouse (if you play it on a computer).\
To shoot, you must keep your finger (or mouse) down.

After you died, you can save your score and hope to be in the player's top five by setting your trigram on the displayed letters.

### Application principles

The game has four states. the init, the menu, the startGame and the endGame.

<p align="center">
<img src="./diagrams/StateMachine.png">
</p>
<p align="center">State diagram UML</p>

#### init state

This state is a preview page to receive an immersive introduction to the game.
When you click, your go to the next state, the menu state.

#### menu state

This state show the high scores. We load the five highest score in the game's database.
When you're ready, click on the page to play the game on the next sate, the startGame state.

#### startGame state

This state is the playable state.
Enemy pop recursively and shoot at a rate depending your current score.

When you it a enemy or enemy's bullet, you die and go to the endGame state.

#### endGame state

This state is the end state.
You see the score of your game. You need to set your trigram to save to your score in the database.

## Development

### Deployment

### Libraries and dependencies

To develop our PWA retro shooter, we configured a database with firebase and we used a framework to have game's physics called wade.

## Firebase

## Wade

### Credits

the images come from wikipedia, imgur, pngtree, pixabay.\
the sounds come from soundbible.\
the documentation and the tutorials for wade come from clockworkchilli.
