import React from 'react';
import { adminCheck } from '../../../../shared/functions/SimpleFunctions';
import { BetStateEnum, BetWinnerEnum } from '../../../../Data/Enums/BetEnums';
import { BetMessages } from '../../../../Data/Text/BetMessages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faInfoCircle,
  faEdit,
  faBalanceScaleRight,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Fragment } from 'react';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import ChangeHistory from '../ChangeHistory/ChangeHistory';
import DifferentStakes from '../DifferentStakes/DifferentStakes';
import SameStakes from '../SameStakes/SameStakes';
import NeutralButton from '../../../../shared/Buttons/NeutralButton/NeutralButton';
import PropTypes from 'prop-types';
import './index.scss';

const RegularBet = (props) => {
  return (
    <Fragment>
      <div className="single-bet-container">
        {props.bet.state === BetStateEnum.FINISHED ? (
          props.bet.winner === BetWinnerEnum.NO_WINNER ? (
            <div className="no-winner-check">
              {BetMessages.betNoWinner}
              <FontAwesomeIcon icon={faTimesCircle} />
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

        <div className="participant-holder">
          {props.bet.differentStakes ? (
            <DifferentStakes
              bet={props.bet}
              handlePayModal={props.handlePayModal}
            />
          ) : (
            <SameStakes bet={props.bet} handlePayModal={props.handlePayModal} />
          )}
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

      {adminCheck(props.user.email) ?
        props.bet.state === BetStateEnum.ACTIVE ?
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
                  icon={faEdit}
                  onClick={() => props.handleEdit(props.bet.id)}
                />
              </div>
            </div>
          )
          : props.bet.state === BetStateEnum.FINISHED && !props.bet.payed && props.bet.winner !== BetWinnerEnum.NO_WINNER ?
            <div className="action-icon-container fx-justify-center">
              <NeutralButton handleClick={props.handlePayModal} payload={props.bet} text={InterfaceTexts.payButton} />
            </div>
            : null :
        <div className="give-space-medium"></div>}
    </Fragment>
  );
};

RegularBet.propTypes = {
  bet: PropTypes.object,
  idx: PropTypes.number,
  handleEdit: PropTypes.func,
  handlePayModal: PropTypes.func,
  handleFinishModal: PropTypes.func,
  numberOfBets: PropTypes.number,
  user: PropTypes.object
};

export default RegularBet;
