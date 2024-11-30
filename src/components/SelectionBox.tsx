// src/components/SelectionBox/SelectionBox.tsx

import React from 'react';
import { Box } from '@mui/material';

interface SelectionBoxProps {
  start: { x: number; y: number };
  current: { x: number; y: number };
}

const SelectionBox: React.FC<SelectionBoxProps> = ({ start, current }) => {
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  return (
    <Box
      sx={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        border: '2px dashed #1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        pointerEvents: 'none',
        zIndex: 3, // Ensure it appears above the desks
      }}
    />
  );
};

export default SelectionBox;