import './App.css';
import { Board } from './components/Board/Board';
import { ActionsBar } from './components/ActionsBar/ActionsBar';
import { Typography } from '@mui/material';
function App() {
  const titleStyle = {
    fontWeight: 'bold',
    color: '#785964',
    fontSize: '3rem',

    textTransform: 'uppercase',
    marginTop: '1rem',
  };

  const titleStylev2 = {
    fontWeight: 'bold',
    color: 'white',
    fontSize: '3rem',
    textTransform: 'uppercase',
    marginTop: '1.2rem',
    marginRight: '.3rem',
    position: 'absolute',
  };

  return (
    <div className="App">
      <Typography sx={titleStyle}>Todo list ✍🏻</Typography>
      <Typography sx={titleStylev2}>Todo list ✍🏻</Typography>
      <Board></Board>
      <ActionsBar></ActionsBar>
    </div>
  );
}

export default App;
