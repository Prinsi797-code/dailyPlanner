// src/constants/moods.ts
export interface Mood {
  id: string;
  label: string;
  image: any;
  score: number;
}

export const MOODS: Mood[] = [
  {
    id: 'happy',
    label: 'Happy',
    image: require('../assets/emoji/happy.png'),
    score: 9 
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    image: require('../assets/emoji/relaxed.png'),
    score: 8
  },
  {
    id: 'grateful',
    label: 'Grateful',
    image: require('../assets/emoji/grateful.png'),
    score: 7
  },
  {
    id: 'tired',
    label: 'Tired',
    image: require('../assets/emoji/tired.png'),
    score: 6
  },
  {
    id: 'unsure',
    label: 'Unsure',
    image: require('../assets/emoji/unsure.png'),
    score: 5
  },
  {
    id: 'bored',
    label: 'Bored',
    image: require('../assets/emoji/bored.png'),
    score: 4
  },
  {
    id: 'angry',
    label: 'Angry',
    image: require('../assets/emoji/angry.png'),
    score: 3
  },
  {
    id: 'stressed',
    label: 'Stressed',
    image: require('../assets/emoji/stressed.png'),
    score: 2
  },
  {
    id: 'sad',
    label: 'Sad',
    image: require('../assets/emoji/sad.png'),
    score: 1
  },
];