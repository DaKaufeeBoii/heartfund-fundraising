
import type { Campaign } from './types';

// Standardized far-future date to ensure pre-made campaigns never expire
const NEVER_EXPIRE = '2099-12-31T23:59:59Z';

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: 'Digital Literacy for Seniors',
    creator: 'TechConnect Elders',
    creatorId: 'mock-user-1',
    creatorAvatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop',
    description: 'Help seniors connect with their loved ones and the digital world by funding tech workshops.',
    longDescription: 'In an increasingly digital age, many seniors are left feeling isolated. TechConnect Elders provides free, patient, and friendly workshops to teach essential skills like video calling, online safety, and accessing telehealth services. Your donation funds tablets, learning materials, and volunteer training, empowering the elderly to stay connected with family, friends, and vital services.',
    imageUrls: [
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1581578731522-7945c283021b?w=800&h=500&fit=crop'
    ],
    goalAmount: 8000,
    currentAmount: 3400,
    donors: 78,
    category: 'Community',
    endDate: NEVER_EXPIRE,
  },
  {
    id: '2',
    title: 'Mobile Health Clinic for Remote Areas',
    creator: 'Health on Wheels',
    creatorId: 'mock-user-2',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    description: 'Bring essential medical check-ups and basic healthcare to isolated communities.',
    longDescription: 'For those living in remote regions, a simple doctor\'s visit can be an all-day journey. Our Mobile Health Clinic is a specially equipped van staffed by volunteer nurses and doctors that travels to these underserved areas. We provide vaccinations, health screenings, and basic medical care. Your support keeps our clinic on the road, stocked with supplies, and ready to serve.',
    imageUrls: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1584432830680-aa2c1a6d758c?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=500&fit=crop'
    ],
    goalAmount: 22000,
    currentAmount: 19500,
    donors: 250,
    category: 'Health',
    endDate: NEVER_EXPIRE,
  },
  {
    id: '3',
    title: 'Urban Beekeeping Initiative',
    creator: 'City Hive Project',
    creatorId: 'mock-user-3',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    description: 'Support local ecosystems by establishing and maintaining beehives on city rooftops.',
    longDescription: 'Bees are vital to our ecosystem, and you can help them thrive even in the city! The City Hive Project installs and maintains beehives on the rooftops of partnering businesses and community buildings. These hives help pollinate urban gardens and parks, increasing biodiversity. Your donation helps us build new hives, purchase safety equipment, and run educational programs about the importance of pollinators.',
    imageUrls: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1508264564344-777353986802?w=800&h=500&fit=crop'
    ],
    goalAmount: 12000,
    currentAmount: 6800,
    donors: 112,
    category: 'Environment',
    endDate: NEVER_EXPIRE,
  },
  {
    id: '4',
    title: 'Revitalize the Local Community Theater',
    creator: 'Spotlight Arts',
    creatorId: 'mock-user-4',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    description: 'Help us renovate our beloved but aging theater with new seats, sound, and lighting.',
    longDescription: 'The Oakwood Community Theater has been a hub for local arts for over 50 years, but it\'s in desperate need of an upgrade. Our seats are worn, our sound system crackles, and our lighting is outdated. This campaign will fund essential renovations to create a safe, comfortable, and technically advanced space for our performers and audience. Help us keep the magic of live theater alive in our town for generations to come.',
    imageUrls: [
      'https://images.unsplash.com/photo-1503095396549-80705a10996c?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop'
    ],
    goalAmount: 40000,
    currentAmount: 25600,
    donors: 198,
    category: 'Arts',
    endDate: NEVER_EXPIRE,
  },
  {
    id: '5',
    title: 'Therapy Dog Training Program',
    creator: 'Healing Paws',
    creatorId: 'mock-user-5',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    description: 'Fund the training and certification of therapy dogs to comfort people in hospitals and schools.',
    longDescription: 'The unconditional love of a dog has incredible healing power. Healing Paws trains and certifies gentle-tempered dogs and their handlers to work as therapy teams. They visit hospitals, nursing homes, and schools to provide comfort, reduce stress, and bring joy. Your donation covers the cost of expert training, certification exams, and volunteer gear, allowing us to bring more wagging tails to those who need them most.',
    imageUrls: [
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1444212477490-ca40a9451722?w=800&h=500&fit=crop'
    ],
    goalAmount: 15000,
    currentAmount: 14800,
    donors: 401,
    category: 'Animals',
    endDate: NEVER_EXPIRE,
  },
  {
    id: '6',
    title: 'Community Fridge Project',
    creator: 'The Neighborhood Spoon',
    creatorId: 'mock-user-6',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    description: 'Install and stock public refrigerators with free, fresh food for anyone in need.',
    longDescription: 'Food insecurity affects many families in our community. The Community Fridge Project is a grassroots effort to combat hunger and reduce food waste. We place refrigerators in accessible public locations, and with the help of volunteers and local partners, keep them stocked with fresh produce, dairy, and prepared meals. Your donation helps purchase a new fridge, cover electricity costs, and buy supplemental groceries.',
    imageUrls: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1488459711635-d6dae289a67e?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=500&fit=crop'
    ],
    goalAmount: 5000,
    currentAmount: 1200,
    donors: 55,
    category: 'Emergency',
    endDate: NEVER_EXPIRE,
  }
];
