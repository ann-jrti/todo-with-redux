import { Box, Button, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import { clearCompleted } from '../../features/tasks/taskSlice';
import { TaskInterface } from '../Task/Task';
import { setFilterStatus } from '../../features/tasks/filterTaskSlice';
import { filteredTodosSelector } from '../../features/tasks/filterTaskSlice';

const barStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '3rem',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'flex-end',
};

const StyledBtn = styled(Button)`
  color: black;
  font-weight: bold;
  font-size: 0.8rem;

  &:hover {
    background-color: blue;
    color: white;
  }
  &:focus {
    color: red;
  }
`;

export const ActionsBar = () => {
  const todos = useSelector(filteredTodosSelector);
  const dispatch = useDispatch();

  return (
    <Box sx={barStyle}>
      <Typography>{todos.length} items left</Typography>
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <StyledBtn onClick={() => dispatch(setFilterStatus('none'))}>
          All
        </StyledBtn>
        <StyledBtn onClick={() => dispatch(setFilterStatus('pending'))}>
          Pending
        </StyledBtn>
        <StyledBtn onClick={() => dispatch(setFilterStatus('completed'))}>
          Completed
        </StyledBtn>
      </Box>

      <Box>
        <StyledBtn onClick={() => dispatch(clearCompleted())}>
          Clear Completed
        </StyledBtn>
      </Box>
    </Box>
  );
};
