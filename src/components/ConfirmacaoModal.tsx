import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface ConfirmacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mensagem: string;
  titulo?: string;
  loading?: boolean;
}

export const ConfirmacaoModal = ({
  open,
  onClose,
  onConfirm,
  mensagem,
  titulo = 'Confirmação',
  loading = false
}: ConfirmacaoModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        {titulo}
      </DialogTitle>
      <DialogContent>
        <Typography>{mensagem}</Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="warning"
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 