// src/components/Toolbar/Toolbar.tsx
import React, { useState } from 'react';
import { Button, ButtonGroup, AppBar, Toolbar as MuiToolbar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Typography } from '@mui/material';
import useStore from '../store/useStore';

const ToolbarComponent: React.FC = () => {
  const addDesk = useStore((state) => state.addDesk);
  const removeDesk = useStore((state) => state.removeDesk);
  const rotateDesk = useStore((state) => state.rotateDesk);
  const groupDesks = useStore((state) => state.groupDesks);
  const saveLayout = useStore((state) => state.saveLayout);
  const loadLayout = useStore((state) => state.loadLayout);
  const selectedDesks = useStore((state) => state.selectedDesks);
  const clearSelection = useStore((state) => state.clearSelection);
  const layouts = useStore((state) => state.layouts);

  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');

  const [openLoadDialog, setOpenLoadDialog] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState('');

  const handleAddDesk = () => {
    addDesk();
  };

  const handleRemoveDesk = () => {
    if (selectedDesks.length === 0) {
      alert('No desks selected to remove.');
      return;
    }
    selectedDesks.forEach((deskId) => removeDesk(deskId));
    clearSelection();
  };

  const handleRotateDesk = () => {
    if (selectedDesks.length === 0) {
      alert('No desks selected to rotate.');
      return;
    }
    selectedDesks.forEach((deskId) => rotateDesk(deskId));
    clearSelection();
  };

  const handleGroupDesks = () => {
    if (selectedDesks.length < 2) {
      alert('Select at least two desks to group.');
      return;
    }
    setOpenGroupDialog(true);
  };

  const confirmGroupDesks = () => {
    if (groupName.trim() === '') {
      alert('Group name cannot be empty.');
      return;
    }
    groupDesks({ label: groupName, deskIds: selectedDesks });
    setGroupName('');
    setOpenGroupDialog(false);
    clearSelection();
  };

  const handleSaveLayout = () => {
    const layoutName = prompt('Enter layout name to save:');
    if (layoutName) {
      saveLayout(layoutName);
    }
  };

  const handleLoadLayout = () => {
    setOpenLoadDialog(true);
  };

  const confirmLoadLayout = () => {
    if (selectedLayout) {
      loadLayout(selectedLayout);
      setOpenLoadDialog(false);
    }
  };

  return (
    <AppBar position="static">
      <MuiToolbar>
        <ButtonGroup variant="contained" aria-label="toolbar">
          <Button onClick={handleAddDesk}>Add Desk</Button>
          <Button onClick={handleRemoveDesk}>Remove Desk</Button>
          <Button onClick={handleRotateDesk}>Rotate Desk</Button>
          <Button onClick={handleGroupDesks}>Group Desks</Button>
          <Button onClick={handleSaveLayout}>Save Layout</Button>
          <Button onClick={handleLoadLayout}>Load Layout</Button>
        </ButtonGroup>
      </MuiToolbar>

      {/* Group Desks Dialog */}
      <Dialog open={openGroupDialog} onClose={() => setOpenGroupDialog(false)}>
        <DialogTitle>Group Selected Desks</DialogTitle>
        <DialogContent>
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupDialog(false)}>Cancel</Button>
          <Button onClick={confirmGroupDesks} variant="contained">
            Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Layout Dialog */}
      <Dialog open={openLoadDialog} onClose={() => setOpenLoadDialog(false)}>
        <DialogTitle>Load Layout</DialogTitle>
        <DialogContent>
          {Object.keys(layouts).length === 0 ? (
            <Typography>No layouts saved.</Typography>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="select-layout-label">Select Layout</InputLabel>
              <Select
                labelId="select-layout-label"
                value={selectedLayout}
                label="Select Layout"
                onChange={(e) => setSelectedLayout(e.target.value)}
              >
                {Object.keys(layouts).map((layoutName) => (
                  <MenuItem key={layoutName} value={layoutName}>
                    {layoutName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoadDialog(false)}>Cancel</Button>
          <Button onClick={confirmLoadLayout} variant="contained" disabled={!selectedLayout}>
            Load
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default ToolbarComponent;