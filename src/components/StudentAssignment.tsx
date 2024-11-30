// src/components/StudentAssignment/StudentAssignment.tsx
import React from 'react';
import { Button } from '@mui/material';
import Papa from 'papaparse';
import useStore from '../store/useStore';

const StudentAssignment: React.FC = () => {
  const assignStudents = useStore((state) => state.assignStudents);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const students: string[] = results.data
            .map((row: any) => row.Name || row.StudentName || row.ID)
            .filter((name: string | undefined): name is string => Boolean(name));
          assignStudents(students);
        },
        error: (error) => {
          alert('Error parsing CSV file.');
          console.error(error);
        },
      });
    }
  };

  return (
    <Button variant="contained" component="label" sx={{ m: 2 }}>
      Import Roster
      <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
    </Button>
  );
};

export default StudentAssignment;