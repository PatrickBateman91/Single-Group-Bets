import React, { Fragment } from 'react';
import { config } from '../../../../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { choosePicture } from '../../../../shared/functions/SimpleFunctions';
import { BetStateEnum } from '../../../../Data/Enums/BetEnums';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './index.scss';

const SameStakes = (props) => {
  return (
    <Fragment>
      {props.bet.participants.length > 2 ?  (
        <div className="amount-bet-more-participants">
          {props.bet.stake.moneyBet ? (
            choosePicture(props.bet.stake.amount) !== null ? (
              <img src={choosePicture(props.bet.stake.amount)} alt="slika novca" />
            ) : (
              <span>{props.bet.stake.amount}KM</span>
            )
          ) : (
            <span>{props.bet.stake.amount}</span>
          )}
        </div>
      ) : null }
      {props.bet.participants.map((participant, index) => {
        return (
          <Fragment  key={participant.name + index + participant.value}>
            <div
              className="participant-row"
            >
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
                    <FontAwesomeIcon icon={faCheck}/>
                  </div>
                ) : null
              ) : null}
              <div className="participant-value">
                <span>{participant.value}</span>
              </div>
            </div>

            {props.bet.participants.length === 2 && index === 0 ?
              <div className="amount-bet-two-participants">
                {props.bet.stake.moneyBet ? (
                  choosePicture(props.bet.stake.amount) !== null ? (
                    <img src={choosePicture(props.bet.stake.amount)} alt="slika novca" />
                  ) : (
                    <div>{props.bet.stake.amount}KM</div>
                  )
                ) : (
                  <div>{props.bet.stake.amount}</div>
                )}
              </div> : null}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

SameStakes.propTypes = {
  bet: PropTypes.object
};

export default SameStakes;
