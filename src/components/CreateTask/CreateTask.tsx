import { InputBase, Box, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TaskInterface } from '../Task/Task';
import { createNewTask } from '../../features/tasks/taskSlice';

const inputStyle = {
  bgcolor: 'rgb(211, 211, 211)',
  width: '80%',
  borderRadius: '.8rem',
  paddingLeft: '.6rem',
};

const inputContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonStyle = {
  fill: 'green',
  ':hover': {
    color: '#ffffff',
  },
};

export const CreateTask = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const todos = useSelector((store: any) => store.todos.list);
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
    <>
      <Box sx={inputContainerStyle}>
        <Button onClick={handleSubmit} style={buttonStyle}>
          <AddCircleOutlineIcon></AddCircleOutlineIcon>
        </Button>

        <form onSubmit={handleSubmit}>
          <InputBase
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Create a new todo..."
            sx={inputStyle}
          ></InputBase>
        </form>
      </Box>
    </>
  );
};
