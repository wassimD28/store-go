import { create } from "zustand";

type StepperState = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  // You can add more complex state and actions as needed
  isCompleted: (step: number) => boolean;
};

export const useQuickStartStepperStore = create<StepperState>((set, get) => ({
  activeStep: 1,
  setActiveStep: (step) => set({ activeStep: step }),
  nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
  prevStep: () =>
    set((state) => ({ activeStep: Math.max(1, state.activeStep - 1) })),
  reset: () => set({ activeStep: 1 }),
  isCompleted: (step) => step < get().activeStep,
}));
