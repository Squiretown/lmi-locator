
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VerificationChallenge {
  id: string;
  question: string;
  answers: string[];
  difficulty: string;
  is_active: boolean;
}

interface VerificationChallengesCardProps {
  challenges: VerificationChallenge[];
}

export const VerificationChallengesCard: React.FC<VerificationChallengesCardProps> = ({ challenges }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Challenges</CardTitle>
        <CardDescription>Active verification questions for anti-bot measures</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div className="font-medium">{challenge.question}</div>
                <Badge variant={challenge.is_active ? "default" : "destructive"}>
                  {challenge.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-sm mt-1">
                <span className="text-gray-500">Difficulty:</span> {challenge.difficulty}
              </div>
              <div className="text-sm mt-1">
                <span className="text-gray-500">Answers:</span> {challenge.answers.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
