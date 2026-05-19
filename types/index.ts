export type EventCategory = 'launch' | 'meeting' | 'campaign' | 'deadline' | 'webinar';

export interface ChronosEvent {
  id: number;
  name: string;
  date: string;
  time: string;
  category: EventCategory;
  desc: string;
  emailNotif: boolean;
  waNotif: boolean;
  createdAt?: string;
}

export interface Subscriber {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface NotifLog {
  id: number;
  subscriberName: string;
  eventName: string;
  channel: 'email' | 'whatsapp';
  status: 'delivered' | 'failed' | 'pending';
  sentAt: string;
}

export const CATS: Record<EventCategory, { l: string; c: string }> = {
  launch:   { l: 'Launch',   c: '#e07040' },
  meeting:  { l: 'Meeting',  c: '#6090c0' },
  campaign: { l: 'Campaign', c: '#9060c0' },
  deadline: { l: 'Deadline', c: '#c8973a' },
  webinar:  { l: 'Webinar',  c: '#60a070' },
};

export const SEED_EVENTS: Omit<ChronosEvent, 'id'>[] = [
  { name:'Emotions Day',           date:'2026-01-29', time:'09:00', category:'campaign', desc:'National Emotions Day — promote wellbeing and awareness garments.',      emailNotif:true,  waNotif:true  },
  { name:'Cancer Day',             date:'2026-02-04', time:'09:00', category:'campaign', desc:'World Cancer Day — raise awareness with themed listings.',               emailNotif:true,  waNotif:true  },
  { name:'Numbers Day',            date:'2026-02-06', time:'09:00', category:'campaign', desc:'Numbers Day — fun maths-themed apparel campaign.',                       emailNotif:true,  waNotif:true  },
  { name:'Wear Red Day',           date:'2026-02-06', time:'09:00', category:'launch',   desc:'Wear Red Day — heart disease awareness red-themed listings.',            emailNotif:true,  waNotif:true  },
  { name:'Valentines Day',         date:'2026-02-14', time:'09:00', category:'launch',   desc:"Valentine's Day — love-themed garments and gifts.",                     emailNotif:true,  waNotif:true  },
  { name:'Children Mental Health Week', date:'2026-02-09', time:'09:00', category:'campaign', desc:'Children Mental Health Week — supportive awareness apparel.',       emailNotif:true,  waNotif:true  },
  { name:'National Cat Day',       date:'2026-02-22', time:'09:00', category:'launch',   desc:'National Cat Day — cat-themed print-on-demand listings.',               emailNotif:true,  waNotif:true  },
  { name:'6 Nations / Rugby',      date:'2026-02-05', time:'09:00', category:'campaign', desc:'6 Nations Rugby (5 Feb – 14 Mar) — rugby-themed garments.',             emailNotif:true,  waNotif:true  },
  { name:"St David's Day",         date:'2026-03-01', time:'09:00', category:'launch',   desc:"St David's Day — Welsh pride garments and listings.",                   emailNotif:true,  waNotif:true  },
  { name:'Science Week',           date:'2026-03-06', time:'09:00', category:'campaign', desc:'Science Week (6–15 Mar) — STEM-themed apparel campaign.',               emailNotif:true,  waNotif:true  },
  { name:'World Book Day',         date:'2026-03-05', time:'09:00', category:'launch',   desc:'World Book Day — book and reading themed garments.',                    emailNotif:true,  waNotif:true  },
  { name:'Maths Day',              date:'2026-03-14', time:'09:00', category:'campaign', desc:'National Maths Day — Pi Day maths-themed listings.',                    emailNotif:true,  waNotif:true  },
  { name:"Mother's Day",           date:'2026-03-15', time:'09:00', category:'launch',   desc:"Mother's Day — heartfelt mum-themed garments and gifts.",               emailNotif:true,  waNotif:true  },
  { name:"St Patrick's Day",       date:'2026-03-17', time:'09:00', category:'launch',   desc:"St Patrick's Day — Irish-themed green garments.",                      emailNotif:true,  waNotif:true  },
  { name:'Red Nose Day',           date:'2026-03-20', time:'09:00', category:'campaign', desc:'Red Nose Day / Comic Relief — charity-themed fun listings.',            emailNotif:true,  waNotif:true  },
  { name:'Autism Awareness Day',   date:'2026-04-02', time:'09:00', category:'campaign', desc:'Autism Awareness Day — puzzle-piece and awareness apparel.',            emailNotif:true,  waNotif:true  },
  { name:'Easter',                 date:'2026-04-05', time:'09:00', category:'launch',   desc:'Easter — bunny, egg, and spring-themed garments.',                     emailNotif:true,  waNotif:true  },
  { name:'National Earth Day',     date:'2026-04-22', time:'09:00', category:'campaign', desc:'National Earth Day — eco and nature-themed apparel.',                  emailNotif:true,  waNotif:true  },
  { name:"St George's Day",        date:'2026-04-23', time:'09:00', category:'launch',   desc:"St George's Day — English pride garments.",                            emailNotif:true,  waNotif:true  },
  { name:'National Pet Day',       date:'2026-04-11', time:'09:00', category:'campaign', desc:'National Pet Day — pet-lover themed listings.',                        emailNotif:true,  waNotif:true  },
  { name:'National Superhero Day', date:'2026-04-28', time:'09:00', category:'campaign', desc:'National Superhero Day — hero-themed fun apparel.',                    emailNotif:true,  waNotif:true  },
  { name:'Teacher Appreciation Week', date:'2026-05-04', time:'09:00', category:'campaign', desc:'Teacher Appreciation Week — teacher-themed listings.',              emailNotif:true,  waNotif:true  },
  { name:'National Space Day',     date:'2026-05-01', time:'09:00', category:'launch',   desc:'National Space Day — space and astronomy themed garments.',            emailNotif:true,  waNotif:true  },
  { name:'Star Wars Day',          date:'2026-05-04', time:'09:00', category:'launch',   desc:'Star Wars Day — May the 4th themed listings.',                        emailNotif:true,  waNotif:true  },
  { name:'Pride Week / Month',     date:'2026-06-01', time:'09:00', category:'campaign', desc:'Pride Month — rainbow and LGBTQ+ pride garments.',                    emailNotif:true,  waNotif:true  },
  { name:"Father's Day",           date:'2026-06-21', time:'09:00', category:'launch',   desc:"Father's Day — dad-themed garments and gift ideas.",                  emailNotif:true,  waNotif:true  },
  { name:'National Yoga Day',      date:'2026-06-21', time:'09:00', category:'campaign', desc:'International Yoga Day — yoga and wellness apparel.',                 emailNotif:true,  waNotif:true  },
  { name:'Fifa World Cup 2026',    date:'2026-06-11', time:'09:00', category:'launch',   desc:'FIFA World Cup 2026 — football nation listings.',                     emailNotif:true,  waNotif:true  },
  { name:'Graduation Season',      date:'2026-07-01', time:'09:00', category:'campaign', desc:'Graduation Season — cap and gown celebration apparel.',               emailNotif:true,  waNotif:true  },
  { name:'Back to School',         date:'2026-09-02', time:'09:00', category:'launch',   desc:'Back to School — teacher and pupil themed garments.',                 emailNotif:true,  waNotif:true  },
  { name:"World's Teacher Day",    date:'2026-10-05', time:'09:00', category:'campaign', desc:"World Teacher's Day — appreciation listings for educators.",          emailNotif:true,  waNotif:true  },
  { name:'World Mental Health',    date:'2026-10-10', time:'09:00', category:'campaign', desc:'World Mental Health Day — awareness and wellbeing apparel.',          emailNotif:true,  waNotif:true  },
  { name:'Yellow Day',             date:'2026-10-10', time:'09:00', category:'campaign', desc:'Yellow Day — bright yellow themed listings for happiness.',           emailNotif:true,  waNotif:true  },
  { name:'Halloween',              date:'2026-10-31', time:'09:00', category:'launch',   desc:'Halloween — spooky themed garments and costumes.',                    emailNotif:true,  waNotif:true  },
  { name:"All Saint's Day",        date:'2026-11-01', time:'09:00', category:'campaign', desc:"All Saint's Day — follow-up listings post-Halloween.",                emailNotif:true,  waNotif:true  },
  { name:'Anti-Bullying Week',     date:'2026-11-09', time:'09:00', category:'campaign', desc:'Anti-Bullying Week — kindness and anti-bullying apparel.',            emailNotif:true,  waNotif:true  },
  { name:'Children in Need',       date:'2026-11-20', time:'09:00', category:'launch',   desc:'Children in Need — Pudsey bear and charity-themed listings.',         emailNotif:true,  waNotif:true  },
  { name:'Christmas Jumper Day',   date:'2026-12-11', time:'09:00', category:'launch',   desc:'Christmas Jumper Day — festive jumper and holiday apparel.',          emailNotif:true,  waNotif:true  },
  { name:'Christmas',              date:'2026-12-25', time:'09:00', category:'launch',   desc:'Christmas — full festive range of garments and gifts.',              emailNotif:true,  waNotif:true  },
  { name:'Football',               date:'2026-06-11', time:'09:00', category:'campaign', desc:'Football season — ongoing football-themed listings.',                 emailNotif:true,  waNotif:false },
  { name:'United Kingdom',         date:'2026-04-23', time:'09:00', category:'campaign', desc:'UK pride listings — England, Scotland, Wales themed garments.',       emailNotif:true,  waNotif:false },
];
