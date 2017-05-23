// @flow weak

import React from 'react';
import {
  Route,
  IndexRoute
 }                              from 'react-router';
import {
   isBrowserSide
 }                              from '../services/universal.js';
import {
  App,
  ConnectedHome,
  ConnectedAbout
}                               from '../containers';
import {
  PageNotFound
}                               from '../views';

const Routes = () => {
  return (
    <Route path="/" component={App} >
      <IndexRoute component={ConnectedHome} onEnter={scrollToTop} />
      <Route path="/about" component={ConnectedAbout} onEnter={scrollToTop} />
      <Route path="*" component={PageNotFound} onEnter={scrollToTop} />
    </Route>
  );
};

function scrollToTop() {
  if (isBrowserSide()) {
    window.scrollTo(0, 0);
  }
}

export default Routes;
