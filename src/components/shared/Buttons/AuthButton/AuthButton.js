import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const AuthButton = (props) => {
  return (
    <div className={`auth-button ${props.classToDisplay ? props.classToDisplay : ''}`}>
      <button type="submit" form={props.form}>{props.text}</button>
    </div>
  );
};

AuthButton.propTypes = {
  classToDisplay: PropTypes.string,
  form: PropTypes.string,
  text: PropTypes.string
};

export default AuthButton;
