import { InputBase, Box } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useState } from 'react';

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
  //   bgcolor: 'rgb(211, 211, 211)',
};

export const CreateTask = () => {
  const [newTask, setNewTask] = useState({});
  return (
    <>
      <Box sx={inputContainerStyle}>
        <AddCircleOutlineIcon
          style={{ fill: 'rgb(53, 54, 144)' }}
        ></AddCircleOutlineIcon>
        <InputBase
          placeholder="Create a new todo..."
          sx={inputStyle}
        ></InputBase>
      </Box>
    </>
  );
};
