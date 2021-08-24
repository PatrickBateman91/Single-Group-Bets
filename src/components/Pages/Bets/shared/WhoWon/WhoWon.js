import React from 'react';
import {
  BetWinnerEnum,
  BetTypeEnum,
  JointBetEnum,
} from '../../../../Data/Enums/BetEnums';
import { BetMessages } from '../../../../Data/Text/BetMessages';
import { BetModel } from '../../../../Data/Models/BetModels';
import { compareArrays } from '../../../../shared/functions/SimpleFunctions';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import ConfirmButton  from '../../../../shared/Buttons/ConfirmButton/ConfirmButton';
import PayedBet from '../PayedBet/PayedBet';
import PropTypes from 'prop-types';
import Spinner from '../../../../shared/Spinners/Spinner/Spinner';
import './index.scss';

const WhoWon = (props) => {
  if (props.bet.type === BetTypeEnum.JOINT_BET) {
    return (
      <div id="finish-bet" className={'display-flex'}>
        {props.loading ? <div className="finish-bet-spinner"><Spinner /></div> :
          <div id="finish-bet-clicked" onClick={(e) => e.stopPropagation()}>
            <div className="finish-bet-title">{BetMessages.whoWonQuestion}</div>
            <div className="joint-winners-container">
              <div
                className={`joint-winners ${
                  compareArrays(
                    props.bet.participants[JointBetEnum.LEFT].people,
                    props.winner
                  )
                    ? 'winner-marked'
                    : ''
                }`}
              >
                {props.bet.participants[JointBetEnum.LEFT].people.map((item) => {
                  return (
                    <span
                      className={item.toLowerCase()}
                      key={item}
                      onClick={() =>
                        props.chooseBetWinner(
                          props.bet.participants[JointBetEnum.LEFT].people
                        )
                      }
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
              <div
                className={`joint-winners ${
                  compareArrays(
                    props.bet.participants[JointBetEnum.RIGHT].people,
                    props.winner
                  )
                    ? 'winner-marked'
                    : ''
                }`}
              >
                {props.bet.participants[JointBetEnum.RIGHT].people.map((item) => {
                  return (
                    <span
                      className={item.toLowerCase()}
                      key={item}
                      onClick={() =>
                        props.chooseBetWinner(
                          props.bet.participants[JointBetEnum.RIGHT].people
                        )
                      }
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>

            <div
              className={`no-winner ${
                props.winner === BetWinnerEnum.NO_WINNER ? 'winner-marked' : ''
              }`}
              onClick={() => props.chooseBetWinner(BetWinnerEnum.NO_WINNER)}
            >
              {InterfaceTexts.noWinner}
            </div>
            {props.winner !== BetWinnerEnum.NO_WINNER ? (
              <PayedBet
                full={false}
                payed={props.payed}
                handleBetPayed={props.handleBetPayed}
              />
            ) : null}
            <ConfirmButton handleClick={props.finishBet} payload={props.bet}  text={InterfaceTexts.finishBet}/>
          </div>}
      </div>
    );
  } else {
    return (
      <div id="finish-bet" className="display-flex">
        {props.loading ? <div className="finish-bet-spinner"><Spinner /></div> :  <div id="finish-bet-clicked" onClick={(e) => e.stopPropagation()}>
          <div className="finish-bet-title">{BetMessages.whoWonQuestion}</div>
          <div className="regular-bet-winners">
            {props.bet.participants.map((item) => {
              return (
                <span
                  className={`${item.name.toLowerCase()} ${
                    props.winner === item.name ? 'winner-marked' : ''
                  }`}
                  key={item.name}
                  onClick={() => props.chooseBetWinner(item.name)}
                >
                  {item.name}
                </span>
              );
            })}
          </div>
          <div
            className={`no-winner ${
              props.winner === BetWinnerEnum.NO_WINNER ? 'winner-marked' : ''
            }`}
            onClick={() => props.chooseBetWinner(BetWinnerEnum.NO_WINNER)}
          >
            {InterfaceTexts.noWinner}
          </div>
          {props.winner !== BetWinnerEnum.NO_WINNER ? (
            <PayedBet
              full={false}
              payed={props.payed}
              handleBetPayed={props.handleBetPayed}
            />
          ) : null}
          <ConfirmButton handleClick={props.finishBet} payload={props.bet}  text={InterfaceTexts.finishBet}/>
        </div>}
      </div>
    );
  }
};

WhoWon.propTypes = {
  bet: BetModel,
  chooseBetWinner: PropTypes.func,
  handleBetPayed: PropTypes.func,
  finishBet: PropTypes.func,
  loading: PropTypes.bool,
  payed: PropTypes.bool,
  winner: PropTypes.array || PropTypes.string
};

export default WhoWon;
