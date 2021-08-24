import React from 'react';
import { useHistory } from 'react-router-dom';
import { config } from '../../../../config/config';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';

const SignOutNav = () => {
  const routeHistory = useHistory();

  const handleAuthNavClick = (type) => {
    routeHistory.push(`${type}`);
  };

  return (
    <div className="auth-navigation-container sign-up-order">
      <div onClick={handleAuthNavClick.bind(null, config.routes.changeProfilePicture)}>
        {InterfaceTexts.changeProfilePicture}
      </div>
      <div onClick={handleAuthNavClick.bind(null, config.routes.changePassword)}>
        {InterfaceTexts.changePassword}
      </div>
      <div onClick={handleAuthNavClick.bind(null, config.routes.logout)}>{InterfaceTexts.logout}</div>
    </div>
  );
};

export default SignOutNav;
