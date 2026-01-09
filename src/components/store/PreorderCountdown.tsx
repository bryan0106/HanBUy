"use client";

import { useEffect, useState } from "react";

interface PreorderCountdownProps {
  deadline: Date;
  className?: string;
}

export function PreorderCountdown({ deadline, className = "" }: PreorderCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = deadline.getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) {
    return (
      <div className={`rounded-lg bg-red-100 p-2 text-xs font-medium text-red-700 ${className}`}>
        ⚠️ Order deadline has passed
      </div>
    );
  }

  if (timeLeft.days < 3) {
    return (
      <div className={`rounded-lg bg-red-100 p-2 text-xs font-medium text-red-700 ${className}`}>
        ⏰ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-warning/10 p-2 text-xs font-medium text-warning ${className}`}>
      ⏰ {timeLeft.days} days left to order
    </div>
  );
}

