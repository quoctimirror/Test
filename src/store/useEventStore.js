/**
 * Event Store - Zustand state management for Mirror Diamond Event
 * Flow: ticket -> name -> diamond -> result
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useEventStore = create(
  persist(
    (set, get) => ({
      // Current step in the flow
      currentStep: 'ticket', // 'ticket' | 'name' | 'diamond' | 'result'

      // User data
      user: null, // { id, ticketId, displayName, lightNumber, createdAt }

      // Selected diamond shape
      selectedDiamond: null,

      // Selected avatar background
      selectedBackground: 'pink',

      // Selected avatar scenery
      selectedScenery: 'mountains',

      // User's placed note (persisted)
      userNote: null,

      // All notes (not persisted, refreshed on load)
      allNotes: [],

      // Stats
      totalParticipants: 0,
      totalNotes: 0,

      // Audio state
      audioInitialized: false,

      // Demo mode
      isDemo: false,

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      setUser: (user) => set({ user }),

      setSelectedDiamond: (diamond) => set({ selectedDiamond: diamond }),

      setSelectedBackground: (background) => set({ selectedBackground: background }),

      setSelectedScenery: (scenery) => set({ selectedScenery: scenery }),

      setUserNote: (note) => set({ userNote: note }),

      addNote: (note) =>
        set((state) => ({
          allNotes: [...state.allNotes, note],
          totalNotes: state.totalNotes + 1,
        })),

      setAllNotes: (notes) => set({ allNotes: notes, totalNotes: notes.length }),

      setTotalParticipants: (count) => set({ totalParticipants: count }),

      setAudioInitialized: (initialized) => set({ audioInitialized: initialized }),

      setIsDemo: (isDemo) => set({ isDemo }),

      // Reset all state (logout)
      reset: () =>
        set({
          currentStep: 'ticket',
          user: null,
          selectedDiamond: null,
          selectedBackground: 'pink',
          selectedScenery: 'mountains',
          userNote: null,
          allNotes: [],
          totalParticipants: 0,
          totalNotes: 0,
          audioInitialized: false,
          isDemo: false,
        }),

      // Check if user has completed the flow
      hasCompletedFlow: () => {
        const { userNote } = get();
        return !!userNote;
      },

      // Resume from persisted state
      resumeFromPersistedState: () => {
        const { userNote } = get();
        if (userNote) {
          set({ currentStep: 'result' });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'mirror-diamond-event',
      // Only persist userNote and user to localStorage
      partialize: (state) => ({
        userNote: state.userNote,
        user: state.user,
      }),
    }
  )
);

export default useEventStore;
