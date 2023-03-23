export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type PGEssay = {
  tweet_url: string;
  tweet_date: string;
  content: string;
  length: number;
  tokens: number;
};

export type PGChunk = {
  essay_title: string;
  essay_url: string;
  essay_date: string;
  essay_thanks: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type PGJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  tweets: PGEssay[];
};

// Replace the following import line:
// import { PGEssay, PGJSON } from "@/types";
// with these type definitions:

export type Tweet = {
  tweet_url: string;
  tweet_date: string;
  content: string;
  author: string;
  embedding: number[];
};

export type TweetJSON = {
  tweets: Tweet[];
};

