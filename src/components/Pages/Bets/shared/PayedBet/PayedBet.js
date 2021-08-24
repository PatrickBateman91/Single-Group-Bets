import React, { Fragment } from 'react';
import { BetMessages } from '../../../../Data/Text/BetMessages';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import PropTypes from 'prop-types';
import Spinner from '../../../../shared/Spinners/Spinner/Spinner';
import './index.scss';

const PayedBet = (props) => {
  if (props.full) {
    return (
      <div id="payed-bet-modal" onClick={(e) => props.handlePayModal(e, null)}>
        <div className="payed-bet-holder">
          {props.loading ? (
            <Spinner />
          ) : (
            <Fragment>
              <span className="payed-bet-title">
                {BetMessages.betPayedQuestion}
              </span>
              <div className="payed-bet-button-container">
                <button className="green" onClick={props.handleBetPay}>
                  {InterfaceTexts.confirm}
                </button>
                <button
                  className="red"
                  onClick={(e) => props.handlePayModal(e, null)}
                >
                  {InterfaceTexts.cancel}
                </button>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="payed-bet-container">
        <label htmlFor="payed-checkbox">{BetMessages.betPayed}</label>
        <input
          id="payed-checkbox"
          type="checkbox"
          checked={props.payed}
          onChange={props.handleBetPayed}
        />
      </div>
    );
  }
};

PayedBet.propTypes = {
  full: PropTypes.bool,
  handleBetPayed: PropTypes.func,
  handlePayModal: PropTypes.func,
  loading: PropTypes.func,
  payed: PropTypes.bool
};

export default PayedBet;
