import { useState } from "react";
import RankingResult from '@/components/RankingResult';
import { motion, AnimatePresence } from "framer-motion";
import { GitHubLogoIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [username1, setUsername1] = useState("");
  const [username2, setUsername2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username1 || !username2) {
      alert("Please enter both usernames");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/rank?usernames=${username1},${username2}`
      );
      const data = await response.json();
      if (data.user1 && data.user2) {
        setComparison(data);
      } else {
        throw new Error("Received invalid data from server");
      }
    } catch (err) {
      console.error("Error fetching comparison:", err);
      setError("Failed to fetch comparison");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <GitHubLogoIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            GitHub Battle
          </h1>
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              Compare GitHub Users
            </CardTitle>
            <CardDescription>
              Enter two GitHub usernames to see who comes out on top!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: "Challenger 1",
                    value: username1,
                    setter: setUsername1,
                  },
                  {
                    label: "Challenger 2",
                    value: username2,
                    setter: setUsername2,
                  },
                ].map((challenger, index) => (
                  <Card key={index} className="bg-secondary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {challenger.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <PersonIcon className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={challenger.value}
                          onChange={(e) => challenger.setter(e.target.value)}
                          placeholder="GitHub username"
                          className="flex-1 bg-transparent border-b border-primary/20 focus:border-primary outline-none py-1 px-2 text-lg"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                type="submit"
                className="w-full text-lg py-6"
                disabled={loading}
              >
                {loading ? "Battling..." : "Start Battle!"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {comparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <RankingResult comparison={comparison} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
