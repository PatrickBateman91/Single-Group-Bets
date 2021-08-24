import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { config } from '../../../../config/config';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { StatsTexts } from '../../../Data/Text/StatsTexts';
import Profile from '../components/Profile';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import Spinner from '../../../shared/Spinners/Spinner/Spinner';
import './index.scss';

const PublicProfilePage = (props) => {
  let peopleDivs;

  const changeProfile = (nickname) => {
    props.history.push(`${config.routes.profile}/${nickname}`);
    window.scrollTo(0,0);
  };

  if (props.appLoaded) {
    peopleDivs = props.people.map((person) => {
      if (person.toLowerCase() !== props.match.params.nickname.toLowerCase()) {
        return (
          <div
            key={person}
            className="not-chosen"
            onClick={changeProfile.bind(null, person)}
          >
            {person}
          </div>
        );
      } else {return null;}
    });
  }

  return (
    <div className="public-profile-page-container">
      {props.appLoaded ? (
        <Fragment>
          <Profile nickname={props.match.params.nickname} />
          <div className="other-profiles-suggestions-container">
            <div className="other-profiles-title">
              {StatsTexts.otherProfiles}
            </div>
            <div className="other-profiles-body">{peopleDivs}</div>
          </div>
        </Fragment>
      ) : (
        <Spinner />
      )}
      <ReturnButton
        classToDisplay="give-space-top"
        target="/"
        text={InterfaceTexts.mainMenu}
      />
    </div>
  );
};

PublicProfilePage.propTypes = {
  appLoaded: PropTypes.bool,
  history: PropTypes.object,
  match: PropTypes.object,
  people: PropTypes.array
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    rawData: state.bets.rawData,
    people: state.appInformation.people,
    user: state.user,
  };
};

export default connect(mapStateToProps, null)(PublicProfilePage);
