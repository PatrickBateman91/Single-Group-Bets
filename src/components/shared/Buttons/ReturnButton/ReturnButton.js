import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './index.scss';

const ReturnButton = (props) => {

  return (
    <div className={`return-button ${props.classToDisplay ? props.classToDisplay : ''}`}>
      <Link to={props.target}>
        {props.text}
      </Link>
    </div>
  );
};

ReturnButton.propTypes = {
  classToDisplay: PropTypes.string,
  target: PropTypes.string,
  text: PropTypes.string
};

export default ReturnButton;
