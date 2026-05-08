-- =============================================================================
-- Adds six new templates to the Ledger Line catalog without disturbing the
-- existing 12. Idempotent: re-running just refreshes the slot_spec for each
-- listed slug.
-- =============================================================================

insert into public.templates (slug, name, description, cadence, slot_spec) values

  -- 1. Magazine: long-form, feature-heavy, two photo spotlights.
  ('magazine-issue', 'Magazine Issue', 'Long-form magazine-style edition with multiple features, an interview, and photo spotlights.', 'quarterly',
   $${
     "slots": [
       {"name": "cover",            "type": "cover"},
       {"name": "editors_note",     "type": "welcome_letter",       "hint": "Editor's note framing this issue's theme.",                     "min_words": 120, "max_words": 200},
       {"name": "cover_story",      "type": "feature_article",      "hint": "The lead piece. Full investigation or analysis.",               "min_words": 600, "max_words": 1000},
       {"name": "interview",        "type": "corner_office",        "hint": "Long-form interview / column from a guest leader.",             "min_words": 500, "max_words": 800},
       {"name": "second_feature",   "type": "feature_article",      "hint": "Companion feature on a related angle.",                         "min_words": 400, "max_words": 700},
       {"name": "spotlight_one",    "type": "compliance_champion",  "hint": "First photo essay / spotlight."},
       {"name": "spotlight_two",    "type": "compliance_champion",  "hint": "Second photo essay / spotlight."},
       {"name": "third_feature",    "type": "feature_article",      "hint": "Shorter closing piece — opinion, perspective, or outlook.",     "min_words": 300, "max_words": 500},
       {"name": "dates_to_remember","type": "dates_to_remember"},
       {"name": "closing_cta",      "type": "closing_cta"}
     ]
   }$$::jsonb),

  -- 2. Poster: single-page promotional broadcast.
  ('poster-flyer', 'Poster / Flyer', 'Single-page broadcast for an event, announcement, or call to action.', 'special',
   $${
     "slots": [
       {"name": "cover",          "type": "cover"},
       {"name": "main_card",      "type": "award_announcement",   "hint": "The dominant card — event details, headline announcement, or CTA."},
       {"name": "message",        "type": "feature_article",      "hint": "Short message tying it together — 150–300 words is plenty.", "min_words": 100, "max_words": 300},
       {"name": "closing_cta",    "type": "closing_cta",          "hint": "Where to RSVP, register, or reach out."}
     ]
   }$$::jsonb),

  -- 3. Interactive Workshop: policy refreshers paired with quizzes.
  ('interactive-workshop', 'Interactive Workshop', 'Self-led learning pack — paired policy refreshers and red-flag scenarios with recognition.', 'onboarding',
   $${
     "slots": [
       {"name": "cover",            "type": "cover"},
       {"name": "intro",            "type": "welcome_letter",       "hint": "How to work through this pack — pacing, scoring, where to send answers.", "min_words": 80,  "max_words": 150},
       {"name": "policy_one",       "type": "policy_refresher",     "hint": "First policy under the spotlight."},
       {"name": "scenario_one",     "type": "spot_the_red_flag",    "hint": "Quiz that exercises policy_one."},
       {"name": "policy_two",       "type": "policy_refresher",     "hint": "Second policy under the spotlight."},
       {"name": "scenario_two",     "type": "spot_the_red_flag",    "hint": "Quiz that exercises policy_two."},
       {"name": "recognition",      "type": "compliance_champion",  "hint": "Recognition for completion — hall of fame from the last cycle."},
       {"name": "closing_cta",      "type": "closing_cta",          "hint": "Submission instructions for completed worksheets."}
     ]
   }$$::jsonb),

  -- 4. Event Recap: post-event coverage with three highlights.
  ('event-recap', 'Event Recap', 'Post-event coverage with photo highlights, takeaways, and thank-yous.', 'special',
   $${
     "slots": [
       {"name": "cover",          "type": "cover"},
       {"name": "intro",          "type": "welcome_letter",       "hint": "Set the scene — when, where, who attended.",       "min_words": 80,  "max_words": 150},
       {"name": "recap",          "type": "feature_article",      "hint": "Narrative recap of the event.",                    "min_words": 400, "max_words": 700},
       {"name": "highlight_one",  "type": "compliance_champion",  "hint": "First photo highlight — moment, person, or panel."},
       {"name": "highlight_two",  "type": "compliance_champion",  "hint": "Second highlight."},
       {"name": "highlight_three","type": "compliance_champion",  "hint": "Third highlight."},
       {"name": "takeaways",      "type": "quick_hits",           "hint": "Key takeaways — short, punchy, memorable."},
       {"name": "closing_cta",    "type": "closing_cta",          "hint": "Thank-yous and next-event teaser."}
     ]
   }$$::jsonb),

  -- 5. Crisis Memo: urgent alert (red-themed via lib/theme.ts).
  ('crisis-memo', 'Crisis Memo', 'Urgent single-topic memo with immediate next steps, deadlines, and escalation contacts.', 'special',
   $${
     "slots": [
       {"name": "cover",            "type": "cover",                "hint": "Urgent hero — short kicker, sharp title."},
       {"name": "what_happened",    "type": "feature_article",      "hint": "What happened, when, who's affected. Plain and direct.", "min_words": 200, "max_words": 400},
       {"name": "what_to_do",       "type": "policy_refresher",     "hint": "Immediate next steps — WHAT IT SAYS / WHY / WHAT YOU DO."},
       {"name": "deadlines",        "type": "dates_to_remember",    "hint": "Hard deadlines triggered by this event."},
       {"name": "contacts",         "type": "quick_hits",           "hint": "Escalation contacts and FAQ — name + how to reach them."},
       {"name": "closing_cta",      "type": "closing_cta",          "hint": "Single emergency contact — make it impossible to miss."}
     ]
   }$$::jsonb),

  -- 6. Compliance Brief: short monthly pulse.
  ('compliance-brief', 'Compliance Brief', 'Short monthly pulse — sign-off note, quick hits, and key dates. Half the length of the standard monthly.', 'monthly',
   $${
     "slots": [
       {"name": "cover",          "type": "cover"},
       {"name": "note",           "type": "welcome_letter",       "hint": "One-paragraph note from the desk.",          "min_words": 50, "max_words": 120},
       {"name": "quick_hits",     "type": "quick_hits",           "hint": "3–5 short news items."},
       {"name": "dates",          "type": "dates_to_remember",    "hint": "Key dates for the next 30 days."},
       {"name": "closing_cta",    "type": "closing_cta"}
     ]
   }$$::jsonb)

  on conflict (slug) do update
  set name        = excluded.name,
      description = excluded.description,
      cadence     = excluded.cadence,
      slot_spec   = excluded.slot_spec;
