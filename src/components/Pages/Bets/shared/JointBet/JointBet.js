import React from 'react';
import {
  adminCheck,
  compareArrays,
} from '../../../../shared/functions/SimpleFunctions';
import {
  BetStateEnum,
  BetWinnerEnum,
  JointBetEnum,
} from '../../../../Data/Enums/BetEnums';
import { config } from '../../../../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faInfoCircle,
  faEdit,
  faBalanceScaleRight,
  faCheck,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Fragment } from 'react';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import { Link } from 'react-router-dom';
import ChangeHistory from '../ChangeHistory/ChangeHistory';
import NeutralButton from '../../../../shared/Buttons/NeutralButton/NeutralButton';
import PropTypes from 'prop-types';
import './index.scss';

const JointBet = (props) => {
  return (
    <Fragment>
      <div className="single-bet-container" key={props.bet.id}>
        {props.bet.state === BetStateEnum.FINISHED ? (
          props.bet.winner === BetWinnerEnum.NO_WINNER ? (
            <div className="no-winner-check">
              {InterfaceTexts.noWinner} <FontAwesomeIcon icon={faTimesCircle} />
            </div>
          ) : null
        ) : null}
        <div className="bet-title">
          <span>
            {' '}
            {`${
              props.bet.state === BetStateEnum.FINISHED
                ? props.numberOfBets - props.idx + '. ' + props.bet.subject
                : props.numberOfBets - props.idx + '. ' + props.bet.subject
            }`}
          </span>
        </div>
        {props.bet.state === BetStateEnum.FINISHED ? null : props.bet.timeLimit
          .enabled ? (
            <div className="clock-holder">
              <FontAwesomeIcon icon={faClock} />
              <div className="show-hide-duration">
                {props.bet.timeLimit.value}
              </div>
            </div>
          ) : null}

        <div className="joint-bet-holder">
          <div className={`joint-display-side`}>
            {props.bet.state === BetStateEnum.FINISHED ? (
              compareArrays(
                props.bet.winner,
                props.bet.participants[JointBetEnum.LEFT].people
              ) ? (
                  <div className="joint-finished-winner-left">
                    <FontAwesomeIcon
                      icon={faCheck}
                    />
                  </div>
                ) : null
            ) : null}
            {props.bet.state === BetStateEnum.FINISHED ? (
              compareArrays(
                props.bet.winner,
                props.bet.participants[JointBetEnum.LEFT].people
              ) && props.bet.payed ? (
                  <div className="joint-finished-payed-left">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                ) : null
            ) : null}

            {props.bet.participants[JointBetEnum.LEFT].people.map(
              (name, index) => {
                return (
                  <div className="joint-name-bet" key={name}>
                    <Link
                      to={`${
                        props.bet.state === BetStateEnum.FINISHED
                          ? config.routes.finishedBets
                          : config.routes.activeBets
                      }/${name.toLowerCase()}`}
                    >
                      <span
                        className={`joint-participant-name ${name.toLowerCase()}`}
                      >
                        {name}
                      </span>
                    </Link>
                    {props.bet.stake.moneyBet ? (
                      <span className="joint-bets-bet bet-left">
                        {`${(
                          props.bet.participants[JointBetEnum.LEFT].bet /
                          props.bet.participants[JointBetEnum.LEFT].people
                            .length
                        ).toFixed(2)} KM`}
                      </span>
                    ) : index === 0 ? (
                      <div className="joint-bets-bet bet-left">
                        {`${props.bet.participants[JointBetEnum.LEFT].bet}`}
                        {props.bet.stake.moneyBet
                          ? `${(
                            props.bet.participants[JointBetEnum.LEFT].bet /
                              props.bet.participants[JointBetEnum.LEFT]
                                .participants.length
                          ).toFixed(2)} KM`
                          : null}
                      </div>
                    ) : null}
                  </div>
                );
              }
            )}
          </div>
          <div className={`joint-display-side`}>
            {props.bet.state === BetStateEnum.FINISHED ? (
              compareArrays(
                props.bet.winner,
                props.bet.participants[JointBetEnum.RIGHT].people
              ) ? (
                  <div className="joint-finished-winner-right">
                    <FontAwesomeIcon
                      icon={faCheck}
                    />
                  </div>
                ) : null
            ) : null}
            {props.bet.state === BetStateEnum.FINISHED ? (
              compareArrays(
                props.bet.winner,
                props.bet.participants[JointBetEnum.RIGHT].people
              ) && props.bet.payed ? (
                  <div className="joint-finished-payed-right">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                ) : null
            ) : null}
            {props.bet.participants[JointBetEnum.RIGHT].people.map(
              (name, index) => {
                return (
                  <div className="joint-name-bet" key={name}>
                    {props.bet.stake.moneyBet ? (
                      <span className="joint-bets-bet bet-right">
                        {`${(
                          props.bet.participants[JointBetEnum.RIGHT].bet /
                          props.bet.participants[JointBetEnum.RIGHT].people
                            .length
                        ).toFixed(2)} KM`}
                      </span>
                    ) : index === 0 ? (
                      <span className="joint-bets-bet bet-right">
                        {`${props.bet.participants[JointBetEnum.RIGHT].bet}`}
                        {props.bet.stake.moneyBet
                          ? `${(
                            props.bet.participants[JointBetEnum.RIGHT].bet /
                              props.bet.participants[JointBetEnum.RIGHT].people
                                .length
                          ).toFixed(2)} KM`
                          : null}
                      </span>
                    ) : (
                      <span className="bet-right"></span>
                    )}

                    <Link
                      to={`${
                        props.bet.state === BetStateEnum.FINISHED
                          ? config.routes.finishedBets
                          : config.routes.activeBets
                      }/${name.toLowerCase()}`}
                    >
                      <span
                        className={`joint-participant-name ${name.toLowerCase()}`}
                      >
                        {name}
                      </span>
                    </Link>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="joint-bet-answers-container">
          <div className="participant-value">
            <span>{props.bet.participants[JointBetEnum.LEFT].value}</span>
          </div>
          <div className="participant-value">
            <span>{props.bet.participants[JointBetEnum.RIGHT].value}</span>
          </div>
        </div>

        {props.bet.additionalClauses.length > 0
          ? props.bet.additionalClauses.map((clause, index) => {
            return (
              <div key={index} className="additional-clauses-container">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>{clause.value}</span>
              </div>
            );
          })
          : null}
        {props.bet.changes.length > 0 ? (
          <ChangeHistory bet={props.bet} />
        ) : null}
      </div>

      {adminCheck(props.user.email) ? props.bet.state === BetStateEnum.ACTIVE ?
        (
          <div className="action-icon-container fx-justify-between">
            <div className="finish-bet-container">
              <FontAwesomeIcon
                icon={faBalanceScaleRight}
                onClick={props.handleFinishModal.bind(null, props.bet)}
              />
            </div>

            <div className="edit-bet-container">
              <FontAwesomeIcon
                onClick={() => props.handleEdit(props.bet.id)}
                icon={faEdit}
              />
            </div>
          </div>
        ) :
        props.bet.state === BetStateEnum.FINISHED && !props.bet.payed && props.bet.winner !== BetWinnerEnum.NO_WINNER ?
          <div className="action-icon-container fx-justify-center">
            <NeutralButton handleClick={props.handlePayModal} payload={props.bet} text={InterfaceTexts.payButton} />
          </div>
          : null
        : <div className="give-space-medium"></div>}
    </Fragment>
  );
};

JointBet.propTypes = {
  bet: PropTypes.object,
  idx: PropTypes.number,
  handleEdit: PropTypes.func,
  handleFinishModal: PropTypes.func,
  handlePayModal: PropTypes.func,
  numberOfBets: PropTypes.number,
  user: PropTypes.object
};

export default JointBet;
