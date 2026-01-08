"use client";

import { message } from "antd";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import constants from "../lib/constants";
import Utils from "../lib/utils";
import { BlogPost } from "../lib/types";

// --- Types ---

export interface UserData {
  jwt?: string;
  [key: string]: any;
}

export interface HeaderData {
  goBack: boolean;
  isSearch: boolean;
}

export interface StoreState {
  isLoading: boolean;
  darkMode: boolean;
  userdata: UserData | Record<string, never> | null;
  headerData: HeaderData;
  blogPosts?: BlogPost[];
  [key: string]: any;
}

export interface AppContextType {
  store: StoreState;
  setStore: (data: Partial<StoreState>, cache?: boolean) => void;
  apiRequest: (
    params: ApiRequestParams,
  ) => Promise<AxiosResponse | null | AxiosError>;
  logout: () => Promise<void>;
}

export interface ApiRequestParams extends AxiosRequestConfig {
  loading?: boolean;
  error?: boolean;
  disableForbidden?: boolean;
  onSuccess?: (res: AxiosResponse) => void;
  onError?: (err: Error | AxiosError) => void;
}

// --- Context ---

export const AppContext = React.createContext<AppContextType | null>(null);

export const defaultContextValues: StoreState = {
  isLoading: false,
  darkMode: false,
  userdata: {},
  headerData: {
    goBack: false,
    isSearch: false,
  },
};

// --- Provider ---

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [store, updateStore] = useState<StoreState>(defaultContextValues);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  // Use a ref to track displayed error messages to prevent duplications,
  // persisting across renders without causing re-renders itself.
  const displayedMessagesRef = useRef<Set<string>>(new Set());

  // Hydrate state from cache on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedVariables = Utils.getCachedVariables();
      if (cachedVariables && Object.keys(cachedVariables).length > 0) {
        setStore(cachedVariables);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug logging
  useEffect(() => {
    if (constants.isDevelopmentMode) {
      console.log("Store Updated:", store);
    }
  }, [store]);

  const setStore = useCallback(
    (data: Partial<StoreState> = {}, cache = false) => {
      updateStore((prevStore) => ({ ...prevStore, ...data }));

      if (cache) {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          // Check if value is valid for storage (truthy, false, or 0)
          if (value || value === false || value === 0) {
            const encodedKey = window.btoa(key);
            const stringValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);

            Utils.cacheStorage.setItem(
              encodedKey,
              Utils.encodeBase64(stringValue),
            );
          } else {
            Utils.cacheStorage.removeItem(window.btoa(key));
          }
        });
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      setStore({ userdata: null }, true);
      router.push(constants.route.login);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // We log or handle the error here, but maybe not throw unless necessary
      console.error("Logout failed:", errorMessage);
    }
  }, [router, setStore]);

  const apiRequest = useCallback(
    async (
      apiParams: ApiRequestParams = {},
    ): Promise<AxiosResponse | null | AxiosError> => {
      const {
        loading = true,
        disableForbidden = false,
        method = "GET",
        headers = {},
        url,
        data,
        params,
        onSuccess = () => {},
        onError = () => {},
        ...rest
      } = apiParams;

      // Helper to show errors with throttling
      const showErrorToast = (msg: string) => {
        if (!displayedMessagesRef.current.has(msg)) {
          displayedMessagesRef.current.add(msg);
          messageApi.error(msg);
          setTimeout(() => {
            displayedMessagesRef.current.delete(msg);
          }, 5000);
        }
      };

      if (!url) {
        showErrorToast("API request error: Missing URL");
        return null;
      }

      try {
        if (loading) {
          setStore({ isLoading: true });
        }

        // Construct full URL
        const fullUrl = url.startsWith("http")
          ? url
          : `${constants.imageHost}${url.startsWith("/") ? "" : "/"}${url}`;

        // Get token from cache (legacy support) or headers
        // Ideally we should rely on store.userdata, but keeping Utils fallback for safety
        const cachedUser = Utils.getCachedVariables("userdata");
        const token =
          ![constants.apis.login].includes(url) &&
          (cachedUser?.jwt || headers?.Authorization);

        const config: AxiosRequestConfig = {
          url: fullUrl,
          method,
          data,
          params,
          ...rest,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token && {
              Authorization:
                typeof token === "string" && token.startsWith("Bearer ")
                  ? token
                  : `Bearer ${token}`,
            }),
          },
        };

        const response = await axios.request(config);

        // Handle logical errors in 200 responses if backend sends them this way
        if (response?.data?.errorResponse?.message) {
          const msg = response.data.errorResponse.message;
          showErrorToast(`API response error: ${msg}`);
          onError(response.data.errorResponse);
          return null;
        }

        if ([200, 201, 204].includes(response.status) && response.data) {
          onSuccess(response);
          return response;
        }

        return null;
      } catch (e: unknown) {
        const error = e as AxiosError;
        const status = error.response?.status;

        // Handle specific error codes
        if ([401, 403].includes(status as number) && !disableForbidden) {
          setStore({ userdata: null }, true);
          router.push(constants.route.login);
        }

        if (status === 413) {
          showErrorToast("Request Entity Too Large");
        } else if (error) {
          const message = Utils.catchErrorResponse(e);
          showErrorToast(message);
        }

        onError(error);
        return error;
      } finally {
        if (loading) {
          setStore({ isLoading: false });
        }
      }
    },
    [messageApi, router, setStore],
  );

  const contextValue = useMemo(
    () => ({
      store,
      setStore,
      apiRequest,
      logout,
    }),
    [store, setStore, apiRequest, logout],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
