import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    
    // Provide user-friendly messages for common HTTP errors
    switch (res.status) {
      case 400:
        errorMessage = "Please check your input and try again.";
        break;
      case 401:
        errorMessage = "Invalid username or password.";
        break;
      case 403:
        errorMessage = "You don't have permission to do this.";
        break;
      case 404:
        errorMessage = "The requested resource was not found.";
        break;
      case 500:
        errorMessage = "Something went wrong on our end. Please try again.";
        break;
      default:
        errorMessage = `Error: ${res.statusText || 'Unknown error'}`;
    }
    
    // Try to get more specific error message from response body
    try {
      const text = await res.text();
      if (text) {
        const errorData = JSON.parse(text);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
    } catch (e) {
      // Keep the default user-friendly message
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  try {
    return await res.json();
  } catch (e) {
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
