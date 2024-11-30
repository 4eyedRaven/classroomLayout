// src/App.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import Toolbar from './components/Toolbar';
import Desk from './components/Desk';
import useStore from './store/useStore';
import Onboarding from './components/Onboarding';
import StudentAssignment from './components/StudentAssignment';
import { useDrop } from 'react-dnd';
import SelectionBox from './components/SelectionBox';

const App: React.FC = () => {
  const desks = useStore((state) => state.desks);
  const initializeLayouts = useStore((state) => state.initializeLayouts);
  const clearSelection = useStore((state) => state.clearSelection);
  const updateDesk = useStore((state) => state.updateDesk);
  const setSelectedDesks = useStore((state) => state.setSelectedDesks);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const justSelectedRef = useRef(false);

  // State for rectangular selection
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isDraggingOrSelecting, setIsDraggingOrSelecting] = useState<boolean>(false);

  useEffect(() => {
    initializeLayouts();
  }, [initializeLayouts]);

  const handleBackgroundClick = () => {
    if (justSelectedRef.current) {
      // A selection just occurred; don't clear the selection
      return;
    }

    clearSelection();
  };

  const gridSize = 25; // Updated grid size

  const snapToGrid = (x: number, y: number): { x: number; y: number } => {
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    return { x: snappedX, y: snappedY };
  };

  const [, drop] = useDrop({
    accept: 'DESK',
    drop: (item: { ids: string[] }, monitor) => {
      if (!containerRef.current) return;

      const delta = monitor.getDifferenceFromInitialOffset();

      if (!delta) return;

      const snappedDelta = {
        x: Math.round(delta.x / gridSize) * gridSize,
        y: Math.round(delta.y / gridSize) * gridSize,
      };

      item.ids.forEach((id) => {
        const desk = desks.find((desk) => desk.id === id);
        if (desk) {
          updateDesk({
            ...desk,
            position: {
              x: desk.position.x + snappedDelta.x,
              y: desk.position.y + snappedDelta.y,
            },
          });
        }
      });
    },
  });

  // Mouse event handlers for rectangular selection
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate selection if not clicking on a desk
    if (e.target === containerRef.current) {
      const { x, y } = convertToContainerCoords(e.clientX, e.clientY);
      setSelectionStart({ x, y });
      setSelectionCurrent({ x, y });
      setIsSelecting(true);
      setIsDraggingOrSelecting(true);
      clearSelection();
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isSelecting && selectionStart) {
        const { x, y } = convertToContainerCoords(e.clientX, e.clientY);
        setSelectionCurrent({ x, y });
      }
    },
    [isSelecting, selectionStart]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isSelecting && selectionStart && selectionCurrent && containerRef.current) {
        const x1 = Math.min(selectionStart.x, selectionCurrent.x);
        const y1 = Math.min(selectionStart.y, selectionCurrent.y);
        const x2 = Math.max(selectionStart.x, selectionCurrent.x);
        const y2 = Math.max(selectionStart.y, selectionCurrent.y);

        // Determine which desks are within the selection rectangle
        const selected = desks
          .filter((desk) => {
            // Determine desk dimensions based on rotation
            const isRotated = desk.rotation % 180 !== 0;
            const deskWidth = isRotated ? 50 : 100;
            const deskHeight = isRotated ? 100 : 50;

            const deskRect = {
              left: desk.position.x,
              top: desk.position.y,
              right: desk.position.x + deskWidth,
              bottom: desk.position.y + deskHeight,
            };

            // Check for overlap using Axis-Aligned Bounding Box (AABB) collision detection
            const isOverlap = !(
              deskRect.right < x1 ||
              deskRect.left > x2 ||
              deskRect.bottom < y1 ||
              deskRect.top > y2
            );

            return isOverlap;
          })
          .map((desk) => desk.id);

        setSelectedDesks(selected);
      }

      // Reset selection state
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionCurrent(null);
      setIsDraggingOrSelecting(false);

      // Indicate that a selection just occurred
      justSelectedRef.current = true;
      setTimeout(() => {
        justSelectedRef.current = false;
      }, 0);

      // Prevent the onClick from firing
      e.stopPropagation();
    },
    [isSelecting, selectionStart, selectionCurrent, desks, setSelectedDesks]
  );

  useEffect(() => {
    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  // Convert screen coordinates to container coordinates
  const convertToContainerCoords = (x: number, y: number): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const converted = { x: x - rect.left, y: y - rect.top };
    return converted;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <Box
        ref={(node: HTMLDivElement | null) => {
          if (node) {
            containerRef.current = node;
            drop(node);
          }
        }}
        sx={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#f0f0f0',
          backgroundImage:
            'linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          cursor: isSelecting ? 'crosshair' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onClick={handleBackgroundClick}
      >
        {/* Render Desks */}
        {desks.map((desk) => (
          <Desk key={desk.id} desk={desk} />
        ))}

        {/* Selection Rectangle */}
        {isSelecting && selectionStart && selectionCurrent && (
          <SelectionBox start={selectionStart} current={selectionCurrent} />
        )}
      </Box>
      <StudentAssignment />
      <Onboarding />
    </Box>
  );
};

export default App;