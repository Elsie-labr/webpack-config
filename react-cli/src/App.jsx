import React, { Suspense, lazy } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { ConfigProvider, Button } from 'antd'
// import Home from './pages/Home'
// import About from './pages/About'

const Home = lazy(() => import(/* webpackChunkName: 'home' */ './pages/Home'))
const About = lazy(() =>
  import(/* webpackChunkName: 'about' */ './pages/About')
)

function App() {
  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <h1>App</h1>
        <Button type="primary"> 按钮</Button>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>

        <Suspense fallback={<div>loading...</div>}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </ConfigProvider>
    </div>
  )
}

export default App
