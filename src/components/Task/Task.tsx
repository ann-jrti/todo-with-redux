import * as React from 'react';
import ReactDOM from 'react-dom';
import { Box, Checkbox, Typography } from '@mui/material';
import { setTaskAsCompleted } from '../../features/tasks/taskSlice';
import { useDispatch } from 'react-redux';
import styled from '@emotion/styled';

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
  width: '100%',
  gap: '3rem',
  borderRadius: '.5rem',
  height: '3rem',
  textAlign: 'left',
  color: '#785964',
};

export const Task = (props: TaskInterface) => {
  const dispatch = useDispatch();

  return (
    <Box sx={taskStyle} bgcolor={props.completed ? '#d5c7bc' : '#ecebe4'}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          style={{ color: '#785964' }}
          onClick={() => dispatch(setTaskAsCompleted(props.id))}
          checked={props.completed}
        />
        <Typography
          sx={{ textDecoration: props.completed ? 'line-through' : 'none' }}
          color="#454545"
        >
          {props.title}
        </Typography>
      </Box>
      <Typography fontSize={'.8rem'}>
        [ Created by user {props.userId} ]
      </Typography>
      {props.completed ? (
        <Typography padding=".5rem" fontStyle="italic" fontSize={'.8rem'}>
          Done
        </Typography>
      ) : (
        ''
      )}
    </Box>
  );
};
