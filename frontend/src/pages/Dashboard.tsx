// src/pages/Dashboard.tsx (Updated)
import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Box, Tabs, Tab, Typography, Container } from "@mui/material";
import UrlForm from "../components/UrlForm";
import UseUrl from "./UseUrl";
import CustomDomainManager from "../pages/CustomDomainManager";
import VanityUrlManager from "../pages/VanityUrlManager";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Please log in to access your dashboard.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your URLs, custom domains, and vanity URLs all in one place.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="URL Shortener" />
          <Tab label="My URLs" />
          <Tab label="Custom Domains" />
          <Tab label="Vanity URLs" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <UrlForm />
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <UseUrl />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CustomDomainManager />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <VanityUrlManager />
      </TabPanel>
    </Container>
  );
};

export default Dashboard;