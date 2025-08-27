import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SavingsChallenge } from '../types/navigation';

interface ChallengesContextType {
  challenges: SavingsChallenge[];
  addChallenge: (challenge: SavingsChallenge) => void;
  updateChallenge: (updatedChallenge: SavingsChallenge) => void;
  deleteChallenge: (challengeId: string) => void;
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

export const useChallenges = () => {
  const context = useContext(ChallengesContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }
  return context;
};

interface ChallengesProviderProps {
  children: ReactNode;
}

export const ChallengesProvider: React.FC<ChallengesProviderProps> = ({ children }) => {
  // Sample data for savings challenges
  const sampleChallenges: SavingsChallenge[] = [
    {
      id: '1',
      name: 'Emergency Fund',
      goalAmount: 50000,
      frequency: 'Monthly',
      dateToFinish: new Date(2025, 11, 31).toISOString(), // December 31, 2025
      estimatedAmount: 10000,
      currentAmount: 15000,
      icon: 'wallet',
      color: '#4CAF50',
      savingEntries: [
        {
          id: '1-1',
          amount: 5000,
          note: 'Salary bonus',
          date: new Date(2025, 6, 1).toISOString(), // July 1, 2025
        },
        {
          id: '1-2',
          amount: 10000,
          note: 'Monthly savings',
          date: new Date(2025, 6, 15).toISOString(), // July 15, 2025
        },
      ],
    },
    {
      id: '2',
      name: 'Dream Vacation',
      goalAmount: 80000,
      frequency: 'Weekly',
      dateToFinish: new Date(2025, 10, 15).toISOString(), // November 15, 2025
      estimatedAmount: 2000,
      currentAmount: 8000,
      icon: 'airplane',
      color: '#2196F3',
      savingEntries: [
        {
          id: '2-1',
          amount: 3000,
          note: 'Side gig earnings',
          date: new Date(2025, 6, 10).toISOString(), // July 10, 2025
        },
        {
          id: '2-2',
          amount: 5000,
          note: 'Tax refund',
          date: new Date(2025, 6, 20).toISOString(), // July 20, 2025
        },
      ],
    },
    {
      id: '3',
      name: 'New Laptop',
      goalAmount: 75000,
      frequency: 'Monthly',
      dateToFinish: new Date(2025, 8, 30).toISOString(), // September 30, 2025
      estimatedAmount: 25000,
      currentAmount: 30000,
      icon: 'phone-portrait',
      color: '#FF9800',
      savingEntries: [
        {
          id: '3-1',
          amount: 15000,
          note: 'Freelance project',
          date: new Date(2025, 5, 25).toISOString(), // June 25, 2025
        },
        {
          id: '3-2',
          amount: 15000,
          note: 'Monthly allocation',
          date: new Date(2025, 6, 5).toISOString(), // July 5, 2025
        },
      ],
    },
  ];

  const [challenges, setChallenges] = useState<SavingsChallenge[]>(sampleChallenges);

  const addChallenge = (challenge: SavingsChallenge) => {
    setChallenges(prev => {
      // Check if challenge already exists to prevent duplicates
      const exists = prev.some(c => c.id === challenge.id);
      if (exists) {
        return prev;
      }
      return [...prev, challenge];
    });
  };

  const updateChallenge = (updatedChallenge: SavingsChallenge) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      )
    );
  };

  const deleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
  };

  return (
    <ChallengesContext.Provider value={{ 
      challenges, 
      addChallenge, 
      updateChallenge, 
      deleteChallenge 
    }}>
      {children}
    </ChallengesContext.Provider>
  );
};
