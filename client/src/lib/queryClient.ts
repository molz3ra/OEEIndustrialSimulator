import { QueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        return apiRequest("GET", url);
      },
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Do not retry 401 or 403 or 404
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5000,
    },
  },
});
