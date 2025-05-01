export class OAuthService {
  static async validateProviderToken(
    provider: string,
    token: string,
    email: string,
  ) {
    switch (provider.toLowerCase()) {
      case "google":
        return OAuthService.validateGoogleToken(token, email);
      default:
        console.error(`Unsupported provider: ${provider}`);
        return false;
    }
  }

  static async validateGoogleToken(token: string, email: string) {
    try {
      // Google's token info endpoint
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!userInfoResponse.ok) {
        console.log("Couldn't access user Info");
        return false;
      }

      const data = await userInfoResponse.json();
      console.log("user info response email_verified: ", data.email_verified);
      console.log("user info response email: ", data.email);
      console.log("method param email: ", email);
      // Verify the email matches
      console.log(
        "Verify the email matches: ",
        data.email === email && data.email_verified === true,
      );
      return data.email === email && data.email_verified === true;
    } catch (error) {
      console.error("Google token validation error:", error);
      return false;
    }
  }
}
