import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const NeutralButton = (props) => {
  return (
    <div
      onClick={e => props.handleClick(e, props.payload)}
      className={`neutral-button ${
        props.classToDisplay ? props.classToDisplay : ''
      }`}
    >
      <button type="button">{props.text}</button>
    </div>
  );
};

NeutralButton.propTypes = {
  classToDisplay: PropTypes.string,
  handleClick: PropTypes.func,
  payload: PropTypes.any,
  text: PropTypes.string
};

export default NeutralButton;
