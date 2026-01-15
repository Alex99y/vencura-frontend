"use client";

import {
  DynamicContextProvider,
  getAuthToken,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import React from "react";
import { Container, Card, Table, Button } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";
import SignModal from "../../../components/sign-modal";
import { ApiService } from "../../../services/api";

interface Account {
  address: string;
  alias?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface AccountBalance {
  balance?: string;
  [key: string]: unknown;
}

interface Operation {
  [key: string]: unknown;
}

const AccountPageContent = () => {
  const { user, handleLogOut } = useDynamicContext();
  const params = useParams();
  const router = useRouter();
  const accountAddress = params?.account as string;

  const [account, setAccount] = React.useState<Account | null>(null);
  const [balance, setBalance] = React.useState<AccountBalance | null>(null);
  const [operations, setOperations] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [signing, setSigning] = React.useState(false);
  const [showSignMessageModal, setShowSignMessageModal] = React.useState(false);
  const [showSignTransactionModal, setShowSignTransactionModal] =
    React.useState(false);

  const fetchAccountData = React.useCallback(async () => {
    if (!user || !accountAddress) return;

    try {
      setLoading(true);
      setError(null);
      const dynamicJwtToken = getAuthToken();
      if (!dynamicJwtToken) {
        throw new Error("No authentication token available");
      }
      const apiService = new ApiService(dynamicJwtToken);

      // Fetch account details, balance, and operations in parallel
      const [accountData, balanceData, operationsData] = await Promise.all([
        apiService.getAccount(accountAddress),
        apiService.getAccountBalance(accountAddress).catch(() => null),
        apiService.getOperations(accountAddress).catch(() => []),
      ]);

      setAccount(accountData);
      setBalance(balanceData);
      setOperations(Array.isArray(operationsData) ? operationsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch account");
      console.error("Error fetching account:", err);
    } finally {
      setLoading(false);
    }
  }, [user, accountAddress]);

  React.useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleSignMessage = async (
    message: string | { toAddress: string; amount: string },
    password: string
  ) => {
    if (typeof message !== "string") {
      return;
    }

    try {
      setSigning(true);
      setError(null);
      const dynamicJwtToken = getAuthToken();
      if (!dynamicJwtToken) {
        throw new Error("No authentication token available");
      }
      const apiService = new ApiService(dynamicJwtToken);
      const result = await apiService.signMessage(
        message,
        accountAddress,
        password
      );
      return result;
    } catch (err) {
      console.error("Error signing message:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign message";
      setError(errorMessage);
      throw err;
    } finally {
      setSigning(false);
    }
  };

  const handleSignTransaction = async (
    data: string | { toAddress: string; amount: string },
    password: string
  ) => {
    if (typeof data === "string") {
      return;
    }

    try {
      setSigning(true);
      setError(null);
      const dynamicJwtToken = getAuthToken();
      if (!dynamicJwtToken) {
        throw new Error("No authentication token available");
      }
      const apiService = new ApiService(dynamicJwtToken);
      const result = await apiService.signTransaction(
        accountAddress,
        password,
        data.toAddress,
        Number(data.amount)
      );
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign transaction";
      setError(errorMessage);
      throw err;
    } finally {
      setSigning(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <p>Please log in to view account details.</p>
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
            <h1>Account Details</h1>
            <Button
              variant="secondary"
              onClick={() => router.push("/accounts")}
            >
              Back to Accounts
            </Button>
          </div>

          {loading ? (
            <div>Loading account details...</div>
          ) : !account ? (
            <div>Account not found.</div>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Account Information</h5>
                </Card.Header>
                <Card.Body>
                  <Table borderless>
                    <tbody>
                      <tr>
                        <td className="fw-bold" style={{ width: "150px" }}>
                          Address:
                        </td>
                        <td>{account.address}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Alias:</td>
                        <td>{account.alias || "N/A"}</td>
                      </tr>
                      {balance?.balance && (
                        <tr>
                          <td className="fw-bold">Balance:</td>
                          <td>{balance.balance}</td>
                        </tr>
                      )}
                      {account.updatedAt && (
                        <tr>
                          <td className="fw-bold">Last Updated:</td>
                          <td>{account.updatedAt}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  <div className="mt-3 d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setShowSignMessageModal(true)}
                      disabled={signing}
                    >
                      Sign Message
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => setShowSignTransactionModal(true)}
                      disabled={signing}
                    >
                      Sign Transaction
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {operations.length > 0 && (
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Operations History</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          {Object.keys(operations[0] || {}).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {operations.map((operation, index) => (
                          <tr key={index}>
                            {Object.values(operation).map((value, idx) => (
                              <td key={idx}>
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {operations.length === 0 && !loading && (
                <Card>
                  <Card.Body>
                    <p className="text-muted mb-0">No operations found.</p>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
          <SignModal
            show={showSignMessageModal}
            onHide={() => setShowSignMessageModal(false)}
            onSubmit={handleSignMessage}
            type="message"
            title="Sign Message"
            buttonText="Sign Message"
            loading={signing}
          />
          <SignModal
            show={showSignTransactionModal}
            onHide={() => setShowSignTransactionModal(false)}
            onSubmit={handleSignTransaction}
            type="transaction"
            title="Sign Transaction"
            buttonText="Sign Transaction"
            loading={signing}
          />
        </Container>
      </div>
    </div>
  );
};

export default function AccountPage() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
      }}
    >
      <AccountPageContent />
    </DynamicContextProvider>
  );
}
