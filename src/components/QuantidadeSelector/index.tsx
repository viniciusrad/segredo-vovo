import { Box, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface QuantidadeSelectorProps {
  quantidade: number;
  onChange: (quantidade: number) => void;
  max?: number;
  min?: number;
}

export function QuantidadeSelector({
  quantidade,
  onChange,
  max = Number.MAX_SAFE_INTEGER,
  min = 1
}: QuantidadeSelectorProps) {
  const handleIncrement = () => {
    if (quantidade < max) {
      onChange(quantidade + 1);
    }
  };

  const handleDecrement = () => {
    if (quantidade > min) {
      onChange(quantidade - 1);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      onChange(value);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleDecrement}
        disabled={quantidade <= min}
      >
        <RemoveIcon />
      </IconButton>

      <TextField
        type="number"
        value={quantidade}
        onChange={handleChange}
        inputProps={{
          min,
          max,
          style: { textAlign: 'center' }
        }}
        sx={{ width: 60 }}
        size="small"
      />

      <IconButton
        size="small"
        onClick={handleIncrement}
        disabled={quantidade >= max}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
} 