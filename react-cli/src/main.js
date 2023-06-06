import React from 'react'
import ReactDom from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import 'antd/dist/reset.css'

const root = ReactDom.createRoot(document.getElementById('app'))

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
