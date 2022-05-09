import { Box, Typography } from '@mui/material';
import { TaskList } from '../TaskList/TaskList';
import { CreateTask } from '../CreateTask/CreateTask';

const boardStyle = {
  margin: '2rem',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'rgb(245, 241, 241)',
  width: '50%',
  height: '70vh',
};

export const Board = () => {
  return (
    <Box sx={boardStyle}>
      <Typography>Todo List</Typography>
      <CreateTask></CreateTask>
      <TaskList></TaskList>
    </Box>
  );
};
