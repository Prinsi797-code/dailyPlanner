import notifee, {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';

const DAILY_CHANNEL_ID = 'daily_planner_reminders';

const ensureDailyChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: DAILY_CHANNEL_ID,
      name: 'Daily Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

// Ek helper: aaj ki date me diye gaye hour/min par agla trigger time nikalta hai
const getNextTriggerTime = (hour: number, minute: number): number => {
  const now = new Date();
  const trigger = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
  );
  if (trigger.getTime() <= now.getTime()) {
    // agar time nikal gaya hai to kal ke liye set karo
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger.getTime();
};

type DailyNotifConfig = {
  id: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
};

const DAILY_NOTIFICATIONS: DailyNotifConfig[] = [
  {
    id: 'morning_greeting',
    hour: 8,
    minute: 0,
    title: 'Good Morning ☀️',
    body: 'A new day, a fresh start! Don\'t forget to plan your day.',
  },
  {
    id: 'plan_today',
    hour: 9,
    minute: 30,
    title: "Today's Plan 📝",
    body: 'Have you set your plan for today? Write it down now!',
  },
  {
    id: 'evening_reflect',
    hour: 21,
    minute: 0,
    title: 'Day Wrap-up 🌙',
    body: 'How was your day? Jot down a quick note before you wind down.',
  },
];

export const scheduleAllDailyNotifications = async () => {
  await notifee.requestPermission();
  await ensureDailyChannel();

  for (const cfg of DAILY_NOTIFICATIONS) {
    await notifee.cancelNotification(cfg.id); // purana cancel karke fresh schedule karo
    await notifee.createTriggerNotification(
      {
        id: cfg.id,
        title: cfg.title,
        body: cfg.body,
        data: { type: 'daily', id: cfg.id },
        android: {
          channelId: DAILY_CHANNEL_ID,
          pressAction: { id: 'default' },
          sound: 'default',
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: getNextTriggerTime(cfg.hour, cfg.minute),
        repeatFrequency: RepeatFrequency.DAILY, // rozana repeat
      },
    );
  }
};

export const cancelAllDailyNotifications = async () => {
  for (const cfg of DAILY_NOTIFICATIONS) {
    await notifee.cancelNotification(cfg.id);
  }
};