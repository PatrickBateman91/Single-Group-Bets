import React from 'react';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NextMenuEnum } from '../../../Data/Enums/NextMenuEnums';
import PropTypes from 'prop-types';
import './index.scss';

const NextMenu = (props) => {
  const optionsDiv = props.options.map(option => {
    return (
      <div
        className="next-menu-option-item"
        key={option.text}
        onClick={option.redirect ? props.handleClick.bind(null, NextMenuEnum.REDIRECT, option) : props.handleClick.bind(null, NextMenuEnum.CLOSE, option)}>
        <span>{option.text}</span>
      </div>
    );
  });
  return (
    <div id="next-menu-container" onClick={props.handleClick.bind(null, NextMenuEnum.CLOSE, null)}>
      <div className="next-menu-holder">
        <div className="next-menu-success-container">
          <span>{props.message}</span>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <div className="next-menu-options-container">
          {optionsDiv}
        </div>
      </div>
    </div>
  );
};

NextMenu.propTypes = {
  handleClick: PropTypes.func,
  message: PropTypes.string,
  options: PropTypes.array
};

export default NextMenu;
