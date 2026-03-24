import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHaStore = create(persist(
  (set) => ({
    haUrl: '',
    accessToken: null,
    refreshToken: null,
    tokenExpires: null,  // Unix ms timestamp
    deviceId: '',

    setHaUrl: (url) => set({ haUrl: url.replace(/\/$/, '') }),

    setTokens: ({ accessToken, refreshToken, expiresIn }) => set({
      accessToken,
      refreshToken,
      tokenExpires: Date.now() + expiresIn * 1000,
    }),

    setDeviceId: (id) => set({ deviceId: id }),

    disconnect: () => set({
      accessToken: null,
      refreshToken: null,
      tokenExpires: null,
    }),
  }),
  { name: 'mqttdash-ha-auth' }
));
