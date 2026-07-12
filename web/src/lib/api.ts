const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error ?? `request failed with status ${res.status}`;
    throw new ApiError(message);
  }

  return body as T;
}

export type User = {
  username: string;
  full_name: string;
  email: string;
  created_at: string;
};

export type Account = {
  id: number;
  owner: string;
  balance: number;
  currency: string;
  created_at: string;
};

export type Transfer = {
  transfer: {
    id: number;
    from_account_id: number;
    to_account_id: number;
    amount: number;
    created_at: string;
  };
  from_account: Account;
  to_account: Account;
};

export type LoginResponse = {
  session_id: string;
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user: User;
};

export function registerUser(input: {
  username: string;
  password: string;
  full_name: string;
  email: string;
}) {
  return request<User>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { username: string; password: string }) {
  return request<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAccounts(pageId = 1, pageSize = 10) {
  return request<Account[]>(
    `/accounts?page_id=${pageId}&page_size=${pageSize}`,
  );
}

export function getAccount(id: number) {
  return request<Account>(`/accounts/${id}`);
}

export function createAccount(currency: string) {
  return request<Account>("/accounts", {
    method: "POST",
    body: JSON.stringify({ currency }),
  });
}

export function createTransfer(input: {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  currency: string;
}) {
  return request<Transfer>("/transfers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
