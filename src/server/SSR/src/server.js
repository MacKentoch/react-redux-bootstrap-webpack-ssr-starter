/* eslint no-console:0 */
/* eslint no-process-env:0 */
// @ flow weak

'use strict';

const express       = require('express');
const path          = require('path');
const bodyParser    = require('body-parser');
const helmet        = require('helmet');
const compression   = require('compression');
const PrettyError   = require('pretty-error');
const Promise       = require('bluebird');
const serialize     = require('serialize-javascript');
// const morgan      = require('morgan');

// isomorphic:
import React              from 'react';
import { renderToString } from 'react-dom/server';
import frontRoutes        from '../../../app/routes/Routes';
import moment             from 'moment';
import {
  RouterContext,
  match,
  createMemoryHistory
}                         from 'react-router';
import { Provider }       from 'react-redux';
import {
  syncHistoryWithStore
}                         from 'react-router-redux';
import configureStore     from '../../../app/redux/store/configureStore';


const DOCS_PATH = '../../../../docs';

const app = express();

// not mandatory but better looking console errors
const pe  = new PrettyError();
pe.start();

app.use(helmet());          // ensure app security
app.use(compression());     // gzip compress if bowser supports it
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// if you need logs (note: uncomment line 11 too):
// app.use(morgan('combined'));

app.use('/assets', express.static(path.resolve(__dirname, DOCS_PATH, 'public/assets/')));

// IMPORTANT: '/*' and not '/' 
// since you want browser refresh (= first render) to work from any route of the application
app.get('/*', serverRender);

/** ========================================================
*    error management
======================================================== */
// catch error 404:
app.use(
  (req, res, next) => {
    console.log('req.url: ', req.url);
    const err = new Error('Not found');
    err.status = 404;
    next(err);
  }
);

/* eslint-disable no-unused-vars */
app.use(
  (err, req, res, next) => {
    if (err.status === 404) {
      res.status(404).send('Sorry nothing here for now...');
    }
    console.error(err);
    res.status(500).send('internal server error');
  }
);
/* eslint-enable no-unused-vars */
/* ======================================================= */

app.set('port', 8083);
app.set('ipAdress', 'localhost');

// $FlowIgnore
// launch server:
app.listen(
  app.get('port'),
  app.get('ipAdress'),
  () => console.log(`Production server 🏃 (running) on ${app.get('ipAdress')}:${app.get('port')}`)
);

module.exports = app; // export app just for testing purpose


function serverRender(req, res) {
  const routes        = frontRoutes(); 
  const location      = req.url;
  const memoryHistory = createMemoryHistory(req.path);
  let store           = configureStore();
  const history       = syncHistoryWithStore(memoryHistory, store);

  match(
    {
      history,
      routes,
      location
    }, 
    (err, redirectLocation, renderProps) => {
      if (err) {
        console.error(err);
        return res.status(500).end('Internal server error');
      }
      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }
      if (!renderProps) {
        return res.status(404).end('Not found');
      }

      // just for demo, replace with a "usefull" async. action to feed your state
      return fakeFetch()
        .then(
          ({ info }) => {
            const currentTime   = moment().format();
            const currentState  = store.getState(); 
            const preWarmedState = {
              ...currentState,
              views: {
                ...currentState.views,
                somePropFromServer: info,
                serverTime:         currentTime
              }
            };
            // update store to be preloaded:
            store = configureStore(preWarmedState);
            const preloadedState = serialize(store.getState()); // serialize is better than JSON.stringify

            const InitialView = (
              <Provider store={store}>
                <RouterContext {...renderProps} />
              </Provider>
            );
            const html        = renderToString(InitialView);

            return res
              .status(200)
              .set('content-type', 'text/html')
              .send(renderFullPage(html, preloadedState));
          }
        )
        .catch((error) => res.status(500).end('Internal server error: ', error));
    }
  );
}

function fakeFetch() {
  return new Promise((resolve) => setTimeout(() => resolve({ info: 'whats up?' }), 200));
}

function renderFullPage(html, preloadedState = '') {
  // NOTE:
  // <section id="root">
  //   ${html}
  // </section>
  // will throw warning related to: https://stackoverflow.com/questions/34060968/react-warning-render
  //
  // so write this way to fix: 
  // <section id="root">${html}</section> 
  const indexHtml = {
    template: `
    <!DOCTYPE html>
    <html>
      <head>
        <title>React redux router SSR Starter</title>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="react redux router SSR">
        <meta name="author" content="Erwan DATIN">
        <link href="http://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="/assets/app.styles.css">
      </head>
      <body class="skin-black" style="background-color:#f1f2f7">
        <section id="root"><div>${html}</div></section>
        <script type="text/javascript">window.__PRELOADED_STATE__ = ${preloadedState}</script>
        <script type="text/javascript" src="/assets/app.vendor.bundle.js"></script>
        <script type="text/javascript" src="/assets/app.bundle.js"></script>
      </body>
    </html>
  `
  };
  return indexHtml.template;
}
