import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import PropTypes from 'prop-types';
import './index.scss';

const ChangeHistory = (props) => {
  return (
    <div className="edit-changes">
      <FontAwesomeIcon icon={faHistory} />
      <div className="edit-change-item">
        <span className="change-title">{InterfaceTexts.changes}</span>
        {props.bet.changes.map(item => {
          return (
            <div className="single-change-item" key={item.time}>
              <span>{item.name}</span>
              <span>{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ChangeHistory.propTypes = {
  bet: PropTypes.object
};

export default ChangeHistory;
