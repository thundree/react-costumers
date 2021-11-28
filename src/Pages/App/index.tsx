import React from 'react'
import './styles.scss'
//  components
import Header from '../../components/Header'
import Customers from '../../components/Customers'

const App = (): JSX.Element => {
  return (
    <div className="App">
      <Header />
      <Customers />
    </div>
  )
}

export default App
