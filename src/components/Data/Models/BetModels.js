import { BetStateEnum, BetTypeEnum, JointBetEnum } from '../Enums/BetEnums';
import { BetMessages } from '../Text/BetMessages';

export class BetModel {
  /**
   * Function that creates new bet from existing BetModel or raw Bet
   * @param {BetModel | Object} bet Expects existing BetModel or raw bet (from server)
   * @returns {BetModel} Returns newly created BetModel
   */
  static serialize (bet) {
    const betModel = new BetModel();
    betModel.additionalClauses = bet.additionalClauses.map(additionalClause => AdditionalClause.serialize(additionalClause));
    betModel.changes = bet.changes;
    betModel.differentStakes = bet.differentStakes;
    betModel.id = bet.id;
    if (bet.type === BetTypeEnum.JOINT_BET) {
      betModel.participants = JointParticipant.serialize(bet.participants);
    } else {
      betModel.participants = bet.participants.map((participant) => {
        return RegularParticipant.serialize(participant);
      });
    }

    if (bet.state === BetStateEnum.FINISHED) {
      betModel.dateResolved = bet.dateResolved;
      betModel.payed = bet.payed;
      betModel.winner = bet.winner;
    }

    betModel.stake = BetStake.serialize(bet.stake);
    betModel.state = bet.state;
    betModel.subject = bet.subject;
    betModel.timeLimit = TimeLimit.serialize(bet.timeLimit);
    betModel.timestamp = bet.timestamp;
    betModel.type = bet.type;

    return betModel;
  }

  /**
   * Function that returns empty BetModel
   * @param {string} type Expects type of Bet to create: regular or joint
   * @returns {BetModel} Returns BetModel
   */
  static initializeEmpty (type) {
    const betModel = new BetModel();
    betModel.additionalClauses = [AdditionalClause.initializeEmpty()];
    betModel.changes = [];
    betModel.differentStakes = false;
    if (type === BetTypeEnum.JOINT_BET) {
      betModel.participants = JointParticipant.initializeEmpty();
    } else {
      betModel.participants = [
        RegularParticipant.initializeEmpty(),
        RegularParticipant.initializeEmpty(),
      ];
    }
    betModel.stake = BetStake.initializeEmpty(false);
    betModel.state = BetStateEnum.ACTIVE;
    betModel.subject = '';
    betModel.timeLimit = TimeLimit.initializeEmpty();
    betModel.timestamp = null;
    betModel.type = type;
    betModel.winner = '';
    return betModel;
  }

  /**
   * Strips BetModel class and creates regular Object that can be saved in Firebase Firestore
   * @param {BetModel} bet Expects BetModel to strip class from
   * @returns {object} Returns stripped bet object
   */
  static stripForFirebase (bet) {
    const newBet = Object.assign({}, bet);
    delete newBet.id;
    // Strips additional clauses of unnecessary values and leaves only value strings
    newBet.additionalClauses = newBet.additionalClauses.map(clause => clause.value).filter(clause => clause !== '');
     // Class to regular object to upload to firebase
    newBet.stake = Object.assign({}, newBet.stake);
    newBet.timeLimit = Object.assign({}, newBet.timeLimit);

    if (newBet.type === BetTypeEnum.REGULAR_BET) {
      // Remove unnecessary id
      newBet.participants = newBet.participants.map(participant => {
        const participantObject = Object.assign({}, participant);
        participantObject.name = participantObject.name.replace(/ /g, '');

        // Convert string to number if money bet
        if (newBet.stake.moneyBet && newBet.differentStakes) {
          participantObject.singleStake = parseFloat(participantObject.singleStake);
        }

        return participantObject;
      });

       // Convert string to number if money and equal bet
      if (newBet.stake.moneyBet && !newBet.differentStakes) {
        newBet.stake.amount = parseFloat(newBet.stake.amount);
      }
    } else if (newBet.type === BetTypeEnum.JOINT_BET) {
      newBet.participants = Object.assign({}, newBet.participants);
      // If participant has space in name, remove it => NO SPACE ALLOWED IN NICKNAME!
      newBet.participants[JointBetEnum.LEFT].people = newBet.participants[JointBetEnum.LEFT].people.map(person => {
        return person.replace(/ /g, '');
      });

      newBet.participants[JointBetEnum.RIGHT].people = newBet.participants[JointBetEnum.RIGHT].people.map(person => {
      // If participant has space in name, remove it => NO SPACE ALLOWED IN NICKNAME!
        return person.replace(/ /g, '');
      });

      if (newBet.stake.moneyBet) {
        newBet.participants[JointBetEnum.LEFT].bet = parseFloat(newBet.participants[JointBetEnum.LEFT].bet);
        newBet.participants[JointBetEnum.RIGHT].bet = parseFloat(newBet.participants[JointBetEnum.RIGHT].bet);
      }

      if (newBet.participants[JointBetEnum.LEFT].bet !== newBet.participants[JointBetEnum.RIGHT].bet) {
        newBet.differentStakes = true;
      }
    }

    return newBet;
  }

  /**
   * Function that switches stakes for bets with different stakes
   * @param {BetModel} bet Expects bet model
   * @returns {BetModel} Returns BetModel with switched stakes
   */
  static switchDifferentStakes (bet) {
    if (bet.type === BetTypeEnum.REGULAR_BET) {
      const firstParticipantValue = bet.participants[0].singleStake;
      const secondParticipantValue = bet.participants[1].singleStake;
      bet.participants[0].singleStake = secondParticipantValue;
      bet.participants[1].singleStake = firstParticipantValue;

      return bet.participants;
    } else if (bet.type === BetTypeEnum.JOINT_BET) {
      const firstGroupValue = bet.participants[JointBetEnum.LEFT].bet;
      const secondGroupValue = bet.participants[JointBetEnum.RIGHT].bet;
      bet.participants[JointBetEnum.LEFT].bet = secondGroupValue;
      bet.participants[JointBetEnum.RIGHT].bet = firstGroupValue;

      return bet.participants;
    }
  }

  /**
   * Function that validates a bet
   * @returns {Validation} Returns validation object
   */
  validate () {
    // Validate subject
    const validation = new Validation(true, '');
    if (!this.subject && this.subject === '') {
      validation.success = false;
      validation.message = BetMessages.betSubjectError;
      return validation;
    }

    // Validate time limit
    if (this.timeLimit.enabled) {
      if (!this.timeLimit.value || this.timeLimit.value === '') {
        validation.success = false;
        validation.message = BetMessages.betTimeLimitError;
        return validation;
      }
    }

    // Validate regular participants
    if (this.type === BetTypeEnum.REGULAR_BET) {
      for (const participant of this.participants) {
        if (!participant.name || participant.name === '' || !participant.value || participant.value === '') {
          validation.success = false;
          validation.message = BetMessages.betParticipantError;
          return validation;
        }

        if (this.differentStakes && (!participant.singleStake || participant.singleStake === '')) {
          validation.success = false;
          validation.message = BetMessages.betParticipantError;
          return validation;
        }
      }

          // Validate equal stakes
      if (!this.differentStakes) {
        if (this.stake.amount !== 0 && (!this.stake.amount || this.stake.amount === '')) {
          validation.success = false;
          validation.message = BetMessages.betMoneyStakeError;
          return validation;
        }
      }
    } else if (this.type === BetTypeEnum.JOINT_BET) {
      if (this.participants[JointBetEnum.LEFT].value === '' || this.participants[JointBetEnum.LEFT].bet === '') {
        validation.success = false;
        validation.message = BetMessages.betJointBetValuesError;
        return validation;
      }
      if (this.participants[JointBetEnum.RIGHT].value === '' || this.participants[JointBetEnum.RIGHT].bet === '') {
        validation.success = false;
        validation.message = BetMessages.betJointBetValuesError;
        return validation;
      }

      if (this.participants[JointBetEnum.LEFT].people.length < 1 || this.participants[JointBetEnum.RIGHT].people.length < 1) {
        validation.success = false;
        validation.message = BetMessages.betJointBetEmptySideError;
        return validation;
      }
    }

    return validation;
  }
}

export class RegularParticipant {
  /**
   * Function that initializes empty Regular Participant
   * @returns {RegularParticipant} Returns Regular participant with empty values
   */
  static initializeEmpty () {
    const regularParticipant = new RegularParticipant();
    regularParticipant.name = '';
    regularParticipant.value = '';
    regularParticipant.singleStake = '';

    return regularParticipant;
  }

  /**
   * Function that creates new Regular participant from existing regular participant
   * @param {object | RegularParticipant} participant Expects existing RegularParticipantModel or raw participant object
   * @returns {RegularParticipant} returns newly created Regular participant
   */
  static serialize (participant) {
    const regularParticipant = new RegularParticipant();
    regularParticipant.name = participant.name;
    regularParticipant.value = participant.value;
    regularParticipant.singleStake = participant.singleStake ? participant.singleStake : '';
    return regularParticipant;
  }
}

export class JointParticipant {
  /**
   * Function that initializes empty joint participant
   * @returns {JointParticipant} Returns empty Joint participant with empty values
   */
  static initializeEmpty () {
    const jointParticipant = new JointParticipant();
    jointParticipant.left = {
      bet: '',
      people: [],
      value: ''
    };
    jointParticipant.right = {
      bet: '',
      people: [],
      value: ''
    };
    return jointParticipant;
  }

  /**
   * Function that creates Joint participant from existing joint participant
   * @param {JointParticipant | Object} participant Expects either existing JointParticipantModel or raw participant object
   * @returns {JointParticipant} Returns newly created Joint participant
   */
  static serialize (participant) {
    const jointParticipant = new JointParticipant();
    jointParticipant.left = participant.left;
    jointParticipant.right = participant.right;
    return jointParticipant;
  }
}

export class AdditionalClause {
  /**
   * Function that initializes empty Additional clause
   * @returns {AdditionalClause} Returns new Additional clause with empty values
   */
  static initializeEmpty () {
    const additionalClause = new AdditionalClause();
    additionalClause.value = '';

    return additionalClause;
  }

  /**
   * Function that creates Additional clause from existing Additional clause
   * @param {AdditionalClause | Object} clause Expects either existing AdditionalClauseModel or raw clause object
   * @returns {AdditionalClause} Returns newly created Additional clause
   */
  static serialize (clause) {
    const additionalClause = new AdditionalClause();
    if (typeof clause === 'string') {
      additionalClause.value = clause;
    } else if (typeof clause === 'object') {
      additionalClause.value = clause.value;
    }


    return additionalClause;
  }
}

export class TimeLimit {
  /**
   * Function that initializes empty TimeLimit class
   * @returns {TimeLimit} Returns TimeLimit class with empty and false values
   */
  static initializeEmpty () {
    const timeLimit = new TimeLimit();
    timeLimit.enabled = false;
    timeLimit.value = '';
    return timeLimit;
  }

  /**
   * Function that creates new TimeLimit from existing Time limit
   * @param {TimeLimit | Object} existingTimeLimit Expects either existing TimeLimitModel or raw Time limit object
   * @returns  {TimeLimit} Returns newly created Time Limit model
   */
  static serialize (existingTimeLimit) {
    const timeLimit = new TimeLimit();
    timeLimit.enabled = existingTimeLimit.enabled;
    timeLimit.value = existingTimeLimit.value;
    return timeLimit;
  }
}

export class BetStake {
  /**
   * Function that initializes empty BetStake object
   * @param {boolean} moneyBet Expects boolean whether bet is of type money or not
   * @returns {BetStake} Returns newly created BetStakeModel;
   */
  static initializeEmpty (moneyBet) {
    const betStake = new BetStake();
    betStake.moneyBet = moneyBet;
    betStake.amount = '';

    return betStake;
  }

  /**
   * Function that creates new Bet Stake from existing Bet stake
   * @param {BetStake | Object} existingBetStake Expects either existing BetStakeModel or raw bet stake object
   * @returns {BetStake} Returns newly created Bet stake
   */
  static serialize (existingBetStake) {
    const betStake = new BetStake();
    betStake.moneyBet = existingBetStake.moneyBet;
    betStake.amount = existingBetStake.amount;

    return betStake;
  }
}

export class Validation {
  constructor (success, message) {
    this.success = success;
    this.message = message;
  }
}
