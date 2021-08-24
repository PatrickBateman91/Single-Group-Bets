import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const PublicRoute = (props) => {
  let Comp = props.component;
  return <Route {...props} component={(routeProps => <Comp {...routeProps} />
  )} />;
};

PublicRoute.propTypes = {
  component: PropTypes.elementType
};

export default PublicRoute;

