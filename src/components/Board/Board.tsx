import { Box } from '@mui/material';
import { TaskList } from '../TaskList/TaskList';
import { CreateTask } from '../CreateTask/CreateTask';

const boardStyle = {
  margin: '1rem',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: '#f1fffa',
  width: 'auto',
  height: '70vh',
  overflowY: 'scroll',
  padding: '2rem',
  borderRadius: '30px',
  background: '#93b7be',
  boxShadow: '25px 25px 60px #79959a',
};

export const Board = () => {
  return (
    <Box sx={boardStyle}>
      <CreateTask></CreateTask>
      <TaskList></TaskList>
    </Box>
  );
};
