import React from 'react';
import { useHistory } from 'react-router-dom';
import { config } from '../../../../config/config';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import '../shared.scss';

const LoginNavigation = () => {
  const routeHistory = useHistory();

  const handleNonAuthNavClick = (type) => {
    routeHistory.push(`${type}`);
  };

  return (
    <div className="auth-navigation-container">
      <div onClick={handleNonAuthNavClick.bind(null, config.routes.login)}>{InterfaceTexts.loginTitle}</div>
      <div onClick={handleNonAuthNavClick.bind(null, config.routes.signUp)}>{InterfaceTexts.registerTitle}</div>
    </div>
  );
};

export default LoginNavigation;
