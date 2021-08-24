import {UserModel} from './UserModel';

export class H2HModel {
  /**
   * Initializes empty H2H Model
   * @returns {H2HModel} Returns empty H2H Model
   */
  static initializeEmpty () {
    return new H2HModel('', '');
  }

  constructor (person) {
    this.nickname = person.nickname;
    if (!person.imageSource || person.imageSource === '') {
      this.imageSource = UserModel.getDefaultPicture();
    } else {
      this.imageSource = person.imageSource;
    }
  }
}
