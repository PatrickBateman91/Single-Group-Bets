import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const GuestRoute = (props) => {
  let Comp = props.component;
  let user = props.user;
  return <Route {...props} component={(props => {
    return user ?
      <Redirect to='/' />
      :
      <Comp {...props} />;
  })} />;
};

GuestRoute.propTypes = {
  component: PropTypes.elementType,
  user: PropTypes.object
};

export default GuestRoute;

