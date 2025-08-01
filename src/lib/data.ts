
import type { Timestamp } from "firebase/firestore";

export type Tournament = {
  id: string;
  title: string;
  game: 'PUBG' | 'Free Fire';
  date: string;
  time: string;
  entryFee: number;
  prizePool: number;
  slotsTotal: number;
  slotsAllotted: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  rules: string[];
};

export type Testimonial = {
  name: string;
  quote: string;
  winHistory: string;
  avatar: string;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  gameId: string;
  totalWinnings: number;
  avatar: string;
  clanName: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
  };
  gamesPlayed: number;
  wins: number;
  streak: number;
  lastTournament: string;
  joinedOn: string;
};

export type UserProfileData = {
    uid: string;
    name: string;
    email: string;
    gameId: string;
    teamName: string;
    status: 'active' | 'banned';
    photoURL?: string;
    bio?: string;
    joinedOn?: Timestamp;
    totalMatches?: number;
    matchesWon?: number;
    totalEarnings?: number;
    preferredGame?: 'PUBG' | 'Free Fire' | 'Both';
    streak?: number;
};

export type UserRegistration = {
    id: string; // Firestore document ID
    userId: string;
    userEmail: string;
    tournamentId: string;
    tournamentTitle: string;
    gameId: string;
    teamName: string;
    upiId: string;
    registeredAt: any; // Firestore Timestamp
    paymentStatus: 'Pending' | 'Confirmed';
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'New' | 'Read';
  submittedAt: any; // Firestore Timestamp
};

export type Community = {
  id: string;
  name: string;
  description: string;
  members: number;
  avatar: string;
  game: 'PUBG' | 'Free Fire' | 'All';
  creatorId: string;
  createdAt: Timestamp;
  memberIds: string[];
};

export type CommunityMessage = {
  id: string;
  text: string;
  createdAt: Timestamp;
  userId: string;
  userName: string;
  userAvatar?: string;
};


export const testimonials: Testimonial[] = [
  {
    name: 'GamerXpert',
    quote: 'BattleBucks is legit! The competition is fierce and the payouts are fast. Won my first tourney last week!',
    winHistory: 'Won ₹5,000 in Weekend Warriors Cup',
    avatar: 'https://placehold.co/100x100/333333/7CFC00.png?text=G',
  },
  {
    name: 'SniperQueen',
    quote: 'The app is so slick and easy to use. Found a match, registered, and won all in one evening. Highly recommended!',
    winHistory: 'Total Winnings: ₹12,500',
    avatar: 'https://placehold.co/100x100/333333/7CFC00.png?text=S',
  },
  {
    name: 'ClutchGod',
    quote: 'Finally a platform that takes mobile esports seriously. The tournaments are well-organized. Great job guys!',
    winHistory: '3x Tournament Champion',
    avatar: 'https://placehold.co/100x100/333333/FFFFFF.png?text=C',
  },
  {
    name: 'RushHour',
    quote: 'Love the vibe of this site. The glitch effects and neon colors are sick! Plus, I actually make money playing.',
    winHistory: 'Won ₹2,500 in Free Fire Frenzy',
    avatar: 'https://placehold.co/100x100/333333/7CFC00.png?text=R',
  },
  {
    name: 'ProPlayer123',
    quote: 'The community is awesome and the admins are super helpful. It\'s my go-to place for daily scrims.',
    winHistory: 'Placed Top 5 in The Grand Clash',
    avatar: 'https://placehold.co/100x100/333333/FFFFFF.png?text=P',
  },
];
