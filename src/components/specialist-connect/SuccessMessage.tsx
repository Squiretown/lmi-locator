
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessMessageProps {
  email: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ email }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-8 text-center"
    >
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6 px-8 flex flex-col items-center">
          <CheckCircle2Icon className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Request Received!</h3>
          <p className="text-muted-foreground">
            A down payment assistance specialist will contact you shortly at {email}.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SuccessMessage;
