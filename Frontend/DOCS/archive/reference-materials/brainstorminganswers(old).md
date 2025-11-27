1) We are building a next js app. We will use the app router. Lets use nextjs 14. The backend will be in typescript. We will use SSR for the web app. Zustand for lightweight UI/global app state (sidebar, feature flags, local UI toggles).

React Query (TanStack Query) for all remote data (wallets, transactions, forms, sync status) with cache keys per user/connection.. Forms

React Hook Form + Zod (schema-safe, fast).

Styling & UI

Tailwind CSS + shadcn/ui for velocity, a11y, and theming; custom tokens for brand. We want to be able to gloablly tweak the theme colors and typography so use a simple styling tokens and must be compatible with the full shadcn UI implementation so we can use the built in darkmode lightmode toggles and tweakCN to tweak the components globally later. We will eventually need global state and we will use supabase for authentication, but we are ONLY focused on the front end development right now, so we just need to prepare for that in the future, not implmenet it at all. We will use tailwind and shadcn components, only builidng custom elements necesaary custom. We want a design syustem documented from the start with easily, human changeable styling tokens for colors and typography. We use REST API. React Query for requests/caching; keep an apiClient wrapper (fetch with interceptors).. 
2) Design & Branding

Visual identity

Vibe: professional + crypto-native, approachable; clean white UI with subtle color accents.

Colors (proposed):

Primary:Dark Blue 

Secondary: Light Blue

Gray base:Light gray base

Success/Warning/Error from Tailwind palette.

Typography: Inter (UI), DM Sans (headlines). Separate fonts for headings and body. 
Global styling tokens used everywhere. 
Dark mode: Yes, from day one (shadcn theme). We have logo and bran assets that I will include in the assets folder. 

Use TaTax only as loose inspiration;

We are going for a professional, but modern web app UI aesthetic. 

Project structure: Your suggestions are good, you decide what it should be knowing that all of the backend will actually be implemneted later, and that we want to try to simulate the linking of th ebackend with fake data first so only including what we need for that and future backend integration in this codebase and project strucutre, only preparing for global auth, not implemnting it, etc. 

Feature folders is good. Mock data should live in @mock-database. You pick how to organize shared types and interfaction. 

4) We will be using supabase as authentication. Sessions via secure cookies (JWT strategy). Socail logins will be google, but we will do this via supabase so do not concern yourslf with it. We just want to prepare for eventual authetnication gating, but not implemnet it at all yet, remmeber we are just building the UI and logic enough to test it and prepare it for integration by the backend developer. Protected routes middleware setup from the start. Onboarding data: filing year, state, filing status, income bands; save per step via server actions so users can leave/return anytime. 

5) We are doing both actual wollate connection and API key input so we need to have UI for both once the user selects the walet theyll connect to. For excahnges, we want to create components for api key, oath, and csv, which you can just enable by decfvault for each excahnge, but we want to be able to easily disable in the UI with few lines of code, or just by not including that component in the exchange page once the use has clicked on it to connect. Do not worry about validating connections, we are just focusing on the front end here. Dont think about storing sensitive connection dta, we are just building the frontend. Yes yuses can disconnect and reconnect wallests from the dahsboard, but if they need to input or edit any data they are taken abck to the wallets excahnfges page. It should just be a one click buttons that are visible on the dashbaord page for this. We show last syned timestamps, remember this is just mock data right now. For the transaction objects, you just come up with the minimal viable objuect with minimum categories in it to represent the data we will watn (buy date, sell date, ticker, value, wallet or cex id came from, amount, id, type (buy, sell, transfer....))
. Transactions pages should eb infinite scroll with lazy loading of 20 transactions per load. We want to show all columns from the fake data objects for now. We want FILTERING based on wallet or cex, transaction type, and sorting based on value and date. Bulk operations not necessary for now. Categorization is a modal popup on top of the transactions page behind it that should automatically popup when they enter the transactions page if they have transactions that need to be categorizxed that have been flagged, but they can X out of it with some sort of warning pill still on the page until theyve categorized all the transactions that need to be, and shuldnt be able to gen forms until all transactions are categorized or left out. Yes they can create custom categories as well. We do need a notes field but it doesnt have to be visible by default, only if the user wants to add it. Yes we want undo functionality. For mock wallets, lets just create two mock wallets, two mock cexs, and two mock blockchains. Lets do 100 mock trnasactions per mock source. Mock data MUST include edge cases where data poitns are missing, really big or really small numbers, etc. Use manual json files for fake data. Yes create a script to generate the mock data. centralized mock data. 

Create a mock API layer that is simple, but we want to do this as simply as possible, literally jsuit enough to make it clear how the backend developer should connect everything up, we want to mimize the work we have to do here but also accomplish this. 

8) 

Pick the best charting library that is most diverse and easist to implement. Those time ranges are good. Doesnt need to be responsive for mobile. Look at the dashboard sceenshot in the inspiration screenshots folder for other card metrics. We need static until refresh updates. No comparison needed yet. We want collapsed and expanded states for the sidebare, dont need a mobile handburder, we want active state styling, and yes make capability for nested menu items. 

9) Its a multi step wizard, but you need to intelligently choose which of these steps occurs on the transactions categorization page/flow, and which shows only on the forms flow: Wizard (premium): Steps → Verify connections → Review/categorize → Pick tax year/method → Preview 8949/Sched D → Generate. Save progress each step.

Exports: PDF (forms), CSV (detailed tx), TurboTax/TaxAct formats later; generated on backend; download immediately with email fallback.

Rating (0–100%): visible on dashboard + before generation; computed from % categorized, % priced, % reconciled transfers; progress bar + badge... Users can save progress and come back later. Yes preview before final generation. Email link when done becuase it will take a long time. Forms are generated from the backend and displayed on front end, stored in the documetns tab when finished. This is displayed on the dahsboard, transactions page, and export pages, and it changes based on the state of the users transaction categorization, and stage of completion through the workflow. If they need to categoirze stuff still, theyll have a lower score which will increase as they categorize transactions. 

10) so we have a fully separate landing page. Once they click get started on the landing page, they are directed first to an authentication page on the web app side, so the auth apge should actually be the first page (automatically bypassed if theyve lgoged in before, directed to dashbaord page). If they need to register, then they register, and are directed through the "new user" flow including the disclaimer, privacy policy, and onbaording flow which is a multi step form, including intro steps, steps asking about their tax information filing status, etc. If they are a non logged in user but registered, they log in, and are direcetd to dashbaord. If they are logged in, they are directed directly to the dashbaord page. Wallets is its own page that shows the connected wallets and relevant stuff, and the add new wallet is the modal that pops up like tatax showing the different ones they can conect (this is what theyre directed to in the initial user flow after onboarding the first time they are in the new user flow, the add wallets,e xchnages, and blokchains modal structurd exactly like tataxs) the wallets page will be behind that modal, showing all the connected sources with resync, disconnect, and other relevant buttons and stats. Forms new and forms completed should be their own separate dirs, not under a single forms dir. It should be new-form, and view-form. New form is the new form flow, view form just lets them view generated documetns on their profile. 

We do not need landing marketing pages at all. This is JUST the web app UI. We have a separate landing page already built out with all marking and landing aspects. this is its own self contained web app. Onboarding is a single route with steps. No admin pages needed for intial version. 

11) red exclamation is an inline banner on dahsbaord header with count of uncat or unrpiced items, clicking it opens the filteres transactions page showing uncategorized ones. Toasts for success and errors. confirm modals for destructive actions, unsaved warning on form pages. Succes messages after cateogirzation is good, error handling for api faliures showuld show graceful messages. Warning yes. 

12) 
Skeleton screens for larger things, spinners for smaller things for loading states, optimizstic UI updates for categorizations, and lazy loading where optimizing. Code splitting by route and feature. Skeletons for charts/tables; route-level Suspense; lazy-load heavy charts.

Code splitting by route and feature; defer shadcn component bundles.

Optimize for large histories (virtualized table later; start with paginated SSR).

We dont care about SEO for these. No landing page here. 

13) No api documentation ready, we shoulod expect v2 rest bearer auth secrets handled server side. Feature flags, dev staging prod env strategy. But this shouldnt matter too much. We want to create the minimum viable backend mockup to provide easy entry points for the backend dev to later have his way with the codebase. No definite interfaces and types necessary, backend owns everyting relevant to backend stuff, dont consider any of that complexity, for now database and backend integration hsould just be hard coded database with simplest possible entries hat mimic future typscript and rest api endpoitns that the backend dev might creaqte. We dont need to set up anyuthing for the env vairables other than what makes snes that the backend guy will do. 

14) Use next hjs defulat es lint config and prettier. We can use Jest and react testing, but low emphaisi on testing for tnow.  Storybook for components & charts.

Conventional commits + PR template.

15) Desktop and laptop with variable sizes first approach. This is just a desktop app, not a mobile app. 

16) Target WCAG 2.1 AA; full keyboard nav; focus rings; color contrast tokens. shadcn gives us a head start.

17) Leave room for analytics later, but we will not implement that now. 




1) porpose a pallete and define the full pallete based on the professional dark blue and light blue look. Copy the colors and hex values seen in our logo in the brand assets folder. Tremor is perfect. 3) Run manually wehn needed yes, autogenerate on first dev server start if no mock data exists yes, include a seed parameter for consisten data across team yes. 4) That split is perfect. 5) 1) ask the tax method preference only during form gen. No CPA info. Yes we shuold include prior year losses in this onboaridng part. 6) Only on first visit after new transactions sync, and when clickikng the red banner from the dashbaord, otherwise if they nav to this page it shouldnt auto popup other than in situations where it makes sense (theyre coming from a button referenceing uncategorized transactions, or the first time when they are auto directed). 7) Please just exactly copy the modal screenshots from tatax for this one, other than our own custom UI, i just mean in terms of info included and layout. 8) Yes show list of all gen forms by tax year, and yes show all that for each form, and ability to regenerate. 9) That user journey is correct!. 10) just do it based on percent categorized for MVP. 11) Build everything as if user is logged in and leave todo commends for auth implementation. 12) They are located in the repo @assets/brand we have the full text logo for the top of the website and other relvant places, and the icon for smaller places. PLEASE FOR THE PRD DOCUMENT, CREATE IT ALL IN ONE DOCUMENT. MAKE DETAILIED DESCRIPTIONS OF THE UI ON EACH PAGE ACCORDING TO OUR EXACT SPECIFICATIONS FOR EACH PAGE, IN ADDITION TO EVEYTHING ELS YOU PROPSED TO INCLUDE IN THE PRD. THIS DOCUMENT SHOULD BE EXTREMELY SPECIFIC, AND SHOULD BE DESIGNED TO BE INGESTED BY AN LLM CODING AGENT. ANYWHERE THAT YOU REFERENCE AN EXTERNAL LIBRARY LIKE SHADCN COMPONENTS, TREMOR, AND ANY OTHER MAJOR THINGS, TELL THE AGENT TO USE ITS RESEARCH TOOLS AND AGENTS AVAILABLE TO COMPLETE IT AS WELL AS POSSIBLE. 