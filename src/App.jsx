import MyPlayground from './components/MyPlayground/MyPlayground'
import ModelTest from './components/ModelTest'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">VR Inventory - Hand Menu Mixed Reality</h1>
      {/* <div style={{ height: '1000px'}}>
        <ModelTest />
      </div> */}
      <MyPlayground />
    </div>
  )
}

export default App
