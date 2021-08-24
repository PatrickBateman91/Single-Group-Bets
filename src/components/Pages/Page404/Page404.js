import React from 'react';
import { InterfaceTexts } from '../../Data/Text/InterfaceTexts';
import ReturnButton from '../../shared/Buttons/ReturnButton/ReturnButton';
import './index.scss';

const Page404 = () => {
  return (
    <div className="page-404">
      <div className="title-404">404</div>
      <span>{InterfaceTexts.goBack}</span>
      <ReturnButton
        classToDisplay="return-center-button"
        target='/'
        text={InterfaceTexts.mainMenu} />
    </div>
  );
};

export default Page404;
