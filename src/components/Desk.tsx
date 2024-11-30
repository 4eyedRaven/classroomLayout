// src/components/Desk/Desk.tsx

import React from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography, styled } from '@mui/material';
import useStore, { Desk } from '../store/useStore';

interface DeskProps {
  desk: Desk;
}

const StyledDesk = styled(Paper)<{ isSelected: boolean; isDragging: boolean; deskWidth: number; deskHeight: number; rotation: number }>(
  ({ isSelected, isDragging, deskWidth, deskHeight, rotation }) => ({
    position: 'absolute',
    width: deskWidth,
    height: deskHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isSelected ? 'move' : 'pointer',
    boxSizing: 'border-box',
    transition: 'border 0.2s, box-shadow 0.2s',
    zIndex: isSelected ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
    transform: `rotate(${rotation}deg)`,
    border: isSelected ? '3px solid #1976d2' : '3px solid transparent',
    boxShadow: isSelected ? '0 0 15px rgba(25, 118, 210, 0.7)' : 'none',
  })
);

const DeskComponent: React.FC<DeskProps> = ({ desk }) => {
  const rotateDesk = useStore((state) => state.rotateDesk);
  const toggleDeskSelection = useStore((state) => state.toggleDeskSelection);

  // Subscribe directly to the selection status of this desk
  const isSelected = useStore((state) => state.selectedDesks.includes(desk.id));

  // Get all selected desks for drag item
  const selectedDesks = useStore((state) => state.selectedDesks);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'DESK',
      item: {
        ids: isSelected ? selectedDesks : [desk.id], // Include all selected desks if this desk is selected
        type: 'DESK',
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [desk.id, isSelected, selectedDesks]
  );

  const handleDoubleClick = () => {
    rotateDesk(desk.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating to parent
    toggleDeskSelection(desk.id);
  };

  // Determine desk dimensions based on rotation
  const isRotated = desk.rotation % 180 !== 0;
  const deskWidth = isRotated ? 50 : 100;
  const deskHeight = isRotated ? 100 : 50;

  console.log(`Rendering Desk ${desk.id}: isSelected = ${isSelected}`);

  return (
    <StyledDesk
      ref={drag}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      isSelected={isSelected}
      isDragging={isDragging}
      deskWidth={deskWidth}
      deskHeight={deskHeight}
      rotation={desk.rotation}
      style={{
        left: desk.position.x,
        top: desk.position.y,
      }}
      elevation={3}
    >
      <Typography variant="body2">
        {desk.type === 'teacher'
          ? 'Teacher'
          : desk.assignedStudent
          ? desk.assignedStudent
          : `Student ${desk.id}`}
      </Typography>
    </StyledDesk>
  );
};

export default DeskComponent;