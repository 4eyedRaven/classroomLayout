// src/components/Onboarding/Onboarding.tsx
import React, { useState } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
import useStore from '../store/useStore';

const Onboarding: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [deskCount, setDeskCount] = useState<number>(20);
  const addDesk = useStore((state) => state.addDesk);

  const handleSubmit = () => {
    for (let i = 0; i < deskCount; i++) {
      addDesk();
    }
    setOpen(false);
  };

  return (
    <Modal open={open}>
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2>Welcome to Classroom Layout Manager</h2>
        <TextField
          label="Number of Desks"
          type="number"
          value={deskCount}
          onChange={(e) => setDeskCount(parseInt(e.target.value, 10))}
          fullWidth
          inputProps={{ min: 1 }}
        />
        <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>
          Start
        </Button>
      </Box>
    </Modal>
  );
};

export default Onboarding;