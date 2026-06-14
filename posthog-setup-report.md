<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Lingua language learning app. The integration covers the full user lifecycle: onboarding, authentication (email OTP + OAuth), language selection, and screen navigation. PostHog is configured via `app.config.js` extras and `expo-constants`, keeping secrets out of the bundle. A `PostHogProvider` wraps the app in the root layout, enabling autocapture and `usePostHog()` across all screens. Manual screen tracking fires on every pathname change via Expo Router. Users are identified on sign-in and sign-up (by email) and again when Clerk loads the session (by Clerk user ID), covering email, OAuth, and session-restore flows.

| Event | Description | File |
|-------|-------------|------|
| `onboarding_get_started_tapped` | User taps Get Started on the onboarding screen | `src/app/onboarding.tsx` |
| `sign_up_started` | User submits the sign-up form (email + password) | `src/app/signup.tsx` |
| `sign_up_completed` | User verifies email OTP and finalizes account creation | `src/app/signup.tsx` |
| `sign_up_oauth_completed` | User completes sign-up via Google, Facebook, or Apple | `src/app/signup.tsx` |
| `sign_in_started` | User submits email to initiate OTP sign-in | `src/app/signin.tsx` |
| `sign_in_completed` | User verifies OTP and finalizes sign-in | `src/app/signin.tsx` |
| `sign_in_oauth_completed` | User completes sign-in via Google, Facebook, or Apple | `src/app/signin.tsx` |
| `language_selected` | User confirms their first language selection | `src/app/language-select.tsx` |
| `language_changed` | Existing user changes their active learning language | `src/app/language-select.tsx` |
| `email_verification_resent` | User requests a new OTP verification code | `src/components/ui/otp-verification-modal.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/201043/dashboard/747301)
- [Sign-up funnel: Onboarding → Completed](https://eu.posthog.com/project/201043/insights/fcEMvY2J)
- [Full auth conversion funnel](https://eu.posthog.com/project/201043/insights/W2o6r7hw)
- [Daily sign-ins and sign-ups](https://eu.posthog.com/project/201043/insights/TOQXR5C6)
- [Sign-up completions: Email vs OAuth](https://eu.posthog.com/project/201043/insights/Q4576EMu)
- [Language selection activity](https://eu.posthog.com/project/201043/insights/eGk3WOkY)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
