**ClosetCoach**

AI Outfit Planning & Wardrobe Optimizer

*Full Business & Product Plan · 2025--2027*

*\"Get dressed faster, wear your clothes more, and stop buying
duplicates.\"*

**1. Executive Summary**

*The one-page view of what ClosetCoach is, why it matters, and where
it\'s headed.*

ClosetCoach is a mobile-first AI application that eliminates wardrobe
decision fatigue and clothing waste by turning a user\'s existing closet
into a personalized, context-aware styling engine. The app recommends
daily outfits based on weather, calendar events, and wear history ---
and tracks what users actually wear to continuously improve suggestions.

The problem is universal and underserved. Studies consistently show that
the average person wears only 20% of their wardrobe 80% of the time.
Existing solutions are either social platforms (Instagram, Pinterest)
with no personalization engine, or expensive human stylist services.
ClosetCoach occupies the gap: intelligent, private, personal, and
affordable.

> *Mission: Help people derive maximum value from what they already own
> --- reducing waste, saving time, and building genuine personal style.*

**Summary of Key Plan Decisions**

  -----------------------------------------------------------------------
  **Dimension**               **Decision**
  --------------------------- -------------------------------------------
  Launch persona              Busy Professional (Priya) --- highest WTP,
                              clearest ROI

  Launch market               English-speaking urban markets: US, UK,
                              Canada, Australia

  Revenue model               Freemium subscription --- free tier to
                              build habit, paid for intelligence

  Paid tier price             \$6.99/month or \$49.99/year

  MVP timeline                6 months to public beta

  Team (seed)                 2 engineers, 1 designer, 1 founder/PM

  Seed funding target         \$1.2M --- 18-month runway

  Year 1 target               50,000 MAU, 8% paid conversion, \~\$280K
                              ARR

  Year 3 target               800,000 MAU, 12% paid, \~\$6.7M ARR
  -----------------------------------------------------------------------

**2. Problem & Market Opportunity**

**2.1 The Core Problems**

**Decision Fatigue**

The average person spends 17 minutes each morning deciding what to wear
--- roughly 100 hours per year. This is not a trivial annoyance;
decision fatigue compounds across a day, degrading subsequent choices
and increasing stress. High-achieving professionals are
disproportionately affected because they carry heavier daily cognitive
loads.

**Wardrobe Waste**

-   The average US household spends \$1,800/year on clothing.

-   Research by the Waste & Resources Action Programme (WRAP) found that
    a garment is worn on average only 10 times before being discarded.

-   An estimated \$400B in unused clothing sits in US wardrobes at any
    given time.

-   Fast fashion contributes \~10% of global carbon emissions --- driven
    partly by impulse purchasing of items that duplicate what people
    already own.

**The Existing Solutions Gap**

  ------------------------------------------------------------------------
  **Solution**       **Strength**           **Key Weakness**
  ------------------ ---------------------- ------------------------------
  Pinterest /        Visual inspiration     No personalization, no closet
  Instagram                                 integration

  Cladwell /         Manual wardrobe        No intelligence layer, high
  Stylebook          catalog                manual effort

  Stitch Fix / Trunk Human curation         \$100+ per delivery, not
  Club                                      sustainable

  Generic AI         Flexible               No wardrobe data, no context,
  chatbots                                  no memory

  ClosetCoach (us)   AI + personal closet + Cold start (onboarding
                     context                friction)
  ------------------------------------------------------------------------

**2.2 Market Size**

  ------------------------------------------------------------------------
  **Market**    **Definition**                     **Size (2024)**
  ------------- ---------------------------------- -----------------------
  TAM           Global fashion & styling app       \~\$4.2B
                market                             

  SAM           AI personal styling apps,          \~\$620M
                English-speaking smartphone users  

  SOM (Y3)      Realistic addressable share given  \~\$25M
                team & budget constraints          
  ------------------------------------------------------------------------

Key tailwinds driving growth: AI capability cost reduction (inference is
10x cheaper in 2024 vs 2022), Gen Z\'s documented preference for
sustainable consumption, and mainstream awareness of capsule wardrobe
thinking via social media.

**3. Target Users & Personas**

*Three distinct users with different motivations, behaviors, and
willingness to pay.*

**Persona 1 --- Busy Professional \'Priya\' (Primary Launch Target)**

  -----------------------------------------------------------------------
  **Attribute**      **Detail**
  ------------------ ----------------------------------------------------
  Age                25--35

  Context            Urban, full-time professional role (consultant,
                     lawyer, product manager, etc.)

  Core pain          Wasted mornings, outfit repeats in front of clients,
                     inefficient packing for trips

  Key feature pull   Daily outfit suggestions, calendar integration, trip
                     packing lists

  Willingness to pay High --- \$7--15/month is trivial vs. time saved

  Churn risk         Low if habit formed in first 2 weeks

  Growth channel     Word of mouth with colleagues; shareable packing
                     lists
  -----------------------------------------------------------------------

> *Priya\'s success story: \'I planned 4 days of client meetings in 8
> minutes on Sunday night. I haven\'t worn the same thing twice in front
> of the same client in 3 months.\'*

**Persona 2 --- Student \'Sam\' (Secondary, Volume Driver)**

  -----------------------------------------------------------------------
  **Attribute**      **Detail**
  ------------------ ----------------------------------------------------
  Age                16--22

  Context            High school or college, socially conscious, limited
                     budget

  Core pain          \'I have nothing to wear\' while closet is full;
                     wants fresh daily looks

  Key feature pull   Outfit ideas, wear tracking, re-styling old items

  Willingness to pay Low --- free tier only or \$3/month max; monetize
                     via affiliate

  Growth channel     TikTok, Instagram, peer sharing --- viral potential
                     is highest here
  -----------------------------------------------------------------------

**Persona 3 --- Eco-Conscious Minimalist \'Elena\'**

  -----------------------------------------------------------------------
  **Attribute**      **Detail**
  ------------------ ----------------------------------------------------
  Age                30--45

  Context            Intentional consumer, owns quality over quantity,
                     avoids impulse buys

  Core pain          Wants to maximize wear-per-item; hates owning things
                     she doesn\'t use

  Key feature pull   Wear frequency analytics, \'not worn in 90 days\'
                     alerts, donation flow

  Willingness to pay Medium --- \$5--8/month if mission aligns

  Growth channel     Sustainability communities, slow fashion blogs, word
                     of mouth
  -----------------------------------------------------------------------

**3.1 Persona Priority for MVP**

All three are real and valuable, but the MVP cannot serve all equally
well. Launch priority: Priya first, Elena second, Sam third. Rationale:

-   Priya drives the highest LTV and most word-of-mouth within
    professional networks.

-   Elena\'s use case requires the same core analytics as Priya\'s, so
    she benefits from Priya features at no additional build cost.

-   Sam requires social features (sharing, community) that are expensive
    to build and operate --- defer to post-MVP.

**4. Product Plan**

*Three phases --- MVP to platform --- with clear entry and exit criteria
for each.*

**4.1 Phase 1 --- MVP (Months 1--6): Build the Core Habit Loop**

Goal: Deliver the daily outfit suggestion loop end-to-end. The user
should be able to add their wardrobe, receive a useful suggestion, and
log a wear in under 3 minutes total on Day 1.

**MVP Feature Set**

  --------------------------------------------------------------------------
  **Feature**                  **Description**                **Priority**
  ---------------------------- ------------------------------ --------------
  Wardrobe capture             Photo or gallery upload;       P0
                               manual tag confirmation (type, 
                               color, season, occasion)       

  Auto-tag suggestion          Vision API (GPT-4o or Gemini)  P0
                               suggests                       
                               category/color/season; user    
                               confirms                       

  Daily outfit suggestion      1--3 ranked outfits; uses      P0
                               weather API + time-of-day;     
                               simple rule engine             

  Wear logging                 One-tap \'Wearing this         P0
                               today\'; persisted to WearLog  

  Basic outfit editor          Swap individual items; save to P1
                               favorites                      

  Calendar integration         Read-only iOS/Android calendar P1
                               for event context (meeting vs. 
                               casual)                        

  Wear frequency view          Simple analytics: items worn   P1
                               0x, 1--3x, 4+ in last 90 days  

  Trip packing list            Select trip dates; app         P1
                               schedules outfits; exports     
                               item list                      

  Onboarding flow              Style quiz (3 questions); add  P0
                               5 items to unlock suggestions  

  Search & filter              Filter wardrobe by color,      P2
                               type, season, or \'not worn in 
                               90 days\'                      
  --------------------------------------------------------------------------

**MVP Exit Criteria**

-   D7 retention ≥ 35% for users who add 10+ items

-   Outfit suggestion acceptance rate ≥ 50% (user taps Wear or saves)

-   Average onboarding completion: add 5+ items within first session

-   App Store rating ≥ 4.2 after 100 reviews

**4.2 Phase 2 --- Intelligence Layer (Months 7--12): Make the AI
Actually Smart**

Goal: Move from rules-based suggestions to a learned preference model.
Introduce scored outfit quality and the first social hook.

**Phase 2 Feature Set**

  ------------------------------------------------------------------------
  **Feature**              **Description**                 **Priority**
  ------------------------ ------------------------------- ---------------
  Preference learning      Model learns from               P0
                           accepts/rejects over time;      
                           outfit ranking improves         

  Outfit scoring           Comfort, formality, novelty,    P0
                           warmth scores displayed per     
                           suggestion                      

  Wear-this-first ranking  Surface under-used items that   P0
                           still match style preferences   

  Background removal       On-device MediaPipe / TFLite    P1
                           auto-crop for cleaner item      
                           images                          

  Body shape & style       Optional style profile (body    P1
  tuning                   shape, color palettes, style    
                           words)                          

  Donation flow            Mark item as \'donate\'; link   P1
                           to ThredUp / local charity      

  Shareable outfit card    Export outfit as a styled image P1
                           card (viral hook for Priya &    
                           Sam)                            

  Re-wear timer nudge      Push: \'You haven\'t worn       P2
                           \[item\] in 60 days --- here\'s 
                           an outfit using it\'            

  Occasion history         Tag a wear with occasion:       P2
                           \'client meeting\', \'date\',   
                           \'casual day\'                  
  ------------------------------------------------------------------------

**4.3 Phase 3 --- Platform & Monetization (Months 13--24): Scale the
Ecosystem**

Goal: Add revenue-driving features, community, and partnerships that
turn ClosetCoach into a platform, not just a utility.

**Phase 3 Feature Set**

  -----------------------------------------------------------------------
  **Feature**                 **Description**
  --------------------------- -------------------------------------------
  Smart shopping gap analysis Identify missing wardrobe essentials;
                              suggest sustainable brands

  Affiliate product links     Earn 4--8% commission on clicked/purchased
                              recommendations

  Community looks             Public outfit inspiration feed (opt-in);
                              follow other users

  Stylist micro-consults      Book 30-min video session with a vetted
                              stylist via the app

  AR try-on preview           Camera overlay for selecting between outfit
                              options

  Brand partnerships          Sponsored \'capsule collections\' from
                              sustainable brands

  ClosetCoach for Teams       B2B: uniform or dress-code management for
                              retail, hospitality
  -----------------------------------------------------------------------

**5. Technical Architecture**

*Pragmatic, scalable, privacy-first. Start with third-party AI APIs to
ship fast; migrate to custom models once data justifies it.*

**5.1 Technology Choices**

  ------------------------------------------------------------------------
  **Layer**        **Phase 1 Choice**    **Rationale / Future Migration**
  ---------------- --------------------- ---------------------------------
  Mobile           React Native (Expo)   Single codebase iOS + Android;
                                         fast iteration; large talent pool

  Image AI         GPT-4o Vision API or  Excellent zero-shot
  (tagging)        Gemini Flash          classification; no ML infra
                                         needed; \~\$0.003/image

  Background       Remove.bg API (P1) →  API first; migrate to on-device
  removal          on-device TFLite (P2) for privacy + cost at scale

  Outfit           Rule engine +         Graduate to learned embeddings
  recommendation   collaborative         model in Phase 2
                   filtering (Phase 1)   

  Backend API      Node.js (Fastify) or  Thin layer; stateless; easy to
                   Python (FastAPI)      scale horizontally

  Database         PostgreSQL (Supabase) Managed; row-level security; good
                                         for auth + file storage

  File storage     Supabase Storage      Images stored per-user; private
                   (S3-compatible)       URLs with expiry

  Auth             Supabase Auth (magic  Friction-free for mobile
                   link + Apple/Google   consumers
                   SSO)                  

  Weather API      Open-Meteo (free) or  Reliable, low cost, good forecast
                   Tomorrow.io           accuracy

  Calendar         Native OS calendar    Privacy-preserving; no OAuth
                   read access (no       complexity
                   cloud)                

  Push             Expo Push + APNs/FCM  Reliable; works with Expo managed
  notifications                          workflow

  Analytics        PostHog (self-hosted  Full funnel; session replay; open
                   or cloud)             source

  Error monitoring Sentry                Industry standard; free tier
                                         sufficient for Phase 1
  ------------------------------------------------------------------------

**5.2 Data Model (Core Entities)**

  -----------------------------------------------------------------------
  **Entity**       **Key Fields**
  ---------------- ------------------------------------------------------
  User             id, age_range, style_prefs (JSON), timezone,
                   location_perms, subscription_tier

  Item             id, user_id, image_uri, category, color\[\],
                   season\[\], material, occasion\[\], wear_count,
                   last_worn, donate_flag, tags\[\]

  Outfit           id, user_id, item_ids\[\], score_tags (JSON),
                   last_worn, favorite_flag, occasion_tag

  WearLog          id, user_id, outfit_id, timestamp, occasion_tag,
                   location (optional)

  Schedule         id, user_id, date, outfit_id, trip_id

  Trip             id, user_id, name, start_date, end_date, destination,
                   packing_list_exported

  Preference       id, user_id, signal_type (accept/reject/wear),
                   outfit_id, timestamp
  -----------------------------------------------------------------------

**5.3 ML & Recommendation Engine (Phased)**

**Phase 1 --- Rule-Based Suggestion Engine**

-   Filter items by weather suitability (temperature ranges, rain flag).

-   Filter by calendar event type (meeting → formal; gym → athletic).

-   Score remaining outfits by: color harmony rules, wear frequency
    inverse (boost unworn items), occasion history match.

-   Return top 3 ranked outfits.

**Phase 2 --- Learned Preference Model**

-   Item embeddings: train a small CNN or use CLIP embeddings on item
    images. Each item → 128-dim vector.

-   Outfit compatibility: pairwise cosine similarity between items in an
    outfit.

-   User preference: log accepts/rejects/wears as implicit feedback;
    fine-tune ranking with a lightweight GBDT or two-tower model.

-   Wear optimizer: multi-armed bandit (Thompson Sampling) to balance
    exploration (unworn items) vs. exploitation (known favorites).

**Phase 3 --- Personalized & Social**

-   Collaborative filtering: \'Users like you also wear\...\' for
    shopping gap suggestions.

-   Body shape adaptation: learn which silhouettes/proportions a user
    accepts over time.

-   Community signal: surface community outfit ratings as a weak feature
    signal (opt-in only).

**5.4 Privacy Architecture**

-   Local-first processing: all image inference runs on-device or via
    user\'s session (no images stored on server unless explicitly
    synced).

-   Cloud sync is optional and end-to-end encrypted (user holds key).

-   No third-party ad SDKs in the app. Ever.

-   GDPR/CCPA compliant from Day 1: full data export, right to deletion,
    clear consent for location.

-   Images never used for model training without explicit written
    consent with compensation.

**6. Go-to-Market Strategy**

*Tight focus in Year 1. Prove the loop with one persona before
expanding.*

**6.1 Launch Strategy**

**Phase 1 Launch (Beta --- Months 4--6)**

-   Closed beta with 500 hand-picked Priya users recruited from:
    LinkedIn professionals, fashion/minimalism newsletters, ProductHunt
    waitlist.

-   Incentive: lifetime 50% discount for beta testers who complete
    30-day active use and leave a review.

-   Goal: D30 retention ≥ 30%, collect 200+ NPS responses, iterate on
    onboarding flow.

**Phase 2 Public Launch (Month 7)**

-   ProductHunt launch (#1 Product of the Day target --- coordinate
    upvote squad 2 weeks out).

-   App Store Optimization: keywords --- \'outfit planner\', \'wardrobe
    organizer\', \'what to wear app\', \'capsule wardrobe\'.

-   Press: pitch to TechCrunch, The Verge, Fast Company with embargo.
    Angle: AI sustainability + time savings.

-   Creator seeding: send 20 micro-influencers (50K--500K,
    fashion/productivity niche) early access + affiliate link.

**6.2 Ongoing Acquisition Channels**

  --------------------------------------------------------------------------
  **Channel**       **Tactic**                 **Expected     **Priority**
                                               CAC**          
  ----------------- -------------------------- -------------- --------------
  Organic / SEO     Blog: \'capsule wardrobe   \$0--5         High
                    for professionals\',                      
                    outfit planning guides                    

  TikTok / Reels    User-generated outfit      \$3--10        High
                    reveal content; shareable                 
                    outfit cards                              

  Referral          Give 1 month free, get 1   \$8--15        High
                    month free (both sides)                   

  App Store search  ASO optimization;          \$0--8         Medium
                    editorial pitches to                      
                    Apple/Google                              

  Creator /         20 micro-influencers with  \$15--25       Medium
  affiliate         unique codes; 20%                         
                    commission                                

  Paid social (Y2)  Meta and TikTok            \$20--35       Low (Y1)
                    retargeting once LTV                      
                    proven                                    

  PR / press        Sustainability angle; AI   \$0--20        Medium
                    angle; wardrobe waste                     
                    statistics                                
  --------------------------------------------------------------------------

**6.3 Retention Strategy**

Acquisition is worthless without retention. ClosetCoach is an inherently
daily-use product --- the habit loop must be established in the first 7
days.

**Onboarding Optimization**

-   Reduce items-to-value threshold: show a demo outfit suggestion with
    placeholder items if the user has \< 5 items.

-   Progressive disclosure: don\'t ask for all permissions (location,
    calendar) upfront --- earn them with context (\'For accurate weather
    suggestions, allow location\').

-   First-week email sequence (3 emails): Day 1 --- welcome + tip; Day 3
    --- \'Here\'s what your wardrobe is telling us\'; Day 7 --- \'Your
    first week in numbers.\'

**Retention Mechanics**

-   Daily push notification: personalized outfit suggestion at 7am
    (configurable). Not a generic reminder --- a specific outfit.

-   Weekly wardrobe report: \'You wore 8 items this week. 3 items
    haven\'t been worn in 60+ days --- here\'s how to use them.\'

-   Streak mechanic: \'Wear log streak --- 12 days.\' Simple but
    effective.

-   Monthly unworn item challenge: \'This month, try to wear 5 items you
    haven\'t touched in 90 days.\'

**7. Monetization Model**

*Freemium subscription as the primary revenue stream, with affiliate as
a meaningful secondary layer by Year 2.*

**7.1 Subscription Tiers**

  -------------------------------------------------------------------------
  **Feature**               **Free**       **Pro           **Pro Annual
                                           (\$6.99/mo)**   (\$49.99/yr)**
  ------------------------- -------------- --------------- ----------------
  Wardrobe items            Up to 50       Unlimited       Unlimited

  Daily outfit suggestions  1 per day      3 +             3 + alternatives
                                           alternatives    

  Wear analytics            Basic (30      Full history    Full history
                            days)                          

  Calendar integration      No             Yes             Yes

  Trip packing lists        No             Yes             Yes

  Outfit scoring            No             Yes             Yes

  Background removal        No             Yes             Yes

  Shareable outfit cards    Watermarked    Clean export    Clean export

  Support                   Community      Email (48h)     Priority (24h)
  -------------------------------------------------------------------------

> *Annual plan is the primary target: \$49.99/yr = \$4.17/mo effective
> rate, 40% discount vs. monthly. Drives LTV and reduces churn
> dramatically.*

**7.2 Revenue Model Mix (Projected)**

  --------------------------------------------------------------------------
  **Revenue Stream**  **Year 1** **Year 2**  **Year 3**  **Notes**
  ------------------- ---------- ----------- ----------- -------------------
  Subscription (Pro)  \~\$275K   \~\$1.4M    \~\$5.8M    Primary revenue
                                                         driver

  Affiliate           \~\$8K     \~\$120K    \~\$620K    Grows with user
  commissions                                            base & shopping
                                                         feature

  Stylist consults    ---        \~\$40K     \~\$180K    20% take on each
  (take rate)                                            booking

  Brand partnerships  ---        \~\$60K     \~\$280K    Sponsored capsule
                                                         collections

  Total ARR           \~\$283K   \~\$1.62M   \~\$6.88M   
  --------------------------------------------------------------------------

**7.3 Unit Economics (Target)**

  -------------------------------------------------------------------------
  **Metric**             **Year 1         **Year 2         **Year 3
                         Target**         Target**         Target**
  ---------------------- ---------------- ---------------- ----------------
  MAU                    50,000           220,000          800,000

  Paid conversion rate   8%               10%              12%

  Paid users             4,000            22,000           96,000

  ARPU (blended, paid)   \$5.90/mo        \$6.10/mo        \$6.30/mo

  CAC (blended)          \$12             \$9              \$7

  LTV (avg paid user)    \$85             \$110            \$140

  LTV:CAC ratio          7:1              12:1             20:1

  Payback period         \~2 months       \~1.5 months     \~1 month

  Monthly churn (paid)   4.5%             3.5%             2.8%
  -------------------------------------------------------------------------

**8. Team & Organization**

**8.1 Founding Team Requirements**

The business requires four founding competencies. Ideally a 2--3 person
founding team covering all four:

  -----------------------------------------------------------------------
  **Role**           **Responsibilities**            **Hire Priority**
  ------------------ ------------------------------- --------------------
  Founder / CEO / PM Vision, fundraising, user       Co-founder or
                     research, roadmap               Founder
                     prioritization, partnerships    

  Lead Engineer      React Native app, backend API,  Co-founder
  (Full-Stack +      infra; owns all technical       
  Mobile)            decisions                       

  ML / AI Engineer   Tagging pipeline,               First hire (month
                     recommendation engine,          3--4)
                     preference learning             

  Product Designer   UX flows, visual design system, Contractor (month
                     onboarding optimization, icon   1--2), FT (month 4)
                     design                          

  Growth / Marketing ASO, content, creator           Hire month 6
                     relationships, email sequences  (post-beta)
  -----------------------------------------------------------------------

**8.2 Hiring Roadmap**

  --------------------------------------------------------------------------
  **Month**   **Hire / Change**           **Rationale**
  ----------- --------------------------- ----------------------------------
  0           Founding team (2--3         Build core product
              people) + designer          
              contractor                  

  3--4        ML/AI Engineer (FT or       Tagging pipeline before beta
              contract)                   

  4           Designer goes full-time     Onboarding polish critical
                                          pre-launch

  6           Growth/Marketing hire       Drive post-launch acquisition

  9           Second engineer (mobile     iOS/Android parity + performance
              specialist)                 

  12          Customer Success            Handle support, gather qualitative
              (part-time)                 feedback

  15          Data Analyst                Turn usage data into product
                                          decisions

  18          Community Manager           Activate social features launching
                                          in Phase 3
  --------------------------------------------------------------------------

**9. Financial Plan**

**9.1 Funding Requirements**

**Pre-Seed / Self-Fund (Months 0--3)**

Estimated cost to reach a working prototype and early closed beta:
\$80,000--120,000. Covers engineering time, design tools, API costs
(vision API at scale for tagging), legal (incorporation, privacy
policy), and initial infrastructure.

**Seed Round (Month 4--6 target close): \$1.2M**

  ------------------------------------------------------------------------
  **Use of Funds**               **Amount**      **% of Round**
  ------------------------------ --------------- -------------------------
  Engineering salaries (18       \$540,000       45%
  months)                                        

  Design + Product               \$144,000       12%

  Growth / Marketing             \$216,000       18%

  Infrastructure & APIs          \$84,000        7%

  Legal, compliance, admin       \$60,000        5%

  Contingency (15%)              \$156,000       13%

  Total                          \$1,200,000     100%
  ------------------------------------------------------------------------

**Series A (Month 18--20 target): \$5--8M**

Milestone-gated: trigger Series A when the product demonstrates \$500K
ARR with \< 3.5% monthly churn and LTV:CAC \> 10:1. Use for:
international expansion, community features, AR try-on, brand
partnership infrastructure, and a 12-person team.

**9.2 Operating Cost Structure**

  ------------------------------------------------------------------------
  **Cost Category**        **Month 6**     **Month 12**    **Month 24**
  ------------------------ --------------- --------------- ---------------
  Salaries & contractors   \$28K/mo        \$52K/mo        \$110K/mo

  Infrastructure (DB,      \$800/mo        \$3K/mo         \$9K/mo
  storage, hosting)                                        

  AI API costs (vision,    \$600/mo        \$4K/mo         \$12K/mo
  weather)                                                 

  Marketing & paid         \$2K/mo         \$8K/mo         \$25K/mo
  acquisition                                              

  Tools, SaaS, misc        \$800/mo        \$2K/mo         \$5K/mo

  Total monthly burn       \~\$32K/mo      \~\$69K/mo      \~\$161K/mo
  ------------------------------------------------------------------------

> *Break-even target: Month 22--24, assuming seed round closes at Month
> 6 and growth targets are met.*

**10. Timeline & Milestones**

**2025 --- Build & Validate**

  -----------------------------------------------------------------------------
  **Month**   **Milestone**    **Key Deliverable**
  ----------- ---------------- ------------------------------------------------
  M1          Foundation       Tech stack chosen, design system started, data
                               model finalized, Supabase project live

  M2          Core loop v1     Wardrobe upload + manual tagging working; basic
                               outfit suggestion (rule-based); wear logging

  M3          AI tagging +     Vision API tagging pipeline integrated;
              onboarding       onboarding flow v1; style quiz

  M4          Calendar +       Weather API + calendar read integration; outfit
              weather          suggestions context-aware

  M5          Beta polish      Trip packing list; outfit editor; D7/D30
                               retention analytics instrumented

  M6          Closed beta (500 Recruit 500 beta users; iterate on onboarding;
              users)           NPS ≥ 40
  -----------------------------------------------------------------------------

**2026 --- Launch & Grow**

  --------------------------------------------------------------------------
  **Quarter**   **Milestone**             **Target Metric**
  ------------- ------------------------- ----------------------------------
  Q1 2026       Public launch +           10,000 downloads in launch month
                ProductHunt               

  Q1 2026       Subscription paywall live 8% free-to-paid conversion

  Q2 2026       Preference learning model Outfit acceptance rate improves
                v1                        from 50% to 65%

  Q2 2026       Shareable outfit cards    First viral TikTok/Reels moment

  Q3 2026       Wear-this-first ranking   Average wear count per item
                                          increases 20%

  Q3 2026       Donation flow             Press coverage on sustainability
                                          angle

  Q4 2026       Series A raise initiated  \$500K ARR milestone, LTV:CAC \>
                                          10:1

  Q4 2026       50,000 MAU                D30 retention ≥ 35% for 10+ item
                                          users
  --------------------------------------------------------------------------

**2027 --- Scale & Expand**

  --------------------------------------------------------------------------
  **Quarter**   **Milestone**             **Target Metric**
  ------------- ------------------------- ----------------------------------
  Q1 2027       Series A closes           \$6M raised; team grows to 12

  Q1 2027       Community features beta   Public outfit inspiration feed
                                          (opt-in)

  Q2 2027       Shopping gap analysis +   \$50K monthly affiliate revenue
                affiliate                 

  Q2 2027       International expansion   10% of new installs from non-US
                (UK/AU)                   markets

  Q3 2027       Stylist micro-consult     200 stylist sessions/month
                marketplace               

  Q4 2027       AR try-on (beta)          Featured in App Store editorial

  Q4 2027       800,000 MAU, \$6.8M ARR   Series B raise or profitability
                                          path
  --------------------------------------------------------------------------

**11. Risks & Mitigations**

  ----------------------------------------------------------------------------------------
  **Risk**           **Likelihood**   **Impact**   **Mitigation**
  ------------------ ---------------- ------------ ---------------------------------------
  Cold-start /       High             High         Demo mode with placeholder items; lower
  onboarding                                       threshold to 5 items; gamified catalog
  drop-off                                         progress bar

  Wear logging habit High             High         Morning push notification with specific
  doesn\'t form                                    outfit (not generic); end-of-day
                                                   passive prompt; streaks mechanic

  Vision API tagging Medium           Medium       Human-in-loop confirmation step; user
  quality too low                                  can always edit; track tag accuracy per
                                                   category and improve prompts

  Competitor with    Medium           High         Data moat (wear logs, preferences) is
  bigger budget                                    hard to copy; move fast; focus on
  copies                                           retention depth not just features

  Apple/Google       Low              High         Comply strictly from Day 1; no dark
  platform risk (App                               patterns; diversify with web app (PWA)
  Store policy)                                    for Android fallback

  Privacy/data       Low              Critical     Local-first architecture; no image
  breach                                           server storage without explicit opt-in;
                                                   SOC2 roadmap starting Month 12

  AI API cost        Medium           Medium       On-device migration plan for background
  explosion at scale                               removal; prompt caching; batch tagging
                                                   on ingest; monthly cost ceiling alerts

  Monetization       Medium           High         Run paywall A/B tests early; test price
  conversion below                                 points (\$4.99 vs \$6.99 vs \$9.99);
  target                                           introduce annual plan prominently

  Founder team gaps  Medium           Medium       Use API-first approach for Phase 1;
  (ML expertise)                                   hire ML engineer by Month 4; partner
                                                   with university ML lab
  ----------------------------------------------------------------------------------------

**12. Success Metrics & KPIs**

*A small, focused set of north-star and supporting metrics. Avoid vanity
metrics.*

**12.1 North Star Metric**

> *North Star: \'Weekly Active Wearers\' --- users who log at least one
> outfit wear in the last 7 days. This captures both retention and the
> core product behavior.*

**12.2 Metric Dashboard**

  ------------------------------------------------------------------------
  **Category**     **Metric**          **Month 6   **Month 12  **Month 24
                                       Target**    Target**    Target**
  ---------------- ------------------- ----------- ----------- -----------
  Acquisition      Monthly new         2,000       8,000       25,000
                   installs                                    

  Activation       Onboarding          45%         55%         60%
                   completion (5+                              
                   items)                                      

  Activation       First outfit        60%         70%         75%
                   suggestion accepted                         

  Retention        D7 retention (10+   35%         40%         45%
                   item users)                                 

  Retention        D30 retention       20%         28%         35%

  Retention        Weekly Active       30%         38%         45%
                   Wearers (WAW)                               

  Revenue          Free-to-paid        ---         8%          12%
                   conversion                                  

  Revenue          Monthly churn       ---         4.5%        2.8%
                   (paid)                                      

  Revenue          MRR                 ---         \$23K       \$140K

  Product          Outfit suggestion   50%         65%         72%
                   acceptance rate                             

  Product          Avg items per       22          35          55
                   wardrobe                                    

  NPS              Net Promoter Score  35          42          50
  ------------------------------------------------------------------------

**13. Competitive Positioning & Moats**

**13.1 Competitive Landscape**

  -------------------------------------------------------------------------
  **Competitor**   **Type**      **Strength**       **Weakness vs.
                                                    ClosetCoach**
  ---------------- ------------- ------------------ -----------------------
  Stylebook        Manual        Established user   No AI, high manual
                   wardrobe      base               effort, limited
                   catalog                          suggestions

  Cladwell         Capsule       Minimalist UX      No wear tracking,
                   wardrobe                         rule-based, no learning
                   planner                          

  Smart Closet     Wardrobe      Item count         Outdated UX, no AI
                   organizer                        layer, no
                                                    personalization

  Stitch Fix       Human styling High-quality       Expensive,
                   service       curation           purchase-required, no
                                                    existing closet use

  ChatGPT / Claude General AI    Flexible, smart    No wardrobe data, no
                                                    persistent context, not
                                                    mobile-native

  Instagram /      Social        Huge content       Not personal, no closet
  TikTok           inspiration   library            integration, promotes
                                                    buying
  -------------------------------------------------------------------------

**13.2 Sustainable Moats**

**Data Moat (Most Important)**

Every wear log, preference signal, and outfit acceptance/rejection makes
the recommendation engine more personal. After 6 months of use, a
user\'s outfit engine is uniquely theirs and cannot be instantly
replicated by a competitor even with a better algorithm --- the data is
the moat.

**Habit Moat**

Daily morning use is a deeply ingrained habit. Apps embedded in morning
routines (alarm, weather, news) show dramatically lower churn than
non-habitual apps. Our target is to be in the same mental slot as the
weather app.

**Wardrobe Catalog Switching Cost**

Once a user has catalogued 80+ items, the friction to switch to a
competitor is enormous. This is a meaningful lock-in --- not predatory,
but real.

**Network Effects (Phase 3)**

Community features and stylist marketplace introduce weak network
effects. More users → more outfit inspiration → better stylist
utilization → more creators join. Not a core moat in Year 1, but a
meaningful one by Year 3.

**14. Open Questions & Decisions Needed**

*These are the decisions that cannot yet be made from the desk --- they
require real user data or deliberate experimentation.*

**Near-Term Decisions (Months 1--4)**

-   What is the exact paywall timing? (After X items? After first outfit
    suggestion? After 7 days?) --- A/B test in beta.

-   Do we build on React Native (Expo) or go native iOS first? Depends
    on founding team iOS/Android split.

-   GPT-4o vs. Gemini Flash vs. Claude Haiku for image tagging --- run a
    500-image benchmark on accuracy + cost before committing.

-   Should onboarding ask for calendar permission before or after the
    user sees a first outfit suggestion? --- test both.

**Medium-Term Decisions (Months 5--10)**

-   When to build custom ML models vs. continuing with API calls ---
    trigger: \>200K items in DB, or \>\$5K/month in API costs.

-   Android-first or iOS-first for launch? --- iOS users have higher
    WTP; Android has more global reach. Lean iOS for monetization.

-   Affiliate or white-label shopping integration? (Commission Junction,
    Skimlinks, or direct brand deals?) --- evaluate at Month 9.

-   Should the packing list be a shareable public link or stay private?
    --- user research needed; could be a viral mechanic.

**Strategic / Long-Term Questions**

-   Is the B2B path (ClosetCoach for Teams / retail) worth pursuing, or
    does it distract from consumer growth?

-   At what scale does the wardrobe wear-data become valuable to fashion
    brands for trend insights? Is there a responsible data licensing
    path?

-   Does the community feature help or hurt retention? (Some users want
    private wardrobe management; social features may feel invasive.)

**Appendix --- Glossary & References**

**Key Terms**

  -----------------------------------------------------------------------
  **Term**         **Definition**
  ---------------- ------------------------------------------------------
  MAU              Monthly Active Users --- users who open the app at
                   least once in the last 30 days

  WAW              Weekly Active Wearers --- users who log at least one
                   outfit wear in the last 7 days (North Star metric)

  WTP              Willingness to Pay

  LTV              Lifetime Value --- total expected revenue from a paid
                   subscriber over their lifetime

  CAC              Customer Acquisition Cost --- total marketing spend
                   divided by new customers acquired

  ARR              Annual Recurring Revenue

  Churn            Percentage of paid subscribers who cancel in a given
                   month

  D7 / D30         Percentage of users who return to the app on Day 7 /
  retention        Day 30 after install

  Onboarding       User adds 5+ items and sees their first outfit
  completion       suggestion

  Outfit           \% of suggested outfits user taps \'Wear\' or \'Save\'
  acceptance rate  on

  Cold-start       The challenge of providing useful suggestions before
  problem          enough data has been collected

  GBDT             Gradient Boosted Decision Trees --- efficient ML model
                   for ranking/classification

  CLIP embeddings  OpenAI\'s image-text embedding model, useful for item
                   similarity

  Multi-armed      Reinforcement learning framework for balancing
  bandit           exploration vs. exploitation in recommendations
  -----------------------------------------------------------------------

*Document version: 1.0 --- March 2025. For internal planning purposes
only.*
