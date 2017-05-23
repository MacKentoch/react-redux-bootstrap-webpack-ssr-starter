// @flow weak

/* eslint-disable no-process-env */
import React, {
  PropTypes,
  Component
}                               from 'react';
import {
  Router,
  // hashHistory,
  browserHistory
}                               from 'react-router';
import { Provider }             from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore           from './redux/store/configureStore';

const preloadedState  = window.__PRELOADED_STATE__;
const store           = configureStore(preloadedState);
delete window.__PRELOADED_STATE__;

const syncedHistory   = syncHistoryWithStore(browserHistory, store);


class Root extends Component {
  static propTypes = {
    routes: PropTypes.any
  };

  render() {
    const { routes } = this.props;
    return (
      <Provider store={store}>
        <div>
          <Router history={syncedHistory}>
            {routes()}
          </Router>
        </div>
      </Provider>
    );
  }
}

export default Root;
