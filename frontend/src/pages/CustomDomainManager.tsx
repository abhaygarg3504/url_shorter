// src/components/CustomDomainManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,Button,Card,CardContent,Typography,TextField,Alert,Chip,IconButton,Dialog,DialogTitle,DialogContent,
  DialogActions,List,ListItem,ListItemText,ListItemSecondaryAction,Divider,CircularProgress,Tooltip,Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  addCustomDomain,
  verifyCustomDomain,
  getUserCustomDomains,
  deleteCustomDomain,
  checkDomainAvailability,
} from '../api/user_api';

interface CustomDomain {
  id: string;
  domain: string;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'failed';
  dnsRecord: string;
  createdAt: string;
  lastChecked: string;
}

interface DomainInstructions {
  recordType: string;
  recordName: string;
  recordValue: string;
  ttl: number;
  steps: string[];
}

const CustomDomainManager: React.FC = () => {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);
  const [instructions, setInstructions] = useState<DomainInstructions | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await getUserCustomDomains();
      if (response.success) {
        setDomains(response.data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      setAlert({ type: 'error', message: 'Failed to fetch domains' });
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (domain: string) => {
    if (!domain) return;
    
    setChecking(domain);
    try {
      const response = await checkDomainAvailability(domain);
      setDomainAvailable(response.available);
    } catch (error) {
      console.error('Error checking availability:', error);
      setDomainAvailable(null);
    } finally {
      setChecking(null);
    }
  };

  const handleAddDomain = async () => {
    if (!domainInput.trim()) return;

    try {
      const response = await addCustomDomain(domainInput.trim());
      if (response.success) {
        setInstructions(response.data.instructions);
        setSelectedDomain(response.data.domain);
        setVerificationOpen(true);
        setAddDomainOpen(false);
        setDomainInput('');
        setAlert({ type: 'success', message: 'Domain added successfully' });
        fetchDomains();
      }
    } catch (error: any) {
      console.error('Error adding domain:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to add domain' });
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await verifyCustomDomain(domainId);
      if (response.success) {
        setAlert({ type: 'success', message: 'Domain verified successfully' });
        setVerificationOpen(false);
        fetchDomains();
      } else {
        setAlert({ type: 'error', message: response.message || 'Domain verification failed' });
      }
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to verify domain' });
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return;

    try {
      const response = await deleteCustomDomain(domainId);
      if (response.success) {
        setAlert({ type: 'success', message: 'Domain deleted successfully' });
        fetchDomains();
      }
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to delete domain' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({ type: 'info', message: 'Copied to clipboard' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <VerifiedIcon />;
      case 'pending': return <WarningIcon />;
      case 'failed': return <WarningIcon />;
      default: return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Custom Domains
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDomainOpen(true)}
        >
          Add Domain
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            {domains.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No custom domains added yet. Add your first domain to get started!
              </Typography>
            ) : (
              <List>
                {domains.map((domain, index) => (
                  <React.Fragment key={domain.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{domain.domain}</Typography>
                            <Chip
                              label={domain.status}
                              size="small"
                              color={getStatusColor(domain.status)}
                            //   icon={getStatusIcon(domain.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Added: {new Date(domain.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Last checked: {new Date(domain.lastChecked).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {domain.status === 'pending' && (
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedDomain(domain);
                                setInstructions({
                                  recordType: 'TXT',
                                  recordName: '@',
                                  recordValue: domain.dnsRecord,
                                  ttl: 300,
                                  steps: [
                                    '1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)',
                                    '2. Go to DNS Management or DNS Settings',
                                    '3. Add a new TXT record with the following details:',
                                    '   - Name/Host: @ (or leave blank)',
                                    `   - Value/Content: ${domain.dnsRecord}`,
                                    '   - TTL: 300 (or automatic)',
                                    '4. Save the record and wait for propagation (5-30 minutes)',
                                    '5. Click "Verify Domain" button below'
                                  ]
                                });
                                setVerificationOpen(true);
                              }}
                            >
                              Setup
                            </Button>
                          )}
                          <Tooltip title="Refresh status">
                            <IconButton
                              onClick={() => handleVerifyDomain(domain.id)}
                              size="small"
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete domain">
                            <IconButton
                              onClick={() => handleDeleteDomain(domain.id)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < domains.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Domain Dialog */}
      <Dialog open={addDomainOpen} onClose={() => setAddDomainOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Domain</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Domain"
            type="text"
            fullWidth
            variant="outlined"
            value={domainInput}
            onChange={(e) => {
              setDomainInput(e.target.value);
              if (e.target.value) {
                checkAvailability(e.target.value);
              }
            }}
            placeholder="example.com"
            helperText="Enter your domain without http:// or www"
            InputProps={{
              endAdornment: checking === domainInput && <CircularProgress size={20} />
            }}
          />
          
          {domainAvailable === false && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This domain is already in use
            </Alert>
          )}
          
          {domainAvailable === true && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Domain is available
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDomainOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddDomain}
            variant="contained"
            disabled={!domainInput.trim() || domainAvailable === false}
          >
            Add Domain
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Instructions Dialog */}
      <Dialog open={verificationOpen} onClose={() => setVerificationOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Domain Verification Setup</DialogTitle>
        <DialogContent>
          {instructions && selectedDomain && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Domain: {selectedDomain.domain}
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  DNS Record Details:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Type:</strong> {instructions.recordType}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {instructions.recordName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    <strong>Value:</strong> {instructions.recordValue}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(instructions.recordValue)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2">
                  <strong>TTL:</strong> {instructions.ttl}
                </Typography>
              </Paper>

              <Typography variant="subtitle2" gutterBottom>
                Setup Instructions:
              </Typography>
              <List dense>
                {instructions.steps.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationOpen(false)}>Close</Button>
          <Button
            onClick={() => selectedDomain && handleVerifyDomain(selectedDomain.id)}
            variant="contained"
            color="primary"
          >
            Verify Domain
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomDomainManager;