export const FIGURES_2026 = {
  workCredit: 1890,
  maxCreditsEarnings: 7560,
  sgaNonBlind: 1690,
  sgaBlind: 2830,
  trialWork: 1210,
  avgWorkerBenefit: 1633,
  disabledWorkersMillions: 7.1,
  initialDecisionDays: 184,
  reconsiderationDays: 208,
  hearingDays: 267,
  waitingMonths: 5,
  medicareMonths: 24,
  appealDays: 60,
};

export const WORK_CREDIT_TABLE = [
  { age: "Before 24", credits: "6 credits in the 3 years before onset", years: "1.5 years" },
  { age: "24–30", credits: "Credits for half the time since age 21", years: "Varies" },
  { age: "31–42", credits: "Generally 20 credits (20/40 rule)", years: "5 of last 10" },
  { age: "44", credits: "22 credits", years: "5.5 years" },
  { age: "46", credits: "24 credits", years: "6 years" },
  { age: "48", credits: "26 credits", years: "6.5 years" },
  { age: "50", credits: "28 credits", years: "7 years" },
  { age: "52", credits: "30 credits", years: "7.5 years" },
  { age: "54", credits: "32 credits", years: "8 years" },
  { age: "56", credits: "34 credits", years: "8.5 years" },
  { age: "58", credits: "36 credits", years: "9 years" },
  { age: "60", credits: "38 credits", years: "9.5 years" },
  { age: "62 to full retirement age", credits: "40 credits", years: "10 years" },
];

export const FIVE_STEPS = [
  {
    step: "1",
    title: "Are you working at SGA?",
    body: `If you are working and earning over the substantial gainful activity level — $${FIGURES_2026.sgaNonBlind.toLocaleString()} a month in 2026 ($${FIGURES_2026.sgaBlind.toLocaleString()} if you are statutorily blind) — SSA generally will not find you disabled. SSA pays only for total disability, not partial or short-term disability.`,
  },
  {
    step: "2",
    title: "Is your condition severe?",
    body: "Your medically determinable impairment must significantly limit basic work activities (walking, sitting, lifting, standing, concentrating, remembering) and last or be expected to last at least 12 months, or be expected to result in death.",
  },
  {
    step: "3",
    title: "Does it meet or equal a listing?",
    body: "SSA’s Listing of Impairments (the Blue Book) describes conditions severe enough to prevent gainful activity regardless of age, education, or work experience. Meeting or medically equaling a listing can result in an award at step 3.",
  },
  {
    step: "4",
    title: "Can you do your past work?",
    body: "If you do not meet a listing, SSA assesses your residual functional capacity (RFC) and decides whether you can still perform your past relevant work as you actually did it or as it is generally performed.",
  },
  {
    step: "5",
    title: "Can you do any other work?",
    body: "SSA considers your RFC, age, education, and work experience to decide whether other work exists in significant numbers in the national economy. If not, you are found disabled. Medical-vocational guidelines (the “grids”) often apply at this step.",
  },
];

export const BLUE_BOOK = [
  { code: "1.00", title: "Musculoskeletal Disorders", examples: "Spine disorders, joint dysfunction, amputation, fractures" },
  { code: "2.00", title: "Special Senses and Speech", examples: "Statutory blindness, hearing loss, speech impairment" },
  { code: "3.00", title: "Respiratory Disorders", examples: "COPD, asthma, cystic fibrosis, pulmonary fibrosis" },
  { code: "4.00", title: "Cardiovascular System", examples: "Chronic heart failure, ischemic disease, arrhythmias, PAD" },
  { code: "5.00", title: "Digestive Disorders", examples: "IBD, chronic liver disease, short bowel, GI bleeding" },
  { code: "6.00", title: "Genitourinary Disorders", examples: "Chronic kidney disease, dialysis, kidney transplant" },
  { code: "7.00", title: "Hematological Disorders", examples: "Sickle cell, hemophilia, bone marrow failure" },
  { code: "8.00", title: "Skin Disorders", examples: "Severe dermatitis, burns, ichthyosis" },
  { code: "9.00", title: "Endocrine Disorders", examples: "Evaluated under the affected body system (e.g., diabetes complications)" },
  { code: "10.00", title: "Congenital Disorders", examples: "Non-mosaic Down syndrome and similar multi-system conditions" },
  { code: "11.00", title: "Neurological Disorders", examples: "Epilepsy, MS, Parkinson’s, ALS, TBI, neuropathy" },
  { code: "12.00", title: "Mental Disorders", examples: "Depression, bipolar, schizophrenia, anxiety, PTSD, autism, neurocognitive" },
  { code: "13.00", title: "Cancer (Malignant Neoplastic Diseases)", examples: "Cancers by site, staging, treatment, and recurrence" },
  { code: "14.00", title: "Immune System Disorders", examples: "Lupus, HIV, inflammatory arthritis, Sjögren’s, vasculitis" },
];

export const APPEAL_LEVELS = [
  {
    title: "Reconsideration",
    timing: "About 7 months on average (≈208 days in mid-2026)",
    body: "A different reviewer at Disability Determination Services looks at your file plus any new evidence. You generally have 60 days from the date you receive the denial to request reconsideration. Approval rates at this stage are typically low.",
  },
  {
    title: "Hearing before an Administrative Law Judge",
    timing: "Often 9–15 months from request to decision",
    body: "If reconsideration is denied, you may request a hearing before an ALJ at the Office of Hearings Operations. This is the stage where many claimants first appear with a representative. You may submit new evidence, call witnesses, and answer the judge’s questions.",
  },
  {
    title: "Appeals Council",
    timing: "Often around 12 months",
    body: "The Appeals Council may grant, deny, or dismiss your request for review, or remand the case to an ALJ. Review is generally limited to errors of law, abuse of discretion, or lack of substantial evidence.",
  },
  {
    title: "Federal district court",
    timing: "Often 12–24 months",
    body: "After the Appeals Council action, you may file a civil action in U.S. District Court under 42 U.S.C. § 405(g). Court review is of the administrative record; it is not a new hearing on the medical facts.",
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is SSDI?",
    a: "Social Security Disability Insurance is a federal insurance program you pay into through Social Security (FICA) taxes. If you have enough work credits and a qualifying disability, you may receive monthly cash benefits based on your earnings record. In January 2026 the average disabled-worker benefit was about $1,633 per month.",
  },
  {
    q: "Is this the Social Security Administration?",
    a: "No. SSDI Campaigns is an independent private campaign. We are not affiliated with, endorsed by, or authorized by the U.S. Social Security Administration.",
  },
  {
    q: "How many work credits do I need?",
    a: "It depends on your age when the disability began. Most people 31 or older need at least 20 credits earned in the 10 years before onset (the 20/40 rule) and enough lifetime credits for their age. Younger workers can qualify with fewer credits. In 2026 one credit is $1,890 of covered earnings, up to four credits per year.",
  },
  {
    q: "What counts as a disability for SSDI?",
    a: "SSA’s statutory definition (Social Security Act § 223(d)) requires an inability to engage in substantial gainful activity due to a medically determinable physical or mental impairment expected to last at least 12 months or result in death. Partial or short-term disability is not payable.",
  },
  {
    q: "Can I work while applying or receiving SSDI?",
    a: "Earnings above SGA generally prevent a finding of disability. After you are on benefits, a trial work period lets you test work for at least nine months (2026 threshold $1,210/month) while still receiving checks. Always report work to SSA.",
  },
  {
    q: "How long does an SSDI decision take?",
    a: "As of mid-2026, initial decisions averaged about 184 days. Reconsideration averaged about 208 days. ALJ hearings averaged under nine months to decision. Your timeline can be shorter or longer.",
  },
  {
    q: "When do payments start if I am approved?",
    a: "SSDI has a five-month waiting period from the established onset date (ALS is an exception). Benefits accrue beginning the sixth full month. SSA also pays benefits one month behind. Back pay can cover months after the waiting period while the claim was pending, generally up to 12 months before the application date.",
  },
  {
    q: "Do I get Medicare?",
    a: "Disabled workers generally become eligible for Medicare after 24 months of SSDI entitlement (29 months after onset). Some conditions, including ALS and end-stage renal disease, have different Medicare timing.",
  },
  {
    q: "What if I was denied?",
    a: "Most initial claims are denied. You generally have 60 days from receipt of the notice to appeal. Do not file a brand-new application if you are still within the appeal window — appeal the denial so you keep your protective filing date.",
  },
  {
    q: "Do I have to pay to apply?",
    a: "No. Applying for Social Security disability benefits is free. Representatives who appear before SSA may charge a fee only if SSA (or a court) approves it, typically a contingency of past-due benefits subject to SSA’s cap. We do not charge a fee to submit this screening form.",
  },
  {
    q: "Is this a law firm? Is this legal advice?",
    a: "No. This site is not a law firm, does not create an attorney-client relationship, and does not give legal advice. If hearing representation is appropriate, we may connect you with a qualified SSA-appointed representative. You choose whether to appoint anyone using SSA Form 1696.",
  },
  {
    q: "What is the difference between SSDI and SSI?",
    a: "SSDI is insurance based on your work credits and earnings record. SSI (Supplemental Security Income) is a needs-based program with strict income and resource limits. Some people receive both (concurrent benefits). Medical disability rules are largely the same; financial rules are not.",
  },
];

export const SERVICES = [
  {
    title: "Free Consultation",
    body: "A no-cost screening conversation about your work history, medical conditions, and whether an SSDI claim may be worth exploring. This is not a government interview and not legal advice.",
  },
  {
    title: "Case Assessment",
    body: "We review onset, work credits, SGA, treatment history, and likely Blue Book or RFC issues so you understand strengths and gaps before you file or appeal.",
  },
  {
    title: "Document Preparation",
    body: "Help organizing medical sources, work history (SSA-3369), function reports, and supporting statements. You remain the applicant. SSA, not this campaign, decides the claim.",
  },
  {
    title: "Hearing Representation Connections",
    body: "If an ALJ hearing is the next step, we can introduce you to SSA-registered representatives. Appointment, strategy, and any fee are between you, the representative, and SSA — never guaranteed by this site.",
  },
];
