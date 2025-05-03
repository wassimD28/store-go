import { create } from "zustand";

interface QuickStartStepperStore {
  activeStep: number;
  totalSteps: number;
  setActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useQuickStartStepperStore = create<QuickStartStepperStore>(
  (set) => ({
    activeStep: 1,
    totalSteps: 3,
    setActiveStep: (step) => set({ activeStep: step }),
    nextStep: () =>
      set((state) => ({
        activeStep:
          state.activeStep < state.totalSteps
            ? state.activeStep + 1
            : state.activeStep,
      })),
    prevStep: () =>
      set((state) => ({
        activeStep:
          state.activeStep > 1 ? state.activeStep - 1 : state.activeStep,
      })),
  }),
);
