import React from 'react'
import ReactDOM from 'react-dom'
import ReactInputVerificationCode from './app'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <ReactInputVerificationCode onChange={console.log} />
  </React.StrictMode>,
  document.getElementById('root'),
)
