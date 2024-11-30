// src/store/useStore.ts

import { create } from 'zustand';
import { generateUniqueId } from '../utils/idGenerator';
import { seedNames } from '../utils/seedNames';

export type DeskType = 'teacher' | 'student';

export interface Position {
  x: number;
  y: number;
}

export interface Desk {
  id: string;
  type: DeskType;
  position: Position;
  rotation: number; // Degrees: 0, 90, 180, 270
  groupId: string | null;
  assignedStudent?: string;
}

export type Group = {
  id: string;
  label: string;
  deskIds: string[];
  position?: { x: number; y: number };
};

export interface Layouts {
  [key: string]: Desk[];
}

interface StoreState {
  desks: Desk[];
  groups: Group[];
  layouts: Layouts;
  currentLayout: string;
  selectedDesks: string[]; // Added for selection

  // Seed List Management
  seedNames: string[];
  currentSeedIndex: number;

  // Actions
  addDesk: (deskType?: DeskType) => void;
  removeDesk: (deskId: string) => void;
  updateDesk: (updatedDesk: Desk) => void;
  rotateDesk: (deskId: string) => void;
  groupDesks: (groupData: { label: string; deskIds: string[] }) => void;
  saveLayout: (layoutName: string) => void;
  loadLayout: (layoutName: string) => void;
  assignStudents: (students: string[]) => void;
  initializeLayouts: () => void;

  // Selection Actions
  selectDesk: (deskId: string) => void;
  deselectDesk: (deskId: string) => void;
  toggleDeskSelection: (deskId: string) => void;
  clearSelection: () => void;
  setSelectedDesks: (deskIds: string[]) => void; // New action
}

const gridSize = 25; // Updated grid size
const desksPerRow = 6; // Number of desks per row for initial arrangement

const useStore = create<StoreState>((set, get) => ({
  desks: [],
  groups: [],
  layouts: {},
  currentLayout: 'default',
  selectedDesks: [],

  // Initialize seedNames and index
  seedNames: [...seedNames], // Clone to prevent mutation
  currentSeedIndex: 0,

  addDesk: (deskType: DeskType = 'student') => {
    const deskCount = get().desks.length;
    const row = Math.floor(deskCount / desksPerRow);
    const col = deskCount % desksPerRow;
    let assignedStudent: string | undefined = undefined;

    // Assign seed name if available
    if (get().currentSeedIndex < get().seedNames.length && deskType === 'student') {
      assignedStudent = get().seedNames[get().currentSeedIndex];
      set((state) => ({ currentSeedIndex: state.currentSeedIndex + 1 }));
    }

    const newDesk: Desk = {
      id: generateUniqueId(),
      type: deskType,
      position: { x: col * (100 + gridSize), y: row * (50 + gridSize) }, // Adjusted for desk size and grid
      rotation: 0,
      groupId: null,
      assignedStudent, // Assign seed name if available
    };
    set((state: StoreState) => ({ desks: [...state.desks, newDesk] }));
  },

  removeDesk: (deskId: string) => {
    set((state) => ({
      desks: state.desks.filter((desk) => desk.id !== deskId),
      groups: state.groups.map((group) => ({
        ...group,
        deskIds: group.deskIds.filter((id) => id !== deskId),
      })),
      selectedDesks: state.selectedDesks.filter((id) => id !== deskId), // Remove from selection if selected
    }));
  },

  updateDesk: (updatedDesk: Desk) => {
    set((state) => ({
      desks: state.desks.map((desk) =>
        desk.id === updatedDesk.id ? updatedDesk : desk
      ),
    }));
  },

  rotateDesk: (deskId: string) => {
    set((state) => ({
      desks: state.desks.map((desk) =>
        desk.id === deskId
          ? { ...desk, rotation: (desk.rotation + 90) % 360 }
          : desk
      ),
    }));
  },

  groupDesks: (groupData: { label: string; deskIds: string[] }) => {
    const { label, deskIds } = groupData;
    const newGroup: Group = {
      id: generateUniqueId(),
      label,
      deskIds,
    };
    set((state) => ({
      groups: [...state.groups, newGroup],
      desks: state.desks.map((desk) =>
        deskIds.includes(desk.id) ? { ...desk, groupId: newGroup.id } : desk
      ),
    }));
  },

  saveLayout: (layoutName: string) => {
    const layouts = { ...get().layouts, [layoutName]: get().desks };
    localStorage.setItem('classroomLayouts', JSON.stringify(layouts));
    set({ layouts });
  },

  loadLayout: (layoutName: string) => {
    const layouts = get().layouts;
    const layout = layouts[layoutName];
    if (layout) {
      set({ desks: layout, currentLayout: layoutName, selectedDesks: [] });
    } else {
      alert(`Layout "${layoutName}" does not exist.`);
    }
  },

  assignStudents: (students: string[]) => {
    const availableDesks = get().desks.filter(
      (desk) => desk.type === 'student'
    );
    const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
    const assignments: { [deskId: string]: string } = {};
    shuffledStudents.forEach((student, index) => {
      if (availableDesks[index]) {
        assignments[availableDesks[index].id] = student;
      }
    });
    set((state) => ({
      desks: state.desks.map((desk) =>
        desk.type === 'student'
          ? { ...desk, assignedStudent: assignments[desk.id] || undefined }
          : desk
      ),
    }));
  },

  initializeLayouts: () => {
    const storedLayouts = JSON.parse(localStorage.getItem('classroomLayouts') || '{}');
    set({ layouts: storedLayouts });
  },

  // Selection Actions
  selectDesk: (deskId: string) => {
    set((state) => ({
      selectedDesks: [...state.selectedDesks, deskId],
    }));
  },
  deselectDesk: (deskId: string) => {
    set((state) => ({
      selectedDesks: state.selectedDesks.filter((id) => id !== deskId),
    }));
  },
  toggleDeskSelection: (deskId: string) => {
    set((state) => ({
      selectedDesks: state.selectedDesks.includes(deskId)
        ? state.selectedDesks.filter((id) => id !== deskId)
        : [...state.selectedDesks, deskId],
    }));
  },
  clearSelection: () => {
    set({ selectedDesks: [] });
  },
  setSelectedDesks: (deskIds: string[]) => {
    console.log('Updating selectedDesks:', deskIds);
    set({ selectedDesks: deskIds });
  },
}));

export default useStore;