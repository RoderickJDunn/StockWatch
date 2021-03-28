import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import StockWatchScreen from "./src/StockWatchScreen";

import './App.global.scss';

export default function App() {
  return (<StockWatchScreen/>);
//   return (
//     <Router>
//       <Switch>
//         <Route path="/" component={StockWatchScreen} />
//       </Switch>
//     </Router>
//   );
}
