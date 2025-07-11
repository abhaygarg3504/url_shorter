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
  IconButton,
  Tooltip,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import { getAllShortUrls } from "../api/user_api"; 
import { getAllQRCodes, downloadQRCode } from "../api/qr_api";
import type { QRCodeData } from "../api/qr_api";

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
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);

  const fetchQRCodes = async () => {
    try {
      const qrCodesData = await getAllQRCodes();
      setQrCodes(qrCodesData);
    } catch (error) {
      console.error("Failed to fetch QR codes:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [urlsResponse] = await Promise.all([
          getAllShortUrls(),
          fetchQRCodes()
        ]);
        
        if (urlsResponse.success) {
          setUrls(urlsResponse.urls);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const getQRCodeForUrl = (shortUrl: string) => {
    return qrCodes.find(qr => qr.shortUrl === shortUrl);
  };

  const handleDownloadQR = async (shortUrl: string) => {
    try {
      await downloadQRCode(shortUrl);
    } catch (error) {
      console.error("Failed to download QR code:", error);
    }
  };

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
                <TableCell align="center">QR Code</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => {
                const qrCode = getQRCodeForUrl(url.shortUrl);
                return (
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
                    <TableCell align="center">
                      {qrCode ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <img 
                            src={qrCode.qrData} 
                            alt="QR Code" 
                            style={{ 
                              width: 32, 
                              height: 32, 
                              border: "1px solid #ccc", 
                              borderRadius: 4, 
                              cursor: "pointer" 
                            }}
                            onClick={() => {
                              // Show QR code in a modal or larger view
                              const newWindow = window.open('', '_blank');
                              if (newWindow) {
                                newWindow.document.write(`
                                  <html>
                                    <head><title>QR Code</title></head>
                                    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                                      <img src="${qrCode.qrData}" alt="QR Code" style="max-width: 90%; max-height: 90%;" />
                                    </body>
                                  </html>
                                `);
                              }
                            }}
                          />
                          <Tooltip title="Download QR Code">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadQR(url.shortUrl)}
                              color="primary"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No QR Code
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default UseUrl;
