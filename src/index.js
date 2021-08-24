import React from 'react';
import {auth} from './config/firebase';
import {Provider} from 'react-redux';
import App from './App';
import configureStore from './components/store/configureStore';
import ReactDOM from 'react-dom';

// Configures Redux store
const store = configureStore();

// Gets re-rendered on authentication state change
auth.onAuthStateChanged(user => {
  ReactDOM.render(
    <Provider store={store}>
      <App user={user}/>
    </Provider>, document.getElementById('root'));
});
