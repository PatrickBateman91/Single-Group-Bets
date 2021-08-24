import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { calculateH2H } from '../../../../shared/functions/SimpleFunctions';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import { H2HModel } from '../../../../Data/Models/H2HModel';
import { JointBetEnum } from '../../../../Data/Enums/BetEnums';
import { StatsTexts } from '../../../../Data/Text/StatsTexts';
import { UserEnums } from '../../../../Data/Enums/UserEnums';
import PersonStats from '../components/PersonStats';
import PropTypes from 'prop-types';
import ReturnButton from '../../../../shared/Buttons/ReturnButton/ReturnButton';
import Spinner from '../../../../shared/Spinners/Spinner/Spinner';
import './index.scss';

const H2HPage = (props) => {
  const middleTitle = {
    activeBets: StatsTexts.activeNumberOfBets,
    finishedBets: StatsTexts.finishedNumberOfBets,
    betsWon: StatsTexts.numberOfBetsWon,
    betsLost: StatsTexts.numberOfBetsLost,
    betsDrawn: StatsTexts.numberOfBetsDrawn,
    bothLost: StatsTexts.bothLost,
    lostTogether: StatsTexts.lostTogether,
    moneyWon: StatsTexts.moneyWon,
    moneyLost: StatsTexts.moneyLost,
    wonTogether: StatsTexts.wonTogether
  };

  const [change, setChange] = useState(false);
  const [leftPerson, setLeftPerson] = useState(H2HModel.initializeEmpty());
  const [rightPerson, setRightPerson] = useState(H2HModel.initializeEmpty());
  const [pageLoaded, setPageLoaded] = useState(false);
  const [statsObject,setStatsObject] = useState(null);

  useEffect(() => {
    if (props.appLoaded && !pageLoaded) {
      if (props.user.type === UserEnums.USER) {
        const filteredPeople = props.people.filter(person => person !== props.user.nickname);
        const leftPerson = props.fullPublicUsers.filter(person => person.nickname === props.user.nickname)[0];
        setLeftPerson(new H2HModel(leftPerson));

        const randomNickname =  filteredPeople[Math.floor(Math.random() * (filteredPeople.length - 1)) + 1];
        const rightPerson = props.fullPublicUsers.filter(person => person.nickname === randomNickname)[0];
        setRightPerson(new H2HModel(rightPerson));
      } else {
        const randomNumber =  Math.floor(Math.random() * (props.people.length - 1)) + 1;
        const leftRandomNickname = props.people[randomNumber];
        const leftPerson = props.fullPublicUsers.filter(person => person.nickname === leftRandomNickname)[0];
        setLeftPerson(new H2HModel(leftPerson));

        const rightRandomNickname = props.people[randomNumber === 0 ? randomNumber + 1 : randomNumber - 1];
        const rightPerson = props.fullPublicUsers.filter(person => person.nickname === rightRandomNickname)[0];
        setRightPerson(new H2HModel(rightPerson));
      }
      setChange(true);
    }
  }, [props.appLoaded, props.fullPublicUsers, props.user, props.people, pageLoaded]);

  useEffect(() => {
    if (change) {
      const statsObject = calculateH2H(props.rawData, leftPerson.nickname, rightPerson.nickname);
      setStatsObject(statsObject);
      setChange(false);

      if (!pageLoaded) {
        setPageLoaded(true);
      }
    }
  }, [change, leftPerson, rightPerson, props.rawData, pageLoaded]);

  const handleSelect = (event, side) => {
    if (side === JointBetEnum.LEFT) {
      const leftPerson = props.fullPublicUsers.filter(person => person.nickname === event.target.value)[0];
      setLeftPerson(new H2HModel(leftPerson));
    } else if (side === JointBetEnum.RIGHT) {
      const rightPerson = props.fullPublicUsers.filter(person => person.nickname === event.target.value)[0];
      setRightPerson(new H2HModel(rightPerson));
    }

    setChange(true);
  };

  return (
    <div className="h2h-container">
      {props.appLoaded && pageLoaded ? (
        <div className="h2h-holder">
          <div className="h2h-title">{StatsTexts.h2hTitle}</div>
          <div className="h2h-select-container">
            <div className="h2h-select-side">
              <div className="h2h-select-item">
                <label htmlFor="peopleLeft">{InterfaceTexts.h2hPerson1}</label>
                <select name="peopleLeft" value={leftPerson.nickname} onChange={e => handleSelect(e, JointBetEnum.LEFT)}>
                  {props.people.map(person => {
                    if (person !== rightPerson.nickname) {
                      return (
                        <option key={person} value={person}>{person}</option>
                      );
                    } else {return null;}
                  })}
                </select>
              </div>
            </div>
            <div className="h2h-select-side">
              <div className="h2h-select-item">
                <label htmlFor="peopleLeft">{InterfaceTexts.h2hPerson2}</label>
                <select name="peopleLeft"  value={rightPerson.nickname} onChange={e => handleSelect(e, JointBetEnum.RIGHT)}>
                  {props.people.map(person => {
                    if (person !== leftPerson.nickname) {
                      return (
                        <option key={person} value={person}>{person}</option>
                      );
                    } else {return null;}
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="h2h-picture-container">
            <div className="h2h-picture-side">
              <div className="public-profile-picture-container">
                <img
                  id="profile-picture"
                  src={leftPerson.imageSource}
                  alt="profile"
                />
              </div>
            </div>
            <div className="h2h-picture-side">
              <div className="public-profile-picture-container">
                <img
                  id="profile-picture"
                  src={rightPerson.imageSource}
                  alt="profile"
                />
              </div>
            </div>
          </div>
          <div className="h2h-body">
            <div className="h2h-side-container">
              <PersonStats stats={statsObject.left} />
            </div>
            <div className="h2h-side-container">
              <div className="empty-middle-div"></div>
              <PersonStats stats={middleTitle} />
            </div>
            <div className="h2h-side-container">

              <PersonStats stats={statsObject.right} />
            </div>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
      <ReturnButton
        classToDisplay="return-center-button"
        target="/"
        text={InterfaceTexts.mainMenu}
      />
    </div>
  );
};

H2HPage.propTypes = {
  appLoaded: PropTypes.bool,
  fullPublicUsers: PropTypes.array,
  people: PropTypes.array,
  rawData: PropTypes.array,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    fullPublicUsers: state.appInformation.fullPublicUsers,
    rawData: state.bets.rawData,
    people: state.appInformation.people,
    user: state.user,
  };
};

export default connect(mapStateToProps, null)(H2HPage);
