"use client";

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Thin fetch wrapper that unwraps the { success, data } envelope. */
export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const payload = (await res.json().catch(() => ({}))) as ApiResult<T>;

  if (!res.ok || !payload.success) {
    throw new ApiError(
      payload.error ?? `Request failed (${res.status})`,
      res.status,
      payload.details,
    );
  }

  return payload.data as T;
}

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};
