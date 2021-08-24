export class NextMenuOptionModel {
  constructor (text, link, redirect, callback) {
    this.callback = callback;
    this.link = link;
    this.redirect = redirect;
    this.text = text;
  }
}
