import { Box, Button, Typography } from '@mui/material';
import styled from '@emotion/styled';

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
  return (
    <Box sx={barStyle}>
      <StyledBtn>4 items left</StyledBtn>
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <StyledBtn>All</StyledBtn>
        <StyledBtn>Active</StyledBtn>
        <StyledBtn>Completed</StyledBtn>
      </Box>

      <Box>
        <StyledBtn>Clear Completed</StyledBtn>
      </Box>
    </Box>
  );
};
