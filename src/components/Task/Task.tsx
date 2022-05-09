import * as React from 'react';
import ReactDOM from 'react-dom';
import { Box, Checkbox, Typography } from '@mui/material';
import { setTaskAsCompleted } from '../../features/tasks/taskSlice';
import { useDispatch } from 'react-redux';

export interface TaskInterface {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const taskStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: '.5rem',
  width: '95%',
  gap: '3rem',
  borderRadius: '.5rem',
  height: '3rem',
  textAlign: 'left',
};

export const Task = (props: TaskInterface) => {
  const dispatch = useDispatch();
  const handleCheck = (id: any) => {
    console.log('click', id);
    dispatch(setTaskAsCompleted(id));
  };
  return (
    <Box
      sx={taskStyle}
      bgcolor={props.completed ? 'rgb(182, 209, 227)' : 'gainsboro'}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          onClick={(e) => handleCheck(props.id)}
          defaultChecked={props.completed}
        />
        <Typography
          sx={{ textDecoration: props.completed ? 'line-through' : 'none' }}
          color="black"
        >
          {props.title}
        </Typography>
      </Box>
      <Typography fontSize={'.8rem'}>
        [ Created by user {props.userId} ]
      </Typography>
      {props.completed ? (
        <Typography fontStyle="italic" fontSize={'.8rem'}>
          Completed
        </Typography>
      ) : (
        ''
      )}
    </Box>
  );
};
