// src/components/VanityUrlManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Tooltip,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import {
  generateVanitySuggestions,
  createVanityUrl,
  checkVanityAvailability,
  getUserVanityUrls,
  updateVanityUrl,
  getUserCustomDomains,
} from '../api/user_api';

interface VanityUrl {
  id: string;
  vanitySlug: string;
  fullUrl: string;
  shortUrl: string;
  title?: string;
  description?: string;
  customDomainId?: string;
  customDomain?: {
    id: string;
    domain: string;
    isVerified: boolean;
  };
  completeUrl: string;
  clicks: number;
  createdAt: string;
}

interface CustomDomain {
  id: string;
  domain: string;
  isVerified: boolean;
}

const VanityUrlManager: React.FC = () => {
  const [vanityUrls, setVanityUrls] = useState<VanityUrl[]>([]);
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<VanityUrl | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Form states
  const [fullUrl, setFullUrl] = useState('');
  const [vanitySlug, setVanitySlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customDomainId, setCustomDomainId] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced slug availability check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (vanitySlug.length >= 3) {
        checkSlugAvailability(vanitySlug);
      } else {
        setSlugAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vanitySlug, customDomainId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vanityResponse, domainResponse] = await Promise.all([
        getUserVanityUrls(),
        getUserCustomDomains()
      ]);

      if (vanityResponse.success) {
        setVanityUrls(vanityResponse.data);
      }

      if (domainResponse.success) {
        setCustomDomains(domainResponse.data.filter((domain: CustomDomain) => domain.isVerified));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!fullUrl) return;

    setGeneratingSuggestions(true);
    try {
      const response = await generateVanitySuggestions(fullUrl, title);
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setAlert({ type: 'error', message: 'Failed to generate suggestions' });
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const response = await checkVanityAvailability(slug, customDomainId || undefined);
      setSlugAvailable(response.available);
    } catch (error) {
      console.error('Error checking slug availability:', error);
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleCreateVanityUrl = async () => {
    if (!fullUrl || !vanitySlug) return;

    try {
      const response = await createVanityUrl({
        url: fullUrl,
        vanitySlug,
        customDomainId: customDomainId || undefined,
        title: title || undefined,
        description: description || undefined,
      });

      if (response.success) {
        setAlert({ type: 'success', message: 'Vanity URL created successfully' });
        setCreateDialogOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error: any) {
      console.error('Error creating vanity URL:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to create vanity URL' });
    }
  };

  const handleUpdateVanityUrl = async () => {
    if (!selectedUrl) return;

    try {
      const response = await updateVanityUrl(selectedUrl.id, {
        vanitySlug,
        title: title || undefined,
        description: description || undefined,
      });

      if (response.success) {
        setAlert({ type: 'success', message: 'Vanity URL updated successfully' });
        setEditDialogOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error: any) {
      console.error('Error updating vanity URL:', error);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to update vanity URL' });
    }
  };

  const resetForm = () => {
    setFullUrl('');
    setVanitySlug('');
    setTitle('');
    setDescription('');
    setCustomDomainId('');
    setSuggestions([]);
    setSlugAvailable(null);
    setSelectedUrl(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({ type: 'info', message: 'Copied to clipboard' });
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (url: VanityUrl) => {
    setSelectedUrl(url);
    setVanitySlug(url.vanitySlug);
    setTitle(url.title || '');
    setDescription(url.description || '');
    setEditDialogOpen(true);
  };

  const isValidSlug = (slug: string) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  };

  const getSlugHelperText = () => {
    if (!vanitySlug) return 'Enter a custom slug (3-50 characters, lowercase, numbers, hyphens)';
    if (!isValidSlug(vanitySlug)) return 'Invalid format. Use lowercase letters, numbers, and hyphens only';
    if (checkingSlug) return 'Checking availability...';
    if (slugAvailable === false) return 'This slug is already taken';
    if (slugAvailable === true) return 'This slug is available';
    return '';
  };

  const getSlugColor = () => {
    if (!vanitySlug) return undefined;
    if (!isValidSlug(vanitySlug)) return 'error';
    if (slugAvailable === false) return 'error';
    if (slugAvailable === true) return 'success';
    return undefined;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vanity URLs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Create Vanity URL
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
            {vanityUrls.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No vanity URLs created yet. Create your first vanity URL to get started!
              </Typography>
            ) : (
              <List>
                {vanityUrls.map((url, index) => (
                  <React.Fragment key={url.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{url.vanitySlug}</Typography>
                            {url.customDomain && (
                              <Chip
                                label={url.customDomain.domain}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="primary" component="div">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinkIcon fontSize="small" />
                                <a href={url.completeUrl} target="_blank" rel="noopener noreferrer">
                                  {url.completeUrl}
                                </a>
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(url.completeUrl)}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              → {url.fullUrl}
                            </Typography>
                            {url.title && (
                              <Typography variant="body2" color="text.secondary">
                                Title: {url.title}
                              </Typography>
                            )}
                            {url.description && (
                              <Typography variant="body2" color="text.secondary">
                                Description: {url.description}
                              </Typography>
                            )}
                            <Typography variant="caption" display="block">
                              {url.clicks} clicks • Created: {new Date(url.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => openEditDialog(url)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < vanityUrls.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Vanity URL Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Vanity URL</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Target URL"
              type="url"
              fullWidth
              value={fullUrl}
              onChange={(e) => setFullUrl(e.target.value)}
              placeholder="https://example.com/your-long-url"
              required
            />

            <TextField
              label="Title (optional)"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title for your vanity URL"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Vanity Slug"
                fullWidth
                value={vanitySlug}
                onChange={(e) => setVanitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-awesome-link"
                required
                color={getSlugColor()}
                helperText={getSlugHelperText()}
                InputProps={{
                  endAdornment: checkingSlug && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />

              {fullUrl && (
                <Button
                  variant="outlined"
                  onClick={generateSuggestions}
                  disabled={generatingSuggestions}
                  startIcon={generatingSuggestions ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                  sx={{ minWidth: 140 }}
                >
                  Suggestions
                </Button>
              )}
            </Box>

            {suggestions.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Suggested slugs:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      variant="outlined"
                      clickable
                      onClick={() => setVanitySlug(suggestion)}
                      size="small"
                    />
                  ))}
                </Box>
              </Paper>
            )}

            <FormControl>
              <InputLabel>Custom Domain (optional)</InputLabel>
              <Select
                value={customDomainId}
                onChange={(e) => setCustomDomainId(e.target.value)}
                label="Custom Domain (optional)"
              >
                <MenuItem value="">Use default domain</MenuItem>
                {customDomains.map((domain) => (
                  <MenuItem key={domain.id} value={domain.id}>
                    {domain.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for your vanity URL"
            />

            {vanitySlug && (
              <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview:
                </Typography>
                <Typography variant="body2" color="primary">
                  {customDomainId 
                    ? `${customDomains.find(d => d.id === customDomainId)?.domain}/${vanitySlug}`
                    : `${window.location.origin}/${vanitySlug}`
                  }
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateVanityUrl}
            variant="contained"
            disabled={!fullUrl || !vanitySlug || !isValidSlug(vanitySlug) || slugAvailable === false}
          >
            Create Vanity URL
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Vanity URL Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Vanity URL</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Vanity Slug"
              fullWidth
              value={vanitySlug}
              onChange={(e) => setVanitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
              color={getSlugColor()}
              helperText={getSlugHelperText()}
              InputProps={{
                endAdornment: checkingSlug && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Title (optional)"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateVanityUrl}
            variant="contained"
            disabled={!vanitySlug || !isValidSlug(vanitySlug) || slugAvailable === false}
          >
            Update Vanity URL
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VanityUrlManager;