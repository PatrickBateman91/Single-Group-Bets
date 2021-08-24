import React, { Fragment } from 'react';
import { config } from '../../../../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { BetStateEnum } from '../../../../Data/Enums/BetEnums';
import PropTypes from 'prop-types';
import './index.scss';

const DifferentStakes = (props) => {
  return (
    <Fragment>
      <div className="different-stakes-container">
        <div className="amount-bet-different-stakes">
          {props.bet.participants.map((participant) => {
            return (
              <div
                className="different-bet-stake"
                key={participant.singleStake}
              >
                {!isNaN(participant.singleStake)
                  ? `${participant.singleStake}KM`
                  : participant.singleStake}
              </div>
            );
          })}
        </div>
      </div>
      {props.bet.participants.map((participant) => {
        return (
          <div className="participant-row" key={participant.name}>
            <Link
              to={`${
                props.bet.state === BetStateEnum.FINISHED
                  ? config.routes.finishedBets
                  : config.routes.activeBets
              }/${participant.name.toLowerCase()}`}
            >
              <div
                className={`participant-name ${participant.name.toLowerCase()}`}
              >
                {participant.name}
              </div>
            </Link>
            {props.bet.state === BetStateEnum.FINISHED ? (
              participant.name === props.bet.winner ? (
                <div className="winner-check">
                  <FontAwesomeIcon
                    icon={faCheck}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : null
            ) : null}
            {props.bet.state === BetStateEnum.FINISHED ? (
              participant.name === props.bet.winner && props.bet.payed ? (
                <div className="winner-payed">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              ) : null
            ) : null}
            <div className="participant-value">
              <span>{participant.value}</span>
            </div>
            {props.bet.participants.length > 2 ? (
              <div className="participant-different-multiple-stake">
                <span>{participant.singleStake}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </Fragment>
  );
};

DifferentStakes.propTypes = {
  bet: PropTypes.object
};

export default DifferentStakes;
