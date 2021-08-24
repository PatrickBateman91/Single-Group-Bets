import { config } from '../../../../../config/config';
import {InterfaceTexts} from '../../../../Data/Text/InterfaceTexts';

export const menuData = [
  {title: InterfaceTexts.addBet, protected: true, route: config.routes.addNewBet, dynamic: false},
  {title: InterfaceTexts.myProfile, protected: true, route: config.routes.profile, dynamic: true},
  {title: InterfaceTexts.myActiveBets, protected: true, route: config.routes.activeBets, dynamic: true},
  {title: InterfaceTexts.myFinishedBets, protected: true, route: config.routes.finishedBets, dynamic: true},
  {title: InterfaceTexts.allActiveBets, protected: false, route: config.routes.activeBets},
  {title: InterfaceTexts.allFinishedBets, protected: false, route: config.routes.finishedBets},
  {title: InterfaceTexts.stats, protected: false, route: config.routes.stats},
  {title: InterfaceTexts.h2h, protected: false, route: config.routes.h2h},
];
