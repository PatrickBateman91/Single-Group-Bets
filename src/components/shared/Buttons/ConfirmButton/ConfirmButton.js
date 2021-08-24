import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const ConfirmButton = (props) => {
  return (
    <div onClick={e => props.handleClick(e, props.payload)}
      className={`confirm-button ${props.classToDisplay ? props.classToDisplay : ''}`}>
      <button type="button">{props.text}</button>
    </div>
  );
};

ConfirmButton.propTypes = {
  classToDisplay: PropTypes.string,
  handleClick: PropTypes.func,
  payload: PropTypes.any,
  text: PropTypes.string
};

export default ConfirmButton;
