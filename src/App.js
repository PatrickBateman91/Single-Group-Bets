import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { config } from './config/config';
import { useEffect } from 'react';
import { refreshApp } from './components/shared/functions/SimpleFunctions';
import { UserModel } from './components/Data/Models/UserModel';
import ActiveBets from './components/Pages/Bets/ActiveBets/ActiveBets';
import AddNewBet from './components/Pages/Bets/AddNewBet/AddNewBet';
import ChangePasswordPage from './components/Pages/Auth/ChangePassword/ChangePasswordPage';
import ChangeProfilePicture from './components/Pages/Auth/ChangeProfilePicture/ChangeProfilePicture';
import FinishedBets from './components/Pages/Bets/FinishedBets/FinishedBets';
import GuestRoute from './components/Pages/Auth/shared/RouteGuards/GuestRoute';
import Home from './components/Pages/Home/Home';
import H2HPage from './components/Pages/Stats/H2H/H2HPage/H2HPage';
import LoginPage from './components/Pages/Auth/Login/LoginPage';
import LogoutPage from './components/Pages/Auth/Logout/Logout';
import Page404 from './components/Pages/Page404/Page404';
import PropTypes from 'prop-types';
import PrivateRoute from './components/Pages/Auth/shared/RouteGuards/PrivateRoute';
import PublicRoute from './components/Pages/Auth/shared/RouteGuards/PublicRoute';
import PublicProfilePage from './components/Pages/PublicProfile/PublicProfilePage/PublicProfilePage';
import SignUpPage from './components/Pages/Auth/SignUp/SignUpPage';
import Stats from './components/Pages/Stats/Charts/Stats';
import './styles/App.scss';

function App (props) {
  // Initialize app
  useEffect(() => {
    if (!props.appLoaded) {
      refreshApp(props);
    }
  }, [props]);

  // Set user if changed
  useEffect(() => {
    if (props.user) {
      props.updateUser(UserModel.createUser(props.user));
    } else {
      props.updateUser(UserModel.createGuest());
    }
  }, [props]);

  return (
    <div className="main-container">
      <BrowserRouter>
        <Switch>
          <PublicRoute exact path={config.routes.home} component={Home} {...props}></PublicRoute>
          <PublicRoute exact path={config.routes.activeBets} component={ActiveBets} {...props}></PublicRoute>
          <PublicRoute exact path={config.routes.finishedBets} component={FinishedBets} {...props}></PublicRoute>
          <PublicRoute path={config.routes.stats} component={Stats} {...props}></PublicRoute>
          <PublicRoute path={config.routes.h2h} component={H2HPage} {...props}></PublicRoute>

          <Route exact path={`${config.routes.activeBets}/:nickname`} component={ActiveBets} {...props}></Route>
          <Route exact path={`${config.routes.finishedBets}/:nickname`} component={FinishedBets} {...props}></Route>
          <Route path={`${config.routes.profile}/:nickname`} component={PublicProfilePage} {...props}></Route>

          <GuestRoute path={config.routes.login} {...props} component={LoginPage}></GuestRoute>
          <GuestRoute path={config.routes.signUp} {...props} component={SignUpPage}></GuestRoute>

          <PrivateRoute path={config.routes.addNewBet} component={AddNewBet} {...props}></PrivateRoute>
          <PrivateRoute path={config.routes.logout} component={LogoutPage} {...props}></PrivateRoute>
          <PrivateRoute path={config.routes.changePassword} component={ChangePasswordPage} {...props}></PrivateRoute>
          <PrivateRoute path={config.routes.changeProfilePicture} component={ChangeProfilePicture} {...props}></PrivateRoute>

          <PublicRoute path="*" component={Page404}></PublicRoute>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

App.propTypes = {
  appLoaded: PropTypes.bool,
  user: PropTypes.object,
  updateUser: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    appLoaded: state.appInformation.appLoaded,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAppLoaded: loaded => {
      dispatch({ type: 'appInformation/setAppLoaded', payload: loaded });
    },
    setBets: bets => {
      dispatch({ type: 'bets/setBets', payload: bets });
    },
    setFullPublicUsers: publicUsers => {
      dispatch({
        type: 'appInformation/setFullPublicUsers',
        payload: publicUsers,
      });
    },
    setPeople: people => {
      dispatch({ type: 'appInformation/setPeople', payload: people });
    },
    updateUser: userData => {
      dispatch({ type: 'user/updateUser', payload: userData });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
