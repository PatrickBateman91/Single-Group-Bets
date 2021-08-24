import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const PersonStats = (props) => {
  return (
    <Fragment>
      <div className="h2h-stat-item">
        <span>{props.stats.activeBets}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.finishedBets}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.betsWon}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.betsLost}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.betsDrawn}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.wonTogether}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.lostTogether}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{props.stats.bothLost}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{!isNaN(props.stats.moneyWon) ? `${(props.stats.moneyWon).toFixed(2)}` : props.stats.moneyWon}</span>
      </div>
      <div className="h2h-stat-item">
        <span>{!isNaN(props.stats.moneyLost) ? `${(props.stats.moneyLost).toFixed(2)}` : props.stats.moneyLost}</span>
      </div>
    </Fragment>
  );
};

PersonStats.propTypes = {
  stats: PropTypes.object
};

export default PersonStats;
