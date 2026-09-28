# AI Dream Journal — Product Context

## Assignment

Build a polished **AI Dream Journal mobile app** within 24 hours.

Requirements:
- Expo + React Native
- Supabase
- Must run on phone or simulator
- Must use AI for:
  - Text
  - Images
  - Audio
- AI coding sessions must be saved as `.md` files inside `ai-logs/`
- Remove API keys/secrets from logs before pushing

Reference for UI quality and visual direction:
- Pillowtalk
- We will provide reference screenshots/images separately

Before designing screens, analyze the provided reference images, understand their design system, and then derive our screens according to that style rather than directly copying them.

---

# Product Idea

The app is a **voice-first AI dream journal**.

The user wakes up, records or writes a dream, and the app:

- Transcribes the dream
- Generates a title
- Detects emotions
- Detects important symbols/themes
- Generates dream artwork
- Asks one meaningful reflection question
- Saves the dream
- Finds connections with previous dreams

The app should feel emotional, calm, visual, premium, and personal.

It should not feel like a generic AI chatbot or notes app.

---

# USP — Dream Echo

Our main differentiator is:

> **Most dream journals interpret one dream. Our app remembers your dream world.**

The app detects recurring things across previous dreams, such as:

- Symbols
- People
- Places
- Emotions
- Themes

Example:

> **Dream Echo**  
> Water has appeared in 3 of your previous dreams.

This should be one of the key product moments.

---

# Core User Flow

```text
Open App
   ↓
Record / Write Dream
   ↓
AI Processing
   ↓
Dream Artwork + Analysis
   ↓
AI Reflection Question
   ↓
Dream Echo
   ↓
Save to Dream History
```

---

# Screens to Develop

## 1. Onboarding

Short 2–3 screen introduction.

Focus on:
- Remembering dreams
- Understanding recurring patterns
- Discovering your dream world

---

## 2. Home

Main entry screen.

Primary CTA:

> What do you remember?

Large voice recording action.

Also show:
- Write instead
- Recent dreams
- Recent Dream Echo if available

---

## 3. Dream Recording

Immersive voice capture screen.

Show:
- Recording state
- Audio visualization
- Timer
- Finish action

Keep it simple and distraction-free.

---

## 4. AI Processing

A polished transition screen.

Example:

> Remembering your dream...

Possible stages:

- Understanding the story
- Finding emotions
- Finding symbols
- Painting your dream

---

## 5. Dream Detail / Reveal

This is the main "wow" screen.

Show:
- AI-generated dream artwork
- Dream title
- Date
- Emotions
- Symbols/themes
- Dream transcript or summary

This screen should be highly visual.

---

## 6. AI Reflection

Show one thoughtful question based on the dream.

Example:

> The house felt familiar in your dream. Does it remind you of somewhere from your childhood?

User can answer by voice or text.

This can be part of Dream Detail if it fits the reference design better.

---

## 7. Dream Echo

Show recurring patterns from previous dreams.

Example:

> **Dream Echo**  
> Water appeared in 2 previous dreams.

Allow users to open related dreams.

This is the main USP.

---

## 8. Dream History

A visual gallery of previous dreams.

Use generated artwork as the main visual element.

Possible layout:
- Cards
- Gallery
- Timeline

Choose the layout after analyzing the reference screenshots.

---

# Optional Screen

## Dream Patterns

Only build if time allows.

Show simple patterns such as:

- Total dreams
- Most common emotion
- Most recurring symbol
- Most recurring theme

Do not turn this into a complex analytics dashboard.

---

# Design Direction

Use Pillowtalk as the quality benchmark.

Analyze reference screenshots for:

- Typography
- Spacing
- Colors
- Gradients
- Cards
- Border radius
- Navigation
- Buttons
- Visual hierarchy
- Motion
- Content density

Then re-evaluate our screens and derive the final layouts accordingly.

Do not blindly copy Pillowtalk.

Our design should feel more:
- Dream-like
- Atmospheric
- Calm
- Surreal
- Emotional

---

# Product Principles

1. Voice-first experience
2. Minimal steps
3. AI should feel embedded, not like ChatGPT
4. Dream artwork should be visually important
5. Show one meaningful insight instead of too much analysis
6. Dream Echo should communicate long-term memory
7. Polish is more important than number of features

---

# Do Not Prioritize

Avoid:
- Social features
- Payments
- Subscriptions
- Sleep tracking
- Lucid dreaming courses
- Dream dictionary
- Complex analytics
- Community features
- Complex settings
- Complicated graph visualizations

---

# Final Product Positioning

## Dream Echo

**A voice-first AI dream journal that turns dreams into visual memories and remembers what keeps returning.**

Core experience:

> **Speak → Visualize → Reflect → Connect**

Core USP:

> **Most dream journals interpret one dream. Dream Echo remembers your dream world.**
