import { Box, Typography } from '@mui/material';

const titleBrownStyle = {
  fontWeight: 'bold',
  color: '#785964',
  fontSize: '3rem',
  textTransform: 'uppercase',
  marginTop: '1rem',
};

const titleWhiteStyle = {
  fontWeight: 'bold',
  color: 'white',
  fontSize: '3rem',
  textTransform: 'uppercase',
  marginTop: '1.3rem',
  marginLeft: '-.1rem',
  position: 'absolute',
};
export const HeaderTitle = () => {
  return (
    <Box display="flex" marginLeft="2rem" alignItems="center" gap="1rem">
      <Typography sx={titleBrownStyle}>To-do list</Typography>
      <Typography sx={titleWhiteStyle}>To-do list</Typography>
      <Typography sx={{ fontSize: '3rem', marginTop: '.8rem' }}>✍🏻</Typography>
    </Box>
  );
};
