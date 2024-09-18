import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from 'lucide-react';

export default function ComparisonResult({ comparison }) {
  console.log('Comparison data:', comparison);
  const { user1, user2 } = comparison;

  const compareAttribute = (attr, higherIsBetter = true) => {
    if (user1[attr] === user2[attr]) return 'Tie';
    if (user1[attr] > user2[attr]) return higherIsBetter ? user1.username : user2.username;
    return higherIsBetter ? user2.username : user1.username;
  };

  const getOverallWinner = () => {
    const attributes = ['followers', 'publicRepos', 'totalStars', 'contributions', 'pullRequests', 'issues'];
    let user1Points = 0;
    let user2Points = 0;

    attributes.forEach(attr => {
      if (user1[attr] > user2[attr]) user1Points++;
      else if (user2[attr] > user1[attr]) user2Points++;
    });

    if (user1Points === user2Points) return 'Tie';
    return user1Points > user2Points ? user1.username : user2.username;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const renderComparison = (attr, label, higherIsBetter = true) => (
    <TableRow key={attr}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell>{user1[attr]}</TableCell>
      <TableCell>{user2[attr]}</TableCell>
      <TableCell className={`font-semibold ${compareAttribute(attr, higherIsBetter) === 'Tie' ? 'text-yellow-500' : 'text-green-500'}`}>
        {compareAttribute(attr, higherIsBetter)}
      </TableCell>
    </TableRow>
  );

  const winner = getOverallWinner();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attribute</TableHead>
            <TableHead>{user1.username}</TableHead>
            <TableHead>{user2.username}</TableHead>
            <TableHead>Winner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderComparison('followers', 'Followers')}
          {renderComparison('publicRepos', 'Public Repos')}
          {renderComparison('totalStars', 'Total Stars')}
          {renderComparison('contributions', 'Contributions')}
          {renderComparison('pullRequests', 'Pull Requests')}
          {renderComparison('issues', 'Issues')}
          <TableRow>
            <TableCell className="font-medium">Account Age</TableCell>
            <TableCell>{formatDate(user1.createdAt)}</TableCell>
            <TableCell>{formatDate(user2.createdAt)}</TableCell>
            <TableCell className={`font-semibold ${compareAttribute('createdAt', false) === 'Tie' ? 'text-yellow-500' : 'text-green-500'}`}>
              {compareAttribute('createdAt', false)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <motion.div 
        className="text-center bg-accent rounded-lg p-4 sm:p-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <h3 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
          Winner - <span className="text-primary">{winner}</span>
          <Trophy className="text-yellow-500 w-6 h-6 sm:w-8 sm:h-8" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          The overall winner is determined by who wins the most individual comparisons.
        </p>
      </motion.div>
    </motion.div>
  );
}