import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '../types';

interface SessionState {
  sessionId: number | null;
  tableId: number | null;
  session: Session | null;
  isOwner: boolean;
  setSession: (session: Session, isOwner?: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      tableId: null,
      session: null,
      isOwner: false,
      setSession: (session: Session, isOwner = false) => {
        set({
          sessionId: session.id,
          tableId: session.tableId,
          session,
          isOwner,
        });
      },
      clearSession: () => {
        set({
          sessionId: null,
          tableId: null,
          session: null,
          isOwner: false,
        });
      },
    }),
    {
      name: 'session-storage',
    }
  )
);

