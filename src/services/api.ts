export class ApiService {
  private readonly headers: Headers;
  private readonly apiUrl: string;
  constructor(private readonly token: string) {
    this.apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    this.headers = new Headers();
    this.headers.set("authorization", `${this.token}`);
    this.headers.set("content-type", "application/json");
  }

  async getAccounts() {
    const response = await fetch(`${this.apiUrl}/accounts`, {
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    return response.json();
  }

  async createAccount(alias: string, password: string) {
    const response = await fetch(`${this.apiUrl}/account`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ alias, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create account: ${error.errors.join(", ")}`);
    }
    return response.json();
  }

  async updateAccount(
    address: string,
    {
      alias,
      newPassword,
      existingPassword,
    }: { alias?: string; newPassword?: string; existingPassword?: string }
  ) {
    const response = await fetch(`${this.apiUrl}/account/${address}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify({
        ...(alias ? { alias } : {}),
        ...(newPassword ? { newPassword } : {}),
        ...(existingPassword ? { existingPassword } : {}),
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update account: ${response.statusText}`);
    }
    return response.json();
  }

  async getAccount(address: string) {
    const response = await fetch(`${this.apiUrl}/account/${address}`, {
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.statusText}`);
    }
    return response.json();
  }

  async getAccountBalance(address: string) {
    const response = await fetch(`${this.apiUrl}/accounts/${address}/balance`, {
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch account balance: ${response.statusText}`
      );
    }
    return response.json();
  }

  async signMessage(message: string, address: string, password: string) {
    const response = await fetch(`${this.apiUrl}/sign-message`, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify({ message, address, password }),
    });
    if (!response.ok) {
      throw new Error(`Failed to sign message: ${response.statusText}`);
    }
    return response.json();
  }

  async signTransaction(address: string, password: string, to: string, amount: number) {
    const response = await fetch(`${this.apiUrl}/sign-transaction`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        transaction: {
          to,
          amount,
        },
        chain: "sepolia",
        address,
        password,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to sign transaction: ${response.statusText}`);
    }
    return response.json();
  }

  async getOperations(address: string) {
    const response = await fetch(`${this.apiUrl}/account/${address}/history`, {
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch operations: ${response.statusText}`);
    }
    return response.json();
  }
}
