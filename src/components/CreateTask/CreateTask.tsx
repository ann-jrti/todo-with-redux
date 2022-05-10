import { InputBase, Box, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TaskInterface } from '../Task/Task';
import { createNewTask } from '../../features/tasks/taskSlice';

const inputStyle = {
  bgcolor: '#ecebe4',
  width: 'auto',
  borderRadius: '.8rem',
  paddingLeft: '.6rem',
  marginBottom: '1rem',
};

const inputContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonStyle = {
  border: 'none',
  color: '#785964',
  marginRight: '-1rem',
};

export const CreateTask = () => {
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
      <Box marginBottom="15px">
        <Button onClick={handleSubmit} sx={buttonStyle}>
          <AddCircleOutlineIcon></AddCircleOutlineIcon>
        </Button>
      </Box>

      <Box>
        <form onSubmit={handleSubmit}>
          <InputBase
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new todo..."
            sx={inputStyle}
          ></InputBase>
        </form>
      </Box>
    </Box>
  );
};
