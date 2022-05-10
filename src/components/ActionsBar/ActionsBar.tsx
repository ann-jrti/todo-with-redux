import { Box, Button, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import { clearCompleted } from '../../features/tasks/taskSlice';
import { setFilterStatus } from '../../features/tasks/filterTaskSlice';
import { filteredTodosSelector } from '../../features/tasks/filterTaskSlice';

const barStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '3rem',
  justifyContent: 'center',
  alignItems: 'center',
  bgcolor: '#785964',
  height: '3rem',
  width: '100vw',
  padding: '1.5rem',
  borderRadius: '5px',
  color: 'white',
  position: 'fixed',
  bottom: '0',
};

const StyledBtn = styled(Button)`
  color: black;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;

  &:hover {
    background-color: #d5c7bc;
    color: #454545;
  }
  &:focus {
    color: #93b7be;
  }
`;

export const ActionsBar: React.FC = () => {
  const todos = useSelector(filteredTodosSelector);
  const dispatch = useDispatch();

  return (
    <Box sx={barStyle}>
      <Typography fontStyle="italic">{todos.length} items left</Typography>
      <Box sx={{ display: 'flex', gap: '.5rem' }}>
        <StyledBtn onClick={() => dispatch(setFilterStatus('none'))}>
          All
        </StyledBtn>
        <StyledBtn onClick={() => dispatch(setFilterStatus('pending'))}>
          Pending
        </StyledBtn>
        <StyledBtn onClick={() => dispatch(setFilterStatus('completed'))}>
          Done
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
