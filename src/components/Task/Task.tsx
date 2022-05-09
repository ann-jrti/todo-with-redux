import * as React from 'react';
import ReactDOM from 'react-dom';
import { Box, Checkbox, Typography } from '@mui/material';

interface Task {
  user: number;
  id: number;
  title: string;
  completed: boolean;
}

const taskStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '95%',
  gap: '3rem',
  borderRadius: '.5rem',
  height: '3rem',
};

export const Task = (props: Task) => {
  return (
    <Box
      sx={taskStyle}
      bgcolor={props.completed ? 'rgb(182, 209, 227)' : 'gainsboro'}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox defaultChecked={props.completed} />
        <Typography>{props.title}</Typography>
      </Box>
      <Typography fontStyle="italic" fontSize={'.8rem'}>
        Task created by user {props.user}
      </Typography>
    </Box>
  );
};
