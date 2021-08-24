import {combineReducers} from 'redux';
import userReducer from './userSlice';
import betsReducer from './betsSlice';
import appInformationReducer from './appInformationSlice';

const rootReducer = combineReducers({
  appInformation: appInformationReducer,
  bets: betsReducer,
  user: userReducer
});

export default rootReducer;
