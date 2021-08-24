import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = (props) => {
  let Comp = props.component;
  let user = props.user;

  if (user) {
    return <Route {...props} component={(props => {
      return <Comp  {...props} user={user} />;
    })} />;
  } else {
    return <Route {...props} component={(() => {
      return <Redirect to="/" />;
    })} />;
  }
};

PrivateRoute.propTypes = {
  component: PropTypes.elementType,
  user: PropTypes.object
};

export default PrivateRoute;

