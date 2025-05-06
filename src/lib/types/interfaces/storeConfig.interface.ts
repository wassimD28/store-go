export interface StoreConfig {
  metadata: {
    storeId: string;
    storeName: string;
    description: string;
    apiEndpoint: string;
    callbackUrl: string;
    templateName: string;
    storeSlogan: string;
    templateType: "fashion" | "electronic" | "shoes";
  };
  app: {
    name: string;
    bundleId: string;
    version: {
      name: string;
      code: number;
    };
    supportedLocales: string[];
  };
  design: {
    radius: 0 | 5 | 10 | 15 | 100;
    lightTheme: {
      backgroundColor: string;
      foregroundColor: string;
      cardColor: string;
      cardForegroundColor: string;
      primaryColor: string;
      primaryForegroundColor: string;
      mutedColor: string;
      mutedForegroundColor: string;
      inputColor: string;
      inputForegroundColor: string;
      borderColor: string;
    };
    darkTheme: {
      backgroundColor: string;
      foregroundColor: string;
      cardColor: string;
      cardForegroundColor: string;
      primaryColor: string;
      primaryForegroundColor: string;
      mutedColor: string;
      mutedForegroundColor: string;
      inputColor: string;
      inputForegroundColor: string;
      borderColor: string;
    };
  };
  splashScreen: {
    lightIconUrl: string;
    darkIconUrl: string;
    lightBackgroundColor: string;
    darkBackgroundColor: string;
  };
}
