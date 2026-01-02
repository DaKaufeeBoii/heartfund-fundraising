
import type { Campaign } from './types';

// Standardized far-future date to ensure pre-made campaigns never expire
const NEVER_EXPIRE = '2099-12-31T23:59:59Z';

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: 'Digital Literacy for Seniors',
    creator: 'TechConnect Elders',
    creatorid: 'mock-user-1',
    creatoravatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop',
    description: 'Help seniors connect with their loved ones and the digital world by funding tech workshops.',
    longdescription: 'In an increasingly digital age, many seniors are left feeling isolated. TechConnect Elders provides free, patient, and friendly workshops to teach essential skills.',
    imageurls: [
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&h=500&fit=crop'
    ],
    goalamount: 8000,
    currentamount: 3400,
    donors: 78,
    category: 'Community',
    enddate: NEVER_EXPIRE,
  },
  {
    id: '2',
    title: 'Mobile Health Clinic for Remote Areas',
    creator: 'Health on Wheels',
    creatorid: 'mock-user-2',
    creatoravatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    description: 'Bring essential medical check-ups and basic healthcare to isolated communities.',
    longdescription: 'For those living in remote regions, a simple doctor\'s visit can be an all-day journey.',
    imageurls: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop'
    ],
    goalamount: 22000,
    currentamount: 19500,
    donors: 250,
    category: 'Health',
    enddate: NEVER_EXPIRE,
  }
];
