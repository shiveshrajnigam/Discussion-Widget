# Discussion Widget

## Contents

- [Description](#description)
- [Demo](#demo)
- [Requirements](#requirements)
- [Installation/Download](#install)
  - [Using Git](#git)
  - [Download ZIP](#zip)
- [Object constructor](#object-constructor)

## Description

18.5KB lightweight, fast & powerful JavaScript widget with zero dependencies. Uses browsers localstorage. Compatible with all web browsers.

## Demo
Working demo: https://shiveshrajnigam.github.io/Discussion-Widget
- Clear localstorage 'discussion' to reset the store.

## Requirements

The JavaScript Templates script has zero dependencies.

## Install

### GIT

Clone the project using HTTPS or SSH.

### ZIP

Downoad the ZIP file and extract the files. 
Double click index.html to open the widget in browser or right click index.html and select browser to open.

## Object Constructor

JavaScript object constructor to use as data for the template:
```js
class node {
  constructor(index, text, vote, reply) {
    this.owner = {
      name: string,
      timestamp: new Date().getTime()
    };
    this.index = index;
    this.text = text;
    this.votes = vote || 0;
    this.reply = reply || [];
  }
}
```
Create new objects for adding subsequent reply and discussion as:
```js
new node(index, text, vote, reply);
