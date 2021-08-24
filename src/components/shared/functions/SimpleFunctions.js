import {config} from '../../../config/config';
import { BetWinnerEnum, BetStateEnum, BetTypeEnum, JointBetEnum } from '../../Data/Enums/BetEnums';
import { ErrorEnums } from '../../Data/Enums/ErrorEnums';
import { FirebaseOrderEnums } from '../../Data/Enums/FIrebaseOrderEnums';
import { getBetsFromServer, getPeopleFromServer, firebaseLooper } from './FirebaseFunctions';
import { ServerResponses } from '../../Data/Text/ServerResponses';

/**
 * Checks whether provided email matches admin email
 * @param {string} email Expects email string to compare with admin config
 * @returns {boolean} Returns if user is admin
 */
export const adminCheck = (email) => {
  return email === config.admin;
};

/**
 * Function that gets picture url if amount matches available paper bills
 * @param {number} amount Exoects amount to check
 * @returns {string | null} Returns url string or null
 */
export const choosePicture = (amount) => {
  if (amount === 1) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/jedna-marka.jpg?alt=media&token=dd5c34dd-24f5-426b-a212-02915a6f23d4';
  } else if (amount === 5) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/pet-maraka.jpg?alt=media&token=85a814da-5d49-4599-8869-ac2750bb0847';
  } else if (amount === 10) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/deset-maraka.jpg?alt=media&token=7ab1719b-e0b3-4b3a-8e5c-96f35d3743cb';
  } else if (amount === 20) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/dvadeset-maraka.jpg?alt=media&token=74929460-ec9a-4a2c-832f-7793efc81d77';
  } else if (amount === 50) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/pedeset-maraka.jpg?alt=media&token=a7135acc-5f20-4a1c-a3be-90bf6c9b4dd7';
  } else if (amount === 100) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/sto-maraka.jpg?alt=media&token=4f80d432-9505-47b5-a5d0-9f522f116542';
  } else if (amount === 200) {
    return 'https://firebasestorage.googleapis.com/v0/b/opklade-bdd79.appspot.com/o/dvjesto-maraka.jpg?alt=media&token=1d498e41-b11c-41e0-8495-525ee6a4f33a';
  } else {
    return null;
  }
};

/**
 * Function that calculates balance of a single user
 * @param {array} bets Expects array of bets
 * @param {array} people Expects array of people nicknames
 * @param {string} name Expects a string nickname of a user
 * @returns {object} Returns object with calculations for a single user
 */
export const calculateBalance = (bets, people, name) => {
  let activeBets = 0;
  let finishedBets = 0;
  let betsWon = 0;
  let betsLost = 0;
  let balance = 0;
  let moneyWon = 0;
  let moneyLost = 0;
  let betsDrawn = 0;
  const nickname = people.filter(person => name.toLowerCase() === person.toLowerCase())[0];
  bets.forEach(bet => {
    if (bet.state === BetStateEnum.FINISHED) {
      if (bet.type === BetTypeEnum.JOINT_BET) {
        let userBetTrigger = false;
        let userSide = '';
        if (bet.participants[JointBetEnum.LEFT].people.indexOf(nickname) !== -1) {
          userBetTrigger = true;
          userSide = JointBetEnum.LEFT;
        }
        if (bet.participants[JointBetEnum.RIGHT].people.indexOf(nickname) !== -1) {
          userBetTrigger = true;
          userSide = JointBetEnum.RIGHT;
        }
        if (userBetTrigger) {
          finishedBets++;

          if (bet.winner !== BetWinnerEnum.NO_WINNER) {
            if (bet.winner.indexOf(nickname) !== -1) {
              betsWon++;
              if (bet.stake.moneyBet) {
                if (userSide === JointBetEnum.LEFT) {
                  balance += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                  moneyWon += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                } else if (userSide === JointBetEnum.RIGHT) {
                  balance += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                  moneyWon += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                }
              } else if (!bet.stake.moneyBet) {
                if (userSide === JointBetEnum.LEFT) {
                  if (!isNaN(bet.participants[JointBetEnum.LEFT].bet)) {
                    balance += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                    moneyWon += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                  }
                } else if (userSide === JointBetEnum.RIGHT) {
                  if (!isNaN(bet.participants[JointBetEnum.RIGHT].bet)) {
                    balance += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                    moneyWon += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                  }
                }
              }
            } else {
              betsLost++;
              if (bet.stake.moneyBet) {
                if (userSide === JointBetEnum.LEFT) {
                  balance -= parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                  moneyLost += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                } else if (userSide === JointBetEnum.RIGHT) {
                  balance -= parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                  moneyLost += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                }
              } else if (!bet.stake.moneyBet) {
                if (userSide === JointBetEnum.LEFT) {
                  if (!isNaN(bet.participants[JointBetEnum.RIGHT].bet)) {
                    balance -= parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                    moneyLost += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                  }
                } else if (userSide === JointBetEnum.RIGHT) {
                  if (!isNaN(bet.participants[JointBetEnum.LEFT].bet)) {
                    balance -= parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                    moneyLost += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                  }
                }
              }
            }
          } else {
            betsDrawn++;
          }
        }
      } else {
        let userBetTrigger = false;
        for (let i = 0; i < bet.participants.length; i++) {
          if (bet.participants[i].name === nickname) {
            userBetTrigger = true;
            break;
          }
        }
        if (userBetTrigger) {
          finishedBets++;
          if (bet.winner !== BetWinnerEnum.NO_WINNER) {
            if (bet.differentStakes) {
              if (bet.participants[0].name === nickname) {
                if (nickname === bet.winner) {
                  betsWon++;
                  if (!isNaN(bet.participants[0].singleStake)) {
                    balance += parseFloat(bet.participants[0].singleStake);
                    moneyWon += parseFloat(bet.participants[0].singleStake);
                  }
                } else {
                  betsLost++;
                  if (!isNaN(bet.participants[1].singleStake)) {
                    balance -= parseFloat(bet.participants[1].singleStake);
                    moneyLost += parseFloat(bet.participants[1].singleStake);
                  }
                }
              } else {
                if (nickname === bet.winner) {
                  betsWon++;
                  if (!isNaN(bet.participants[1].singleStake)) {
                    balance += parseFloat(bet.participants[1].singleStake);
                    moneyWon += parseFloat(bet.participants[1].singleStake);
                  }
                } else {
                  betsLost++;
                  if (!isNaN(bet.participants[0].singleStake)) {
                    balance -= parseFloat(bet.participants[0].singleStake);
                    moneyLost += parseFloat(bet.participants[0].singleStake);
                  }
                }
              }
            } else {
              if (bet.stake.moneyBet) {
                if (nickname === bet.winner) {
                  betsWon++;
                  balance += bet.stake.amount * parseFloat((bet.participants.length - 1));
                  moneyWon += bet.stake.amount * parseFloat((bet.participants.length - 1));
                } else {
                  betsLost++;
                  balance -= parseFloat(bet.stake.amount);
                  moneyLost += parseFloat(bet.stake.amount);
                }
              } else {
                if (nickname === bet.winner) {
                  betsWon++;
                } else {
                  betsLost++;
                }
              }
            }
          } else {
            betsDrawn++;
          }

        }
      }

    }

    if (bet.state === BetStateEnum.ACTIVE) {
      if (bet.type === BetTypeEnum.JOINT_BET) {
        let userBetTrigger = false;
        if (bet.participants[JointBetEnum.LEFT].people.indexOf(nickname) !== -1) {
          userBetTrigger = true;
        }
        if (bet.participants[JointBetEnum.RIGHT].people.indexOf(nickname) !== -1) {
          userBetTrigger = true;
        }
        if (userBetTrigger) {
          activeBets++;
        }
      } else {
        let userBetTrigger = false;
        for (let i = 0; i < bet.participants.length; i++) {
          if (bet.participants[i].name === nickname) {
            userBetTrigger = true;
            break;
          }
        }
        if (userBetTrigger) {
          activeBets++;
        }
      }
    }
  });

  return {
    activeBets,
    balance,
    betsWon,
    betsLost,
    finishedBets,
    moneyWon,
    moneyLost,
    betsDrawn
  };
};

/**
 * Function that calculates H2H statistics for two users
 * @param {array} bets Expects array of bets
 * @param {string} personLeft Expects string nickname of person 1
 * @param {string} personRight Expects string nickname of person 2
 * @returns {object} Returns calculation object
 */
export const calculateH2H = (bets, personLeft, personRight) => {
  const statsObject = {
    left: {
      activeBets: 0,
      finishedBets: 0,
      betsWon: 0,
      betsLost: 0,
      betsDrawn: 0,
      bothLost: 0,
      lostTogether: 0,
      moneyWon: 0,
      moneyLost: 0,
      wonTogether: 0
    },
    right: {
      activeBets: 0,
      finishedBets: 0,
      betsWon: 0,
      betsLost: 0,
      betsDrawn: 0,
      bothLost: 0,
      lostTogether: 0,
      moneyWon: 0,
      moneyLost: 0,
      wonTogether: 0
    }
  };

  bets.forEach((bet, index) => {
    if (bet.type === BetTypeEnum.REGULAR_BET) {
      let foundLeft = false;
      let foundRight = false;
      for (const participant of bet.participants) {
        if (participant.name === personLeft) {
          foundLeft = true;
        }

        if (participant.name === personRight) {
          foundRight = true;
        }
      }

      if (foundLeft && foundRight) {
        if (bet.state === BetStateEnum.ACTIVE) {
          statsObject[JointBetEnum.LEFT].activeBets++;
          statsObject[JointBetEnum.RIGHT].activeBets++;
        } else if (bet.state === BetStateEnum.FINISHED) {
          statsObject[JointBetEnum.LEFT].finishedBets++;
          statsObject[JointBetEnum.RIGHT].finishedBets++;

          if (bet.winner === personLeft) {
            statsObject[JointBetEnum.LEFT].betsWon++;
            statsObject[JointBetEnum.RIGHT].betsLost++;

            if (bet.differentStakes) {
              if (bet.participants[0].name === personLeft) {
                if (!isNaN(bet.participants[0].singleStake)) {
                  statsObject[JointBetEnum.LEFT].moneyWon += parseFloat(bet.participants[0].singleStake);
                  statsObject[JointBetEnum.RIGHT].moneyLost += parseFloat(bet.participants[0].singleStake);
                }
              } else {
                if (!isNaN(bet.participants[1].singleStake)) {
                  statsObject[JointBetEnum.LEFT].moneyWon += parseFloat(bet.participants[1].singleStake);
                  statsObject[JointBetEnum.RIGHT].moneyLost += parseFloat(bet.participants[1].singleStake);
                }
              }
            } else {
              if (bet.stake.moneyBet) {
                statsObject[JointBetEnum.LEFT].moneyWon += bet.stake.amount;
                statsObject[JointBetEnum.RIGHT].moneyLost += bet.stake.amount;
              }
            }

          } else if (bet.winner === personRight) {
            statsObject[JointBetEnum.RIGHT].betsWon++;
            statsObject[JointBetEnum.LEFT].betsLost++;

            if (bet.differentStakes) {
              if (bet.participants[0].name === personRight) {
                if (!isNaN(bet.participants[0].singleStake)) {
                  statsObject[JointBetEnum.RIGHT].moneyWon += parseFloat(bet.participants[0].singleStake);
                  statsObject[JointBetEnum.LEFT].moneyLost += parseFloat(bet.participants[0].singleStake);
                }
              } else {
                if (!isNaN(bet.participants[1].singleStake)) {
                  statsObject[JointBetEnum.RIGHT].moneyWon += parseFloat(bet.participants[1].singleStake);
                  statsObject[JointBetEnum.LEFT].moneyLost += parseFloat(bet.participants[1].singleStake);
                }
              }
            } else {
              if (bet.stake.moneyBet) {
                statsObject[JointBetEnum.RIGHT].moneyWon += bet.stake.amount;
                statsObject[JointBetEnum.LEFT].moneyLost += bet.stake.amount;
              }
            }
          } else if (bet.winner === BetWinnerEnum.NO_WINNER) {
            statsObject[JointBetEnum.LEFT].betsDrawn++;
            statsObject[JointBetEnum.RIGHT].betsDrawn++;
          } else {
            statsObject[JointBetEnum.LEFT].bothLost++;
            statsObject[JointBetEnum.RIGHT].bothLost++;
          }
        }
      }

    } else if (bet.type === BetTypeEnum.JOINT_BET) {
      let foundLeft = false;
      let foundRight = false;
      let sameSide = false;
      let noneFound = false;
      for (const jointParticipant of bet.participants[JointBetEnum.LEFT].people) {
        if (jointParticipant === personLeft) {
          foundLeft = true;
        }

        if (jointParticipant === personRight) {
          foundRight = true;
        }
      }
            // If both are found then skip because it's not H2H
      if (foundLeft && foundRight) {
        sameSide = true;
      }
            // If none are found that means that they are either on same side or nonexistent => skip
      if (!foundLeft && !foundRight) {
        noneFound = true;
      }

      for (const jointParticipant of bet.participants[JointBetEnum.RIGHT].people) {
        if (jointParticipant === personLeft) {
          foundLeft = true;
        }

        if (jointParticipant === personRight) {
          foundRight = true;
        }
      }

      if (foundLeft && foundRight && !sameSide && !noneFound) {
        if (bet.state === BetStateEnum.ACTIVE) {
          statsObject[JointBetEnum.LEFT].activeBets++;
          statsObject[JointBetEnum.RIGHT].activeBets++;
        } else if (bet.state === BetStateEnum.FINISHED) {
          statsObject[JointBetEnum.LEFT].finishedBets++;
          statsObject[JointBetEnum.RIGHT].finishedBets++;
          if (bet.winner === BetWinnerEnum.NO_WINNER) {
            statsObject[JointBetEnum.LEFT].betsDrawn++;
            statsObject[JointBetEnum.RIGHT].betsDrawn++;
          } else if (bet.winner.indexOf(personLeft) !== -1) {
            statsObject[JointBetEnum.LEFT].betsWon++;
            statsObject[JointBetEnum.RIGHT].betsLost++;
            if (bet.participants[JointBetEnum.LEFT].people.indexOf(personLeft) !== -1) {
              if (!isNaN(bet.participants[JointBetEnum.LEFT].bet)) {
                statsObject[JointBetEnum.LEFT].moneyWon += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                statsObject[JointBetEnum.RIGHT].moneyLost += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
              }
            } else {

              if (!isNaN(bet.participants[JointBetEnum.RIGHT].bet)) {
                statsObject[JointBetEnum.LEFT].moneyWon += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                statsObject[JointBetEnum.RIGHT].moneyLost += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.LEFT].people.length);
              }
            }
          } else if (bet.winner.indexOf(personRight) !== -1) {
            statsObject[JointBetEnum.RIGHT].betsWon++;
            statsObject[JointBetEnum.LEFT].betsLost++;
            if (bet.participants[JointBetEnum.LEFT].people.indexOf(personRight) !== -1) {
              if (!isNaN(bet.participants[JointBetEnum.LEFT].bet)) {
                statsObject[JointBetEnum.RIGHT].moneyWon += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.LEFT].people.length);
                statsObject[JointBetEnum.LEFT].moneyLost += parseFloat(bet.participants[JointBetEnum.LEFT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
              }
            } else {
              if (!isNaN(bet.participants[JointBetEnum.RIGHT].bet)) {
                statsObject[JointBetEnum.RIGHT].moneyWon += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.RIGHT].people.length);
                statsObject[JointBetEnum.LEFT].moneyLost += parseFloat(bet.participants[JointBetEnum.RIGHT].bet / bet.participants[JointBetEnum.LEFT].people.length);
              }
            }
          }
        }
      } else if (foundLeft && foundRight) {
        if (bet.state === BetStateEnum.FINISHED) {
          if (bet.winner !== BetWinnerEnum.NO_WINNER && bet.winner.indexOf(personLeft) === -1 && bet.winner.indexOf(personRight) === -1) {
            statsObject[JointBetEnum.LEFT].finishedBets++;
            statsObject[JointBetEnum.RIGHT].finishedBets++;
            statsObject[JointBetEnum.LEFT].lostTogether++;
            statsObject[JointBetEnum.RIGHT].lostTogether++;
          } else if (bet.winner !== BetWinnerEnum.NO_WINNER && bet.winner.indexOf(personLeft) !== -1 && bet.winner.indexOf(personRight) !== -1) {
            statsObject[JointBetEnum.LEFT].wonTogether++;
            statsObject[JointBetEnum.RIGHT].wonTogether++;
            statsObject[JointBetEnum.LEFT].finishedBets++;
            statsObject[JointBetEnum.RIGHT].finishedBets++;
          }
        } else if (bet.state === BetStateEnum.ACTIVE) {
          statsObject[JointBetEnum.LEFT].activeBets++;
          statsObject[JointBetEnum.RIGHT].activeBets++;
        }
      }
    }

  });

  return statsObject;
};

/**
 * Compares two string arrays
 * @param {array} array1 First array of strings
 * @param {array} array2 Second array of strings
 * @returns {boolean} Returns if arrays are the same
 */
export const compareArrays = (array1, array2) => {
  let a = [...array1].toString();
  let b = [...array2].toString();

  return a === b;
};

/**
 * Converts fake email to name
 * @param {string} email Email string
 * @returns {string} Returns extracted name
 */
export const emailToName = (email) => {
  let nameCutOff = email.replace('@nekitamomejl.com', '');
  nameCutOff = nameCutOff.split('');
  nameCutOff[0] = nameCutOff[0].toUpperCase();
  nameCutOff = nameCutOff.join('');

  return nameCutOff;
};

/**
 * Filters bets of a single user
 * @param {array} bets array of bets
 * @param {string} user String nickname
 * @param {number} state Expects state of the bet: active or finished
 * @returns {array} Returns array of filtered user bets
 */
export const filterUserBets = (bets, user, state) => {
  let filteredBets = bets.filter(bet => {
    if (bet.state === state) {
      if (bet.type === BetTypeEnum.JOINT_BET) {
        const arrayToSearch = [...bet.participants[JointBetEnum.LEFT].people, ...bet.participants[JointBetEnum.RIGHT].people];
        for (const person of arrayToSearch) {
          if (person.toLowerCase() === user.toLowerCase()) {
            return true;
          }

        }
      } else {
        for (let i = 0; i < bet.participants.length; i++) {
          if (bet.participants[i].name.toLowerCase() === user.toLowerCase()) {
            return true;
          }
        }
      }
    }

    return false;
  });

  return filteredBets;
};

/**
 * Gets order number from person's public profile
 * @param {array} people Array of people profiles
 * @param {string} participant String nickname
 * @returns {number} Returns order number of a given person
 */
export const getOrderNumber = (people, participant) => {
  for (const person of people) {
    if (person.nickname.toLowerCase() === participant.toLowerCase()) {
      return person.order;
    }
  }
};

/**
 * Gets correct translation from error provided error codes
 * @param {object} err Expects error object
 * @returns {string} Returns a translated error message string
 */
export const getTranslatedErrorMessage = (err) => {
  switch (err.code) {
    case ErrorEnums.PASSWORD_NOT_MATCH:
      return ServerResponses.passwordNoMatch;

    case ErrorEnums.WEAK_PASSWORD:
      return ServerResponses.weakPassword;

    case ErrorEnums.ALREADY_EXISTS:
      return ServerResponses.userAlreadyExists;

    case ErrorEnums.INVALID_EMAIL:
      return ServerResponses.nameNotValid;

    case ErrorEnums.NOT_FOUND:
      return ServerResponses.noUserFound;

    case ErrorEnums.TOO_MANY_ATTEMPTS:
      return ServerResponses.tooManyAttempts;

    case ErrorEnums.WRONG_PASSWORD:
      return ServerResponses.wrongPassword;

    default:
      return err.message;
  }
};

/**
 * Refreshes entire app with newest data from server
 * @param {object} props Expects props from a component that calls the function
 */
export const refreshApp = (props) => {
  const promiseArray = [getPeopleFromServer(), getBetsFromServer()];
  Promise.all(promiseArray).then(values => {
    const mappedPublicUsers = values[FirebaseOrderEnums.PUBLIC_PROFILES].docs.map(doc => doc.data());
    mappedPublicUsers.sort((a,b) => a.order - b.order);
    const people = mappedPublicUsers.map(person => person.nickname);
    props.setPeople(people);
    props.setFullPublicUsers(mappedPublicUsers);
    const loopedBets = firebaseLooper(values[FirebaseOrderEnums.BETS]);
    props.setBets(loopedBets);
    if (!props.appLoaded) {
      props.setAppLoaded(true);
    }
  });
};

/**
 * Searches bet subjects for a match
 * @param {array} bets Array of bets
 * @param {string} searchParameter String parameter used to search bets for match
 * @param {number} state State of bets to search: active or finished
 * @returns {array} Returns array of bets that match the search parameter
 */
export const searchBets = (bets, searchParameter, state) => {
  const searchedBets = bets.filter(bet => {
    if (bet.state === state) {
      return bet.subject.toLowerCase().indexOf(searchParameter.toLowerCase()) !== -1;
    }

    return false;
  });
  return searchedBets;
};

/**
 * Converts current date to pretty date string
 * @returns {string} Returns date string in desired, pretty format
 */
export const getDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  let months = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  if (hours < 10) {
    hours = '0' + hours;
  }


  const strTime = `${day}. ${months[month]} ${year}, - ${hours}:${minutes}:${seconds}`;
  return strTime;
};

/**
 * Returns title with correct Bosnian case
 * @param {string} name Name of the user
 * @param {string} type String type of bet to be used in a title: active or finished
 * @returns {string} Returns string in correct Bosnian case if match is found
 */
export const getTitle = (name, type) => {
  switch (name) {
    case 'amko':
      return `Amkove ${type} opklade`;

    case 'zena':
      return `Zenine  ${type} opklade`;

    case 'zlaja':
      return `Zlajine  ${type} opklade`;

    case 'tare':
      return `Sanjine  ${type} opklade`;

    case 'spaha':
      return `Spahine  ${type} opklade`;

    case 'tijana':
      return `Tijanine ${type} opklade`;

    case 'dino':
      return `Dinine  ${type} opklade`;

    case 'niho':
      return `Nihine  ${type} opklade`;

    case 'izo':
      return `Izine  ${type} opklade`;

    case 'selva':
      return `Selvine ${type} opklade`;

    default:
      if (name) {
        return `${name} ${type} opklade`;
      } else {
        return `Sve ${type} opklade`;
      }
  }
};
