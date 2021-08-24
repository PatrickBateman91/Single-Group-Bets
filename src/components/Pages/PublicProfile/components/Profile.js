import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { config } from '../../../../config/config';
import { calculateBalance } from '../../../shared/functions/SimpleFunctions';
import { StatsTexts } from '../../../Data/Text/StatsTexts';
import { UserModel } from '../../../Data/Models/UserModel';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import './index.scss';

const Profile = (props) => {
  const history = useHistory();
  const [nickname, setNickname] = useState(null);
  const [imageSource, setImageSource] = useState(UserModel.getDefaultPicture());
  const [pageLoaded, setPageLoaded] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const calculateStatistics = useCallback(() => {
    const statisticsObject = calculateBalance(props.rawData, props.people, props.nickname);
    setStatistics(statisticsObject);
    setPageLoaded(true);
  }, [props.rawData, props.people, props.nickname]);

  useEffect(() => {
    if (props.nickname !== nickname) {
      setPageLoaded(false);
      const selectedPerson = props.fullPublicUsers.filter(person => person.nickname.toLowerCase() === props.nickname.toLowerCase())[0];
      if (!selectedPerson) {
        return history.push(config.routes.page404);
      }

      if (!selectedPerson.imageSource || selectedPerson.imageSource === '') {
        setImageSource(UserModel.getDefaultPicture());
      } else {
        setImageSource(selectedPerson.imageSource);
      }

      setNickname(selectedPerson.nickname);
      calculateStatistics();
    }
  }, [nickname,props.fullPublicUsers, props.nickname, calculateStatistics, history]);

  return (
    <div className="public-profile-container">
      {pageLoaded ?    <div className="public-profile-holder" >
        <div className="public-profile-inner-container">
          <div className="public-profile-picture-container">
            <img id="profile-picture" src={imageSource} alt="profile" />
          </div>
          <div className="public-data-container">
            <div className="public-profile-name">{props.nickname}</div>
            <div className="public-info-holder">
              <div className="public-data-item">
                <span>{StatsTexts.totalNumberOfBets}</span>
                <span>{statistics.activeBets + statistics.finishedBets}</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.activeNumberOfBets}</span>
                <span>{statistics.activeBets}</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.finishedNumberOfBets}</span>
                <span>{statistics.finishedBets}</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.numberOfBetsWon}</span>
                <span>{statistics.betsWon}</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.numberOfBetsLost}</span>
                <span>{statistics.betsLost}</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.numberOfBetsDrawn} </span>
                <span>{statistics.betsDrawn}</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.totalBalance}</span>
                <span>
                  <span
                    className={statistics.balance  === 0 ? '' : statistics.balance > 0 ? 'green-text' : 'red-text'}>
                    {statistics.balance > 0 ? '+' : ''}{(statistics.balance).toFixed(2)}
                  </span> KM</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.moneyWon}</span>
                <span>{(statistics.moneyWon).toFixed(2)} KM</span>
              </div>
              <div className="public-data-item">
                <span>{StatsTexts.moneyLost}</span>
                <span>{(statistics.moneyLost).toFixed(2)} KM</span>
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

Profile.propTypes = {
  fullPublicUsers: PropTypes.array,
  nickname: PropTypes.string,
  rawData: PropTypes.array,
  people: PropTypes.array
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

export default connect(mapStateToProps, null)(Profile);
