"use client";

import {
  DynamicContextProvider,
  getAuthToken,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import React from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import AccountModal from "../../components/modal";
import { ApiService } from "../../services/api";

interface Account {
  address: string;
  alias?: string;
  updatedAt?: string;
}

const AccountsPageContent = () => {
  const { user, handleLogOut } = useDynamicContext();
  const router = useRouter();
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCreateAccountModal, setShowCreateAccountModal] =
    React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(
    null
  );

  const fetchAccounts = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const dynamicJwtToken = getAuthToken();
      if (!dynamicJwtToken) {
        throw new Error("No authentication token available");
      }
      const apiService = new ApiService(dynamicJwtToken);
      const data = await apiService.getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const showEditAccountModal = React.useCallback((account: Account) => {
    setShowEditModal(true);
    setSelectedAccount(account);
  }, []);

  const handleEditAccount = async (
    alias?: string,
    password?: string,
    newPassword?: string
  ) => {
    const dynamicJwtToken = getAuthToken();
    if (!dynamicJwtToken) {
      throw new Error("No authentication token available");
    }
    const apiService = new ApiService(dynamicJwtToken);
    await apiService.updateAccount(selectedAccount?.address || "", {
      alias,
      newPassword,
      existingPassword: password,
    });
    fetchAccounts();
  };

  const handleCreateAccount = async (alias: string, password: string) => {
    const dynamicJwtToken = getAuthToken();
    if (!dynamicJwtToken) {
      throw new Error("No authentication token available");
    }
    const apiService = new ApiService(dynamicJwtToken);
    await apiService.createAccount(alias, password);
    fetchAccounts();
  };

  if (!user) {
    return (
      <div className="auth-container">
        <p>Please log in to view accounts.</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        username={user.alias || user.email || ""}
        onLogOut={handleLogOut}
      />
      <div className="main-content">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Accounts</h1>
            <Button
              variant="primary"
              onClick={() => setShowCreateAccountModal(true)}
            >
              Create Account
            </Button>
          </div>
          {loading ? (
            <div>Loading accounts...</div>
          ) : error ? (
            <div className="text-danger">Error: {error}</div>
          ) : accounts.length === 0 ? (
            <div>No accounts found.</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Alias</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr key={account.address || index}>
                    <td>
                      <a
                        href={`/account/${account.address}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/account/${account.address}`);
                        }}
                        style={{ cursor: "pointer", color: "#0d6efd" }}
                      >
                        {account.address}
                      </a>
                    </td>
                    <td>{account.alias || "N/A"}</td>
                    <td>{account.updatedAt || "N/A"}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => showEditAccountModal(account)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <AccountModal
            title="Create Account"
            show={showCreateAccountModal}
            onHide={() => setShowCreateAccountModal(false)}
            onSubmit={handleCreateAccount}
            buttonText="Create Account"
          />
          <AccountModal
            title="Edit Account"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            onSubmit={handleEditAccount}
            isEdit={true}
            buttonText="Update Account"
          />
        </Container>
      </div>
    </div>
  );
};

export default function AccountsPage() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
      }}
    >
      <AccountsPageContent />
    </DynamicContextProvider>
  );
}
