import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './Sidebar';
import Canvas from './Canvas';

ReactDOM.render(
  <React.StrictMode>
    <Sidebar /><Canvas />
  </React.StrictMode>,
  document.getElementById('root')
);
