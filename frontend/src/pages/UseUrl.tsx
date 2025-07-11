import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { getAllShortUrls } from "../api/user_api"; 

interface UrlData {
  id: string;
  fullUrl: string;
  shortUrl: string;
  clicks: number;
  userId: string;
}

const UseUrl: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        const response = await getAllShortUrls();
        if (response.success) {
          setUrls(response.urls);
        }
      } catch (error) {
        console.error("Failed to fetch URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUrls();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" color="text.secondary">
          Please log in to view your URLs and profile details.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Card sx={{ mb: 4, p: 2, display: "flex", alignItems: "center", boxShadow: 3 }}>
        <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: "primary.main" }}>
          {user?.name?.[0]?.toUpperCase() || <LinkIcon />}
        </Avatar>
        <CardContent>
          <Typography variant="h5" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
          {user?.provider && (
            <Typography variant="caption" color="text.secondary">
              Provider: {user.provider}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Paper sx={{ p: 2, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom>
          Your Shortened URLs
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : urls.length === 0 ? (
          <Typography color="text.secondary">No URLs found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full URL</TableCell>
                <TableCell>Short URL</TableCell>
                <TableCell align="center">Clicks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell>
                    <a href={url.fullUrl} target="_blank" rel="noopener noreferrer">
                      {url.fullUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`${import.meta.env.VITE_API_URL}${url.shortUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url.shortUrl}
                    </a>
                  </TableCell>
                  <TableCell align="center">{url.clicks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default UseUrl;
