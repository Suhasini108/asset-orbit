import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ReportsPage from './pages/ReportsPage';
import SmartToolsPage from './pages/SmartToolsPage';
import CollegeLabsPage from './pages/CollegeLabsPage';
import TicketsPage from './pages/TicketsPage';
import PlatformPlansPage from './pages/PlatformPlansPage';
import ShadowItPage from './pages/ShadowItPage';
import LoanersPage from './pages/LoanersPage';
import WarrantyPage from './pages/WarrantyPage';
import ReplacementPage from './pages/ReplacementPage';
import LossTheftPage from './pages/LossTheftPage';
import EWastePage from './pages/EWastePage';
import AuditPage from './pages/AuditPage';
import VendorsPage from './pages/VendorsPage';
import SettingsPage from './pages/SettingsPage';
import DepreciationPage from './pages/DepreciationPage';

// Global Modals
import AddAssetModal from './components/assets/AddAssetModal';
import AssetDetailModal from './components/assets/AssetDetailModal';
import BatchPrintQrModal from './components/assets/BatchPrintQrModal';
import QrScannerModal from './components/qr/QrScannerModal';
import CreateTicketModal from './components/tickets/CreateTicketModal';
import TicketDetailModal from './components/tickets/TicketDetailModal';
import LoanerPoolModal from './components/loaners/LoanerPoolModal';
import ImportExportWizard from './components/importexport/ImportExportWizard';
import BackupRecoveryModal from './components/backup/BackupRecoveryModal';
import AddSubscriptionModal from './components/subscriptions/AddSubscriptionModal';
import SetReminderModal from './components/subscriptions/SetReminderModal';
import EmailBroadcastModal from './components/notifications/EmailBroadcastModal';

export default function App() {
  const { currentUser } = useAuth();

  // Modal states
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [addAssetLab, setAddAssetLab] = useState(null);
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [setReminderOpen, setSetReminderOpen] = useState(false);
  const [emailBroadcastOpen, setEmailBroadcastOpen] = useState(false);

  const [assetDetailOpen, setAssetDetailOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [batchPrintQrOpen, setBatchPrintQrOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [ticketInitialAsset, setTicketInitialAsset] = useState(null);

  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [loanerModalOpen, setLoanerModalOpen] = useState(false);
  const [loanerTicket, setLoanerTicket] = useState(null);

  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Handlers
  const handleOpenAddAsset = (lab = null) => {
    setAddAssetLab(lab);
    setAddAssetOpen(true);
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setAssetDetailOpen(true);
  };

  const handleReportIssue = (asset) => {
    setTicketInitialAsset(asset);
    setCreateTicketOpen(true);
  };

  const handleOpenTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailOpen(true);
  };

  const handleOpenLoanerForTicket = (ticket) => {
    setLoanerTicket(ticket);
    setLoanerModalOpen(true);
  };

  const isManagement = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If unauthenticated, show the dedicated Login Page at first
  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // When authenticated, render full application layout without in-app switcher (must Sign Out to switch)
  return (
    <Router>
      <div className="min-h-screen bg-[#F7F8F5] text-[#172D27] flex flex-col font-sans transition-colors duration-200">
        <div className="flex-1 flex flex-row min-h-0 relative">
          {/* Responsive Sidebar (Desktop Persistent + Mobile Drawer) */}
          <Sidebar
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main App Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
            {/* Header with Breadcrumb, Mobile Hamburger, Live status, and Sign out button */}
            <Header
              onOpenSetupWizard={() => setImportWizardOpen(true)}
              onOpenEmailBroadcast={() => setEmailBroadcastOpen(true)}
              onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
            />

            {/* Page Route Content Container */}
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                {/* Redirect /login to home when already authenticated */}
                <Route path="/login" element={<Navigate to="/" replace />} />

                <Route
                  path="/"
                  element={
                    <DashboardPage
                      onOpenAddAsset={() => handleOpenAddAsset(null)}
                      onOpenAddSubscription={() => setAddSubscriptionOpen(true)}
                      onOpenSetReminder={() => setSetReminderOpen(true)}
                      onOpenEmailBroadcast={() => setEmailBroadcastOpen(true)}
                    />
                  }
                />
                <Route
                  path="/overview"
                  element={
                    <DashboardPage
                      onOpenAddAsset={() => handleOpenAddAsset(null)}
                      onOpenAddSubscription={() => setAddSubscriptionOpen(true)}
                      onOpenSetReminder={() => setSetReminderOpen(true)}
                      onOpenEmailBroadcast={() => setEmailBroadcastOpen(true)}
                    />
                  }
                />
                <Route
                  path="/assets"
                  element={
                    <AssetsPage
                      onOpenAddAsset={() => handleOpenAddAsset(null)}
                      onSelectAsset={handleSelectAsset}
                      onReportIssue={handleReportIssue}
                    />
                  }
                />
                <Route
                  path="/subscriptions"
                  element={<SubscriptionsPage />}
                />
                <Route
                  path="/renewals"
                  element={isManagement ? <SubscriptionsPage initialTab="renewals" /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/reports"
                  element={isManagement ? <ReportsPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/smart-tools"
                  element={
                    isManagement ? (
                      <SmartToolsPage
                        onSelectAsset={handleSelectAsset}
                        onReportIssue={handleReportIssue}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/college-labs"
                  element={<Navigate to="/assets" replace />}
                />
                <Route
                  path="/qr-system"
                  element={
                    isManagement ? (
                      <SmartToolsPage
                        onSelectAsset={handleSelectAsset}
                        onReportIssue={handleReportIssue}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <TicketsPage
                      onOpenCreateTicket={() => { setTicketInitialAsset(null); setCreateTicketOpen(true); }}
                      onOpenTicketDetail={handleOpenTicketDetail}
                    />
                  }
                />
                <Route
                  path="/loaners"
                  element={isManagement ? <LoanersPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/warranty"
                  element={isManagement ? <WarrantyPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/replacements"
                  element={isManagement ? <ReplacementPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/loss-theft"
                  element={isManagement ? <LossTheftPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/platform-plans"
                  element={isManagement ? <PlatformPlansPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/shadow-it"
                  element={isManagement ? <ShadowItPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/depreciation"
                  element={isManagement ? <DepreciationPage onSelectAsset={handleSelectAsset} /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/audit-mode"
                  element={isManagement ? <AuditPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/e-waste"
                  element={isManagement ? <EWastePage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/vendors"
                  element={isManagement ? <VendorsPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/settings"
                  element={
                    isManagement ? (
                      <SettingsPage
                        onOpenBackupModal={() => setBackupModalOpen(true)}
                        onOpenEmailBroadcast={() => setEmailBroadcastOpen(true)}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>

        {/* Global Modals */}
        <AddAssetModal
          isOpen={addAssetOpen}
          onClose={() => setAddAssetOpen(false)}
          initialLab={addAssetLab}
        />

        <AssetDetailModal
          isOpen={assetDetailOpen}
          onClose={() => setAssetDetailOpen(false)}
          asset={selectedAsset}
          onReportIssue={handleReportIssue}
        />

        <BatchPrintQrModal
          isOpen={batchPrintQrOpen}
          onClose={() => setBatchPrintQrOpen(false)}
        />

        <QrScannerModal
          isOpen={qrScannerOpen}
          onClose={() => setQrScannerOpen(false)}
          onSelectAsset={handleSelectAsset}
          onReportTicket={handleReportIssue}
        />

        <CreateTicketModal
          isOpen={createTicketOpen}
          onClose={() => setCreateTicketOpen(false)}
          initialAsset={ticketInitialAsset}
        />

        <TicketDetailModal
          isOpen={ticketDetailOpen}
          onClose={() => setTicketDetailOpen(false)}
          ticket={selectedTicket}
          onOpenLoanerModal={handleOpenLoanerForTicket}
        />

        <LoanerPoolModal
          isOpen={loanerModalOpen}
          onClose={() => setLoanerModalOpen(false)}
          ticket={loanerTicket}
        />

        <ImportExportWizard
          isOpen={importWizardOpen}
          onClose={() => setImportWizardOpen(false)}
        />

        <BackupRecoveryModal
          isOpen={backupModalOpen}
          onClose={() => setBackupModalOpen(false)}
        />

        <AddSubscriptionModal
          isOpen={addSubscriptionOpen}
          onClose={() => setAddSubscriptionOpen(false)}
        />

        <SetReminderModal
          isOpen={setReminderOpen}
          onClose={() => setSetReminderOpen(false)}
        />

        <EmailBroadcastModal
          isOpen={emailBroadcastOpen}
          onClose={() => setEmailBroadcastOpen(false)}
        />
      </div>
    </Router>
  );
}
