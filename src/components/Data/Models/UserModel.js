import { emailToName } from '../../shared/functions/SimpleFunctions';
import { UserEnums } from '../Enums/UserEnums';

export class UserModel {
    /**
     * Creates guest user
     * @returns {UserModel} Returns newly created guest user
     */
  static createGuest () {
    const guest = new UserModel();
    guest.email = null;
    guest.imageSource = UserModel.getDefaultPicture();
    guest.nickname = null;
    guest.uid = null;
    guest.type = UserEnums.GUEST;

    return guest;
  }

  /**
   *  Creates authenticated user
   * @param {object} firebaseUser Expects firebase user object
   * @returns {UserModel} Returns newly created authenticated user
   */
  static createUser (firebaseUser) {
    const user = new UserModel();
    user.email = firebaseUser.email;
    user.nickname = emailToName(firebaseUser.email);
    user.imageSource = firebaseUser.imageSource;
    user.uid = firebaseUser.uid;
    user.type = UserEnums.USER;

    return user;
  }

  /**
   * Function that returns default profile picture link
   * @returns {string} Returns default profile url string
   */
  static getDefaultPicture () {
    return 'https://cdn.pixabay.com/photo/2018/08/28/12/41/avatar-3637425_960_720.png';
  }

  /**
   * Function that creates fake email for authentication
   * @param {string} person Expects nickname string
   * @returns {string} Returns unique fake email
   */
  static createFakeEmail (person) {
    const cleanSpaces = person.replace(/ /g, '');
    return cleanSpaces + '@nekitamomejl.com';
  }

  /**
   * Function that creates fake password from nickname string
   * @param {string} person Expects nickname string
   * @returns {string} Returns fake password string
   */
  static createFakePassword (person) {
    return person + '123';
  }
}
