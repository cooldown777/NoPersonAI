export interface PostPair {
  id: string;
  label: string;
  optionA: { style: string; text: string };
  optionB: { style: string; text: string };
}

export const styleDiscoveryPairs: PostPair[] = [
  {
    id: "pair1",
    label: "Which opening style resonates more?",
    optionA: {
      style: "direct",
      text: "I lost $50,000 in 3 months.\n\nHere's what nobody tells you about bootstrapping.\n\nThread:",
    },
    optionB: {
      style: "reflective",
      text: "Last year I sat in my car for 20 minutes before walking into the office.\n\nI wasn't ready to face my team.\n\nBecause I knew the numbers didn't lie.",
    },
  },
  {
    id: "pair2",
    label: "Which format feels more like you?",
    optionA: {
      style: "list",
      text: "5 lessons from 10 years of hiring:\n\n1. Skills can be taught. Attitude can't.\n2. The best people don't need managing.\n3. Slow down. One bad hire costs 6 months.\n4. Culture add > culture fit.\n5. Trust references more than interviews.",
    },
    optionB: {
      style: "narrative",
      text: "My best hire almost didn't happen.\n\nShe bombed the technical interview. Completely.\n\nBut something about her questions made me pause.\n\nShe asked things nobody else had thought of.\n\nThat was 4 years ago. She's now my CTO.",
    },
  },
  {
    id: "pair3",
    label: "Which ending style do you prefer?",
    optionA: {
      style: "actionable",
      text: "Stop waiting for the perfect moment.\n\nStart today. Ship tomorrow. Learn always.\n\nWhat's one thing you've been putting off? Drop it in the comments.",
    },
    optionB: {
      style: "thoughtful",
      text: "I don't have all the answers.\n\nBut I know this: the people who figure it out aren't smarter.\n\nThey just refuse to stop trying.\n\nAnd maybe that's enough.",
    },
  },
  {
    id: "pair4",
    label: "Which tone feels more natural?",
    optionA: {
      style: "bold",
      text: "Hot take: Most LinkedIn advice is garbage.\n\n\"Post every day\" — burnout recipe\n\"Use hashtags\" — nobody searches those\n\"Network more\" — without strategy, it's noise\n\nHere's what actually works:",
    },
    optionB: {
      style: "warm",
      text: "A mentor told me something 5 years ago that I didn't understand until last week.\n\n\"Your network isn't about numbers. It's about who would answer your call at midnight.\"\n\nI've been thinking about that a lot lately.",
    },
  },
];
