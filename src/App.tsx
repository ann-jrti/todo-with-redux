import './App.css';
import { HeaderTitle } from './components/HeaderTitle/CreateTask';
import { CreateTask } from './components/CreateTask/CreateTask';
import { Board } from './components/Board/Board';
import { ActionsBar } from './components/ActionsBar/ActionsBar';

function App() {
  return (
    <div className="App">
      <HeaderTitle></HeaderTitle>
      <CreateTask></CreateTask>
      <Board></Board>
      <ActionsBar></ActionsBar>
    </div>
  );
}

export default App;
