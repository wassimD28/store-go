# StoreGo Authentication Workflow Diagram

This document provides sequence diagrams for the different authentication workflows in the StoreGo platform.

## User Registration (Sign Up) Workflow

```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant API as StoreGo API
    participant Auth as Supabase Auth
    participant DB as Database

    MobileApp->>API: POST /auth/sign-up (name, email, password, storeId)
    API->>DB: Check if store exists
    DB-->>API: Store found/not found

    alt Store not found
        API-->>MobileApp: 404 - Store not found
    else Store found
        API->>Auth: createUser(email, password, metadata:{name, storeId})
        Auth-->>API: User created with ID

        API->>DB: Set store context for row-level security
        API->>DB: Insert user record with hashed password

        API->>Auth: signInWithPassword(email, password)
        Auth-->>API: Session tokens (access + refresh)

        API-->>MobileApp: 201 - User created with session tokens
    end
```

## User Authentication (Sign In) Workflow

```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant API as StoreGo API
    participant Auth as Supabase Auth
    participant DB as Database

    MobileApp->>API: POST /auth/sign-in (email, password, storeId)
    API->>DB: Check if user exists

    alt User not found
        DB-->>API: User not found
        API-->>MobileApp: 404 - Email not found
    else User found
        API->>Auth: signInWithPassword(email, password)

        alt Invalid credentials
            Auth-->>API: Authentication error
            API-->>MobileApp: 401 - Invalid credentials
        else Authenticated
            Auth-->>API: User data + tokens

            API->>API: Check if storeId matches user metadata

            alt StoreId mismatch
                API-->>MobileApp: 403 - User not associated with this store
            else StoreId match
                API->>DB: Set store context for row-level security
                API->>DB: Verify user exists in this store

                alt User not in store
                    DB-->>API: User not found
                    API-->>MobileApp: 404 - User not found in this store
                else User in store
                    API-->>MobileApp: 200 - User authenticated with session tokens
                end
            end
        end
    end
```

## Authenticated Request Workflow

```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant Middleware as isAuthenticated Middleware
    participant Auth as Supabase Auth
    participant API as API Controller
    participant DB as Database

    MobileApp->>Middleware: Request with Bearer token

    alt Missing/Invalid header
        Middleware-->>MobileApp: 401 - Invalid authorization header
    else Token provided
        Middleware->>Auth: getUser(token)

        alt Invalid token
            Auth-->>Middleware: Token error
            Middleware-->>MobileApp: 401 - Invalid or expired token
        else Valid token
            Auth-->>Middleware: User data with metadata

            alt No storeId in metadata
                Middleware-->>MobileApp: 403 - No store association
            else StoreId found
                Middleware->>Auth: set_store_context(storeId)
                Middleware->>API: Forward request with user context
                API->>DB: Database operations (filtered by store)
                DB-->>API: Query results (store-specific)
                API-->>MobileApp: 200 - Requested data
            end
        end
    end
```

## Token Refresh Workflow

```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant API as StoreGo API
    participant Auth as Supabase Auth

    MobileApp->>API: POST /auth/refresh (refreshToken)

    alt Missing token
        API-->>MobileApp: 400 - Refresh token required
    else Token provided
        API->>Auth: refreshSession(refreshToken)

        alt Invalid refresh token
            Auth-->>API: Token error
            API-->>MobileApp: 401 - Invalid refresh token
        else Valid refresh token
            Auth-->>API: New access & refresh tokens
            API-->>MobileApp: 200 - Updated session with new tokens
        end
    end
```

## Password Reset Workflow

```mermaid
sequenceDiagram
    participant User as User
    participant MobileApp as Mobile App
    participant API as StoreGo API
    participant Auth as Supabase Auth
    participant DB as Database

    %% Request Password Reset
    MobileApp->>API: POST /auth/request-reset (email, storeId)

    alt Missing email
        API-->>MobileApp: 400 - Email required
    else Email provided
        API->>DB: Check if user exists in store

        alt User not found
            DB-->>API: User not found
            API-->>MobileApp: 404 - User not found in store
        else User found
            API->>Auth: resetPasswordForEmail(email, redirectTo)
            Auth-->>User: Email with reset link
            Auth-->>API: Success/Error
            API-->>MobileApp: 200 - Reset email sent
        end
    end

    %% Complete Password Reset
    User->>MobileApp: Click reset link and set new password
    MobileApp->>API: POST /auth/reset-password (token, password, storeId)

    alt Missing token/password
        API-->>MobileApp: 400 - Token and password required
    else Token and password provided
        API->>Auth: verifyOtp(token_hash, type: 'recovery')

        alt Invalid token
            Auth-->>API: Token verification error
            API-->>MobileApp: 400 - Invalid reset token
        else Valid token
            API->>Auth: updateUser(password)
            API->>DB: Set store context for row-level security
            API-->>MobileApp: 200 - Password reset successful
        end
    end
```

## Logout Workflow

```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant API as StoreGo API
    participant Auth as Supabase Auth

    MobileApp->>API: POST /auth/sign-out with Bearer token

    alt Invalid header
        API-->>MobileApp: 401 - Invalid authorization header
    else Header provided
        API->>Auth: signOut()

        alt Standard logout successful
            Auth-->>API: Success
            API-->>MobileApp: 200 - User logged out
        else Standard logout fails
            API->>MobileApp: Request userId (body)
            MobileApp->>API: Provide userId

            alt UserId provided
                API->>Auth: deleteUser(userId)
                Auth-->>API: Success/Error
                API-->>MobileApp: 200 - Sessions invalidated
            else No fallback possible
                API-->>MobileApp: 200 - Clear local tokens
            end
        end
    end

    MobileApp->>MobileApp: Clear local tokens
```

## OAuth Authentication Workflow

```mermaid
sequenceDiagram
    participant MobileApp as Mobile App
    participant API as StoreGo API
    participant OAuthProvider as OAuth Provider
    participant OAuthService as OAuth Service
    participant Auth as Supabase Auth
    participant DB as Database

    %% Initiate OAuth
    MobileApp->>API: POST /oauth/initiate (provider, storeId, redirectUrl)
    API->>DB: Check if store exists

    alt Store not found
        API-->>MobileApp: 404 - Store not found
    else Store found
        API->>Auth: signInWithOAuth(provider, redirectUrl)
        Auth-->>API: OAuth URL
        API-->>MobileApp: 200 - OAuth URL

        %% OAuth Provider Authentication
        MobileApp->>OAuthProvider: Redirect to OAuth URL
        OAuthProvider->>OAuthProvider: User authenticates
        OAuthProvider-->>MobileApp: Authorization code & provider token

        %% OAuth Callback
        MobileApp->>API: POST /oauth/callback (accessToken, storeId, provider, providerToken)

        API->>Auth: getUser(accessToken)
        Auth-->>API: User data

        API->>OAuthService: validateProviderToken(provider, token, email)
        OAuthService->>OAuthProvider: Verify token directly with provider
        OAuthProvider-->>OAuthService: Token validation result
        OAuthService-->>API: Valid/Invalid token

        alt Invalid provider token
            API-->>MobileApp: 401 - Invalid authentication flow
        else Valid provider token
            API->>DB: Check if user exists in store

            alt User exists
                API->>DB: Update OAuth information
            else New user
                API->>DB: Create new user with OAuth data
            end

            API-->>MobileApp: 200 - Session with access token
        end
    end
```

These diagrams illustrate the complete authentication workflows in the StoreGo platform, from registration to authenticated API requests, providing a visual representation of the security mechanisms in place.
