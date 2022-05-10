import { Box, Typography } from '@mui/material';
import { TaskList } from '../TaskList/TaskList';

const boardStyle = {
  margin: '1rem',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: '#f1fffa',
  width: '60vw',
  height: '65vh',
  overflowY: 'scroll',
  padding: '2rem',
  borderRadius: '30px',
  background: '#93b7be',
  boxShadow: '10px 10px 50px #79959a',
};

export const Board: React.FC = () => {
  return (
    <Box sx={boardStyle}>
      <Typography
        sx={{
          alignSelf: 'flex-start',
          color: '#785964',
          marginBottom: '.5rem',
          fontStyle: 'italic',
          fontSize: '1.5rem',
        }}
      >
        My todos
      </Typography>
      <TaskList></TaskList>
    </Box>
  );
};
