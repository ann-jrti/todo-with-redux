import { InputBase, Box, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TaskInterface } from '../Task/Task';
import { createNewTask } from '../../features/tasks/taskSlice';

const inputStyle = {
  bgcolor: '#ecebe4',
  width: '30vw',
  borderRadius: '.8rem',
  paddingLeft: '.6rem',
  margin: '1rem 0',
};

const inputContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '50vw',
};

const buttonStyle = {
  border: 'none',
  color: '#ecebe4',
  marginRight: '-.5rem',
};

export const CreateTask: React.FC = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newTask: TaskInterface = {
      userId: 11,
      id: Math.random(),
      title: newTaskTitle,
      completed: false,
    };
    dispatch(createNewTask(newTask));
  };
  return (
    <Box sx={inputContainer}>
      <Box>
        <Button onClick={handleSubmit} sx={buttonStyle}>
          <AddCircleOutlineIcon fontSize="large"></AddCircleOutlineIcon>
        </Button>
      </Box>

      <Box>
        <form onSubmit={handleSubmit}>
          <InputBase
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new to-do..."
            sx={inputStyle}
          ></InputBase>
        </form>
      </Box>
    </Box>
  );
};
