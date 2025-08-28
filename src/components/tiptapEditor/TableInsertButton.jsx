import React, { useState } from 'react'
import {
    Box,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material'
import TableChart from '@mui/icons-material/TableChart'

const TableInsertButton = ({ editor }) => {
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState(3)
    const [cols, setCols] = useState(3)

    const handleInsertTable = () => {
        editor
            .chain()
            .focus()
            .insertTable({
                rows: Number(rows),
                cols: Number(cols),
                withHeaderRow: true,
            })
            .run()
        setOpen(false)
    }

    return (
        <>
            <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
                <Tooltip title="Insert Table">
                    <IconButton
                        onClick={() => setOpen(true)}
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        <TableChart />
                    </IconButton>
                </Tooltip>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Insert Table</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 ,margin:2}}>
                        <TextField
                            label="Rows"
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(e.target.value)}
                            inputProps={{ min: 1 }}
                            autoFocus
                        />
                        <TextField
                            label="Columns"
                            type="number"
                            value={cols}
                            onChange={(e) => setCols(e.target.value)}
                            inputProps={{ min: 1 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleInsertTable} variant="contained" disabled={rows < 1 || cols < 1}>
                        Insert
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TableInsertButton;
