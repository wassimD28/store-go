// This function dynamically generates the appropriate border-radius class
export const getRadiusClass = (radius: string) => {
  switch (radius) {
    case "none":
      return "";
    case "sm":
      return "rounded-sm";
    case "md":
      return "rounded-md";
    case "lg":
      return "rounded-lg";
    case "full":
      return "rounded-full";
    default:
      return "";
  }
};
