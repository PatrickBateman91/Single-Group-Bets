import React, { Component, Fragment } from 'react';
import {AdditionalClause, BetModel, RegularParticipant} from '../../../Data/Models/BetModels';
import { addPublicProfileToFirebase } from '../../../shared/functions/FirebaseFunctions';
import { BetTypeEnum, JointBetEnum } from '../../../Data/Enums/BetEnums';
import { BetMessages } from '../../../Data/Text/BetMessages';
import {connect} from 'react-redux';
import {config} from '../../../../config/config';
import {db, currentTimestamp} from '../../../../config/firebase';
import {DndProvider} from 'react-dnd';
import {emailToName, getDate, refreshApp} from '../../../shared/functions/SimpleFunctions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { NextMenuOptionModel } from '../../../Data/Models/NextMenuOptions';
import { NextMenuEnum } from '../../../Data/Enums/NextMenuEnums';
import { usePreview } from 'react-dnd-preview';
import Backend from 'react-dnd-html5-backend';
import AuthButton from '../../../shared/Buttons/AuthButton/AuthButton';
import DraggableName from '../shared/DnD-Utilities/DraggableName';
import DropInput from '../shared/DnD-Utilities/DropInput';
import JointDroppable from '../shared/DnD-Utilities/JointDroppable';
import NextMenu from '../../../shared/Modals/NextMenu/NextMenu';
import NeutralButton from '../../../shared/Buttons/NeutralButton/NeutralButton';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import Spinner from '../../../shared/Spinners/Spinner/Spinner';
import TouchBackend from 'react-dnd-touch-backend';
import './index.scss';

class AddNewBet extends Component {
  state = {
    bet: BetModel.initializeEmpty(BetTypeEnum.REGULAR_BET),
    error: false,
    errorMessage: '',
    editMode: false,
    editID: null,
    loading: false,
    nextMenuModal: false,
    nextMenuOptions: [
      new NextMenuOptionModel(BetMessages.addNewBet, null, false),
      new NextMenuOptionModel(BetMessages.activeBets, config.routes.activeBets, true),
      new NextMenuOptionModel(InterfaceTexts.mainMenu, config.routes.home, true),
    ],
    newPerson: '',
    options: { enableMouseEvents: true, enableKeyboardEvents: true },
    people: [],
    pageLoaded: false,
  };

  /**
   * Adds new clause to the state
   * @param {InputEvent} event Expects input event to stop propagation
   */
  addNewAdditionalClause = (event) => {
    event.stopPropagation();
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.additionalClauses.push(AdditionalClause.initializeEmpty());
    this.setState({ bet: changedBet });
  };

  /**
   * Adds new participant and sets equal bets to false
   * @param {InputEvent} event Expects input event
   */
  addNewParticipant = (event) => {
    event.stopPropagation();
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.participants.push(RegularParticipant.initializeEmpty());
    // Reset value of single stake which is used when different bets
    changedBet.participants.forEach(
      (participant) => (participant.singleStake = '')
    );
    // Sets different bets by default to false (cannot have different bets for more than 2 participants);
    changedBet.differentStakes = false;
    this.setState({ bet: changedBet });
  };

  /**
   * Adds new person to suggestions
   * @param {InputEvent} event Expects input event to stop propagation
   */
  addNewPerson = (event) => {
    event.stopPropagation();
    let duplicateTest = this.state.people.indexOf(this.state.newPerson);
    if (this.state.newPerson !== '' && duplicateTest === -1) {
      let copyPeople = [...this.state.people];
      copyPeople.push(this.state.newPerson);
      this.setState({newPerson: '', people: copyPeople});
    }
  };

  /**
   * Adds participant's name on suggestion click
   * @param {InputEvent} event Expects input event
   * @param {string} person Expects name string to update participant
   * @param {number} idx Expects index of participant inside participant array
   */
  addSuggestion = (event, person, idx) => {
    event.stopPropagation();
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.participants[idx].name = person;
    this.setState({ bet: changedBet });
  };

  /**
   * Checks whether person exists already in current participants
   * @param {string} person Expects name string of person to check
   * @param {number} type Expects type of bet
   * @returns {boolean} Returns if person already is in current participants
   */
  alreadyExistsCheck = (person, type) => {
    if (type === BetTypeEnum.JOINT_BET) {
      const arrayToSearch = [
        ...this.state.bet.participants[JointBetEnum.LEFT].people,
        ...this.state.bet.participants[JointBetEnum.RIGHT].people,
      ];
      for (const participant of arrayToSearch) {
        if (participant === person) {
          return true;
        }
      }
    } else {
      for (const participant of this.state.bet.participants) {
        if (
          participant.name === person &&
          participant.name !== '' &&
          person !== ''
        ) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Checks if person matches any of the suggestions
   * @param {string} person Expects string person
   * @returns {boolean} Returns if suggestions match
   */
  checkIfSuggestionMatch (person) {
    for (const suggestion of this.state.people) {
      if (person === suggestion) {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates a bet if valid and calls function to save bet to server
   * @param {InputEvent} event Expects input event to prevent default and stop propagation
   */
  createNewBet = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.props.user.email !== config.admin) {
      this.setState({
        error: true,
        errorMessage: BetMessages.betUnauthorizedAdd,
      });
    } else {
      this.setState({ loading: true }, () => {
        const validation = this.state.bet.validate();
        if (validation.success) {
          const newBet = BetModel.stripForFirebase(this.state.bet);

          if (newBet.differentStakes || BetModel.type === BetTypeEnum.JOINT_BET) {
            newBet.participants = BetModel.switchDifferentStakes(newBet);
          }
          if (this.state.editMode) {
            const newChange = {
              name: emailToName(this.props.user.email),
              time: getDate(),
            };
            // Array.push throws error
            newBet.changes = [...newBet.changes, newChange];
          } else {
            newBet.timestamp = currentTimestamp.now();
          }
          this.uploadBetToFirebase(
            this.state.editMode,
            this.state.editID,
            newBet
          );
        } else {
          this.setState({
            error: true,
            errorMessage: validation.message,
            loading: false,
          });
        }
      });
    }
  };

  componentDidMount = () => {
    window.scrollTo(0, 0);
    window.document.body.height = '100%';
    if (this.props.location.state && this.props.appLoaded) {
      this.getAndSetEditValues(this.props.location.state.ID);
    } else if (this.props.appLoaded && !this.state.pageLoaded) {
      this.setState({ people: [...this.props.people], pageLoaded: true });
    }
  };

  componentDidUpdate = () => {
    if (
      this.props.location.state &&
      this.props.appLoaded &&
      !this.state.pageLoaded
    ) {
      this.getAndSetEditValues(this.props.location.state.ID);
    } else if (this.props.appLoaded && !this.state.pageLoaded) {
      this.setState({ people: [...this.props.people], pageLoaded: true });
    }
  };

  /**
   * Adds participant to participant array on drop
   * @param {object} item Item to drop
   * @param {number} type Type of bet
   * @param {number} index Index of element if regular bet, or side if joint bet
   */
  drop = (item, type, index) => {
    if (type === BetTypeEnum.REGULAR_BET) {
      const changedBet = BetModel.serialize(this.state.bet);
      changedBet.participants[index].name = item.name;
      this.setState({ bet: changedBet });
    } else if (type === BetTypeEnum.JOINT_BET) {
      const changedBet = BetModel.serialize(this.state.bet);
      changedBet.participants[index].people.push(item.name);
      this.setState({ bet: changedBet });
    }
  };

  /**
   * Gets values from a bet and sets component for bet edit
   * @param {string} id Expects ID of the bet to get values from
   */
  getAndSetEditValues = (id) => {
    let betToEdit;

    for (const bet of this.props.rawData) {
      if (bet.id === id) {
        betToEdit = BetModel.serialize(bet);

        if (betToEdit.differentStakes || BetModel.type === BetTypeEnum.JOINT_BET) {
          betToEdit.participants = BetModel.switchDifferentStakes(betToEdit);
        }
        break;
      }
    }

    this.setState({
      bet: betToEdit,
      editMode: true,
      editID: id,
      people: [...this.props.people],
      pageLoaded: true,
    });
  };

  /**
   * Saves entered values of new person to state
   * @param {InputEvent} event Expects input event
   */
  handleNewPersonInput = (event) => {
    this.setState({newPerson: event.target.value});
  }

  /**
   * Hides error if any are shown
   * @param {InputEvent} event Expects input event
   */
  hideError = (event) => {
    event.stopPropagation();
    this.setState({ error: false, errorMessage: '' });
  };

  /**
   * Gets called from next menu
   * @param {string} type Expects type whether close or redirect
   * @param {object} option Expects full option object needed to extract link or other info
   * @param {InputEvent} event  Expects input event
   */
  nextMenuCallback = (type, option, event) => {
    event.stopPropagation();
    document.querySelector('body').style.overflowY = 'auto';
    if (type === NextMenuEnum.CLOSE) {
      this.setState({
        bet: BetModel.initializeEmpty(BetTypeEnum.REGULAR_BET),
        editID: null,
        editMode: false,
        nextMenuModal: false,
      });
    } else if (type === NextMenuEnum.REDIRECT) {
      this.props.history.push(option.link);
    }
  };

  /**
   * Removes joint participant by name
   * @param {string} name Expects name to match and remove
   * @param {string} side Expects side of the bet: left/right
   */
  removeJointParticipant = (name, side) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.participants[side].people = changedBet.participants[
      side
    ].people.filter((person) => person !== name);
    this.setState({ bet: changedBet });
  };

  /**
   * Removes clicked additional clause
   * @param {number} index Expects index of clause in state clause array
   * @param {InputEvent} event Expects Input event
   */
  removeAdditionalClause = (index, event) => {
    event.stopPropagation();
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.additionalClauses.splice(index, 1);
    this.setState({ bet: changedBet });
  };

  /**
   * Removes participant from participant's array
   * @param {number} index Expects index of participant in participants array
   * @param {InputEvent} event Expects Input event
   */
  removeParticipant = (index, event) => {
    event.stopPropagation();
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.participants.splice(index, 1);
    this.setState({ bet: changedBet });
  };

  /**
   * Sets value for additional clause
   * @param {number} index Expects index of clause that is being changed
   * @param {InputEvent} event Expects Input event
   */
  setAdditionalClauseValue = (index, event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.additionalClauses[index].value = event.target.value;
    this.setState({ bet: changedBet });
  };

  /**
   * Sets values for participant
   * @param {InputEvent} event Expects input event
   * @param {string} type Expects field string name (name, value or singleStake)
   * @param {number} index Expects participant's index in participants array
   */
  setParticipantFieldValue = (event, type, index) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.participants[index][type] = event.target.value;
    this.setState({ bet: changedBet });
  };

  /**
   * Sets bet amount (for money bets)
   * @param {InputEvent} event Expects input event
   */
  setAmount = (event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.stake.amount = changedBet.stake.moneyBet
      ? parseFloat(event.target.value)
      : event.target.value;
    this.setState({ bet: changedBet });
  };

  /**
   * Sets whether bet has different or same stakes
   * @param {InputEvent} event Expects input event
   */
  setDifferentStakes = (event) => {
    event.stopPropagation();
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.differentStakes = event.target.checked;
    changedBet.participants.forEach(
      (participant) => (participant.singleStake = '')
    );
    changedBet.stake.amount = '';
    this.setState({ bet: changedBet });
  };

  /**
   * Sets joint bet up or resets it back to regular
   * @param {InputEvent} event Expects Input event
   */
  setJointBet = (event) => {
    event.stopPropagation();

    const newJointBet =
      this.state.bet.type === BetTypeEnum.REGULAR_BET ? true : false;
    let changedBet;
    if (newJointBet) {
      changedBet = BetModel.initializeEmpty(BetTypeEnum.JOINT_BET);
    } else {
      changedBet = BetModel.initializeEmpty(BetTypeEnum.REGULAR_BET);
    }

    this.setState({
      bet: changedBet,
      error: false,
      errorMessage: '',
      jointBet: newJointBet,
    });
  };

  /**
   * Sets joint bet field values
   * @param {string} side Expects side string: left/right
   * @param {string} key Expects key of property being updated: value/bet
   * @param {InputEvent} event Expects input event to extract value
   */
  setJointBetFieldValues = (side, key, event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.participants[side][key] = event.target.value;
    this.setState({ bet: changedBet });
  };

  /**
   * Sets bets type to money ON/OFF and resets amount & stake values
   * @param {InputEvent} event Input event
   */
  setMoneyBet = (event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.stake.moneyBet = event.target.checked;
    changedBet.stake.amount = '';

    if (changedBet.type === BetTypeEnum.REGULAR_BET) {
      changedBet.participants.forEach(participant => participant.singleStake = '');
    } else {
      changedBet.participants[JointBetEnum.LEFT].bet = '';
      changedBet.participants[JointBetEnum.RIGHT].bet = '';
    }
    this.setState({ bet: changedBet });
  };

  /**
   * Sets value of Bet Subject
   * @param {InputEvent} event Input event
   */
  setSubject = (event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.subject = event.target.value;
    this.setState({ bet: changedBet });
  };

  /**
   * Sets time limit for bet and resets value
   * @param {InputEvent} event Expects Input event
   */
  setTimeLimitCheck = (event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.timeLimit.enabled = event.target.checked;
    changedBet.timeLimit.value = '';
    this.setState({ bet: changedBet });
  };

/**
 * Sets value for time limit
 * @param {InputEvent} event Expects input event
 */
  setTimeLimitValue = (event) => {
    const changedBet = BetModel.serialize(this.state.bet);
    changedBet.timeLimit.value = event.target.value;
    this.setState({ bet: changedBet });
  };

  /**
   * Uploads valid bet to server and refreshes entire app with new data
   * @param {boolean} editOn Expects boolean whether bet save is new or edited
   * @param {string} editId Expects string ID of the edited bet
   * @param {object} bet Expects stripped bet ready for server
   */
  uploadBetToFirebase = async (editOn, editId, bet) => {
    const newPeople = [];
    if (bet.type === BetTypeEnum.JOINT_BET) {
      const arrayToSearch = [
        ...bet.participants[JointBetEnum.LEFT].people,
        ...bet.participants[JointBetEnum.RIGHT].people,
      ];
      arrayToSearch.forEach((participant) => {
        if (!this.props.people.includes(participant)) {
          newPeople.push(participant);
        }
      });
    } else {
      bet.participants.forEach((participant) => {
        if (!this.props.people.includes(participant.name)) {
          newPeople.push(participant.name);
        }
      });
    }

    try {
      const promiseArray = [];
      if (newPeople.length > 0) {
        newPeople.map((person, index) => {
          let cleanSpaces = person.replace(/ /g, '');
          return addPublicProfileToFirebase(cleanSpaces.toLowerCase(), cleanSpaces, '', this.props.people.length + index);
        });
      }

      if (editOn) {
        promiseArray.push(db.collection('bets').doc(editId).set(bet));
      } else {
        promiseArray.push(db.collection('bets').add(bet));
      }


      Promise.all(promiseArray).then(() => {
        refreshApp(this.props);
        this.setState(
          {
            nextMenuModal: true,
            loading: false,
          },
          () => {
            document.getElementById(
              'next-menu-container'
            ).style.top = `${window.pageYOffset}px`;
            document.querySelector('body').style.overflowY = 'hidden';
          }
        );
      });
    } catch (err) {
      this.setState({ error: true, errorMessage: err.message, loading: false });
    }
  };

  render () {
    let participantsToRender;
    if (this.state.bet.type === BetTypeEnum.JOINT_BET) {
      participantsToRender = (
        <Fragment>
          <div className="joint-bet-container">
            <JointDroppable
              itemOnDrop={this.drop}
              jointSelected={this.state.bet.participants.left.people}
              searchIndex={JointBetEnum.LEFT}
              divId="left-joint-"
              removeJointParticipant={this.removeJointParticipant}
            />
            <JointDroppable
              itemOnDrop={this.drop}
              jointSelected={this.state.bet.participants.right.people}
              searchIndex={JointBetEnum.RIGHT}
              divId="right-joint-"
              removeJointParticipant={this.removeJointParticipant}
            />
          </div>

          <div className="joint-bet-inputs-container">
            <div className="input-joint-side">
              <input
                id="joint-left-side-input1"
                type="text"
                placeholder={InterfaceTexts.leftSideSaysWhat}
                value={this.state.bet.participants.left.value}
                onChange={this.setJointBetFieldValues.bind(
                  this,
                  JointBetEnum.LEFT,
                  'value'
                )}
              />
              <input
                id="joint-left-side-input2"
                type={this.state.bet.stake.moneyBet ? 'number' : 'text'}
                placeholder={InterfaceTexts.leftSideStake}
                value={this.state.bet.participants.left.bet}
                onChange={this.setJointBetFieldValues.bind(
                  this,
                  JointBetEnum.LEFT,
                  'bet'
                )}
              />
            </div>
            <div className="input-joint-side">
              <input
                id="joint-right-side-input1"
                type={this.state.bet.stake.moneyBet ? 'number' : 'text'}
                placeholder={InterfaceTexts.rightSideStake}
                value={this.state.bet.participants.right.bet}
                onChange={this.setJointBetFieldValues.bind(
                  this,
                  JointBetEnum.RIGHT,
                  'bet'
                )}
              />
              <input
                id="joint-right-side-input2"
                type="text"
                placeholder={InterfaceTexts.rightSideSaysWhat}
                value={this.state.bet.participants.right.value}
                onChange={this.setJointBetFieldValues.bind(
                  this,
                  JointBetEnum.RIGHT,
                  'value'
                )}
              />
            </div>
          </div>

          <div className="joint-bet-names-suggestions">
            {this.state.people.map((person) => {
              let check = this.alreadyExistsCheck(
                person,
                BetTypeEnum.JOINT_BET
              );
              if (!check) {
                return (
                  <DraggableName
                    classNameToDisplay="not-chosen"
                    id={`jointBet${person}`}
                    key={person}
                    person={person}
                    itemOnClick={() => false}
                  />
                );
              } else {
                return null;
              }
            })}
          </div>

          <div className="form-line-space">
            <label htmlFor="jointBetAdditionalParticipant">{InterfaceTexts.somebodyElse}</label>
            <div className="new-person-container">
              <input
                type="text"
                placeholder={InterfaceTexts.somebodyElse}
                name="jointBetAdditionalParticipant"
                value={this.state.newPerson}
                onChange={this.handleNewPersonInput}
              />
              <NeutralButton handleClick={this.addNewPerson} text={InterfaceTexts.add}/>
            </div>
          </div>
        </Fragment>
      );
    } else {
      participantsToRender = this.state.bet.participants.map((item, index) => {
        if (this.state.bet.type === BetTypeEnum.JOINT_BET) {
          return null;
        } else {
          return (
            <Fragment key={index}>
              <div className="form-line-center">
                <DropInput
                  classNameToDisplay={`participant-input-name ${
                    this.checkIfSuggestionMatch(item.name)
                      ? 'selected-person'
                      : ''
                  }`}
                  index={index}
                  itemOnDrop={this.drop}
                  itemOnChange={this.setParticipantFieldValue}
                  itemName={item.name}
                  placeholder={InterfaceTexts.name}
                />

                <input
                  type="text"
                  value={item.value}
                  onChange={(e) =>
                    this.setParticipantFieldValue(e, 'value', index)
                  }
                  placeholder={InterfaceTexts.participantsSayWhat}
                />

                <input
                  type={this.state.bet.stake.moneyBet ? 'number' : 'text'}
                  onChange={(e) =>
                    this.setParticipantFieldValue(e, 'singleStake', index)
                  }
                  value={this.state.bet.differentStakes ? item.singleStake : ''}
                  placeholder={
                    this.state.bet.differentStakes
                      ? InterfaceTexts.stake
                      : null
                  }
                  disabled={!this.state.bet.differentStakes}
                />
                {this.state.bet.participants.length > 2 ? (
                  <span
                    className="removeAdditionalParticipant"
                    onClick={this.removeParticipant.bind(this, index)}
                  >
                    x
                  </span>
                ) : null}
              </div>
              {this.state.bet.differentStakes ?
                <div className="different-bet-legend">
                  <FontAwesomeIcon icon={faInfo} />
                  <span>{InterfaceTexts[`differentStakesLegend${index}`]}</span>
                </div> : null}
              {this.state.people.map((person) => {
                let check = this.alreadyExistsCheck(
                  person,
                  BetTypeEnum.REGULAR_BET
                );
                if (!check) {
                  return (
                    <DraggableName
                      classNameToDisplay="not-chosen"
                      index={index}
                      key={person}
                      person={person}
                      itemOnClick={this.addSuggestion}
                    />
                  );
                } else {
                  return null;
                }
              })}
            </Fragment>
          );
        }
      });
    }

    const MyPreview = () => {
      const { display, item, style } = usePreview();
      if (!display) {
        return null;
      }
      return (
        <div className="onDrag" style={style}>
          {item.name}
        </div>
      );
    };

    const isMobile = window.innerWidth < 769 ? true : false;

    return (
      <DndProvider
        backend={isMobile ? TouchBackend : Backend}
        options={this.state.options}
      >
        <MyPreview />
        <div className="main-container">
          <div className="add-new-bet-container">
            {this.state.pageLoaded && !this.state.loading ? (
              <form
                id="addNewBet"
                onSubmit={this.createNewBet}
                onChange={this.hideError}
              >
                <div className="bet-subject">
                  <label htmlFor="newBetSubject">{InterfaceTexts.betTitle}</label>
                  <input
                    type="text"
                    id="newBetSubject"
                    name="newBetSubject"
                    value={this.state.bet.subject}
                    onChange={this.setSubject}
                  />
                </div>

                <div className="between-who-container">{InterfaceTexts.betBetweenWho}</div>

                {participantsToRender}

                <div className="form-line-space">
                  {this.state.bet.type === BetTypeEnum.REGULAR_BET ? (
                    <NeutralButton handleClick={this.addNewParticipant} text={InterfaceTexts.addParticipant}/>
                  ) : null}
                  <NeutralButton handleClick={this.setJointBet} text= {this.state.bet.type === BetTypeEnum.JOINT_BET
                    ? InterfaceTexts.regularBet
                    : InterfaceTexts.jointBet}/>
                </div>
                <div className="form-line-space">
                  <label htmlFor="moneyBetCheck">{InterfaceTexts.moneyBet}</label>
                  <input
                    id="moneyBetCheck"
                    name="moneyBetCheck"
                    checked={this.state.bet.stake.moneyBet}
                    onChange={this.setMoneyBet}
                    type="checkbox"
                  />
                </div>
                {this.state.bet.type === BetTypeEnum.REGULAR_BET &&
                this.state.bet.participants.length < 3 ? (
                    <div className="form-line-space">
                      <label htmlFor="moneyBetEquality">{InterfaceTexts.differentStakes}</label>
                      <input
                        type="checkbox"
                        id="moneyBetEquality"
                        name="moneyBetEquality"
                        checked={this.state.bet.differentStakes}
                        onChange={this.setDifferentStakes}
                      />
                    </div>
                  ) : null}

                <div className="form-line-space">
                  <label htmlFor="timeLimitCheck">
                    {InterfaceTexts.timeLimitCheck}
                  </label>
                  <input
                    type="checkbox"
                    id="timeLimitCheck"
                    name="timeLimitCheck"
                    checked={this.state.bet.timeLimit.enabled}
                    onChange={this.setTimeLimitCheck}
                  />
                </div>

                {this.state.bet.timeLimit.enabled ? (
                  <div className="form-line-space">
                    <label htmlFor="timeLimitValue">{InterfaceTexts.timeLimitValue}</label>
                    <input
                      type="text"
                      id="timeLimitValue"
                      name="timeLimitValue"
                      value={this.state.bet.timeLimit.value}
                      onChange={this.setTimeLimitValue}
                    />
                  </div>
                ) : null}
                {this.state.bet.type === BetTypeEnum.REGULAR_BET ? (
                  !this.state.bet.differentStakes ? (
                    <Fragment>
                      <div className="form-line-space">
                        <label htmlFor="newBetAmount">
                          {this.state.bet.stake.moneyBet ? InterfaceTexts.moneyStake : InterfaceTexts.nonMoneyStake}
                        </label>
                        <input
                          type={
                            this.state.bet.stake.moneyBet ? 'number' : 'text'
                          }
                          id="newBetAmount"
                          name="newBetAmount"
                          value={this.state.bet.stake.amount}
                          onChange={this.setAmount}
                        />
                      </div>
                    </Fragment>
                  ) : null
                ) : null}

                {this.state.bet.additionalClauses.map((item, index) => {
                  return (
                    <div className="form-line-space" key={index}>
                      <label
                        htmlFor={`newBetAdditionalClause${index + 1}`}
                      >{`${InterfaceTexts.additionalClause} ${index + 1}`}</label>
                      <span
                        className="removeAdditionalClause"
                        onClick={this.removeAdditionalClause.bind(this, index)}
                      >
                        x
                      </span>
                      <input
                        type="text"
                        onChange={this.setAdditionalClauseValue.bind(
                          this,
                          index
                        )}
                        value={item.value}
                      />
                    </div>
                  );
                })}
                <NeutralButton handleClick={this.addNewAdditionalClause} text={InterfaceTexts.addAdditionalClause} />
                {this.state.error ? (
                  <div className="error-message give-space">
                    <span>{this.state.errorMessage}</span>
                  </div>
                ) : null}
                <div className="add-new-bet-submit-container">
                  <AuthButton form="addNewBet" type="submit" classToDisplay="give-space" text={this.state.editMode ? InterfaceTexts.editBet : InterfaceTexts.addBet} />
                </div>
              </form>
            ) : (
              <Spinner />
            )}
          </div>
          <ReturnButton
            classToDisplay="return-add-button"
            target={'/'}
            text={InterfaceTexts.mainMenu}
          />
          {this.state.nextMenuModal ? (
            <NextMenu
              message={this.state.editMode ? BetMessages.betEditedSuccessfully : BetMessages.betAddedSuccessfully}
              options={this.state.nextMenuOptions}
              handleClick={this.nextMenuCallback}
            />
          ) : null}
        </div>
      </DndProvider>
    );
  }
}

AddNewBet.propTypes = {
  appLoaded: PropTypes.bool,
  history: PropTypes.object,
  location: PropTypes.object,
  people: PropTypes.array,
  rawData: PropTypes.array,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    rawData: state.bets.rawData,
    people: state.appInformation.people,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAppLoaded: (people) => {
      dispatch({ type: 'appInformation/setAppLoaded', payload: people });
    },
    setBets: (bets) => {
      dispatch({ type: 'bets/setBets', payload: bets });
    },
    setFullPublicUsers: (publicUsers) => {
      dispatch({
        type: 'appInformation/setFullPublicUsers',
        payload: publicUsers,
      });
    },
    setPeople: (people) => {
      dispatch({ type: 'appInformation/setPeople', payload: people });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNewBet);
