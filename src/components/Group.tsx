// src/components/Group/Group.tsx
import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Group as GroupType } from '../store/useStore';

interface GroupProps {
  group: GroupType;
  children: React.ReactNode;
}

const GroupComponent: React.FC<GroupProps> = ({ group, children }) => {
  return (
    <Paper
      style={{
        position: 'absolute',
        left: group.position?.x || 0, // Assuming Group has position if needed
        top: group.position?.y || 0,
        padding: 10,
        border: '2px dashed #ccc',
      }}
      elevation={1}
    >
      <Typography variant="subtitle1">{group.label}</Typography>
      {children}
    </Paper>
  );
};

export default GroupComponent;